import type { TaskList } from '../types';

export const MOCK_TASK_LISTS: TaskList[] = [
    {
      id: "list1", title: "Work",
      tasks: [
        { id: "t1", title: "Fix login bug",     completed: false },
        { id: "t2", title: "Write unit tests",  completed: true  },
        { id: "t3", title: "Deploy to staging", completed: false },
      ],
    },
    {
      id: "list2", title: "Personal",
      tasks: [
        { id: "t4", title: "Read 30 minutes",   completed: false },
        { id: "t5", title: "Gym session",       completed: false },
        { id: "t6", title: "Call mom",          completed: true  },
      ],
    },
    {
      id: "list3", title: "Shopping",
      tasks: [
        { id: "t7", title: "Groceries",         completed: false },
        { id: "t8", title: "New headphones",    completed: false },
      ],
    },
  ];