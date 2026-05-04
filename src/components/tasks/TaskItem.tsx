import type { Task } from "../../types";

import { FC, useState } from "react";
import { useApp } from "../../context/AppContext";
import { HOURS, formatHour } from "../../utils/timeUtils";

interface TaskItemProps {
  listId: string;
  task: Task;
}

export const TaskItem: FC<TaskItemProps> = ({ listId, task }) => {
  const { toggleTask, deleteTask, addEvent } = useApp();
  const [hov, setHov] = useState<boolean>(false);
  const [scheduling, setScheduling] = useState<boolean>(false);
  const [pickedHour, setPickedHour] = useState<number>(9);
  const [duration, setDuration] = useState<number>(1);

  const confirmSchedule = (): void => {
    addEvent(task.title, pickedHour, duration);
    setScheduling(false);
  };

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => {
        setHov(false);
      }}
      style={{
        padding: "5px 4px",
        borderRadius: 4,
        background: hov ? "rgba(255,255,255,0.03)" : "transparent",
      }}
    >
      {/* Main row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => toggleTask(listId, task.id)}
          style={{ accentColor: "#4f46e5", cursor: "pointer", flexShrink: 0 }}
        />
        <span
          style={{
            flex: 1,
            fontSize: 13,
            color: task.completed ? "#6b7280" : "#e5e7eb",
            textDecoration: task.completed ? "line-through" : "none",
            opacity: task.completed ? 0.6 : 1,
          }}
        >
          {task.title}
        </span>

        {hov && !scheduling && (
          <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
            <button
              onClick={() => setScheduling(true)}
              style={{
                fontSize: 11,
                color: "#818cf8",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "2px 6px",
                borderRadius: 4,
                whiteSpace: "nowrap",
              }}
            >
              → Schedule
            </button>
            <button
              onClick={() => deleteTask(listId, task.id)}
              style={{
                fontSize: 14,
                color: "#ef4444",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                lineHeight: 1,
                flexShrink: 0,
              }}
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Time picker row */}
      {scheduling && (
        <div
          style={{
            marginTop: 6,
            display: "flex",
            alignItems: "center",
            gap: 8,
            paddingLeft: 20,
          }}
        >
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            style={{
              background: "#374151",
              color: "#d1d5db",
              border: "1px solid #4b5563",
              borderRadius: 4,
              padding: "3px 6px",
              fontSize: 12,
            }}
          >
            {[1, 2, 3, 4].map((h) => (
              <option key={h} value={h}>
                {h}h
              </option>
            ))}
          </select>
          <select
            value={pickedHour}
            onChange={(e) => setPickedHour(Number(e.target.value))}
            style={{
              background: "#374151",
              color: "#d1d5db",
              border: "1px solid #4b5563",
              borderRadius: 4,
              padding: "3px 6px",
              fontSize: 12,
            }}
          >
            {HOURS.map((h) => (
              <option key={h} value={h}>
                {formatHour(h)}
              </option>
            ))}
          </select>
          <button
            onClick={confirmSchedule}
            style={{
              fontSize: 12,
              background: "#4f46e5",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              padding: "3px 10px",
              cursor: "pointer",
            }}
          >
            Add to calendar
          </button>
          <button
            onClick={() => setScheduling(false)}
            style={{
              fontSize: 12,
              color: "#9ca3af",
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};
