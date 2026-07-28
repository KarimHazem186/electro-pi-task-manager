import { api, resolve } from "@/lib/api/client";
import { mockActivity, mockProjects, mockTasks } from "@/data/mock";
import type { ActivityEvent, DashboardStats } from "@/types";

export const dashboardService = {
  stats: () =>
    resolve<DashboardStats>(
      () => ({
        totalProjects: mockProjects.length,
        totalTasks: mockTasks.length,
        completedTasks: mockTasks.filter((t) => t.status === "done").length,
        pendingTasks: mockTasks.filter((t) => t.status !== "done").length,
      }),
      async () => (await api.get<DashboardStats>("/dashboard/stats")).data,
    ),

  activity: () =>
    resolve<ActivityEvent[]>(
      () => mockActivity,
      async () => (await api.get<ActivityEvent[]>("/dashboard/activity")).data,
    ),
};
