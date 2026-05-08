import type { Task } from '../../types'

import { FC, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { TimePicker } from './TimePicker'

interface TaskItemProps {
  listId: string
  listTitle: string
  task: Task
}

const getCurrentRounded = (): number => {
  const now     = new Date()
  const minutes = now.getHours() * 60 + now.getMinutes()
  return Math.ceil(minutes / 15) * 15 % (24 * 60)
}

export const TaskItem: FC<TaskItemProps> = ({ listId, listTitle, task }) => {
  const { toggleTask, deleteTask, addEvent } = useApp()
  const [hov,        setHov]        = useState<boolean>(false)
  const [scheduling, setScheduling] = useState<boolean>(false)
  const [startMin,   setStartMin]   = useState<number>(getCurrentRounded)
  const [endMin,     setEndMin]     = useState<number>((getCurrentRounded() + 60) % (24 * 60))

  const openScheduler = () => {
    const s = getCurrentRounded()
    setStartMin(s)
    setEndMin((s + 60) % (24 * 60))
    setScheduling(true)
  }

  const confirmSchedule = (): void => {
    addEvent(task.title, startMin, endMin, listTitle)
    setScheduling(false)
  }

  let diffMin = endMin - startMin
  if (diffMin <= 0) diffMin += 24 * 60
  const durH     = Math.floor(diffMin / 60)
  const durM     = diffMin % 60
  const durLabel = durM === 0 ? `${durH}h` : durH === 0 ? `${durM}m` : `${durH}h ${durM}m`

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding:      '5px 4px',
        borderRadius: 4,
        background:   hov ? 'rgba(255,255,255,0.03)' : 'transparent',
      }}
    >
      {/* Main row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => toggleTask(listId, task.id)}
          style={{ accentColor: '#4f46e5', cursor: 'pointer', flexShrink: 0 }}
        />

        {/* Text — clipped so gradient overlays it */}
        <span style={{
          flex:           1,
          fontSize:       13,
          color:          task.completed ? '#6b7280' : '#e5e7eb',
          textDecoration: task.completed ? 'line-through' : 'none',
          opacity:        task.completed ? 0.6 : 1,
          overflow:       'hidden',
          whiteSpace:     'nowrap',
          textOverflow:   'ellipsis',
        }}>
          {task.title}
        </span>

        {/* Gradient + action buttons — overlaid on the right of the text */}
        {hov && !scheduling && (
          <div style={{
            position:   'absolute',
            right:      0,
            top:        '50%',
            transform:  'translateY(-50%)',
            display:    'flex',
            alignItems: 'center',
            // Gradient fades text into background
            background: 'linear-gradient(to right, transparent, #111827 30%)',
            paddingLeft: 48,
          }}>
            <button
              onClick={openScheduler}
              style={{
                fontSize:     11,
                color:        '#818cf8',
                background:   'transparent',
                border:       'none',
                cursor:       'pointer',
                padding:      '2px 6px',
                borderRadius: 4,
                whiteSpace:   'nowrap',
              }}
            >
              → Schedule
            </button>
            <button
              onClick={() => deleteTask(listId, task.id)}
              style={{
                fontSize:   14,
                color:      '#ef4444',
                background: 'transparent',
                border:     'none',
                cursor:     'pointer',
                lineHeight: 1,
                flexShrink: 0,
              }}
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Scheduler */}
      {scheduling && (
        <div style={{
          marginTop:     10,
          marginLeft:    20,
          padding:       '10px 12px',
          background:    '#1a2035',
          borderRadius:  8,
          border:        '1px solid #374151',
          display:       'flex',
          flexDirection: 'column',
          gap:           10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <TimePicker value={startMin} onChange={setStartMin} />
            <span style={{ color: '#6b7280', fontSize: 13 }}>→</span>
            <TimePicker value={endMin} onChange={setEndMin} />
            <span style={{
              fontSize:     11,
              color:        '#818cf8',
              background:   'rgba(129,140,248,0.1)',
              borderRadius: 4,
              padding:      '3px 7px',
              whiteSpace:   'nowrap',
            }}>
              {durLabel}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={confirmSchedule}
              style={{
                flex:         1,
                fontSize:     12,
                background:   '#4f46e5',
                color:        '#fff',
                border:       'none',
                borderRadius: 6,
                padding:      '7px 0',
                cursor:       'pointer',
                fontWeight:   600,
              }}
            >
              Add to calendar
            </button>
            <button
              onClick={() => setScheduling(false)}
              style={{
                fontSize:     12,
                color:        '#6b7280',
                background:   'transparent',
                border:       '1px solid #374151',
                borderRadius: 6,
                padding:      '7px 12px',
                cursor:       'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}