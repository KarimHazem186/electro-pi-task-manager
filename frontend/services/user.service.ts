import { api } from "@/lib/api/client";
import type { ListQuery, Paginated, User } from "@/types";

export const userService = {
  list: async (query: ListQuery = {}): Promise<Paginated<User>> => {
    const response = await api.get<Paginated<User>>("/users", { params: query });
    return response.data;
  },

  listAll: async (): Promise<User[]> => {
    const response = await api.get<User[]>("/users/all");
    return response.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  invite: async (email: string, role: User["role"]): Promise<void> => {
    await api.post("/users/invite", { email, role });
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  updateRole: async (id: string, role: User["role"]): Promise<User> => {
    const response = await api.patch<User>(`/users/${id}/role`, { role });
    return response.data;
  },

  uploadAvatar: async (file: File): Promise<{ avatarUrl: string }> => {
    const formData = new FormData();
    formData.append("image", file);
    const response = await api.put<{ avatarUrl: string }>("/users/profile/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  deleteAvatar: async (): Promise<void> => {
    await api.delete("/users/profile/avatar");
  },
};
