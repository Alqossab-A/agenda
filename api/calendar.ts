import { Hono }                     from 'hono'
import { handle }                   from 'hono/vercel'
import { getCookie, setCookie }     from 'hono/cookie'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { parseTokenCookie, getValidAccessToken, serializeTokenCookie } from './lib/token'
import { COOKIE_NAME }              from './lib/cookieOptions'

export const config = { runtime: 'edge' }

const BASE = 'https://www.googleapis.com/calendar/v3'

type Variables = { accessToken: string }
const app = new Hono<{ Variables: Variables }>()

/** Middleware — checks auth on every calendar route */
app.use('*', async (c, next) => {
  const raw    = getCookie(c, COOKIE_NAME)
  const tokens = parseTokenCookie(raw)
  if (!tokens) return c.json({ error: 'Unauthorized' }, 401)

  try {
    const valid = await getValidAccessToken(tokens)
    if (valid.accessToken !== tokens.accessToken) {
      setCookie(c, COOKIE_NAME, serializeTokenCookie(valid), {
        maxAge:   60 * 60 * 24 * 365,
        httpOnly: true,
        sameSite: 'Lax',
        secure:   process.env.NODE_ENV === 'production',
        path:     '/',
      })
    }
    c.set('accessToken', valid.accessToken)
    await next()
  } catch {
    return c.json({ error: 'Token refresh failed — please log in again' }, 401)
  }
})

/** GET /api/calendar/events — today's events */
app.get('/api/calendar/events', async (c) => {
  const accessToken = c.get('accessToken')

  const now        = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfDay   = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)

  const params = new URLSearchParams({
    timeMin:      startOfDay.toISOString(),
    timeMax:      endOfDay.toISOString(),
    singleEvents: 'true',
    orderBy:      'startTime',
  })

  const res = await fetch(`${BASE}/calendars/primary/events?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) return c.json({ error: 'Failed to fetch events' }, res.status as ContentfulStatusCode)

  const data = await res.json()
  return c.json(data.items ?? [])
})

/** POST /api/calendar/events — create an event */
app.post('/api/calendar/events', async (c) => {
  const accessToken = c.get('accessToken')
  const body        = await c.req.json()

  const res = await fetch(`${BASE}/calendars/primary/events`, {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) return c.json({ error: 'Failed to create event' }, res.status as ContentfulStatusCode)
  return c.json(await res.json())
})

/** DELETE /api/calendar/events/:id */
app.delete('/api/calendar/events/:id', async (c) => {
  const accessToken = c.get('accessToken')
  const id          = c.req.param('id')

  const res = await fetch(`${BASE}/calendars/primary/events/${id}`, {
    method:  'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) return c.json({ error: 'Failed to delete event' }, res.status as ContentfulStatusCode)
  return c.json({ success: true })
})

export default handle(app)