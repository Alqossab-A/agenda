export interface BrainDumpItem {
  id: string;
  text: string;
}

export type Source = "google" | "manual";

export interface CalendarEvent {
  id: string;
  title: string;
  startHour: number; // 1–24
  duration: number; // hours
  source: Source;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskList {
  id: string;
  title: string;
  tasks: Task[];
}
