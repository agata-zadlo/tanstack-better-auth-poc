import { config } from "dotenv";
config({ path: ".env.local" });

import { betterAuth } from "better-auth";
import { genericOAuth } from "better-auth/plugins";
import { decodeJwtPayload } from "./utils";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,

  // ── Stateless mode ────────────────────────────────────────────────────────
  // No database adapter. Session data lives entirely in encrypted cookies.
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 7 * 24 * 60 * 60, // 7 days
      strategy: "jwe",
    },
  },
  account: {
    accountLinking: {
      enabled: false,
    },
    storeStateStrategy: "cookie",
    storeAccountCookie: true,
  },

  // ── Extra user fields ──────────────────────────────────────────────────────
  user: {
    additionalFields: {
      groups: {
        type: "string", // stored as JSON-stringified array in the cookie
        required: false,
        defaultValue: "[]",
        input: false,
      },
    },
  },

  // ── Okta via genericOAuth plugin ──────────────────────────────────────────
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: "okta",
          clientId: process.env.OKTA_CLIENT_ID!,
          clientSecret: process.env.OKTA_CLIENT_SECRET!,
          // discoveryUrl is derived from the issuer so we get all endpoints
          discoveryUrl: `${process.env.OKTA_ISSUER}/.well-known/openid-configuration`,
          scopes: ["openid", "profile", "email", "groups"],
          pkce: true,

          // Map the Okta profile → Better Auth user.
          // The access token payload may carry the `groups` claim (when
          // configured in Okta); surfacing it here stores it in the
          // cookie-based session so the home page can render it.
          mapProfileToUser: (profile) => {
            const rawGroups = (profile as Record<string, unknown>).groups;
            const groups = typeof rawGroups === "string" ? rawGroups : "[]";

            return {
              name:
                (profile.name as string | undefined) ??
                (profile.email as string | undefined) ??
                "",
              email: (profile.email as string | undefined) ?? "",
              image: (profile.picture as string | undefined) ?? null,
              emailVerified:
                typeof profile.email_verified === "boolean"
                  ? profile.email_verified
                  : true,
              groups,
            };
          },

          // Extract groups from ID token
          getUserInfo: async (tokens) => {
            const issuer = process.env.OKTA_ISSUER!;
            const userInfoUrl = `${issuer}/oauth2/v1/userinfo`;

            console.log("\n=== Token Debug ===");
            console.log("RAW ID Token:", tokens.idToken);
            console.log("RAW Access Token:", tokens.accessToken);

            // Get user profile from userinfo endpoint
            const res = await fetch(userInfoUrl, {
              headers: { Authorization: `Bearer ${tokens.accessToken}` },
            });

            if (!res.ok) {
              throw new Error(
                `Okta userinfo request failed: ${res.status} ${res.statusText}`
              );
            }

            const profile = (await res.json()) as Record<string, unknown>;

            // Extract groups from ID token
            let groups: string[] = [];
            if (tokens.idToken) {
              const idTokenPayload = decodeJwtPayload(tokens.idToken);
              console.log("ID Token payload:", JSON.stringify(idTokenPayload, null, 2));

              if (Array.isArray(idTokenPayload.groups)) {
                groups = idTokenPayload.groups as string[];
                console.log("✓ Found groups in ID token:", groups);
              }
            }

            // Also decode and print access token
            if (tokens.accessToken) {
              const accessTokenPayload = decodeJwtPayload(tokens.accessToken);
              console.log("Access Token payload:", JSON.stringify(accessTokenPayload, null, 2));
            }

            console.log("===================\n");

            return {
              id: String(profile.sub ?? ""),
              name:
                (profile.name as string | undefined) ??
                (profile.email as string | undefined) ??
                "",
              email: (profile.email as string | undefined) ?? null,
              image: (profile.picture as string | undefined) ?? undefined,
              emailVerified:
                typeof profile.email_verified === "boolean"
                  ? profile.email_verified
                  : true,
              groups: JSON.stringify(groups),
            };
          },
          overrideUserInfo: true,
        },
      ],
    }),
  ],
});

export type Auth = typeof auth;
