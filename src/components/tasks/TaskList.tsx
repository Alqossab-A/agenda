import type { TaskList } from '../../types'
import { FC, useState } from 'react'
import { TaskItem } from './TaskItem'
import { AddTaskInput } from './AddTaskInput'
import { colorIdToHex, listTitleToColorId } from '../../utils/calendarColors'

interface TaskListProps { list: TaskList }

export const TaskListCard: FC<TaskListProps> = ({ list }) => {
  const [open, setOpen] = useState<boolean>(false)
  const color = colorIdToHex(listTitleToColorId(list.title))

  return (
    <div style={{ marginBottom: 4 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '8px 4px',
          background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 4,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, borderLeft: `0.3rem solid ${color}`, paddingLeft: '0.2rem' }}>
          <h3 style={{
            margin: 0, fontSize: 11, fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            {list.title}
          </h3>
        </div>
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