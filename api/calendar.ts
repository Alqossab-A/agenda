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

const BASE = "https://www.googleapis.com/calendar/v3";

type Variables = { accessToken: string };
const app = new Hono<{ Variables: Variables }>();

/** Middleware — checks auth on every calendar route */
app.use("/api/calendar/*", async (c, next) => {
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

/** GET /api/calendar/events — today's events */
app.get('/api/calendar/events', async (c) => {
  const accessToken = c.get('accessToken')
  const timeZone    = c.req.query('timeZone') ?? 'America/Toronto'

  const now = new Date()

  // Get the UTC offset for the user's timezone
  const utcDate  = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }))
  const tzDate   = new Date(now.toLocaleString('en-US', { timeZone }))
  const diffMins = (tzDate.getTime() - utcDate.getTime()) / 60000
  const hours    = Math.floor(Math.abs(diffMins) / 60)
  const mins     = Math.abs(diffMins) % 60
  const sign     = diffMins >= 0 ? '+' : '-'
  const offset   = `${sign}${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`

  // Get today's date string in user's timezone
  const dateStr = now.toLocaleDateString('en-CA', { timeZone }) // "2026-05-03"

  // Build RFC3339 timestamps with timezone offset — what Google actually requires
  const timeMin = `${dateStr}T00:00:00${offset}`  // e.g. "2026-05-03T00:00:00-04:00"
  const timeMax = `${dateStr}T23:59:59${offset}`  // e.g. "2026-05-03T23:59:59-04:00"

  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: 'true',
    orderBy:      'startTime',
  })

  const res = await fetch(`${BASE}/calendars/primary/events?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) {
    const err = await res.text()
    return c.json({ error: err }, res.status as ContentfulStatusCode)
  }

  const data = await res.json()
  return c.json(data.items ?? [])
})

/** POST /api/calendar/events — create an event */
app.post('/api/calendar/events', async (c) => {
  const accessToken                              = c.get('accessToken')
  const { title, startMin, endMin, timeZone }   = await c.req.json()

  const now     = new Date()
  const dateStr = now.toLocaleDateString('en-CA', { timeZone }) // "2026-05-04"

  // Convert total minutes to HH:MM strings
  const toTimeStr = (totalMin: number): string => {
    const h = Math.floor(totalMin / 60) % 24
    const m = totalMin % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`
  }

  // Handle overnight (endMin < startMin)
  const endDate = endMin < startMin
    ? new Date(new Date(`${dateStr}T00:00:00`).getTime() + 24 * 60 * 60 * 1000)
        .toLocaleDateString('en-CA', { timeZone })
    : dateStr

  const googleEvent = {
    summary: title,
    start:   { dateTime: `${dateStr}T${toTimeStr(startMin)}`, timeZone },
    end:     { dateTime: `${endDate}T${toTimeStr(endMin)}`,   timeZone },
  }

  const res = await fetch(`${BASE}/calendars/primary/events`, {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(googleEvent),
  })

  if (!res.ok) return c.json({ error: 'Failed to create event' }, res.status as ContentfulStatusCode)
  return c.json(await res.json())
})

/** DELETE /api/calendar/events/:id */
app.delete("/api/calendar/events/:id", async (c) => {
  const accessToken = c.get("accessToken");
  const id = c.req.param("id");

  const res = await fetch(`${BASE}/calendars/primary/events/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok)
    return c.json(
      { error: "Failed to delete event" },
      res.status as ContentfulStatusCode,
    );
  return c.json({ success: true });
});

export default handle(app);
