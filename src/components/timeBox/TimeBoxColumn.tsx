import { FC } from 'react';

import { TimeGrid } from './TimeGrid';

export const TimeBoxColumn: FC = () => (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <div style={{ flex:1, overflowY:"auto" }}>
        <TimeGrid />
      </div>
    </div>
  );