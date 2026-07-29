import { api } from "@/lib/api/client";
import type { Paginated, Task, TaskListQuery, TaskPayload } from "@/types";

export const taskService = {
  list: async (query: TaskListQuery = {}): Promise<Paginated<Task>> => {
    const response = await api.get<Paginated<Task>>("/tasks", { params: query });
    return response.data;
  },

  listAll: async (query: TaskListQuery = {}): Promise<Task[]> => {
    const response = await api.get<Task[]>("/tasks/all", { params: query });
    // The interceptor already extracts response.data.data to response.data
    return Array.isArray(response.data) ? response.data : [];
  },

  getById: async (id: string): Promise<Task> => {
    const response = await api.get<Task>(`/tasks/${id}`);
    return response.data;
  },

  create: async (payload: TaskPayload): Promise<Task> => {
    const response = await api.post<Task>("/tasks", payload);
    return response.data;
  },

  update: async (id: string, payload: Partial<TaskPayload>): Promise<Task> => {
    const response = await api.patch<Task>(`/tasks/${id}`, payload);
    return response.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },
};
