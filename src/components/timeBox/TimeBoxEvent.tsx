import type { CalendarEvent } from '../../types'
import { FC, useState } from 'react'
import { colorIdToHex } from '../../utils/calendarColors'

interface TimeBoxEventProps {
  event: CalendarEvent
  onDelete: (e: React.MouseEvent) => void
}

const formatDuration = (hours: number): string => {
  if (hours < 1) return `${Math.round(hours * 60)}m`
  const val = +hours.toFixed(1)
  return `${val}h`
}

export const TimeBoxEvent: FC<TimeBoxEventProps> = ({ event, onDelete }) => {
  const [hov, setHov] = useState<boolean>(false)
  const color = colorIdToHex(event.colorId)

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: '100%', height: '100%',
        borderLeft: `3px solid ${color}`,
        background: `${color}`,
        borderRadius: 4,
        padding: '4px 8px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
        <p style={{
          fontSize: 12, fontWeight: 600, color: '#ffffff',
          margin: 0, overflow: 'hidden', textOverflow: 'ellipsis',
          whiteSpace: 'nowrap', flex: 1,
        }}>
          {event.title}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <span style={{ fontSize: 11, color: '#ffffff' }}>
            {formatDuration(event.duration)}
          </span>
          {hov && (
            <button
              onClick={onDelete}
              style={{
                fontSize: 14, color: '#ef4444', background: 'transparent',
                border: 'none', cursor: 'pointer', lineHeight: 1, padding: 0,
              }}
            >×</button>
          )}
        </div>
      </div>
    </div>
  )
}