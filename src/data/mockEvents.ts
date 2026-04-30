import type { CalendarEvent } from '../types';

export const MOCK_EVENTS: CalendarEvent[] = [
    { id: "e1", title: "Team Standup",            startHour: 9,  duration: 1, source: "google" },
    { id: "e2", title: "Deep Work: Feature Build", startHour: 10, duration: 2, source: "google" },
    { id: "e3", title: "Lunch",                   startHour: 12, duration: 1, source: "manual" },
    { id: "e4", title: "Code Review",             startHour: 14, duration: 1, source: "google" },
  ];