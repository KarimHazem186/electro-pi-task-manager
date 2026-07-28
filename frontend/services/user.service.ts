import { api, resolve } from "@/lib/api/client";
import { matches, paginate } from "@/lib/api/paginate";
import { mockUsers } from "@/data/mock";
import type { ListQuery, Paginated, User } from "@/types";

let users = [...mockUsers];

export const userService = {
  list: (query: ListQuery = {}) =>
    resolve<Paginated<User>>(
      () => paginate(users.filter((u) => matches(u.name + u.email, query.search)), { ...query, pageSize: query.pageSize ?? 8 }),
      async () => (await api.get<Paginated<User>>("/users", { params: query })).data,
    ),

  listAll: () =>
    resolve<User[]>(
      () => users,
      async () => (await api.get<User[]>("/users/all")).data,
    ),

  invite: (email: string, role: User["role"]) =>
    resolve<void>(
      () => undefined,
      async () => {
        await api.post("/users/invite", { email, role });
      },
    ),

  remove: (id: string) =>
    resolve<void>(
      () => {
        users = users.filter((u) => u.id !== id);
      },
      async () => {
        await api.delete(`/users/${id}`);
      },
    ),
};
