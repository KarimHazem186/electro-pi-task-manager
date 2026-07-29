import { api } from "@/lib/api/client";
import type {
  ListQuery,
  Paginated,
  Project,
  ProjectMember,
  ProjectPayload,
} from "@/types";

export const projectService = {
  list: async (query: ListQuery = {}): Promise<Paginated<Project>> => {
    const response = await api.get<Paginated<Project>>("/projects", { params: query });
    return response.data;
  },

  getById: async (id: string): Promise<Project> => {
    const response = await api.get<Project>(`/projects/${id}`);
    return response.data;
  },

  getBySlug: async (slug: string): Promise<Project> => {
    const response = await api.get<Project>(`/projects/by-slug/${slug}`);
    return response.data;
  },

  create: async (payload: ProjectPayload): Promise<Project> => {
    const response = await api.post<Project>("/projects", payload);
    return response.data;
  },

  update: async (id: string, payload: ProjectPayload): Promise<Project> => {
    const response = await api.patch<Project>(`/projects/${id}`, payload);
    return response.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },

  members: async (projectId: string): Promise<ProjectMember[]> => {
    const response = await api.get<ProjectMember[]>(`/projects/${projectId}/members`);
    return response.data;
  },

  addMember: async (projectId: string, userId: string): Promise<void> => {
    await api.post(`/projects/${projectId}/members`, { userId });
  },

  removeMember: async (projectId: string, memberId: string): Promise<void> => {
    await api.delete(`/projects/${projectId}/members/${memberId}`);
  },
};
