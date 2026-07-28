import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/user.service";
import { dashboardService } from "@/services/dashboard.service";
import { authService } from "@/services/auth.service";
import { queryKeys } from "@/hooks/query-keys";
import type { ListQuery, User } from "@/types";

export function useUsers(query: ListQuery) {
  return useQuery({
    queryKey: queryKeys.users.list(query),
    queryFn: () => userService.list(query),
  });
}

export function useAllUsers() {
  return useQuery({
    queryKey: queryKeys.users.all,
    queryFn: () => userService.listAll(),
  });
}

export function useInviteMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ email, role }: { email: string; role: User["role"] }) =>
      userService.invite(email, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users.all }),
  });
}

export function useRemoveMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users.all }),
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.stats,
    queryFn: () => dashboardService.stats(),
  });
}

export function useActivityFeed() {
  return useQuery({
    queryKey: queryKeys.dashboard.activity,
    queryFn: () => dashboardService.activity(),
  });
}

export function useCurrentUser() {
  return useQuery({ queryKey: queryKeys.auth.me, queryFn: () => authService.me() });
}
