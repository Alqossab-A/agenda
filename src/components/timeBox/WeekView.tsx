import { FC, useState, useEffect, useRef } from 'react'
import { useApp } from '../../context/AppContext'
import { colorIdToHex } from '../../utils/calendarColors'
import { SLOT_H, HOURS, formatHour } from '../../utils/timeUtils'

const LABEL_W = 68                         // matches daily view label width
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

interface WeekEvent {
  id: string
  title: string
  dateStr: string   // 'YYYY-MM-DD'
  startHour: number   // fractional, e.g. 9.5 = 9:30am
  duration: number   // hours
  colorId?: string
}

interface GRaw {
  id: string
  summary?: string
  colorId?: string
  start?: { dateTime?: string; date?: string }
  end?: { dateTime?: string; date?: string }
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

export const WeekView: FC = () => {
  const { deleteEvent, eventsSyncVersion } = useApp()
  const [weekStart, setWeekStart] = useState<Date>(() => getMonday(new Date()))
  const [events, setEvents] = useState<WeekEvent[]>([])
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const nowLineRef = useRef<HTMLDivElement>(null)

  const todayStr = toDateStr(new Date())
  const weekDates = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return d
  })

  // Scroll to current time on first mount
  useEffect(() => {
    nowLineRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [])

  // Fetch week events whenever week or event version changes
  useEffect(() => {
    const load = async () => {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
        const ws = toDateStr(weekStart)
        const res = await fetch(
          `/api/calendar/week?weekStart=${ws}&timeZone=${encodeURIComponent(tz)}`
        )
        if (!res.ok) return
        const items: GRaw[] = await res.json()
        const adapted: WeekEvent[] = []
        for (const e of items) {
          const startDt = e.start?.dateTime
          if (!startDt) continue                // skip all-day events
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
        setEvents(adapted)
      } catch (err) {
        console.error('WeekView fetch failed:', err)
      }
    }
    load()
  }, [weekStart, eventsSyncVersion])

  const prevWeek = () => setWeekStart(d => { const n = new Date(d); n.setDate(n.getDate() - 7); return n })
  const nextWeek = () => setWeekStart(d => { const n = new Date(d); n.setDate(n.getDate() + 7); return n })

  const handleDelete = async (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id))   // optimistic
    await deleteEvent(id)
  }

  const monthLabel = weekDates[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  // Current-time line
  const now = new Date()
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const nowLineTop = (nowMin / 60 - 1) * SLOT_H        // matches TimeGrid formula

  const navBtnStyle = {
    width: 24, height: 24, background: 'none', border: '1px solid #e7e5e4',
    borderRadius: 4, cursor: 'pointer', fontSize: 14, color: '#78716c',
    padding: 0, lineHeight: '22px', textAlign: 'center' as const,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', borderRight: '1px solid #e7e5e4' }}>

      {/* ── Header ── */}
      <div style={{ flexShrink: 0, borderBottom: '1px solid #e7e5e4' }}>

        {/* Nav row */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 20px 0',
        }}>
          <span style={{
            fontSize: 11, fontWeight: 700, color: '#4b4642',
            letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            {monthLabel}
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={prevWeek} style={navBtnStyle}>‹</button>
            <button onClick={nextWeek} style={navBtnStyle}>›</button>
          </div>
        </div>

        {/* Day headers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `${LABEL_W}px repeat(5, 1fr)`,
          padding: '8px 20px 0',
        }}>
          <div />
          {weekDates.map((d, i) => {
            const isToday = toDateStr(d) === todayStr
            return (
              <div key={i} style={{ textAlign: 'center', paddingBottom: 12 }}>
                <div style={{
                  fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
                  fontWeight: 600, color: isToday ? '#6366f1' : '#4b464',
                }}>
                  {DAY_NAMES[i]}
                </div>
                <div style={{
                  fontSize: 22, fontWeight: isToday ? 700 : 300,
                  marginTop: 3, letterSpacing: '-0.02em',
                  color: isToday ? '#6366f1' : '#4b464',
                }}>
                  {d.getDate()}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Scrollable time grid ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px' }}>
        <div style={{ position: 'relative' }}>

          {/* Hour rows — all 24 hours matching daily view */}
          {HOURS.map(h => (
            <div key={h} style={{
              display: 'grid',
              gridTemplateColumns: `${LABEL_W}px repeat(5, 1fr)`,
              height: SLOT_H,
            }}>
              <div style={{
                fontSize: 12, color: '#111111', paddingLeft: 4,
                lineHeight: 1,
              }}>
                {formatHour(h)}
              </div>
              {weekDates.map((d, col) => (
                <div key={col} style={{
                  borderTop: '1px solid #a0a0a090',
                  background: toDateStr(d) === todayStr ? '#f7f7ff' : 'none',
                }} />
              ))}
            </div>
          ))}

          {/* Current time line */}
          {nowMin >= 60 && (
            <div
              ref={nowLineRef}
              style={{
                position: 'absolute', left: LABEL_W, right: 0, top: nowLineTop,
                display: 'flex', alignItems: 'center', zIndex: 30, pointerEvents: 'none',
              }}
            >
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', marginLeft: -3, flexShrink: 0 }} />
              <div style={{ flex: 1, height: 1, background: '#ef4444' }} />
            </div>
          )}

          {/* Events */}
          {events.map((ev, idx) => {
            const col = weekDates.findIndex(d => toDateStr(d) === ev.dateStr)
            if (col === -1) return null

            const isToday = ev.dateStr === todayStr
            const color = colorIdToHex(ev.colorId)
            const top = (ev.startHour - 1) * SLOT_H + 2   // matches TimeGrid formula
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
                  left: `calc(${LABEL_W}px + ${col} * (100% - ${LABEL_W}px) / 5 + 3px)`,
                  width: `calc((100% - ${LABEL_W}px) / 5 - 8px)`,
                  height,
                  background: isToday ? '#eef2ff' : `${color}`,
                  border: `1px solid ${isToday ? '#c7d2fe' : '#e7e5e4'}`,
                  borderLeft: `2px solid ${color}`,
                  borderRadius: 6,
                  padding: '4px 6px',
                  overflow: 'hidden',
                  boxSizing: 'border-box',
                  cursor: 'default',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <div style={{
                    flex: 1, fontSize: 11, fontWeight: 600,
                    color: isToday ? '#4338ca' : '#f7f7ff',
                    lineHeight: 1.35, overflow: 'hidden',
                    textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {ev.title}
                  </div>
                  {isHov && (
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(ev.id) }}
                      style={{
                        flexShrink: 0, fontSize: 13, color: '#ef4444',
                        background: 'none', border: 'none', cursor: 'pointer',
                        lineHeight: 1, padding: '0 1px',
                      }}
                    >×</button>
                  )}
                </div>
                {ev.duration >= 0.75 && (
                  <div style={{ fontSize: 10, color: '#ffffff', marginTop: 1 }}>
                    {fmtShort(ev.startHour)}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}