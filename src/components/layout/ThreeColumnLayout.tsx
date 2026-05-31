import { FC, useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { ColumnWrapper } from './ColumnWrapper'
import { TaskCaptureColumn } from '../tasks/TaskCaptureColumn'
import { WeekView } from '../timeBox/WeekView'
import { TimeBoxColumn } from '../timeBox/TimeBoxColumn'

type Tab = 'schedule' | 'tasks'

const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

const DesktopLayout: FC = () => (
  <div style={{ display: 'flex', flex: 1, overflow: 'hidden', width: '100%' }}>
    {/* Col 1: Tasks + Capture */}
    <div style={{ width: '20%', flexShrink: 0, height: '100%' }}>
      <TaskCaptureColumn />
    </div>

    {/* Col 2: Week view */}
    <div style={{ flex: 1, minWidth: 0, height: '100%' }}>
      <WeekView />
    </div>

    {/* Col 3: Today's Schedule */}
    <div style={{ width: '24%', flexShrink: 0, height: '100%' }}>
      <ColumnWrapper title="Today">
        <TimeBoxColumn isMobile={false} />
      </ColumnWrapper>
    </div>
  </div>
)

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
          <ColumnWrapper title="Today's Schedule">
            <TimeBoxColumn isMobile={true} />
          </ColumnWrapper>
        )}
      </div>

      {/* Tab bar */}
      <div style={{
        display: 'flex', borderTop: '1px solid #e7e5e4', background: '#fff',
        flexShrink: 0, minHeight: '2rem', paddingBottom: '2rem',
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
                <span style={{
                  fontSize: 11, fontWeight: active ? 700 : 400,
                  color: active ? '#000000' : '#a8a29e',
                  letterSpacing: '0.05em', textTransform: 'uppercase',
                }}>
                  {tab.label}
                </span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span style={{
                    fontSize: 10,
                    background: active ? '#000000' : '#f5f5f4',
                    color: active ? '#fff' : '#78716c',
                    borderRadius: 10, padding: '1px 6px', lineHeight: 1.4,
                  }}>
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