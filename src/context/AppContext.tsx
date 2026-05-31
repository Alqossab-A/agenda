import {
	useState, useEffect, useRef,
	createContext, useContext, FC, ReactNode,
} from 'react'
import type { BrainDumpItem, CalendarEvent, TaskList, Task } from '../types/index'
import {
	fetchTodaysEvents, createEvent as apiCreateEvent, deleteCalendarEvent,
} from '../services/googleCalendar'
import {
	fetchTaskLists, fetchTasks,
	createTask as apiCreateTask, updateTask,
	deleteTask as apiDeleteTask, createTaskList,
} from '../services/googleTasks'

const BRAIN_DUMP_NAME = 'Brain Dump'

interface GCalEvent {
	id: string
	summary?: string
	colorId?: string
	start?: { dateTime?: string; date?: string }
	end?: { dateTime?: string; date?: string }
}

interface GTask { id: string; title?: string; status?: 'needsAction' | 'completed' }
interface GTaskList { id: string; title?: string }

const adaptCalendarEvent = (e: GCalEvent): CalendarEvent => {
	const startDt = e.start?.dateTime ?? e.start?.date ?? ''
	const endDt = e.end?.dateTime ?? e.end?.date ?? ''
	const startDate = new Date(startDt)
	const endDate = new Date(endDt)
	const startHour = (startDate.getHours() + startDate.getMinutes() / 60) || 1
	const duration = Math.max(0.25, (endDate.getTime() - startDate.getTime()) / 3_600_000)
	return { id: e.id, title: e.summary ?? '(No title)', startHour, duration, colorId: e.colorId }
}

const adaptTask = (t: GTask): Task => ({ id: t.id, title: t.title ?? '', completed: t.status === 'completed' })
const adaptTaskList = (l: GTaskList, tasks: Task[]): TaskList => ({ id: l.id, title: l.title ?? 'Untitled', tasks })

interface AppContextValue {
	brainDump: BrainDumpItem[]
	addBrainItem: (text: string) => void
	deleteBrainItem: (id: string) => void

	events: CalendarEvent[]
	addEvent: (title: string, startMin: number, endMin: number, listTitle?: string, date?: string) => void
	deleteEvent: (id: string) => void
	eventsSyncVersion: number

	taskLists: TaskList[]
	addTask: (listId: string, title: string) => void
	toggleTask: (listId: string, taskId: string) => void
	deleteTask: (listId: string, taskId: string) => void

	loading: boolean
	error: string | null
}

const AppCtx = createContext<AppContextValue | null>(null)

