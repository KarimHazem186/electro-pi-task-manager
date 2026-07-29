import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/services/notification.service";
import { queryKeys } from "@/hooks/query-keys";
import type { AppNotification } from "@/types";

type NotificationCache = { items: AppNotification[]; unreadCount: number };

export function useNotifications(params: { limit?: number; unreadOnly?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.notifications.list(params),
    queryFn: () => notificationService.list(params),
    refetchInterval: 60_000,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount,
    queryFn: () => notificationService.unreadCount(),
    refetchInterval: 60_000,
  });
}

export function useMarkAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: queryKeys.notifications.all });
      const previous = qc.getQueriesData({ queryKey: queryKeys.notifications.all });

      qc.setQueriesData<NotificationCache | undefined>(
        { queryKey: queryKeys.notifications.all },
        (current) => {
          if (!current) return current;
          const wasUnread = current.items.some((n) => n.id === id && !n.read);
          return {
            items: current.items.map((n) =>
              n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n,
            ),
            unreadCount: Math.max(current.unreadCount - (wasUnread ? 1 : 0), 0),
          };
        },
      );

      return { previous };
    },
    onError: (_err, _id, ctx) => {
      ctx?.previous?.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

export function useMarkAllAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

export function useClearAllNotifications() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.clearAll(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

/**
 * Push a new notification into the cache. Used by the socket listener.
 */
export function pushNotification(qc: ReturnType<typeof useQueryClient>, notification: AppNotification) {
  qc.setQueriesData<NotificationCache | undefined>(
    { queryKey: queryKeys.notifications.all },
    (current) => {
      if (!current) {
        return { items: [notification], unreadCount: 1 };
      }
      if (current.items.some((n) => n.id === notification.id)) return current;
      return {
        items: [notification, ...current.items].slice(0, 50),
        unreadCount: current.unreadCount + (notification.read ? 0 : 1),
      };
    },
  );
  qc.setQueryData<number>(queryKeys.notifications.unreadCount, (current) =>
    typeof current === "number" ? current + (notification.read ? 0 : 1) : 1,
  );
}
