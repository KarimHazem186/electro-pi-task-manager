import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { taskService } from "@/services/task.service";
import { queryKeys } from "@/hooks/query-keys";
import type { TaskListQuery, TaskPayload } from "@/types";

export function useTasks(query: TaskListQuery) {
  return useQuery({
    queryKey: queryKeys.tasks.list(query),
    queryFn: () => taskService.list(query),
  });
}

export function useAllTasks(query: TaskListQuery, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["tasks", "board", query],
    queryFn: async () => {
      try {
        const data = await taskService.listAll(query);
        return data ?? [];
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
        return [];
      }
    },
    enabled: options?.enabled ?? true,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: TaskPayload) => taskService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.tasks.all }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<TaskPayload> }) =>
      taskService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.tasks.all }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => taskService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.tasks.all }),
  });
}
