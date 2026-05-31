import { FC, useState, useEffect, useRef, useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import { colorIdToHex } from '../../utils/calendarColors'
import { SLOT_H, HOURS, formatHour } from '../../utils/timeUtils'

const LABEL_W = 68
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const TOTAL_DAYS = 365
const OFFSET_TODAY = 182 // roughly middle of our 365 day buffer

// Added timeBoxOpen prop
interface WeekViewProps {
  timeBoxOpen?: boolean
}

interface WeekEvent {
  id: string
  title: string
  dateStr: string
  startHour: number
  duration: number
  colorId?: string
}

interface GRaw {
  id: string
  summary?: string
  colorId?: string
  start?: { dateTime?: string; date?: string }
  end?: { dateTime?: string; date?: string }
}

const addDays = (d: Date, num: number) => {
  const r = new Date(d)
  r.setDate(r.getDate() + num)
  return r
}

const getMonday = (d: Date): Date => {
  const r = new Date(d)
  r.setDate(r.getDate() - (r.getDay() === 0 ? 6 : r.getDay() - 1))
  r.setHours(0, 0, 0, 0)
  return r
}

const toDateStr = (d: Date): string => d.toLocaleDateString('en-CA')

const fmtShort = (h: number): string => {
  const w = Math.floor(h)
  const m = Math.round((h - w) * 60)
  const p = w < 12 ? 'am' : 'pm'
  const h12 = w === 0 ? 12 : w > 12 ? w - 12 : w
  return m === 0 ? `${h12}${p}` : `${h12}:${String(m).padStart(2, '0')}${p}`
}

export const WeekView: FC<WeekViewProps> = ({ timeBoxOpen }) => {
  const { deleteEvent, eventsSyncVersion } = useApp()

  // Create our massive 365-day continuous timeline buffer
  const [baseDate] = useState(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return addDays(d, -OFFSET_TODAY)
  })

  const days = useMemo(() => Array.from({ length: TOTAL_DAYS }, (_, i) => addDays(baseDate, i)), [baseDate])
  const dayIndices = useMemo(() => {
    const map = new Map<string, number>()
    days.forEach((d, i) => map.set(toDateStr(d), i))
    return map
  }, [days])

  const todayStr = toDateStr(new Date())

  // Layout & Scroll State
  const scrollRef = useRef<HTMLDivElement>(null)
  const [dayWidth, setDayWidth] = useState(0)
  const hasInitScroll = useRef(false)
  const [visibleDate, setVisibleDate] = useState(new Date())

  // Fetching State
  const [events, setEvents] = useState<WeekEvent[]>([])
  const loadedWeeks = useRef(new Set<string>())
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  // Drag to pan mechanics
  const [isDragging, setIsDragging] = useState(false)
  const dragInfo = useRef({ active: false, startX: 0, startY: 0, sl: 0, st: 0 })

  // Measure container width and set day width (+20% wider)
  useEffect(() => {
    if (!scrollRef.current) return
    const obs = new ResizeObserver(entries => {
      const w = entries[0].contentRect.width
      setDayWidth(((w - LABEL_W) / 7) * 1.2)
    })
    obs.observe(scrollRef.current)
    return () => obs.disconnect()
  }, [])

  // Standard fetch for infinite scrolling
  const fetchWeek = async (mondayStr: string) => {
    if (loadedWeeks.current.has(mondayStr)) return
    loadedWeeks.current.add(mondayStr)
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      const res = await fetch(`/api/calendar/week?weekStart=${mondayStr}&timeZone=${encodeURIComponent(tz)}`)
      if (!res.ok) return
      const items: GRaw[] = await res.json()
      const adapted: WeekEvent[] = []

      for (const e of items) {
        const startDt = e.start?.dateTime
        if (!startDt) continue
        const start = new Date(startDt)
        const end = new Date(e.end?.dateTime ?? e.end?.date ?? '')
        adapted.push({
          id: e.id,
          title: e.summary ?? '(No title)',
          dateStr: toDateStr(start),
          startHour: start.getHours() + start.getMinutes() / 60,
          duration: Math.max(0.25, (end.getTime() - start.getTime()) / 3_600_000),
          colorId: e.colorId,
        })
      }

      setEvents(prev => {
        const merged = [...prev, ...adapted]
        const deduped = new Map<string, WeekEvent>()
        merged.forEach(ev => deduped.set(ev.id, ev))
        return Array.from(deduped.values())
      })
    } catch (err) {
      console.error('Fetch failed for', mondayStr, err)
    }
  }

  const handleScroll = () => {
    if (!scrollRef.current || dayWidth === 0) return
    const sl = scrollRef.current.scrollLeft

    // Calculate which day index is in the center of the screen
    const centerIndex = Math.max(0, Math.min(TOTAL_DAYS - 1, Math.floor(sl / dayWidth + 3.5)))
    const centerD = days[centerIndex]
    setVisibleDate(centerD)

    // Load the week of the center date, plus the week before and after to ensure smooth infinite buffering
    const monday = getMonday(centerD)
    const weeksToLoad = [
      toDateStr(addDays(monday, -7)),
      toDateStr(monday),
      toDateStr(addDays(monday, 7))
    ]
    weeksToLoad.forEach(str => fetchWeek(str))
  }

  // Initial scroll to today + timeline centering
  useEffect(() => {
    if (dayWidth > 0 && !hasInitScroll.current && scrollRef.current) {
      scrollRef.current.scrollLeft = (OFFSET_TODAY - 3) * dayWidth // Centers today

      // Calculate scroll to current time 
      const now = new Date()
      const nowMin = now.getHours() * 60 + now.getMinutes()
      const topOffset = Math.max(0, (nowMin / 60 - 2) * SLOT_H)
      scrollRef.current.scrollTop = topOffset

      hasInitScroll.current = true
      handleScroll()
    }
  }, [dayWidth])

  // ── SEAMLESS BACKGROUND SYNC ──
  useEffect(() => {
    const backgroundSync = async () => {
      if (!scrollRef.current || dayWidth === 0) return

      const sl = scrollRef.current.scrollLeft
      const centerIndex = Math.max(0, Math.min(TOTAL_DAYS - 1, Math.floor(sl / dayWidth + 3.5)))
      const centerD = days[centerIndex]

      const monday = getMonday(centerD)
      const weeksToLoad = [
        toDateStr(addDays(monday, -7)),
        toDateStr(monday),
        toDateStr(addDays(monday, 7))
      ]

      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
        const refreshed: WeekEvent[] = []

        await Promise.all(weeksToLoad.map(async (ws) => {
          const res = await fetch(`/api/calendar/week?weekStart=${ws}&timeZone=${encodeURIComponent(tz)}`)
          if (!res.ok) return
          const items: GRaw[] = await res.json()
          for (const e of items) {
            const startDt = e.start?.dateTime
            if (!startDt) continue
            const start = new Date(startDt)
            const end = new Date(e.end?.dateTime ?? e.end?.date ?? '')
            refreshed.push({
              id: e.id,
              title: e.summary ?? '(No title)',
              dateStr: toDateStr(start),
              startHour: start.getHours() + start.getMinutes() / 60,
              duration: Math.max(0.25, (end.getTime() - start.getTime()) / 3_600_000),
              colorId: e.colorId,
            })
          }
        }))

        setEvents(refreshed)
        loadedWeeks.current.clear()
        weeksToLoad.forEach(w => loadedWeeks.current.add(w))

      } catch (err) {
        console.error('Seamless background sync failed:', err)
      }
    }

    if (hasInitScroll.current) {
      backgroundSync()
    }
  }, [eventsSyncVersion, dayWidth, days])


  const snapToToday = () => {
    if (!scrollRef.current || dayWidth === 0) return
    scrollRef.current.scrollTo({
      left: (OFFSET_TODAY - 3) * dayWidth,
      behavior: 'smooth'
    })
  }

  // ── RECENTER ON TOGGLE ──
  // Listens for the TimeBox slide state. Waits 310ms for the CSS animation to complete 
  // so the grid measurements are final before smoothly snapping back to today.
  useEffect(() => {
    if (timeBoxOpen !== undefined && hasInitScroll.current) {
      const timer = setTimeout(() => snapToToday(), 310)
      return () => clearTimeout(timer)
    }
  }, [timeBoxOpen])


  const handleDelete = async (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id))
    await deleteEvent(id)
  }

  // Pointer Handlers for Mouse Click-and-Drag Panning
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return
    if ((e.target as HTMLElement).closest('button')) return
    setIsDragging(true)
    dragInfo.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      sl: scrollRef.current!.scrollLeft,
      st: scrollRef.current!.scrollTop,
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragInfo.current.active || !scrollRef.current) return
    scrollRef.current.scrollLeft = dragInfo.current.sl - (e.clientX - dragInfo.current.startX)
    scrollRef.current.scrollTop = dragInfo.current.st - (e.clientY - dragInfo.current.startY)
  }

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false)
    dragInfo.current.active = false
    e.currentTarget.releasePointerCapture(e.pointerId)
  }

  const monthLabel = visibleDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const now = new Date()
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const nowLineTop = (nowMin / 60 - 1) * SLOT_H

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', borderRight: '1px solid #e7e5e4', backgroundColor: '#fff' }}>

      {/* ── Fixed Top Nav ── */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', borderBottom: '1px solid #e7e5e4', background: '#ffffff', zIndex: 60 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#4b4642', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {monthLabel}
        </span>
        <button
          onClick={snapToToday}
          style={{ padding: '4px 12px', fontSize: 12, fontWeight: 600, color: '#4b4642', background: '#f5f5f4', border: '1px solid #e7e5e4', borderRadius: 4, cursor: 'pointer' }}
        >
          Today
        </button>
      </div>

      {/* ── Infinite Scrolling Grid ── */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          flex: 1,
          overflow: 'auto',
          position: 'relative',
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none'
        }}
      >
        {/* Massive width container establishing the 365 day canvas */}
        <div style={{ width: LABEL_W + TOTAL_DAYS * dayWidth, position: 'relative', minHeight: 60 + 24 * SLOT_H }}>

          {/* Top-Left Empty Anchor Corner */}
          <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 50, width: LABEL_W, height: 60, background: '#fff', borderBottom: '1px solid #e7e5e4' }} />

          {/* Sticky Header Row (Day Names and Numbers) */}
          <div style={{ position: 'sticky', top: 0, zIndex: 40, height: 60, background: '#fff', display: 'flex', borderBottom: '1px solid #e7e5e4' }}>
            <div style={{ width: LABEL_W, flexShrink: 0 }} /> {/* Spacer */}
            {days.map((d, i) => {
              const isToday = toDateStr(d) === todayStr
              return (
                <div key={i} style={{ width: dayWidth, flexShrink: 0, textAlign: 'center', paddingTop: 8 }}>
                  <div style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, color: isToday ? '#6366f1' : '#4b4642' }}>
                    {DAY_NAMES[d.getDay()]}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: isToday ? 700 : 300, marginTop: 3, letterSpacing: '-0.02em', color: isToday ? '#6366f1' : '#4b4642' }}>
                    {d.getDate()}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Core Time Grid Area */}
          <div style={{ position: 'relative', height: 24 * SLOT_H }}>

            {/* Sticky Time Labels Left Column */}
            <div style={{ position: 'sticky', left: 0, width: LABEL_W, height: '100%', background: '#fff', zIndex: 30, borderRight: '1px solid #e7e5e4' }}>
              {HOURS.map(h => (
                <div key={`l-${h}`} style={{ position: 'absolute', top: (h - 1) * SLOT_H, height: SLOT_H, width: '100%', fontSize: 12, color: '#111111', paddingLeft: 4, lineHeight: 1 }}>
                  {formatHour(h)}
                </div>
              ))}
            </div>

            {/* Vertical Day Boundary Lines */}
            {days.map((_, i) => (
              <div key={`v-${i}`} style={{ position: 'absolute', top: 0, bottom: 0, left: LABEL_W + i * dayWidth, width: dayWidth, borderRight: '1px solid #e7e5e490', pointerEvents: 'none' }} />
            ))}

            {/* Current Time Red Indicator Line (Global Line + Local Dot) */}
            {nowMin >= 60 && (
              <>
                {/* Global red line stretching across all 365 days */}
                <div style={{ position: 'absolute', left: LABEL_W, width: TOTAL_DAYS * dayWidth, top: nowLineTop, height: 1, background: '#ef4444', zIndex: 24, pointerEvents: 'none' }} />

                {/* Anchor red dot exactly on the 'today' column */}
                {dayIndices.has(todayStr) && (
                  <div style={{ position: 'absolute', left: LABEL_W + dayIndices.get(todayStr)! * dayWidth - 3, top: nowLineTop - 2, width: 6, height: 6, borderRadius: '50%', background: '#ef4444', zIndex: 25, pointerEvents: 'none' }} />
                )}
              </>
            )}

            {/* Absolute Positioned Events */}
            {events.map((ev, idx) => {
              const colIndex = dayIndices.get(ev.dateStr)
              if (colIndex === undefined) return null

              const color = colorIdToHex(ev.colorId)
              const top = (ev.startHour - 1) * SLOT_H + 2
              const height = Math.max(ev.duration * SLOT_H - 4, 18)
              const isHov = hoveredId === ev.id

              return (
                <div
                  key={`${ev.id}-${idx}`}
                  onMouseEnter={() => setHoveredId(ev.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    position: 'absolute',
                    top,
                    left: LABEL_W + colIndex * dayWidth + 3,
                    width: dayWidth - 8,
                    height,
                    background: color,
                    borderRadius: 6,
                    padding: '4px 6px',
                    overflow: 'hidden',
                    boxSizing: 'border-box',
                    cursor: 'default',
                    zIndex: 20
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <div style={{ flex: 1, fontSize: 11, fontWeight: 600, color: '#ffffff', lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ev.title}
                    </div>
                    {isHov && (
                      <button
                        onClick={e => { e.stopPropagation(); handleDelete(ev.id) }}
                        style={{ flexShrink: 0, fontSize: 13, color: '#ffffff', background: 'rgba(0,0,0,0.2)', border: 'none', borderRadius: '50%', cursor: 'pointer', lineHeight: 1, padding: '0 4px', marginLeft: 4 }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                  {ev.duration >= 0.75 && (
                    <div style={{ fontSize: 10, color: '#ffffff', marginTop: 1, opacity: 0.9 }}>
                      {fmtShort(ev.startHour)}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}