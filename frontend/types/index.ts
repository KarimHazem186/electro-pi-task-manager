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
  avatarPublicId?: string | null;
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
  coverImage?: string | null;
  coverImagePublicId?: string | null;
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

export interface TaskAttachment {
  _id: string;
  url: string;
  publicId: string;
  uploadedBy: UUID;
  uploadedAt: ISODateString;
}

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
  attachments?: TaskAttachment[];
  createdAt: ISODateString;
  updatedAt?: ISODateString;
}

export interface ActivityEvent {
  id: UUID;
  type: string;
  message: string;
  actor: User | null;
  action: string;
  target: string;
  href: string | null;
  entityType?: string;
  user: User | null;
  timestamp: ISODateString;
  createdAt: ISODateString;
  metadata?: Record<string, unknown>;
  changes?: {
    from?: string;
    to?: string;
    priority?: { from: string; to: string } | string;
    assigneeId?: { from: string; to: string };
    dueDate?: { from: string; to: string };
  };
  details?: {
    actionType: string;
    hasChanges: boolean;
    statusChange?: {
      from: string;
      to: string;
      fromLabel: string;
      toLabel: string;
    };
    priorityChange?: {
      from: string;
      to: string;
      fromLabel: string;
      toLabel: string;
    };
    prioritySet?: {
      value: string;
      label: string;
    };
    assignmentChange?: {
      from: string;
      to: string;
    };
    dueDateChange?: {
      from: string;
      to: string;
    };
  };
}

export type NotificationType =
  | "task_assigned"
  | "task_updated"
  | "task_completed"
  | "task_status_changed"
  | "project_member_added"
  | "project_invite"
  | "mention"
  | "system";

export interface AppNotification {
  id: UUID;
  recipientId: UUID;
  actorId: UUID | null;
  actor?: Pick<User, "id" | "name" | "email" | "avatarUrl" | "role"> | null;
  type: NotificationType;
  title: string;
  body: string;
  href: string | null;
  projectId: UUID | null;
  project?: { id: UUID; name: string; slug: string } | null;
  taskId: UUID | null;
  metadata?: Record<string, unknown>;
  read: boolean;
  readAt: ISODateString | null;
  createdAt: ISODateString;
  updatedAt?: ISODateString;
}

export interface NotificationsResponse {
  items: AppNotification[];
  unreadCount: number;
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

/* ---------- Global search ---------- */

export type SearchResultKind = "project" | "task";

export interface SearchProjectHit {
  id: UUID;
  name: string;
  slug: string;
  description: string;
  status: ProjectStatus;
  ownerId: UUID;
  coverImage?: string | null;
}

export interface SearchTaskHit {
  id: UUID;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: ISODateString | null;
  project: { id: UUID; name: string; slug: string } | null;
  assignee: { id: UUID; name: string; avatarUrl?: string | null } | null;
}

export interface SearchResponse {
  query: string;
  projects: SearchProjectHit[];
  tasks: SearchTaskHit[];
}
