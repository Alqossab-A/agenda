import { FC } from 'react';
import { useApp } from '../../context/AppContext';

import { TaskListCard } from './TaskList';

export const TaskColumn: FC = () => {
    const { taskLists } = useApp();
    return (
      <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
        <div style={{ flex:1, overflowY:"auto" }}>
          {taskLists.map(l => <TaskListCard key={l.id} list={l} />)}
        </div>
      </div>
    );
  };