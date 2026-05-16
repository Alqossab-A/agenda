import type { Task, TaskList } from "../types";

const BASE = "/api/tasks";

export const fetchTaskLists = async (): Promise<TaskList[]> => {
  const res = await fetch(`${BASE}/lists`);
  if (!res.ok) throw new Error("Failed to fetch task lists");
  return res.json();
};

export const fetchTasks = async (listId: string): Promise<Task[]> => {
  const res = await fetch(`${BASE}/lists/${listId}/tasks`);
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
};

export const createTask = async (
  listId: string,
  task: Pick<Task, "title">,
): Promise<Task> => {
  const res = await fetch(`${BASE}/lists/${listId}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  if (!res.ok) throw new Error("Failed to create task");
  return res.json();
};

export const updateTask = async (
  listId: string,
  taskId: string,
  patch: { status?: "needsAction" | "completed"; title?: string },
): Promise<Task> => {
  const res = await fetch(`/api/tasks/lists/${listId}/tasks/${taskId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error("Failed to update task");
  return res.json();
};

export const deleteTask = async (
  listId: string,
  taskId: string,
): Promise<void> => {
  const res = await fetch(`${BASE}/lists/${listId}/tasks/${taskId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete task");
};

export const createTaskList = async (
  title: string,
): Promise<{ id: string; title?: string }> => {
  const res = await fetch("/api/tasks/lists", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error("Failed to create task list");
  return res.json();
};