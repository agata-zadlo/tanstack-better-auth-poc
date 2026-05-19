import { config } from "dotenv";
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { auth } from "./auth";

config({ path: ".env.local" });

const app = express();
const PORT = 8080;
const VITE_PORT = 5173;

app.use(express.json());

app.all("/api/auth/*", async (req, res) => {
  return auth.handler(
    new Request(`http://localhost:8080${req.url}`, {
      method: req.method,
      headers: req.headers as HeadersInit,
      body: req.method !== "GET" && req.method !== "HEAD" ? JSON.stringify(req.body) : undefined,
    })
  ).then((response) => {
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === "set-cookie") {
        res.append(key, value);
      } else {
        res.setHeader(key, value);
      }
    });
    res.status(response.status);
    return response.text();
  }).then((body) => {
    if (body) {
      res.send(body);
    } else {
      res.end();
    }
  }).catch((error) => {
    console.error("Error in auth handler:", error);
    res.status(500).json({ error: "Authentication error" });
  });
});

app.get("/auth/start", async (req, res) => {
  try {
    console.log("=== Auth Start Debug ===");
    console.log("OKTA_ISSUER:", process.env.OKTA_ISSUER);
    console.log("OKTA_CLIENT_ID:", process.env.OKTA_CLIENT_ID);
    console.log("BETTER_AUTH_URL:", process.env.BETTER_AUTH_URL);
    console.log("Callback URL:", (req.query.callbackURL as string) || "/");
    console.log("Expected redirect_uri:", `${process.env.BETTER_AUTH_URL}/api/auth/callback/okta`);

    const callbackURL = (req.query.callbackURL as string) || "/";

    const result = await auth.api.signInWithOAuth2({
      headers: req.headers as Record<string, string>,
      body: {
        providerId: "okta",
        callbackURL,
      },
      returnHeaders: true,
    });

    if (result.headers) {
      result.headers.forEach((value, key) => {
        if (key.toLowerCase() === "set-cookie") {
          res.append(key, value);
        } else {
          res.setHeader(key, value);
        }
      });
    }

    if (result.response?.url) {
      console.log("OAuth redirect URL:", result.response.url);
      // Parse the URL to extract redirect_uri parameter
      try {
        const redirectUrl = new URL(result.response.url);
        console.log("redirect_uri parameter:", redirectUrl.searchParams.get("redirect_uri"));
      } catch (e) {
        console.log("Could not parse redirect URL");
      }
      res.redirect(result.response.url);
    } else {
      res.status(500).json({ error: "No redirect URL received" });
    }
  } catch (error) {
    console.error("Error in /auth/start:", error);
    res.status(500).json({ error: "Authentication initiation failed" });
  }
});

app.post("/auth/logout", async (req, res) => {
  try {
    const result = await auth.api.signOut({
      headers: req.headers as Record<string, string>,
      returnHeaders: true,
    });

    if (result.headers) {
      result.headers.forEach((value, key) => {
        if (key.toLowerCase() === "set-cookie") {
          res.append(key, value);
        } else {
          res.setHeader(key, value);
        }
      });
    }

    res.redirect("/login");
  } catch (error) {
    console.error("Error in /auth/logout:", error);
    res.status(500).json({ error: "Logout failed" });
  }
});

// Proxy everything else to Vite dev server
app.use(
  createProxyMiddleware({
    target: `http://localhost:${VITE_PORT}`,
    changeOrigin: true,
    ws: true,
    logLevel: 'silent',
  })
);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Proxying to Vite dev server on http://localhost:${VITE_PORT}`);
});
