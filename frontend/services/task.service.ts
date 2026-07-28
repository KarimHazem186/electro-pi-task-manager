import { api, resolve } from "@/lib/api/client";
import { matches, paginate } from "@/lib/api/paginate";
import { currentUser, mockTasks, mockUsers } from "@/data/mock";
import type { Paginated, Task, TaskListQuery, TaskPayload } from "@/types";

let tasks = [...mockTasks];

function filter(query: TaskListQuery) {
  return tasks.filter(
    (task) =>
      matches(task.title + task.description, query.search) &&
      (!query.projectId || task.projectId === query.projectId) &&
      (!query.status || query.status === "all" || task.status === query.status) &&
      (!query.priority || query.priority === "all" || task.priority === query.priority) &&
      (!query.assigneeId || query.assigneeId === "all" || task.assigneeId === query.assigneeId),
  );
}

export const taskService = {
  list: (query: TaskListQuery = {}) =>
    resolve<Paginated<Task>>(
      () => paginate(filter(query), { ...query, pageSize: query.pageSize ?? 8 }),
      async () => (await api.get<Paginated<Task>>("/tasks", { params: query })).data,
    ),

  listAll: (query: TaskListQuery = {}) =>
    resolve<Task[]>(
      () => filter(query),
      async () => (await api.get<Task[]>("/tasks/all", { params: query })).data,
    ),

  getById: (id: string) =>
    resolve<Task | undefined>(
      () => tasks.find((task) => task.id === id),
      async () => (await api.get<Task>(`/tasks/${id}`)).data,
    ),

  create: (payload: TaskPayload) =>
    resolve<Task>(
      () => {
        const assignee = mockUsers.find((u) => u.id === payload.assigneeId) ?? null;
        const created: Task = {
          id: `t${Date.now()}`,
          projectId: payload.projectId ?? "p1",
          title: payload.title,
          description: payload.description,
          status: payload.status,
          priority: payload.priority,
          dueDate: payload.dueDate,
          assigneeId: assignee?.id ?? null,
          assignee,
          creatorId: currentUser.id,
          creator: currentUser,
          createdAt: new Date().toISOString(),
        };
        tasks = [created, ...tasks];
        return created;
      },
      async () => (await api.post<Task>("/tasks", payload)).data,
    ),

  update: (id: string, payload: Partial<TaskPayload>) =>
    resolve<Task>(
      () => {
        tasks = tasks.map((task) =>
          task.id === id
            ? {
                ...task,
                ...payload,
                assignee:
                  payload.assigneeId !== undefined
                    ? (mockUsers.find((u) => u.id === payload.assigneeId) ?? null)
                    : task.assignee,
              }
            : task,
        );
        return tasks.find((task) => task.id === id)!;
      },
      async () => (await api.patch<Task>(`/tasks/${id}`, payload)).data,
    ),

  remove: (id: string) =>
    resolve<void>(
      () => {
        tasks = tasks.filter((task) => task.id !== id);
      },
      async () => {
        await api.delete(`/tasks/${id}`);
      },
    ),
};
