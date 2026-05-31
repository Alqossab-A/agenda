import type { CalendarEvent } from '../types';
import { listTitleToColorId } from '../utils/calendarColors';

const BASE = '/api/calendar';

export const fetchTodaysEvents = async (): Promise<CalendarEvent[]> => {
	const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
	const res = await fetch(
		`${BASE}/events?timeZone=${encodeURIComponent(timeZone)}`,
	);
	if (!res.ok) throw new Error('Failed to fetch events');
	return res.json();
};

export const fetchWeekEvents = async (
	weekStart: string,
): Promise<unknown[]> => {
	const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
	const res = await fetch(
		`${BASE}/week?weekStart=${weekStart}&timeZone=${encodeURIComponent(timeZone)}`,
	);
	if (!res.ok) throw new Error('Failed to fetch week events');
	return res.json();
};

export const createEvent = async (event: {
	title: string;
	startMin: number;
	endMin: number;
	listTitle?: string;
	date?: string; // 'YYYY-MM-DD'; omit for today
}): Promise<void> => {
	const res = await fetch(`${BASE}/events`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			title: event.title,
			startMin: event.startMin,
			endMin: event.endMin,
			colorId: event.listTitle ? listTitleToColorId(event.listTitle) : '1',
			timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
			date: event.date, // undefined → API defaults to today
		}),
	});
	if (!res.ok) throw new Error('Failed to create event');
};

export const deleteCalendarEvent = async (id: string): Promise<void> => {
	const res = await fetch(`${BASE}/events/${id}`, { method: 'DELETE' });
	if (!res.ok) throw new Error('Failed to delete event');
};
