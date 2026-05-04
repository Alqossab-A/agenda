import { Hono } from "hono";
import { handle } from "hono/vercel";
import { setCookie } from "hono/cookie";

export const config = { runtime: "edge" };

import { COOKIE_NAME } from "../lib/cookieOptions";

const app = new Hono();

app.get("/api/auth/logout", (c) => {
  setCookie(c, COOKIE_NAME, "", {
    maxAge: 0,
    httpOnly: true,
    sameSite: "Lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return c.redirect("/");
});

export default handle(app);
