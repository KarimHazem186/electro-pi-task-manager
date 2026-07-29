import { api } from "@/lib/api/client";
import type { AppNotification, NotificationsResponse } from "@/types";

export const notificationService = {
  list: async (params: { limit?: number; unreadOnly?: boolean } = {}): Promise<NotificationsResponse> => {
    const response = await api.get<NotificationsResponse>("/notifications", { params });
    return response.data;
  },

  unreadCount: async (): Promise<number> => {
    const response = await api.get<{ data: { unreadCount: number } }>("/notifications/unread-count");
    return response.data.data.unreadCount;
  },

  markAsRead: async (id: string): Promise<AppNotification> => {
    const response = await api.patch<{ data: AppNotification }>(`/notifications/${id}/read`);
    return response.data.data;
  },

  markAllAsRead: async (): Promise<number> => {
    const response = await api.patch<{ data: { updated: number } }>("/notifications/mark-all-read");
    return response.data.data.updated;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/notifications/${id}`);
  },

  clearAll: async (): Promise<void> => {
    await api.delete(`/notifications`);
  },
};
