import type { CalendarEvent } from "../types";

const BASE = "/api/calendar";

export const fetchTodaysEvents = async (): Promise<CalendarEvent[]> => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const res = await fetch(`/api/calendar/events?timeZone=${encodeURIComponent(timeZone)}`)
  if (!res.ok) throw new Error('Failed to fetch events')
  return res.json()
}

export const createEvent = async (
  event: { title: string; startMin: number; endMin: number }
): Promise<void> => {
  const res = await fetch('/api/calendar/events', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      title:    event.title,
      startMin: event.startMin,
      endMin:   event.endMin,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }),
  })
  if (!res.ok) throw new Error('Failed to create event')
}

export const deleteCalendarEvent = async (id: string): Promise<void> => {
  const res = await fetch(`${BASE}/events/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete event");
};
