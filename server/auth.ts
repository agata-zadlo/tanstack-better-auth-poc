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

          // getUserInfo lets us intercept the full token set so we can
          // decode the access token and pull groups into the profile data.
          // The generic OAuth plugin merges this object into the final user.
          getUserInfo: async (tokens) => {
            const issuer = process.env.OKTA_ISSUER!;
            const userInfoUrl = `${issuer}/oauth2/v1/userinfo`;

            console.log("=== Token Debug ===");
            console.log("Access Token:", tokens.accessToken);
            console.log("ID Token:", tokens.idToken);

            const res = await fetch(userInfoUrl, {
              headers: { Authorization: `Bearer ${tokens.accessToken}` },
            });

            if (!res.ok) {
              throw new Error(
                `Okta userinfo request failed: ${res.status} ${res.statusText}`
              );
            }

            const profile = (await res.json()) as Record<string, unknown>;
            console.log("Userinfo profile:", JSON.stringify(profile, null, 2));

            let groups: string[] = [];

            // Check userinfo response first
            if (Array.isArray(profile.groups)) {
              groups = profile.groups as string[];
            }

            // Check ID token (org authorization server puts groups here)
            if (groups.length === 0 && tokens.idToken) {
              const idTokenPayload = decodeJwtPayload(tokens.idToken);
              console.log("Decoded ID token payload:", JSON.stringify(idTokenPayload, null, 2));
              if (Array.isArray(idTokenPayload.groups)) {
                groups = idTokenPayload.groups as string[];
              }
            }

            // Check access token (custom authorization server would put groups here)
            if (groups.length === 0 && tokens.accessToken) {
              const accessTokenPayload = decodeJwtPayload(tokens.accessToken);
              console.log("Decoded access token payload:", JSON.stringify(accessTokenPayload, null, 2));
              if (Array.isArray(accessTokenPayload.groups)) {
                groups = accessTokenPayload.groups as string[];
              }
            }

            // Fallback: Fetch groups from Okta API if not in token
            if (groups.length === 0 && profile.sub && process.env.OKTA_API_TOKEN) {
              try {
                const userId = String(profile.sub);
                const groupsUrl = `${issuer}/api/v1/users/${userId}/groups`;
                console.log("Fetching groups from API:", groupsUrl);

                const groupsRes = await fetch(groupsUrl, {
                  headers: {
                    Authorization: `SSWS ${process.env.OKTA_API_TOKEN}`,
                    Accept: "application/json",
                  },
                });

                if (groupsRes.ok) {
                  const groupsData = await groupsRes.json() as Array<{ id: string; profile: { name: string } }>;
                  groups = groupsData.map(g => g.profile.name);
                  console.log("Groups from API:", groups);
                } else {
                  console.log("Could not fetch groups from API:", groupsRes.status, groupsRes.statusText);
                }
              } catch (e) {
                console.log("Error fetching groups from API:", e);
              }
            }

            console.log("Final extracted groups:", groups);

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
