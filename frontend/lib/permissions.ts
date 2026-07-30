/**
 * Role-based access control helpers used across the UI.
 *
 * Two layers:
 *   1. Workspace role  (`admin` | `manager` | `member`) — global capabilities
 *   2. Project role    (`owner` | `editor` | `viewer`) — scoped to a project
 */

import type { Project, Task, User } from "@/types";

export type WorkspaceRole = "admin" | "manager" | "member";
export type ProjectRole = "owner" | "editor" | "viewer";

const PROJECT_ROLE_ORDER: Record<ProjectRole, number> = {
  viewer: 1,
  editor: 2,
  owner: 3,
};

/* ---------- Workspace role helpers ---------- */

export const isAdmin = (user: { role?: string } | null | undefined): boolean =>
  user?.role === "admin";

export const isManager = (user: { role?: string } | null | undefined): boolean =>
  user?.role === "manager";

export const isMember = (user: { role?: string } | null | undefined): boolean =>
  user?.role === "member";

export const canManageWorkspace = (
  user: { role?: string } | null | undefined,
): boolean => user?.role === "admin";

export const canCreateProject = (
  user: { role?: string } | null | undefined,
): boolean =>
  Boolean(
    user && (user.role === "admin" || user.role === "manager" || user.role === "member"),
  );

/* ---------- Pure project role helpers ---------- */

export const hasProjectRoleAtLeast = (
  current: ProjectRole | null | undefined,
  required: ProjectRole,
): boolean => {
  if (!current) return false;
  return PROJECT_ROLE_ORDER[current] >= PROJECT_ROLE_ORDER[required];
};

export const canEditProjectAsRole = (role: ProjectRole | null | undefined) =>
  hasProjectRoleAtLeast(role, "owner");

export const canDeleteProjectAsRole = (role: ProjectRole | null | undefined) =>
  hasProjectRoleAtLeast(role, "owner");

export const canManageMembersAsRole = (role: ProjectRole | null | undefined) =>
  hasProjectRoleAtLeast(role, "owner");

export const canEditTaskAsRole = (role: ProjectRole | null | undefined) =>
  hasProjectRoleAtLeast(role, "editor");

export const canDeleteTaskAsRole = (role: ProjectRole | null | undefined) =>
  hasProjectRoleAtLeast(role, "editor");

/* ---------- (User, Project) helpers ---------- */

export const getProjectRoleForUser = (
  user: User | null | undefined,
  project: Project | null | undefined,
): ProjectRole | null => {
  if (!user || !project) return null;
  if (user.role === "admin") return "owner";
  if (project.ownerId === user.id) return "owner";
  const membership = project.members?.find((m) => m.user.id === user.id);
  return (membership?.role ?? null) as ProjectRole | null;
};

export const canManageProject = (
  user: User | null | undefined,
  project: Project | null | undefined,
): boolean => {
  const role = getProjectRoleForUser(user, project);
  return hasProjectRoleAtLeast(role, "owner");
};

export const canCreateTask = (
  user: User | null | undefined,
  project: Project | null | undefined,
): boolean => {
  const role = getProjectRoleForUser(user, project);
  return hasProjectRoleAtLeast(role, "editor");
};

export const canEditTaskInProject = (
  user: User | null | undefined,
  project: Project | null | undefined,
): boolean => {
  const role = getProjectRoleForUser(user, project);
  return hasProjectRoleAtLeast(role, "editor");
};

export const canDeleteTaskInProject = (
  user: User | null | undefined,
  project: Project | null | undefined,
): boolean => {
  const role = getProjectRoleForUser(user, project);
  return hasProjectRoleAtLeast(role, "editor");
};

export const canManageProjectMembers = (
  user: User | null | undefined,
  project: Project | null | undefined,
): boolean => {
  const role = getProjectRoleForUser(user, project);
  return hasProjectRoleAtLeast(role, "owner");
};

/* ---------- Task-specific helpers ---------- */

/**
 * Check if user can edit a task (change status, update details).
 * - Admins can edit any task
 * - Task creators can edit their own tasks
 * - Task assignees can edit their assigned tasks (update status, etc.)
 * - For project-role based checking, use canEditTaskInProject() with project object
 */
export const canEditTask = (
  user: User | null | undefined,
  task: Task | null | undefined,
): boolean => {
  if (!user || !task) return false;
  
  // Admins can edit any task
  if (user.role === "admin") return true;
  
  // Task creator can edit their own task
  if (task.creatorId === user.id) return true;
  
  // Task assignee can edit their assigned task
  if (task.assigneeId === user.id) return true;
  
  return false;
};

/**
 * Check if user can delete a task.
 * - Admins can delete any task
 * - Task creators can delete their own tasks
 * - Assignees CANNOT delete tasks (only edit)
 */
export const canDeleteTask = (
  user: User | null | undefined,
  task: Task | null | undefined,
): boolean => {
  if (!user || !task) return false;
  
  // Admins can delete any task
  if (user.role === "admin") return true;
  
  // Task creator can delete their own task
  if (task.creatorId === user.id) return true;
  
  // Assignees cannot delete tasks
  return false;
};

/**
 * @deprecated Use canEditTask() and canDeleteTask() instead for more granular control
 * Check if user can modify a task (edit/delete).
 * This is a simplified check when you have a task object but not the full project.
 */
export const canModifyTask = (
  user: User | null | undefined,
  task: Task | null | undefined,
): boolean => {
  // For backward compatibility, use the edit permission
  return canEditTask(user, task);
};

/* ---------- UI labels ---------- */

export const workspaceRoleLabel = (
  role: string,
  t: (key: string) => string,
): string => {
  switch (role) {
    case "admin":
      return t("admin");
    case "manager":
      return t("manager");
    case "member":
      return t("member");
    default:
      return role;
  }
};

export const projectRoleLabel = (
  role: ProjectRole,
  t: (key: string) => string,
): string => {
  switch (role) {
    case "owner":
      return t("owner");
    case "editor":
      return t("editor");
    case "viewer":
      return t("viewer");
  }
};
