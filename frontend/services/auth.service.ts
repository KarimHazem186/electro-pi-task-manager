import { api, resolve } from "@/lib/api/client";
import { currentUser } from "@/data/mock";
import type {
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
  User,
} from "@/types";

/** Auth endpoints. Mock resolvers stand in until the REST API exists. */
export const authService = {
  login: (payload: LoginPayload) =>
    resolve<User>(
      () => currentUser,
      async () => {
        const response = await api.post<{ data: User; token: string }>("/auth/login", payload);
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        return response.data.data;
      },
    ),

  register: (payload: RegisterPayload) =>
    resolve<User>(
      () => ({ ...currentUser, name: payload.name, email: payload.email }),
      async () => {
        const response = await api.post<{ data: User; token: string }>("/auth/register", payload);
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        return response.data.data;
      },
    ),

  logout: () =>
    resolve<void>(
      () => undefined,
      async () => {
        await api.post("/auth/logout");
        localStorage.removeItem('token');
      },
    ),

  me: () =>
    resolve<User>(
      () => currentUser,
      async () => (await api.get<User>("/auth/me")).data,
    ),

  updateProfile: (payload: UpdateProfilePayload) =>
    resolve<User>(
      () => ({ ...currentUser, ...payload }),
      async () => (await api.patch<User>("/auth/profile", payload)).data,
    ),

  changePassword: (payload: ChangePasswordPayload) =>
    resolve<void>(
      () => undefined,
      async () => {
        await api.post("/auth/change-password", payload);
      },
    ),
};
