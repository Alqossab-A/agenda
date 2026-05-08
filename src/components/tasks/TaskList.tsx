import type { TaskList } from '../../types'
import { FC, useState }  from 'react'
import { TaskItem }      from './TaskItem'
import { AddTaskInput }  from './AddTaskInput'
import { colorIdToHex, listTitleToColorId } from '../../utils/calendarColors'

interface TaskListProps { list: TaskList }

export const TaskListCard: FC<TaskListProps> = ({ list }) => {
  const [open, setOpen] = useState<boolean>(false)
  const done  = list.tasks.filter(t => t.completed).length
  const total = list.tasks.length
  const color = colorIdToHex(listTitleToColorId(list.title))

  return (
    <div style={{ marginBottom: 4 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width:          '100%',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          padding:        '8px 4px',
          background:     'transparent',
          border:         'none',
          cursor:         'pointer',
          borderRadius:   4,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontSize:   10,
            color:      color,
            display:    'inline-block',
            transform:  open ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s ease',
            lineHeight: 1,
          }}>▶</span>
          <h3 style={{
            margin:        0,
            fontSize:      11,
            fontWeight:    700,
            color,                      
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}>
            {list.title}
          </h3>
        </div>
        <span style={{ fontSize: 11, color: '#4b5563' }}>{done}/{total}</span>
      </button>

      {open && (
        <div style={{ paddingBottom: 16 }}>
          {list.tasks.map(t => (
            <TaskItem key={t.id} listId={list.id} listTitle={list.title} task={t} />
          ))}
          <AddTaskInput listId={list.id} />
        </div>
      )}
    </div>
  )
}