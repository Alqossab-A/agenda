import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { getCookie, setCookie } from 'hono/cookie';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import {
	parseTokenCookie,
	getValidAccessToken,
	serializeTokenCookie,
} from './lib/token';
import { COOKIE_NAME } from './lib/cookieOptions';

export const config = { runtime: 'edge' };

const BASE = 'https://www.googleapis.com/calendar/v3';

type Variables = { accessToken: string };
const app = new Hono<{ Variables: Variables }>();

app.use('/api/calendar/*', async (c, next) => {
	const raw = getCookie(c, COOKIE_NAME);
	const tokens = parseTokenCookie(raw);
	if (!tokens) return c.json({ error: 'Unauthorized' }, 401);
	try {
		const valid = await getValidAccessToken(tokens);
		if (valid.accessToken !== tokens.accessToken) {
			setCookie(c, COOKIE_NAME, serializeTokenCookie(valid), {
				maxAge: 60 * 60 * 24 * 365,
				httpOnly: true,
				sameSite: 'Lax',
				secure: process.env.NODE_ENV === 'production',
				path: '/',
			});
		}
		c.set('accessToken', valid.accessToken);
		await next();
	} catch {
		return c.json({ error: 'Token refresh failed — please log in again' }, 401);
	}
});

const getTzOffset = (timeZone: string): string => {
	const now = new Date();
	const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
	const tzDate = new Date(now.toLocaleString('en-US', { timeZone }));
	const diffMins = (tzDate.getTime() - utcDate.getTime()) / 60000;
	const hh = Math.floor(Math.abs(diffMins) / 60);
	const mm = Math.abs(diffMins) % 60;
	const sign = diffMins >= 0 ? '+' : '-';
	return `${sign}${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
};

/** GET /api/calendar/events — today's events */
app.get('/api/calendar/events', async (c) => {
	const accessToken = c.get('accessToken');
	const timeZone = c.req.query('timeZone') ?? 'America/Toronto';
	const offset = getTzOffset(timeZone);
	const dateStr = new Date().toLocaleDateString('en-CA', { timeZone });

	const params = new URLSearchParams({
		timeMin: `${dateStr}T00:00:00${offset}`,
		timeMax: `${dateStr}T23:59:59${offset}`,
		singleEvents: 'true',
		orderBy: 'startTime',
	});

	const res = await fetch(`${BASE}/calendars/primary/events?${params}`, {
		headers: { Authorization: `Bearer ${accessToken}` },
	});
	if (!res.ok) {
		const err = await res.text();
		return c.json({ error: err }, res.status as ContentfulStatusCode);
	}
	const data = await res.json();
	return c.json(data.items ?? []);
});

/** GET /api/calendar/week — a work week's events */
app.get('/api/calendar/week', async (c) => {
	const accessToken = c.get('accessToken');
	const timeZone = c.req.query('timeZone') ?? 'America/Toronto';
	const weekStart = c.req.query('weekStart');

	if (!weekStart) return c.json({ error: 'weekStart required' }, 400);

	const offset = getTzOffset(timeZone);
	const endD = new Date(`${weekStart}T12:00:00`);
	endD.setDate(endD.getDate() + 6);
	const weekEnd = endD.toLocaleDateString('en-CA');

	const params = new URLSearchParams({
		timeMin: `${weekStart}T00:00:00${offset}`,
		timeMax: `${weekEnd}T23:59:59${offset}`,
		singleEvents: 'true',
		orderBy: 'startTime',
	});

	const res = await fetch(`${BASE}/calendars/primary/events?${params}`, {
		headers: { Authorization: `Bearer ${accessToken}` },
	});
	if (!res.ok) {
		const err = await res.text();
		return c.json({ error: err }, res.status as ContentfulStatusCode);
	}
	const data = await res.json();
	return c.json(data.items ?? []);
});

/** POST /api/calendar/events — create an event */
app.post('/api/calendar/events', async (c) => {
	const accessToken = c.get('accessToken');
	const { title, startMin, endMin, colorId, timeZone, date } =
		await c.req.json();

	// Use caller-supplied date, or fall back to today in user's timezone
	const dateStr =
		date && typeof date === 'string'
			? date
			: new Date().toLocaleDateString('en-CA', { timeZone });

	const toTimeStr = (totalMin: number): string => {
		const h = Math.floor(totalMin / 60) % 24;
		const m = totalMin % 60;
		return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
	};

	const endDate =
		endMin < startMin
			? new Date(
					new Date(`${dateStr}T00:00:00`).getTime() + 86_400_000,
				).toLocaleDateString('en-CA', { timeZone })
			: dateStr;

	const googleEvent = {
		summary: title,
		colorId: colorId ?? '1',
		start: { dateTime: `${dateStr}T${toTimeStr(startMin)}`, timeZone },
		end: { dateTime: `${endDate}T${toTimeStr(endMin)}`, timeZone },
	};

	const res = await fetch(`${BASE}/calendars/primary/events`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(googleEvent),
	});

	if (!res.ok)
		return c.json(
			{ error: 'Failed to create event' },
			res.status as ContentfulStatusCode,
		);
	return c.json(await res.json());
});

/** DELETE /api/calendar/events/:id */
app.delete('/api/calendar/events/:id', async (c) => {
	const accessToken = c.get('accessToken');
	const id = c.req.param('id');
	const res = await fetch(`${BASE}/calendars/primary/events/${id}`, {
		method: 'DELETE',
		headers: { Authorization: `Bearer ${accessToken}` },
	});
	if (!res.ok)
		return c.json(
			{ error: 'Failed to delete event' },
			res.status as ContentfulStatusCode,
		);
	return c.json({ success: true });
});

export default handle(app);
