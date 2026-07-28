import { api, resolve } from "@/lib/api/client";
import { matches, paginate } from "@/lib/api/paginate";
import { mockProjects, mockUsers } from "@/data/mock";
import { slugify, uniqueSlug } from "@/lib/format";
import type {
  ListQuery,
  Paginated,
  Project,
  ProjectMember,
  ProjectPayload,
} from "@/types";

let projects = [...mockProjects];

export const projectService = {
  list: (query: ListQuery = {}) =>
    resolve<Paginated<Project>>(
      () => paginate(projects.filter((p) => matches(p.name + p.description, query.search)), query),
      async () => (await api.get<Paginated<Project>>("/projects", { params: query })).data,
    ),

  getById: (id: string) =>
    resolve<Project | undefined>(
      () => projects.find((p) => p.id === id),
      async () => (await api.get<Project>(`/projects/${id}`)).data,
    ),

  getBySlug: (slug: string) =>
    resolve<Project | undefined>(
      () => projects.find((p) => p.slug === slug),
      async () => (await api.get<Project>(`/projects/by-slug/${slug}`)).data,
    ),

  create: (payload: ProjectPayload) =>
    resolve<Project>(
      () => {
        const base = slugify(payload.name);
        const slug = uniqueSlug(base, projects.map((p) => p.slug));
        const created: Project = {
          id: `p${Date.now()}`,
          slug,
          name: payload.name,
          description: payload.description,
          status: "active",
          ownerId: mockUsers[0].id,
          members: [],
          taskCount: 0,
          completedTaskCount: 0,
          createdAt: new Date().toISOString(),
        };
        projects = [created, ...projects];
        return created;
      },
      async () => (await api.post<Project>("/projects", payload)).data,
    ),

  update: (id: string, payload: ProjectPayload) =>
    resolve<Project>(
      () => {
        const target = projects.find((p) => p.id === id);
        const nextSlug = target
          ? uniqueSlug(slugify(payload.name), projects.map((p) => p.slug), target.slug)
          : slugify(payload.name);
        projects = projects.map((p) =>
          p.id === id
            ? { ...p, ...payload, slug: nextSlug, updatedAt: new Date().toISOString() }
            : p,
        );
        return projects.find((p) => p.id === id)!;
      },
      async () => (await api.patch<Project>(`/projects/${id}`, payload)).data,
    ),

  remove: (id: string) =>
    resolve<void>(
      () => {
        projects = projects.filter((p) => p.id !== id);
      },
      async () => {
        await api.delete(`/projects/${id}`);
      },
    ),

  members: (projectId: string) =>
    resolve<ProjectMember[]>(
      () => projects.find((p) => p.id === projectId)?.members ?? [],
      async () => (await api.get<ProjectMember[]>(`/projects/${projectId}/members`)).data,
    ),

  addMember: (projectId: string, userId: string) =>
    resolve<void>(
      () => undefined,
      async () => {
        await api.post(`/projects/${projectId}/members`, { userId });
      },
    ),

  removeMember: (projectId: string, memberId: string) =>
    resolve<void>(
      () => undefined,
      async () => {
        await api.delete(`/projects/${projectId}/members/${memberId}`);
      },
    ),
};
