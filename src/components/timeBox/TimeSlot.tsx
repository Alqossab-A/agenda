import type { CalendarEvent } from '../../types'

import { FC, useState } from 'react'
import { formatHour, SLOT_H, SLOT_H_MOBILE } from '../../utils/timeUtils'
import { TimeBoxEvent } from './TimeBoxEvent'

interface TimeSlotProps {
  hour: number
  event: CalendarEvent | null
  onDeleteEvent: (id: string) => void
  isHidden: boolean
  isMobile?: boolean
}

export const TimeSlot: FC<TimeSlotProps> = ({ hour, event, onDeleteEvent, isHidden, isMobile }) => {
  const [hov, setHov] = useState<boolean>(false)
  const slotH = isMobile ? SLOT_H_MOBILE : SLOT_H

  if (isHidden)
    return <div style={{ height: slotH, borderBottom: '1px solid #1f2937' }} />

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: 'relative',
        height: slotH,
        borderBottom: '1px solid #3b4e69',
        display: 'flex',
        cursor: 'default',
        background: hov && !event ? 'rgba(255,255,255,0.02)' : 'transparent',
      }}
    >
      <div style={{
        width: isMobile ? 56 : 68,
        flexShrink: 0,
        position: 'relative',
        top: -9,         
        paddingLeft: 4,
        fontSize: isMobile ? 11 : 12,   
        color: '#6b7280',
        lineHeight: 1,
      }}>
        {formatHour(hour)}
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        {event && (
          <TimeBoxEvent
            event={event}
            onDelete={(e) => {
              e.stopPropagation()
              onDeleteEvent(event.id)
            }}
          />
        )}
      </div>
    </div>
  )
}