import { FC, useState } from 'react';
import { useApp } from '../../context/AppContext';

interface AddTaskInputProps { listId: string; }

export const AddTaskInput: FC<AddTaskInputProps> = ({ listId }) => {
  const { addTask } = useApp();
  const [active, setActive] = useState<boolean>(false);
  const [val, setVal]       = useState<string>("");

  const commit = (): void => {
    const t = val.trim();
    if (t) addTask(listId, t);
    setVal("");
    setActive(false);
  };

  if (!active) {
    return (
      <button onClick={() => setActive(true)} style={{ marginTop:4, fontSize:12, color:"#6b7280", background:"transparent", border:"none", cursor:"pointer", textAlign:"left", padding:"2px 0" }}>
        + Add task
      </button>
    );
  }

  return (
    <input
      autoFocus value={val}
      onChange={e => setVal(e.target.value)}
      onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setVal(""); setActive(false); } }}
      onBlur={commit}
      placeholder="Task name…"
      style={{ marginTop:4, width:"100%", background:"#1f2937", color:"#f3f4f6", border:"1px solid #374151", borderRadius:4, padding:"4px 8px", fontSize:12, outline:"none", boxSizing:"border-box" }}
    />
  );
};