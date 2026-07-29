import type { User, Project, Task, ProjectMemberRole } from "@/types";

/**
 * Resolves the member's role within a project
 */
export function getProjectMemberRole(user: User | null, project?: Project | null): ProjectMemberRole | null {
  if (!user || !project) return null;
  if (user.id === project.ownerId) return "owner";
  
  const member = project.members?.find(
    (m) => m.userId === user.id || m.user?.id === user.id
  );
  return member?.role ?? null;
}

/**
 * Checks if the user has permission to manage the project settings (Edit/Delete project)
 */
export function canManageProject(user: User | null, project?: Project | null): boolean {
  if (!user || !project) return false;
  if (user.role === "admin") return true;
  return project.ownerId === user.id;
}

/**
 * Checks if the user can create tasks within a project
 */
export function canCreateTask(user: User | null, project?: Project | null): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (!project) return true; // On global page, backend will enforce project membership on submit
  
  const role = getProjectMemberRole(user, project);
  return role === "owner" || role === "editor";
}

/**
 * Checks if the user can modify (edit/delete) a specific task
 */
export function canModifyTask(user: User | null, task: Task, project?: Project | null): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (task.creatorId === user.id) return true;
  
  if (project) {
    const role = getProjectMemberRole(user, project);
    return role === "owner" || role === "editor";
  }
  
  return true; // If project details are not loaded, fall back to true (API will reject if unauthorized)
}

/**
 * Checks if the user is authorized to invite new users to the workspace
 */
export function canInviteWorkspace(user: User | null): boolean {
  if (!user) return false;
  return user.role === "admin" || user.role === "manager";
}

/**
 * Checks if the user is authorized to delete a user account from the workspace
 */
export function canDeleteWorkspaceUser(user: User | null): boolean {
  if (!user) return false;
  return user.role === "admin";
}
