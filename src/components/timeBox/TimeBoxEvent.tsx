import type { CalendarEvent } from '../../types';

import { FC, useState } from 'react';
import { SLOT_H } from '../../utils/timeUtils';

interface TimeBoxEventProps {
    event: CalendarEvent;
    onDelete: (e: React.MouseEvent) => void;
  }
  
  export const TimeBoxEvent: FC<TimeBoxEventProps> = ({ event, onDelete }) => {
    const [hov, setHov] = useState<boolean>(false);
    const isGoogle = event.source === "google";
    return (
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          position:"absolute", inset:"2px 4px 0 4px",
          height: SLOT_H * event.duration - 6,
          borderLeft:`3px solid ${isGoogle ? "#3b82f6" : "#818cf8"}`,
          background: isGoogle ? "rgba(59,130,246,0.15)" : "rgba(129,140,248,0.15)",
          borderRadius:4, padding:"4px 8px",
          display:"flex", alignItems:"flex-start", justifyContent:"space-between",
          zIndex:10, overflow:"hidden",
        }}
      >
        <div style={{ minWidth:0 }}>
          <p style={{ fontSize:12, fontWeight:600, color:"#f3f4f6", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {event.title}
          </p>
          <p style={{ fontSize:11, color:"#9ca3af", margin:0 }}>
            {event.duration}h · {isGoogle ? "Google Cal" : "Manual"}
          </p>
        </div>
        {hov && (
          <button onClick={onDelete} style={{ fontSize:14, color:"#ef4444", background:"transparent", border:"none", cursor:"pointer", lineHeight:1, flexShrink:0 }}>×</button>
        )}
      </div>
    );
  };