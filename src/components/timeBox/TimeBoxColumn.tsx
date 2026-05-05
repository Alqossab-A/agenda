import { FC } from 'react'
import { TimeGrid } from './TimeGrid'

interface TimeBoxColumnProps {
  isMobile?: boolean
}

export const TimeBoxColumn: FC<TimeBoxColumnProps> = ({ isMobile }) => (
  <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <TimeGrid isMobile={isMobile} />
    </div>
  </div>
)