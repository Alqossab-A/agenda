import type { TaskList } from "../../types";

import { FC } from "react";

import { TaskItem } from "./TaskItem";
import { AddTaskInput } from "./AddTaskInput";

interface TaskListProps {
  list: TaskList;
}

export const TaskListCard: FC<TaskListProps> = ({ list }) => {
  const done = list.tasks.filter((t) => t.completed).length;
  return (
    <div style={{ marginBottom: 28 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: 11,
            fontWeight: 700,
            color: "#9ca3af",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          {list.title}
        </h3>
        <span style={{ fontSize: 11, color: "#4b5563" }}>
          {done}/{list.tasks.length}
        </span>
      </div>
      {list.tasks.map((t) => (
        <TaskItem key={t.id} listId={list.id} task={t} />
      ))}
      <AddTaskInput listId={list.id} />
    </div>
  );
};
