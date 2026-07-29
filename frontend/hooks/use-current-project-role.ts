"use client";

import { useMemo } from "react";

import { useProjectBySlug } from "@/hooks/use-projects";
import { hasProjectRoleAtLeast, type ProjectRole } from "@/lib/permissions";
import { useApp } from "@/lib/app-context";

interface UseCurrentProjectRoleOptions {
  projectId?: string;
  projectSlug?: string;
}

interface UseCurrentProjectRoleResult {
  role: ProjectRole | null;
  isAdmin: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageMembers: boolean;
  canCreateTask: boolean;
  canEditTask: boolean;
  canDeleteTask: boolean;
  isLoading: boolean;
}

const NONE: UseCurrentProjectRoleResult = {
  role: null,
  isAdmin: false,
  canEdit: false,
  canDelete: false,
  canManageMembers: false,
  canCreateTask: false,
  canEditTask: false,
  canDeleteTask: false,
  isLoading: true,
};

/**
 * Resolve the current user's effective role on a project, plus
 * convenience permission flags for the UI.
 *
 * Admin always returns role='owner' and full permissions.
 * For other users we look up their membership in the project.
 */
export function useCurrentProjectRole(
  options: UseCurrentProjectRoleOptions,
): UseCurrentProjectRoleResult {
  const { currentUser } = useApp();
  const projectId = options.projectId;
  const projectSlug = options.projectSlug;

  const query = useProjectBySlug(projectSlug ?? "");

  return useMemo<UseCurrentProjectRoleResult>(() => {
    if (!currentUser) {
      return { ...NONE, isLoading: false };
    }

    const admin = currentUser.role === "admin";
    if (admin) {
      return {
        role: "owner",
        isAdmin: true,
        canEdit: true,
        canDelete: true,
        canManageMembers: true,
        canCreateTask: true,
        canEditTask: true,
        canDeleteTask: true,
        isLoading: false,
      };
    }

    const project = query.data;
    if (!project) {
      return { ...NONE, isLoading: query.isLoading };
    }

    const owned = project.ownerId === currentUser.id;
    if (owned) {
      return {
        role: "owner",
        isAdmin: false,
        canEdit: true,
        canDelete: true,
        canManageMembers: true,
        canCreateTask: true,
        canEditTask: true,
        canDeleteTask: true,
        isLoading: false,
      };
    }

    const member = project.members?.find((m) => m.user.id === currentUser.id);
    const role = (member?.role ?? null) as ProjectRole | null;

    return {
      role,
      isAdmin: false,
      canEdit: false,
      canDelete: false,
      canManageMembers: false,
      canCreateTask: hasProjectRoleAtLeast(role, "editor"),
      canEditTask: hasProjectRoleAtLeast(role, "editor"),
      canDeleteTask: hasProjectRoleAtLeast(role, "editor"),
      isLoading: false,
    };
  }, [currentUser, query.data, query.isLoading]);
}