export const AppProvider: FC<{ children: ReactNode }> = ({ children }) => {
	const [brainDump, setBrainDump] = useState<BrainDumpItem[]>([])
	const [events, setEvents] = useState<CalendarEvent[]>([])
	const [taskLists, setTaskLists] = useState<TaskList[]>([])
	const [loading, setLoading] = useState<boolean>(true)
	const [error, setError] = useState<string | null>(null)
	const [eventsSyncVersion, setEventsSyncVersion] = useState<number>(0)

	const brainDumpListId = useRef<string | null>(null)

	// ── Fetch on mount ───────────────────────────────────────
	useEffect(() => {
		const load = async () => {
			setLoading(true); setError(null)
			try {
				const rawEvents: GCalEvent[] = await fetchTodaysEvents()
				setEvents(rawEvents.map(adaptCalendarEvent))

				const rawLists: GTaskList[] = await fetchTaskLists()
				let bdList = rawLists.find(l => l.title === BRAIN_DUMP_NAME)
				if (!bdList) bdList = await createTaskList(BRAIN_DUMP_NAME)
				brainDumpListId.current = bdList.id

				const rawBdTasks: GTask[] = await fetchTasks(bdList.id)
				setBrainDump(rawBdTasks.map(t => ({ id: t.id, text: t.title ?? '' })))

				const otherLists = rawLists.filter(l => l.title !== BRAIN_DUMP_NAME)
				const listsWithTasks = await Promise.all(
					otherLists.map(async l => {
						const rawTasks: GTask[] = await fetchTasks(l.id)
						return adaptTaskList(l, rawTasks.map(adaptTask))
					})
				)
				setTaskLists(listsWithTasks)
			} catch (err) {
				console.error('Failed to load data:', err)
				setError('Failed to load data. Are you logged in?')
			} finally {
				setLoading(false)
			}
		}
		load()
	}, [])

	// ── Poll every 60 s ───────────────────────────────────────
	useEffect(() => {
		const id = setInterval(async () => {
			try {
				const rawEvents: GCalEvent[] = await fetchTodaysEvents()
				setEvents(rawEvents.map(adaptCalendarEvent))
			} catch (err) { console.error('Poll failed:', err) }
		}, 60_000)
		return () => clearInterval(id)
	}, [])

	// ── Refetch on tab focus ──────────────────────────────────
	useEffect(() => {
		const onVisibility = async () => {
			if (document.visibilityState !== 'visible') return
			try {
				const rawEvents: GCalEvent[] = await fetchTodaysEvents()
				setEvents(rawEvents.map(adaptCalendarEvent))
			} catch (err) { console.error('Visibility refetch failed:', err) }
		}
		document.addEventListener('visibilitychange', onVisibility)
		return () => document.removeEventListener('visibilitychange', onVisibility)
	}, [])

	// ── Brain dump ────────────────────────────────────────────
	const addBrainItem = async (text: string) => {
		const tempId = `bd-${Date.now()}`
		setBrainDump(p => [{ id: tempId, text }, ...p])
		if (!brainDumpListId.current) return
		try {
			const created: GTask = await apiCreateTask(brainDumpListId.current, { title: text })
			setBrainDump(p => p.map(i => i.id === tempId ? { id: created.id ?? tempId, text } : i))
		} catch {
			setBrainDump(p => p.filter(i => i.id !== tempId))
		}
	}

	const deleteBrainItem = async (id: string) => {
		setBrainDump(p => p.filter(i => i.id !== id))
		if (!brainDumpListId.current) return
		try { await apiDeleteTask(brainDumpListId.current, id) }
		catch (err) { console.error('Failed to delete brain dump item:', err) }
	}

	// ── Events ────────────────────────────────────────────────
	const addEvent = async (
		title: string, startMin: number, endMin: number,
		listTitle?: string, date?: string,
	) => {
		try {
			await apiCreateEvent({ title, startMin, endMin, listTitle, date })
			const rawEvents: GCalEvent[] = await fetchTodaysEvents()
			setEvents(rawEvents.map(adaptCalendarEvent))
			setEventsSyncVersion(v => v + 1)    // triggers WeekView refetch
		} catch (err) { console.error('Failed to create event:', err) }
	}

	const deleteEvent = async (id: string) => {
		try {
			await deleteCalendarEvent(id)
			const rawEvents: GCalEvent[] = await fetchTodaysEvents()
			setEvents(rawEvents.map(adaptCalendarEvent))
			setEventsSyncVersion(v => v + 1)    // triggers WeekView refetch
		} catch (err) { console.error('Failed to delete event:', err) }
	}

	// ── Tasks ─────────────────────────────────────────────────
	const addTask = async (listId: string, title: string) => {
		const tempId = `t-${Date.now()}`
		setTaskLists(p => p.map(l => l.id !== listId ? l : { ...l, tasks: [...l.tasks, { id: tempId, title, completed: false }] }))
		try {
			const created: GTask = await apiCreateTask(listId, { title })
			setTaskLists(p => p.map(l => l.id !== listId ? l : { ...l, tasks: l.tasks.map(t => t.id === tempId ? adaptTask(created) : t) }))
		} catch {
			setTaskLists(p => p.map(l => l.id !== listId ? l : { ...l, tasks: l.tasks.filter(t => t.id !== tempId) }))
		}
	}

	const toggleTask = async (listId: string, taskId: string) => {
		setTaskLists(p => p.map(l => l.id !== listId ? l : { ...l, tasks: l.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t) }))
		const task = taskLists.find(l => l.id === listId)?.tasks.find(t => t.id === taskId)
		if (!task) return
		try {
			await updateTask(listId, taskId, { status: task.completed ? 'needsAction' : 'completed' })
		} catch {
			setTaskLists(p => p.map(l => l.id !== listId ? l : { ...l, tasks: l.tasks.map(t => t.id === taskId ? { ...t, completed: task.completed } : t) }))
		}
	}

	const deleteTask = async (listId: string, taskId: string) => {
		setTaskLists(p => p.map(l => l.id !== listId ? l : { ...l, tasks: l.tasks.filter(t => t.id !== taskId) }))
		try { await apiDeleteTask(listId, taskId) }
		catch (err) { console.error('Failed to delete task:', err) }
	}

	return (
		<AppCtx.Provider value={{
			brainDump, addBrainItem, deleteBrainItem,
			events, addEvent, deleteEvent, eventsSyncVersion,
			taskLists, addTask, toggleTask, deleteTask,
			loading, error,
		}}>
			{children}
		</AppCtx.Provider>
	)
}

export const useApp = (): AppContextValue => {
	const ctx = useContext(AppCtx)
	if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
	return ctx
}