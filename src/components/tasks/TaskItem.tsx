import type { Task } from '../../types';

import { FC, useState } from 'react';
import { useApp } from '../../context/AppContext';

interface TaskItemProps { listId: string; task: Task; }

export const TaskItem: FC<TaskItemProps> = ({ listId, task }) => {
  const { toggleTask, deleteTask } = useApp();
  const [hov, setHov] = useState<boolean>(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 4px", borderRadius:4, background: hov ? "rgba(255,255,255,0.03)" : "transparent" }}
    >
      <input type="checkbox" checked={task.completed} onChange={() => toggleTask(listId, task.id)} style={{ accentColor:"#4f46e5", cursor:"pointer", flexShrink:0 }} />
      <span style={{ flex:1, fontSize:13, color: task.completed ? "#6b7280" : "#e5e7eb", textDecoration: task.completed ? "line-through" : "none", opacity: task.completed ? 0.6 : 1 }}>
        {task.title}
      </span>
      {hov && (
        <button onClick={() => deleteTask(listId, task.id)} style={{ fontSize:14, color:"#ef4444", background:"transparent", border:"none", cursor:"pointer", lineHeight:1, flexShrink:0 }}>×</button>
      )}
    </div>
  );
};