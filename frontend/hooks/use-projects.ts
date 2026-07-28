import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { projectService } from "@/services/project.service";
import { queryKeys } from "@/hooks/query-keys";
import type { ListQuery, ProjectPayload } from "@/types";

export function useProjects(query: ListQuery) {
  return useQuery({
    queryKey: queryKeys.projects.list(query),
    queryFn: () => projectService.list(query),
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: queryKeys.projects.detail(id),
    queryFn: () => projectService.getById(id),
  });
}

export function useProjectBySlug(slug: string) {
  return useQuery({
    queryKey: queryKeys.projects.detail(slug),
    queryFn: () => projectService.getBySlug(slug),
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProjectPayload) => projectService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.projects.all }),
  });
}

export function useUpdateProject(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProjectPayload) => projectService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.projects.all });
      qc.invalidateQueries({ queryKey: queryKeys.projects.detail(id) });
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.projects.all }),
  });
}
