import { Hono } from "hono";
import { handle } from "hono/vercel";
import { getCookie, setCookie } from "hono/cookie";

export const config = { runtime: "edge" };

import {
  parseTokenCookie,
  getValidAccessToken,
  serializeTokenCookie,
} from "../lib/token";
import { COOKIE_NAME } from "../lib/cookieOptions";

const app = new Hono();

app.get("/api/auth/me", async (c) => {
  const raw = getCookie(c, COOKIE_NAME);
  const tokens = parseTokenCookie(raw);

  if (!tokens) return c.json({ authenticated: false }, 401);

  try {
    const valid = await getValidAccessToken(tokens);
    if (valid.accessToken !== tokens.accessToken) {
      setCookie(c, COOKIE_NAME, serializeTokenCookie(valid), {
        maxAge: 60 * 60 * 24 * 365,
        httpOnly: true,
        sameSite: "Lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });
    }
    return c.json({ authenticated: true });
  } catch {
    return c.json({ authenticated: false }, 401);
  }
});

export default handle(app);
