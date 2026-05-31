import type { CalendarEvent } from '../../types'
import { FC, useState, useRef, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { HOURS, SLOT_H, SLOT_H_MOBILE } from '../../utils/timeUtils'
import { TimeSlot } from './TimeSlot'
import { TimeBoxEvent } from './TimeBoxEvent'

// ── Lane assignment algorithm ─────────────────────────────
interface EventLayout {
  event: CalendarEvent
  lane: number
  totalLanes: number
}

const computeEventLayouts = (events: CalendarEvent[]): EventLayout[] => {
  if (events.length === 0) return []

  const sorted = [...events].sort((a, b) => a.startHour - b.startHour)
  const laneEndTimes: number[] = []

  // Assign each event to the earliest available lane
  const assignments: { event: CalendarEvent; lane: number }[] = sorted.map(ev => {
    let lane = laneEndTimes.findIndex(end => end <= ev.startHour)
    if (lane === -1) {
      lane = laneEndTimes.length
      laneEndTimes.push(ev.startHour + ev.duration)
    } else {
      laneEndTimes[lane] = ev.startHour + ev.duration
    }
    return { event: ev, lane }
  })

  // For each event, count how many lanes are active at the same time
  return assignments.map(({ event, lane }) => {
    const activeLanes = assignments
      .filter(({ event: other }) =>
        other.startHour < event.startHour + event.duration &&
        other.startHour + other.duration > event.startHour
      )
      .map(o => o.lane)
    const totalLanes = Math.max(...activeLanes) + 1
    return { event, lane, totalLanes }
  })
}

// ── Component ─────────────────────────────────────────────
interface TimeGridProps {
  isMobile?: boolean
}

export const TimeGrid: FC<TimeGridProps> = ({ isMobile }) => {
  const { events, deleteEvent } = useApp()
  const slotH = isMobile ? SLOT_H_MOBILE : SLOT_H
  const labelW = isMobile ? 56 : 68

  const getNow = (): number => {
    const d = new Date()
    return d.getHours() * 60 + d.getMinutes()
  }

  const [nowMin, setNowMin] = useState<number>(getNow)
  const lineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const id = setInterval(() => setNowMin(getNow()), 60_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    lineRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [])

  const lineTop: number = (nowMin / 60 - 1) * slotH
  const showLine: boolean = nowMin >= 60 && nowMin <= 24 * 60

  const eventLayouts = computeEventLayouts(events)

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {/* ── Hour lines ── */}
      {HOURS.map(h => <TimeSlot key={h} hour={h} isMobile={isMobile} />)}

      {/* ── Current time line ── */}
      {showLine && (
        <div
          ref={lineRef}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: lineTop,
            display: 'flex',
            alignItems: 'center',
            zIndex: 30,
            pointerEvents: 'none',
          }}
        >
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', marginLeft: -4, flexShrink: 0 }} />
          <div style={{ flex: 1, height: 1, background: '#ef4444' }} />
        </div>
      )}

      {/* ── Events — absolutely positioned on continuous timeline ── */}
      {eventLayouts.map(({ event, lane, totalLanes }) => {
        // top: distance from 1AM (hour 1 = y:0)
        const top = (event.startHour - 1) * slotH + 2
        const height = event.duration * slotH - 4

        // horizontal: split the event area (right of label) into lanes
        // left  = labelW + lane  * eventAreaWidth / totalLanes
        // width = eventAreaWidth / totalLanes
        const leftCalc = `calc(${labelW}px + ${lane} * (100% - ${labelW}px) / ${totalLanes})`
        const widthCalc = `calc((100% - ${labelW}px) / ${totalLanes} - 2rem)`

        return (
          <div
            key={event.id}
            style={{
              position: 'absolute',
              top,
              height,
              left: leftCalc,
              width: widthCalc,
              zIndex: 10,
            }}
          >
            <TimeBoxEvent
              event={event}
              onDelete={(e) => {
                e.stopPropagation()
                deleteEvent(event.id)
              }}
            />
          </div>
        )
      })}
    </div>
  )
}