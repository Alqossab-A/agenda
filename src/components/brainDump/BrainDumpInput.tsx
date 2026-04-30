import { useApp } from '../../context/AppContext';
import { useState, FC } from 'react';

export const BrainDumpInput: FC = () => {
    const { addBrainItem } = useApp();
    const [text, setText] = useState<string>("");
  
    const submit = (): void => {
      const t = text.trim();
      if (!t) return;
      addBrainItem(t);
      setText("");
    };
  
    return (
      <div style={{ display:"flex", gap:8, marginBottom:12 }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()}
          placeholder="Capture a thought or task…"
          style={{
            flex:1, background:"#1f2937", color:"#f3f4f6",
            border:"1px solid #374151", borderRadius:6,
            padding:"7px 10px", fontSize:13, outline:"none",
          }}
        />
        <button onClick={submit} style={{
          background:"#4f46e5", color:"#fff", border:"none",
          borderRadius:6, padding:"7px 14px", fontSize:13, cursor:"pointer",
        }}>Add</button>
      </div>
    );
  };