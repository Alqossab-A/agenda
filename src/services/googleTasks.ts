import type { Task, TaskList } from '../types'

export const fetchTaskLists = async (): Promise<TaskList[]> => {
  // GET https://www.googleapis.com/tasks/v1/users/@me/lists
  console.warn('fetchTaskLists: not implemented — using mock data')
  return []
}

export const fetchTasks = async (listId: string): Promise<Task[]> => {
  // GET https://www.googleapis.com/tasks/v1/lists/{listId}/tasks
  console.warn('fetchTasks: not implemented', listId)
  return []
}

export const createTask = async (listId: string, task: Omit<Task, 'id'>): Promise<void> => {
  // POST https://www.googleapis.com/tasks/v1/lists/{listId}/tasks
  console.warn('createTask: not implemented', listId, task)
}

export const updateTask = async (listId: string, taskId: string, patch: Partial<Task>): Promise<void> => {
  // PATCH https://www.googleapis.com/tasks/v1/lists/{listId}/tasks/{taskId}
  console.warn('updateTask: not implemented', listId, taskId, patch)
}