export interface BrainDumpItem {
  id: string;
  text: string;
}

export interface CalendarEvent {
  id:        string
  title:     string
  startHour: number
  duration:  number
  colorId?:  string
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

export interface WeatherData {
  temp:      number | string
  condition: string
  wind:      number
  humidity:  number
  station:   string
  low:       number   
  high:      number    
}