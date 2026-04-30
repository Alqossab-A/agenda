import type { CalendarEvent } from '../../types';

import { FC, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatHour, SLOT_H } from '../../utils/timeUtils';

import { TimeBoxEvent } from './TimeBoxEvent';

interface TimeSlotProps {
    hour: number;
    event: CalendarEvent | null;
    onDeleteEvent: (id: string) => void;
    isHidden: boolean;
  }
  
  export const TimeSlot: FC<TimeSlotProps> = ({ hour, event, onDeleteEvent, isHidden }) => {
    const { addEvent } = useApp();
    const [editing, setEditing] = useState<boolean>(false);
    const [val, setVal]         = useState<string>("");
    const [hov, setHov]         = useState<boolean>(false);
  
    if (isHidden) return <div style={{ height: SLOT_H, borderBottom:"1px solid #1f2937" }} />;
  
    const commit = (): void => {
      const t = val.trim();
      if (t) addEvent(t, hour);
      setEditing(false);
      setVal("");
    };
  
    return (
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        onClick={() => !event && !editing && setEditing(true)}
        style={{
          position:"relative", height: SLOT_H, borderBottom:"1px solid #1f2937",
          display:"flex", cursor: event ? "default" : "pointer",
          background: hov && !event ? "rgba(255,255,255,0.02)" : "transparent",
        }}
      >
        <div style={{ width:68, flexShrink:0, paddingTop:6, paddingLeft:4, fontSize:11, color:"#6b7280" }}>
          {formatHour(hour)}
        </div>
        <div style={{ flex:1, position:"relative" }}>
          {event && (
            <TimeBoxEvent event={event} onDelete={(e) => { e.stopPropagation(); onDeleteEvent(event.id); }} />
          )}
          {editing && !event && (
            <div onClick={e => e.stopPropagation()} style={{ position:"absolute", inset:"4px 4px", zIndex:20 }}>
              <input
                autoFocus value={val}
                onChange={e => setVal(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setEditing(false); setVal(""); } }}
                onBlur={commit}
                placeholder="Event name…"
                style={{ width:"100%", background:"#374151", color:"#f3f4f6", border:"1px solid #4f46e5", borderRadius:4, padding:"4px 8px", fontSize:12, outline:"none", boxSizing:"border-box" }}
              />
            </div>
          )}
        </div>
      </div>
    );
  };