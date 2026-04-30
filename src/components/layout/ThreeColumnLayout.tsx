import { FC } from 'react';
import { useApp } from '../../context/AppContext';

import { ColumnWrapper } from './ColumnWrapper';
import { BrainDumpColumn } from '../brainDump/BrainDumpColumn';
import { TimeBoxColumn } from '../timeBox/TimeBoxColumn';
import { TaskColumn } from '../tasks/TaskColumn';

export const ThreeColumnLayout: FC = () => {
    const { brainDump, taskLists } = useApp();
    const bdCount    = brainDump.length;
    const taskCount  = taskLists.reduce((a, l) => a + l.tasks.filter(t => !t.completed).length, 0);
    return (
      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
        <ColumnWrapper title="Brain Dump" badge={bdCount}>
          <BrainDumpColumn />
        </ColumnWrapper>
        <ColumnWrapper title="Today's Schedule">
          <TimeBoxColumn />
        </ColumnWrapper>
        <ColumnWrapper title="Tasks" badge={taskCount}>
          <TaskColumn />
        </ColumnWrapper>
      </div>
    );
  };