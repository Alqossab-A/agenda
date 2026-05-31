import { FC, useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { ColumnWrapper } from './ColumnWrapper'
import { TaskCaptureColumn } from '../tasks/TaskCaptureColumn'
import { WeekView } from '../timeBox/WeekView'
import { TimeBoxColumn } from '../timeBox/TimeBoxColumn'

type Tab = 'schedule' | 'tasks'

const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

const DesktopLayout: FC = () => {
  // Start collapsed by default
  const [timeBoxOpen, setTimeBoxOpen] = useState(false)

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden', width: '100%' }}>
      {/* Col 1: Tasks + Capture */}
      <div style={{ width: '20%', flexShrink: 0, height: '100%' }}>
        <ColumnWrapper title="Tasks">
          <TaskCaptureColumn />
        </ColumnWrapper>
      </div>

      {/* Col 2: Week view (Flexes to take up all remaining space) */}
      <div style={{ flex: 1, minWidth: 0, height: '100%' }}>
        {/* Pass the open state so the WeekView knows when to recenter */}
        <WeekView timeBoxOpen={timeBoxOpen} />
      </div>

      {/* Col 3: Today's Schedule (Paper Slide Peek-View) */}
      <div
        onClick={() => !timeBoxOpen && setTimeBoxOpen(true)}
        style={{
          width: timeBoxOpen ? '24vw' : '6vw', // Shows exactly a quarter (6vw) when closed
          flexShrink: 0,
          height: '100%',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)', // Smooth slide out
          background: '#fff',
          borderLeft: '1px solid #e7e5e4',
          cursor: timeBoxOpen ? 'default' : 'pointer',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Inner container remains rigidly full-width so TimeBoxColumn never squishes or resizes */}
        <div style={{ width: '24vw', height: '100%', position: 'relative' }}>

          <button
            onClick={(e) => {
              e.stopPropagation()
              setTimeBoxOpen(false)
            }}
            title="Close Today View"
            style={{
              position: 'absolute',
              top: 8,
              right: 16,
              zIndex: 10,
              background: 'none',
              border: 'none',
              color: '#a8a29e',
              cursor: 'pointer',
              fontSize: 22,
              lineHeight: 1,
              padding: '4px',
              display: timeBoxOpen ? 'block' : 'none'
            }}
          >
            ×
          </button>

          <ColumnWrapper title="Today">
            <TimeBoxColumn />
          </ColumnWrapper>
        </div>

        {/* Subtle overlay shadow when closed to enhance the "paper tucked away" effect */}
        {!timeBoxOpen && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(255, 255, 255, 0.35)', // slightly dims the 25% peek
            zIndex: 10
          }} />
        )}
      </div>
    </div>
  )
}

const MobileLayout: FC = () => {
  const { taskLists, brainDump } = useApp()
  const [activeTab, setActiveTab] = useState<Tab>('schedule')

  const taskCount = taskLists.reduce((a, l) => a + l.tasks.filter(t => !t.completed).length, 0)
  const bdCount = brainDump.length

  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: 'tasks', label: 'Tasks', badge: taskCount + bdCount },
    { id: 'schedule', label: 'Schedule' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {activeTab === 'tasks' && <TaskCaptureColumn />}
        {activeTab === 'schedule' && (
          <WeekView />
        )}
      </div>

      {/* Tab bar */}
      <div style={{
        display: 'flex',
        borderTop: '1px solid #e7e5e4',
        background: '#fff',
        flexShrink: 0,
        minHeight: '2rem',
        paddingBottom: '2rem',
      }}>
        {tabs.map(tab => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '1rem 0', background: 'transparent', border: 'none',
                borderTop: `2px solid ${active ? '#000000' : 'transparent'}`,
                cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 11, fontWeight: active ? 700 : 400, color: active ? '#000000' : '#a8a29e', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  {tab.label}
                </span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span style={{ fontSize: 10, background: active ? '#000000' : '#f5f5f4', color: active ? '#fff' : '#78716c', borderRadius: 10, padding: '1px 6px', lineHeight: 1.4 }}>
                    {tab.badge}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export const ThreeColumnLayout: FC = () => {
  const isMobile = useIsMobile()
  return isMobile ? <MobileLayout /> : <DesktopLayout />
}