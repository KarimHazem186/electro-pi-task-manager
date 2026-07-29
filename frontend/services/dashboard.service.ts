import { api } from "@/lib/api/client";
import type { ActivityEvent, DashboardStats } from "@/types";

export const dashboardService = {
  stats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>("/dashboard/stats");
    return response.data;
  },

  activity: async (): Promise<ActivityEvent[]> => {
    const response = await api.get<ActivityEvent[]>("/dashboard/activity");
    return response.data;
  },
};
