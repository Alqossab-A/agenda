import type { CalendarEvent } from '../types'

// TODO: wire with VITE_GOOGLE_CLIENT_ID + VITE_GOOGLE_API_KEY

export const fetchTodaysEvents = async (): Promise<CalendarEvent[]> => {
  // GET https://www.googleapis.com/calendar/v3/calendars/primary/events
  console.warn('fetchTodaysEvents: not implemented — using mock data')
  return []
}

export const createEvent = async (event: Omit<CalendarEvent, 'id'>): Promise<void> => {
  // POST https://www.googleapis.com/calendar/v3/calendars/primary/events
  console.warn('createEvent: not implemented', event)
}

export const deleteCalendarEvent = async (eventId: string): Promise<void> => {
  // DELETE https://www.googleapis.com/calendar/v3/calendars/primary/events/{eventId}
  console.warn('deleteCalendarEvent: not implemented', eventId)
}