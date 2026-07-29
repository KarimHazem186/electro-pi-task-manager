import type { User } from "@/types";

/**
 * Get badge variant for user role
 */
export function getRoleBadgeVariant(role: User["role"]) {
  switch (role) {
    case "admin":
      return "destructive" as const;
    case "manager":
      return "default" as const;
    case "member":
      return "secondary" as const;
    default:
      return "outline" as const;
  }
}

/**
 * Get role display color classes
 */
export function getRoleColorClasses(role: User["role"]) {
  switch (role) {
    case "admin":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
    case "manager":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
    case "member":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
  }
}
