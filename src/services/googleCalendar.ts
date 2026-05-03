import type { CalendarEvent } from '../types'

const BASE = '/api/calendar'

export const fetchTodaysEvents = async (): Promise<CalendarEvent[]> => {
  const res = await fetch(`${BASE}/events`)
  if (!res.ok) throw new Error('Failed to fetch events')
  return res.json()
}

export const createEvent = async (
  event: Pick<CalendarEvent, 'title' | 'startHour' | 'duration'>
): Promise<CalendarEvent> => {
  const res = await fetch(`${BASE}/events`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(event),
  })
  if (!res.ok) throw new Error('Failed to create event')
  return res.json()
}

export const deleteCalendarEvent = async (id: string): Promise<void> => {
  const res = await fetch(`${BASE}/events/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete event')
}