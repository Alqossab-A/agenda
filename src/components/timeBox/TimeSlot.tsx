import { FC } from 'react'
import { formatHour, SLOT_H, SLOT_H_MOBILE } from '../../utils/timeUtils'

interface TimeSlotProps {
  hour: number
  isMobile?: boolean
}

export const TimeSlot: FC<TimeSlotProps> = ({ hour, isMobile }) => {
  const slotH = isMobile ? SLOT_H_MOBILE : SLOT_H
  const labelW = isMobile ? 56 : 68

  return (
    <div style={{ height: slotH, display: 'flex', position: 'relative' }}>
      <div style={{
        width: labelW, flexShrink: 0, paddingLeft: 4,
        fontSize: isMobile ? 11 : 12, color: '#000000',
        lineHeight: 1,
      }}>
        {formatHour(hour)}
      </div>
      <div style={{ flex: 1, borderTop: '1px solid #a0a0a090' }} />
    </div>
  )
}