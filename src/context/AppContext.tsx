import { useState, createContext, useContext, FC, ReactNode } from "react";
import type { BrainDumpItem, CalendarEvent, TaskList } from '../types/index';

import { MOCK_BRAIN_DUMP } from '../data/mockBrainDump';
import { MOCK_EVENTS } from '../data/mockEvents';
import { MOCK_TASK_LISTS } from '../data/mockTasks';

interface AppContextValue {
    brainDump:           BrainDumpItem[];
    addBrainItem:        (text: string) => void;
    deleteBrainItem:     (id: string) => void;
    moveBrainToTimeBox:  (item: BrainDumpItem, hour: number) => void;
  
    events:      CalendarEvent[];
    addEvent:    (title: string, startHour: number) => void;
    deleteEvent: (id: string) => void;
  
    taskLists:   TaskList[];
    addTask:     (listId: string, title: string) => void;
    toggleTask:  (listId: string, taskId: string) => void;
    deleteTask:  (listId: string, taskId: string) => void;
  }
  
const AppCtx = createContext<AppContextValue | null>(null);

export const AppProvider: FC<{ children: ReactNode }> = ({ children }) => {
  // TODO: replace with API — see src/services/googleCalendar.ts
  const [brainDump,  setBrainDump]  = useState<BrainDumpItem[]>(MOCK_BRAIN_DUMP);
  const [events,     setEvents]     = useState<CalendarEvent[]>(MOCK_EVENTS);
  const [taskLists,  setTaskLists]  = useState<TaskList[]>(MOCK_TASK_LISTS);

  const addBrainItem = (text: string) =>
    setBrainDump(p => [{ id: `bd-${Date.now()}`, text }, ...p]);

  const deleteBrainItem = (id: string) =>
    setBrainDump(p => p.filter(i => i.id !== id));

  const moveBrainToTimeBox = (item: BrainDumpItem, hour: number) => {
    setEvents(p => [...p, { id: `ev-${Date.now()}`, title: item.text, startHour: hour, duration: 1, source: "manual" }]);
    deleteBrainItem(item.id);
  };

  const addEvent = (title: string, startHour: number) =>
    setEvents(p => [...p, { id: `ev-${Date.now()}`, title, startHour, duration: 1, source: "manual" }]);

  const deleteEvent = (id: string) => setEvents(p => p.filter(e => e.id !== id));

  const addTask = (listId: string, title: string) =>
    setTaskLists(p => p.map(l =>
      l.id !== listId ? l :
      { ...l, tasks: [...l.tasks, { id: `t-${Date.now()}`, title, completed: false }] }
    ));

  const toggleTask = (listId: string, taskId: string) =>
    setTaskLists(p => p.map(l =>
      l.id !== listId ? l :
      { ...l, tasks: l.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t) }
    ));

  const deleteTask = (listId: string, taskId: string) =>
    setTaskLists(p => p.map(l =>
      l.id !== listId ? l :
      { ...l, tasks: l.tasks.filter(t => t.id !== taskId) }
    ));

  return (
    <AppCtx.Provider value={{
      brainDump, addBrainItem, deleteBrainItem, moveBrainToTimeBox,
      events, addEvent, deleteEvent,
      taskLists, addTask, toggleTask, deleteTask,
    }}>
      {children}
    </AppCtx.Provider>
  );
};

export const useApp = (): AppContextValue => {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
};

console.log('app context module loaded', useApp)