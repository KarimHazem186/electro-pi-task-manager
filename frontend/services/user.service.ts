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

  invite: async (email: string, role: User["role"]): Promise<void> => {
    await api.post("/users/invite", { email, role });
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};
