import { api } from "@/lib/api/client";

export interface UserPreferences {
  id: string;
  userId: string;
  notifications: {
    email: boolean;
    weekly: boolean;
    deadlines: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePreferencesPayload {
  notifications?: {
    email?: boolean;
    weekly?: boolean;
    deadlines?: boolean;
  };
}

export const preferencesService = {
  get: async (): Promise<UserPreferences> => {
    const response = await api.get<UserPreferences>("/preferences");
    return response.data;
  },

  update: async (payload: UpdatePreferencesPayload): Promise<UserPreferences> => {
    const response = await api.patch<UserPreferences>("/preferences", payload);
    return response.data;
  },
};
