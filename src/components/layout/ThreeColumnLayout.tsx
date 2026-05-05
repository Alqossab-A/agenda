import { FC, useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ColumnWrapper } from './ColumnWrapper';
import { BrainDumpColumn } from '../brainDump/BrainDumpColumn';
import { TimeBoxColumn } from '../timeBox/TimeBoxColumn';
import { TaskColumn } from '../tasks/TaskColumn';

type Tab = 'schedule' | 'tasks' | 'braindump';

const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
};

// ── Desktop: three columns with custom ratios ─────────────
const DesktopLayout: FC = () => {
  const { brainDump, taskLists } = useApp();
  const bdCount = brainDump.length;
  const taskCount = taskLists.reduce(
    (a, l) => a + l.tasks.filter((t) => !t.completed).length,
    0
  );
  return (
    <div
      style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
        width: '100%',
      }}
    >
      {/* Brain Dump — 23% */}
      <div style={{ width: '23%', flexShrink: 0, height: '100%' }}>
        <ColumnWrapper title='Brain Dump' badge={bdCount}>
          <BrainDumpColumn />
        </ColumnWrapper>
      </div>
      {/* Schedule — 48% */}
      <div style={{ width: '48%', flexShrink: 0, height: '100%' }}>
        <ColumnWrapper title="Today's Schedule">
          <TimeBoxColumn isMobile={false} />
        </ColumnWrapper>
      </div>

      {/* Tasks — 32% (remainder) */}
      <div style={{ flex: 1, minWidth: 0, height: '100%' }}>
        <ColumnWrapper title='Tasks' badge={taskCount}>
          <TaskColumn />
        </ColumnWrapper>
      </div>
    </div>
  );
};

// ── Mobile: tab bar at bottom ─────────────────────────────
const MobileLayout: FC = () => {
  const { brainDump, taskLists } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>('schedule');
  const bdCount = brainDump.length;
  const taskCount = taskLists.reduce(
    (a, l) => a + l.tasks.filter((t) => !t.completed).length,
    0
  );
  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: 'braindump', label: 'Capture', badge: bdCount },
    { id: 'schedule', label: 'Schedule' },
    { id: 'tasks', label: 'Tasks', badge: taskCount },
  ];
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        overflow: 'hidden',
      }}
    >
      {/* Active panel */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {activeTab === 'schedule' && (
          <ColumnWrapper title="Today's Schedule">
            <TimeBoxColumn isMobile={true} />
          </ColumnWrapper>
        )}
        {activeTab === 'tasks' && (
          <ColumnWrapper title='Tasks' badge={taskCount}>
            <TaskColumn />
          </ColumnWrapper>
        )}
        {activeTab === 'braindump' && (
          <ColumnWrapper title='Brain Dump' badge={bdCount}>
            <BrainDumpColumn />
          </ColumnWrapper>
        )}
      </div>

      {/* Tab bar — extra bottom padding for iPhone home bar */}
      <div
        style={{
          display: 'flex',
          borderTop: '1px solid #1f2937',
          background: '#0f172a',
          flexShrink: 0,
          paddingBottom: '5rem', // respects iPhone home bar
        }}
      >
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                padding: '14px 0', // extra padding on top too
                background: 'transparent',
                border: 'none',
                borderTop: `2px solid ${active ? '#4f46e5' : 'transparent'}`,
                cursor: 'pointer',
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: active ? 700 : 400,
                  color: active ? '#818cf8' : '#6b7280',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                {tab.label}
              </span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  style={{
                    fontSize: 10,
                    background: active
                      ? '#4f46e5'
                      : '#374151',
                    color: '#fff',
                    borderRadius: 10,
                    padding: '1px 6px',
                    lineHeight: 1.4,
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ── Root ──────────────────────────────────────────────────
export const ThreeColumnLayout: FC = () => {
  const isMobile = useIsMobile();
  return isMobile ? <MobileLayout /> : <DesktopLayout />;
};
