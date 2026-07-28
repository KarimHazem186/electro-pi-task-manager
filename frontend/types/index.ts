/**
 * Domain models mirroring the backend entities.
 * These are the single source of truth for the API layer and the UI.
 */

export type UUID = string;
export type ISODateString = string;

export type UserRole = "admin" | "manager" | "member";

export interface User {
  id: UUID;
  name: string;
  email: string;
  avatarUrl?: string | null;
  role: UserRole;
  projectsCount?: number;
  createdAt: ISODateString;
  updatedAt?: ISODateString;
}

export type ProjectStatus = "active" | "archived";

export interface Project {
  id: UUID;
  slug: string;
  name: string;
  description: string;
  status: ProjectStatus;
  ownerId: UUID;
  members: ProjectMember[];
  taskCount: number;
  completedTaskCount: number;
  createdAt: ISODateString;
  updatedAt?: ISODateString;
}

export type ProjectMemberRole = "owner" | "editor" | "viewer";

export interface ProjectMember {
  id: UUID;
  projectId: UUID;
  userId: UUID;
  role: ProjectMemberRole;
  user: User;
  joinedAt: ISODateString;
}

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Task {
  id: UUID;
  projectId: UUID;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: ISODateString | null;
  assigneeId: UUID | null;
  assignee?: User | null;
  creatorId: UUID;
  creator?: User | null;
  createdAt: ISODateString;
  updatedAt?: ISODateString;
}

export interface ActivityEvent {
  id: UUID;
  actor: User;
  action: string;
  target: string;
  createdAt: ISODateString;
}

/* ---------- API envelopes ---------- */

export interface Paginated<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface TaskListQuery extends ListQuery {
  projectId?: UUID;
  status?: TaskStatus | "all";
  priority?: TaskPriority | "all";
  assigneeId?: UUID | "all";
}

/* ---------- Payloads ---------- */

export interface LoginPayload {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ProjectPayload {
  name: string;
  description: string;
}

export interface TaskPayload {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: ISODateString | null;
  assigneeId: UUID | null;
  projectId?: UUID;
}

export interface UpdateProfilePayload {
  name: string;
  email: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
}
