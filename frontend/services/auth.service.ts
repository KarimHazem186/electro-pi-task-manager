import { api, resolve } from "@/lib/api/client";
import { currentUser } from "@/data/mock";
import type {
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
  User,
} from "@/types";

/** Auth endpoints. Tokens are stored in HTTP-only cookies by the backend. */
export const authService = {
  login: (payload: LoginPayload) =>
    resolve<User>(
      () => currentUser,
      async () => {
        const response = await api.post<{ data: User }>("/auth/login", payload);
        // Tokens are automatically stored in HTTP-only cookies by backend
        // No need to handle tokens in frontend
        return response.data.data;
      },
    ),

  register: (payload: RegisterPayload) =>
    resolve<User>(
      () => ({ ...currentUser, name: payload.name, email: payload.email }),
      async () => {
        const response = await api.post<{ data: User }>("/auth/register", payload);
        // Tokens are automatically stored in HTTP-only cookies by backend
        return response.data.data;
      },
    ),

  logout: () =>
    resolve<void>(
      () => undefined,
      async () => {
        // Backend clears the HTTP-only cookies
        await api.post("/auth/logout");
        // No localStorage to clean
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
