import { FC, useState }        from 'react'
import { useApp }              from '../../context/AppContext'
import { TaskListCard }        from './TaskList'
import { BrainDumpInput }      from '../brainDump/BrainDumpInput'
import { BrainDumpItemCard }   from '../brainDump/BrainDumpItem'

type Tab = 'tasks' | 'capture'

export const TaskCaptureColumn: FC = () => {
  const [tab, setTab]          = useState<Tab>('tasks')
  const { taskLists, brainDump } = useApp()

  const taskCount = taskLists.reduce((a, l) => a + l.tasks.filter(t => !t.completed).length, 0)
  const bdCount   = brainDump.length

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      borderRight: '1px solid #e7e5e4',
    }}>
      {/* Tab bar */}
      <div style={{
        flexShrink: 0, display: 'flex',
        borderBottom: '1px solid #e7e5e4',
        padding: '0 20px', background: '#fff',
      }}>
        {(['tasks', 'capture'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: '11px 0', fontSize: 11, fontWeight: 600,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              background: 'none', border: 'none',
              borderBottom: `2px solid ${tab === t ? '#1c1917' : 'transparent'}`,
              cursor: 'pointer', color: tab === t ? '#1c1917' : '#a8a29e',
              marginBottom: -1, transition: 'color 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            {t === 'tasks' ? 'Tasks' : 'Capture'}
            {t === 'tasks' && taskCount > 0 && (
              <span style={{
                fontSize: 10,
                background: tab === 'tasks' ? '#1c1917' : '#f5f5f4',
                color: tab === 'tasks' ? '#fff' : '#78716c',
                borderRadius: 10, padding: '1px 5px', lineHeight: 1.4,
              }}>{taskCount}</span>
            )}
            {t === 'capture' && bdCount > 0 && (
              <span style={{
                fontSize: 10,
                background: tab === 'capture' ? '#1c1917' : '#f5f5f4',
                color: tab === 'capture' ? '#fff' : '#78716c',
                borderRadius: 10, padding: '1px 5px', lineHeight: 1.4,
              }}>{bdCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        {tab === 'tasks' ? (
          taskLists.map(l => <TaskListCard key={l.id} list={l} />)
        ) : (
          <div>
            <BrainDumpInput />
            {brainDump.length === 0 && (
              <p style={{ color: '#c4bfbb', fontSize: 13, textAlign: 'center', marginTop: 32 }}>
                No thoughts yet. Capture something!
              </p>
            )}
            {brainDump.map(item => (
              <BrainDumpItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}