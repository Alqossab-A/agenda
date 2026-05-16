import { Hono } from "hono";
import { handle } from "hono/vercel";
import { getCookie, setCookie } from "hono/cookie";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import {
  parseTokenCookie,
  getValidAccessToken,
  serializeTokenCookie,
} from "./lib/token";
import { COOKIE_NAME } from "./lib/cookieOptions";

export const config = { runtime: "edge" };

const BASE = "https://www.googleapis.com/tasks/v1";

type Variables = { accessToken: string };
const app = new Hono<{ Variables: Variables }>();

app.use("*", async (c, next) => {
  const raw = getCookie(c, COOKIE_NAME);
  const tokens = parseTokenCookie(raw);
  if (!tokens) return c.json({ error: "Unauthorized" }, 401);

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
    c.set("accessToken", valid.accessToken);
    await next();
  } catch {
    return c.json({ error: "Token refresh failed — please log in again" }, 401);
  }
});

app.get("/api/tasks/lists", async (c) => {
  const accessToken = c.get("accessToken");
  const res = await fetch(`${BASE}/users/@me/lists`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok)
    return c.json(
      { error: "Failed to fetch task lists" },
      res.status as ContentfulStatusCode,
    );
  const data = await res.json();
  return c.json(data.items ?? []);
});

app.get("/api/tasks/lists/:listId/tasks", async (c) => {
  const accessToken = c.get("accessToken");
  const listId = c.req.param("listId");

  const res = await fetch(`${BASE}/lists/${listId}/tasks?showCompleted=false`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok)
    return c.json(
      { error: "Failed to fetch tasks" },
      res.status as ContentfulStatusCode,
    );
  const data = await res.json();
  return c.json(data.items ?? []);
});

app.post("/api/tasks/lists/:listId/tasks", async (c) => {
  const accessToken = c.get("accessToken");
  const listId = c.req.param("listId");
  const body = await c.req.json();
  const res = await fetch(`${BASE}/lists/${listId}/tasks`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok)
    return c.json(
      { error: "Failed to create task" },
      res.status as ContentfulStatusCode,
    );
  return c.json(await res.json());
});

/** POST /api/tasks/lists — create a new task list */
app.post("/api/tasks/lists", async (c) => {
  const accessToken = c.get("accessToken");
  const body = await c.req.json();

  const res = await fetch(`${BASE}/users/@me/lists`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok)
    return c.json(
      { error: "Failed to create task list" },
      res.status as ContentfulStatusCode,
    );
  return c.json(await res.json());
});

app.patch("/api/tasks/lists/:listId/tasks/:taskId", async (c) => {
  const accessToken = c.get("accessToken");
  const { listId, taskId } = c.req.param();
  const body = await c.req.json();
  const res = await fetch(`${BASE}/lists/${listId}/tasks/${taskId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok)
    return c.json(
      { error: "Failed to update task" },
      res.status as ContentfulStatusCode,
    );
  return c.json(await res.json());
});

app.delete("/api/tasks/lists/:listId/tasks/:taskId", async (c) => {
  const accessToken = c.get("accessToken");
  const { listId, taskId } = c.req.param();
  const res = await fetch(`${BASE}/lists/${listId}/tasks/${taskId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok)
    return c.json(
      { error: "Failed to delete task" },
      res.status as ContentfulStatusCode,
    );
  return c.json({ success: true });
});

export default handle(app);