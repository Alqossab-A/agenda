import type { CalendarEvent } from '../../types';

import { FC, useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { HOURS, SLOT_H } from '../../utils/timeUtils';

import { TimeSlot } from './TimeSlot';

export const TimeGrid: FC = () => {
    const { events, deleteEvent } = useApp();
  
    const getNow = (): number => {
      const d = new Date();
      return d.getHours() * 60 + d.getMinutes();
    };
  
    const [nowMin, setNowMin] = useState<number>(getNow);
    const lineRef = useRef<HTMLDivElement>(null);
  
    useEffect(() => {
      const id = setInterval(() => setNowMin(getNow()), 60_000);
      return () => clearInterval(id);
    }, []);
  
    useEffect(() => {
      lineRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, []);
  
    const byHour = events.reduce<Record<number, CalendarEvent>>((acc, ev) => {
      if (!acc[ev.startHour]) acc[ev.startHour] = ev;
      return acc;
    }, {});
  
    const hidden = new Set<number>();
    events.forEach(ev => {
      for (let i = 1; i < ev.duration; i++) hidden.add(ev.startHour + i);
    });
  
    const lineTop: number = ((nowMin / 60) - 1) * SLOT_H;
    const showLine: boolean = nowMin >= 60 && nowMin <= 24 * 60;
  
    return (
      <div style={{ position:"relative" }}>
        {showLine && (
          <div ref={lineRef} style={{ position:"absolute", left:0, right:0, top: lineTop, display:"flex", alignItems:"center", zIndex:30, pointerEvents:"none" }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:"#ef4444", marginLeft:-4, flexShrink:0 }} />
            <div style={{ flex:1, height:1, background:"#ef4444" }} />
          </div>
        )}
        {HOURS.map(h => (
          <TimeSlot
            key={h} hour={h}
            event={byHour[h] ?? null}
            onDeleteEvent={deleteEvent}
            isHidden={hidden.has(h)}
          />
        ))}
      </div>
    );
  };