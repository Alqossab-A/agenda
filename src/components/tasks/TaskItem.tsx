import type { Task } from '../../types'

import { FC, useState } from 'react'
import { useApp } from '../../context/AppContext'

interface TaskItemProps {
  listId: string
  task: Task
}

// Generate all 15-minute intervals for a full day
// Returns array of { label: "5:45 PM", totalMinutes: 1065 }
interface TimeOption {
  label: string
  totalMinutes: number
}

const generateTimeOptions = (): TimeOption[] => {
  const options: TimeOption[] = []
  for (let totalMinutes = 0; totalMinutes < 24 * 60; totalMinutes += 15) {
    const h    = Math.floor(totalMinutes / 60)
    const m    = totalMinutes % 60
    const ampm = h < 12 ? 'AM' : 'PM'
    const h12  = h === 0 ? 12 : h > 12 ? h - 12 : h
    const mStr = m === 0 ? '00' : String(m)
    options.push({ label: `${h12}:${mStr} ${ampm}`, totalMinutes })
  }
  return options
}

const TIME_OPTIONS = generateTimeOptions()

// Round current time up to nearest 15 min
const getCurrentRounded = (): number => {
  const now     = new Date()
  const minutes = now.getHours() * 60 + now.getMinutes()
  return Math.ceil(minutes / 15) * 15 % (24 * 60)
}

const selectStyle: React.CSSProperties = {
  background:   '#1f2937',
  color:        '#e5e7eb',
  border:       '1px solid #374151',
  borderRadius: 6,
  padding:      '6px 8px',
  fontSize:     13,
  cursor:       'pointer',
  outline:      'none',
}

export const TaskItem: FC<TaskItemProps> = ({ listId, task }) => {
  const { toggleTask, deleteTask, addEvent } = useApp()
  const [hov,        setHov]        = useState<boolean>(false)
  const [scheduling, setScheduling] = useState<boolean>(false)

  const initStart = getCurrentRounded()
  const initEnd   = (initStart + 60) % (24 * 60)  // default 1h later

  const [startMin, setStartMin] = useState<number>(initStart)
  const [endMin,   setEndMin]   = useState<number>(initEnd)

  const openScheduler = () => {
    const s = getCurrentRounded()
    setStartMin(s)
    setEndMin((s + 60) % (24 * 60))
    setScheduling(true)
  }

  const confirmSchedule = (): void => {
    addEvent(task.title, startMin, endMin)
    setScheduling(false)
  }

  // Duration display e.g. "2h 30m"
  let diffMin = endMin - startMin
  if (diffMin <= 0) diffMin += 24 * 60
  const durH = Math.floor(diffMin / 60)
  const durM = diffMin % 60
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => toggleTask(listId, task.id)}
          style={{ accentColor: '#4f46e5', cursor: 'pointer', flexShrink: 0 }}
        />
        <span style={{
          flex:           1,
          fontSize:       13,
          color:          task.completed ? '#6b7280' : '#e5e7eb',
          textDecoration: task.completed ? 'line-through' : 'none',
          opacity:        task.completed ? 0.6 : 1,
        }}>
          {task.title}
        </span>

        {hov && !scheduling && (
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            <button
              onClick={openScheduler}
              style={{
                fontSize:   11,
                color:      '#818cf8',
                background: 'transparent',
                border:     'none',
                cursor:     'pointer',
                padding:    '2px 6px',
                borderRadius: 4,
                whiteSpace: 'nowrap',
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
          marginTop:   10,
          marginLeft:  20,
          padding:     '10px 12px',
          background:  '#1a2035',
          borderRadius: 8,
          border:      '1px solid #374151',
          display:     'flex',
          flexDirection: 'column',
          gap:         10,
        }}>
          {/* Time range row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <select
              value={startMin}
              onChange={e => setStartMin(Number(e.target.value))}
              style={selectStyle}
            >
              {TIME_OPTIONS.map(t => (
                <option key={t.totalMinutes} value={t.totalMinutes}>{t.label}</option>
              ))}
            </select>

            <span style={{ color: '#6b7280', fontSize: 13 }}>→</span>

            <select
              value={endMin}
              onChange={e => setEndMin(Number(e.target.value))}
              style={selectStyle}
            >
              {TIME_OPTIONS.map(t => (
                <option key={t.totalMinutes} value={t.totalMinutes}>{t.label}</option>
              ))}
            </select>

            {/* Duration badge */}
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

          {/* Action buttons */}
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