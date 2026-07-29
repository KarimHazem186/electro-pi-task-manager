import { api } from "@/lib/api/client";
import { startTokenRefresh, stopTokenRefresh } from "@/lib/api/token-refresh";
import type {
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
  User,
} from "@/types";

/** Auth endpoints. Tokens are stored in HTTP-only cookies by the backend. */
export const authService = {
  login: async (payload: LoginPayload): Promise<User> => {
    const response = await api.post<User>("/auth/login", payload);
    // Tokens are automatically stored in HTTP-only cookies by backend
    
    // Start automatic token refresh in background
    startTokenRefresh();
    
    return response.data;
  },

  register: async (payload: RegisterPayload): Promise<User> => {
    const response = await api.post<User>("/auth/register", payload);
    // Tokens are automatically stored in HTTP-only cookies by backend
    
    // Start automatic token refresh in background
    startTokenRefresh();
    
    return response.data;
  },

  logout: async (): Promise<void> => {
    // Stop automatic token refresh
    stopTokenRefresh();
    
    // Backend clears the HTTP-only cookies
    await api.post("/auth/logout");
  },

  me: async (): Promise<User> => {
    const response = await api.get<User>("/auth/me");
    return response.data;
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<User> => {
    const response = await api.patch<User>("/auth/profile", payload);
    return response.data;
  },

  changePassword: async (payload: ChangePasswordPayload): Promise<void> => {
    await api.post("/auth/change-password", payload);
  },
};
