import type { BrainDumpItem } from '../../types';

import { FC, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { HOURS, formatHour } from '../../utils/timeUtils';

interface BrainDumpItemProps { item: BrainDumpItem; }

export const BrainDumpItemCard: FC<BrainDumpItemProps> = ({ item }) => {
  const { deleteBrainItem, moveBrainToTimeBox } = useApp();
  const [hovered,    setHovered]    = useState<boolean>(false);
  const [picking,    setPicking]    = useState<boolean>(false);
  const [pickedHour, setPickedHour] = useState<number>(9);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background:"#1f2937", border:"1px solid #374151", borderRadius:6, padding:"10px 12px", marginBottom:8 }}
    >
      <div style={{ display:"flex", alignItems:"flex-start", gap:8 }}>
        <span style={{ flex:1, fontSize:13, color:"#e5e7eb", lineHeight:1.5 }}>{item.text}</span>
        {hovered && !picking && (
          <div style={{ display:"flex", gap:4, flexShrink:0 }}>
            <button onClick={() => setPicking(true)} style={{ fontSize:11, color:"#818cf8", background:"transparent", border:"none", cursor:"pointer", padding:"2px 6px", borderRadius:4, whiteSpace:"nowrap" }}>→ Today</button>
            <button onClick={() => deleteBrainItem(item.id)} style={{ fontSize:14, color:"#6b7280", background:"transparent", border:"none", cursor:"pointer", padding:"2px 6px", borderRadius:4 }}>×</button>
          </div>
        )}
      </div>
      {picking && (
        <div style={{ marginTop:8, display:"flex", alignItems:"center", gap:8 }}>
          <select
            value={pickedHour}
            onChange={e => setPickedHour(Number(e.target.value))}
            style={{ background:"#374151", color:"#d1d5db", border:"1px solid #4b5563", borderRadius:4, padding:"3px 6px", fontSize:12 }}
          >
            {HOURS.map(h => <option key={h} value={h}>{formatHour(h)}</option>)}
          </select>
          <button onClick={() => { moveBrainToTimeBox(item, pickedHour); setPicking(false); }}
            style={{ fontSize:12, background:"#4f46e5", color:"#fff", border:"none", borderRadius:4, padding:"3px 10px", cursor:"pointer" }}>
            Move
          </button>
          <button onClick={() => setPicking(false)}
            style={{ fontSize:12, color:"#9ca3af", background:"transparent", border:"none", cursor:"pointer" }}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};