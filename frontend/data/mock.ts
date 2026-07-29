import type {
  ActivityEvent,
  Project,
  ProjectMember,
  Task,
  User,
} from "@/types";

/**
 * Mock fixtures. Replace by pointing the axios client at a real API
 * (see src/lib/api/client.ts -> USE_MOCKS).
 */

const iso = (daysFromNow: number) => {
  const d = new Date(2026, 6, 28);
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString();
};

export const mockUsers: User[] = [
  {
    id: "u1",
    name: "Amara Okafor",
    email: "amara@northwind.io",
    role: "admin",
    projectsCount: 6,
    createdAt: iso(-320),
  },
  {
    id: "u2",
    name: "Julian Reyes",
    email: "julian@northwind.io",
    role: "manager",
    projectsCount: 4,
    createdAt: iso(-280),
  },
  {
    id: "u3",
    name: "Sofia Lindqvist",
    email: "sofia@northwind.io",
    role: "member",
    projectsCount: 3,
    createdAt: iso(-190),
  },
  {
    id: "u4",
    name: "Dev Malhotra",
    email: "dev@northwind.io",
    role: "member",
    projectsCount: 2,
    createdAt: iso(-120),
  },
  {
    id: "u5",
    name: "Hana Sato",
    email: "hana@northwind.io",
    role: "member",
    projectsCount: 5,
    createdAt: iso(-95),
  },
  {
    id: "u6",
    name: "Ben Carter",
    email: "ben@northwind.io",
    role: "manager",
    projectsCount: 3,
    createdAt: iso(-60),
  },
];

export const currentUser = mockUsers[0];

const member = (
  projectId: string,
  user: User,
  role: ProjectMember["role"],
): ProjectMember => ({
  id: `${projectId}-${user.id}`,
  projectId,
  userId: user.id,
  role,
  user,
  joinedAt: iso(-40),
});

export const mockProjects: Project[] = [
  {
    id: "p1",
    slug: "atlas-design-system",
    name: "Atlas Design System",
    description:
      "Component library, tokens and documentation shared across all product surfaces.",
    status: "active",
    ownerId: "u1",
    members: [
      member("p1", mockUsers[0], "owner"),
      member("p1", mockUsers[2], "editor"),
      member("p1", mockUsers[4], "editor"),
    ],
    taskCount: 24,
    completedTaskCount: 17,
    createdAt: iso(-140),
  },
  {
    id: "p2",
    slug: "billing-migration",
    name: "Billing Migration",
    description:
      "Move legacy invoicing onto the new metered billing pipeline without downtime.",
    status: "active",
    ownerId: "u2",
    members: [
      member("p2", mockUsers[1], "owner"),
      member("p2", mockUsers[3], "editor"),
    ],
    taskCount: 31,
    completedTaskCount: 9,
    createdAt: iso(-88),
  },
  {
    id: "p3",
    slug: "mobile-companion-app",
    name: "Mobile Companion App",
    description:
      "Native shell, offline sync and push notifications for the field team.",
    status: "active",
    ownerId: "u5",
    members: [
      member("p3", mockUsers[4], "owner"),
      member("p3", mockUsers[0], "viewer"),
      member("p3", mockUsers[5], "editor"),
      member("p3", mockUsers[2], "editor"),
    ],
    taskCount: 18,
    completedTaskCount: 4,
    createdAt: iso(-52),
  },
  {
    id: "p4",
    slug: "q3-marketing-site",
    name: "Q3 Marketing Site",
    description: "Refreshed positioning, pricing page and customer stories.",
    status: "active",
    ownerId: "u6",
    members: [
      member("p4", mockUsers[5], "owner"),
      member("p4", mockUsers[1], "viewer"),
    ],
    taskCount: 12,
    completedTaskCount: 12,
    createdAt: iso(-30),
  },
  {
    id: "p5",
    slug: "data-warehouse-v2",
    name: "Data Warehouse v2",
    description: "Consolidate event streams into a single analytics warehouse.",
    status: "active",
    ownerId: "u2",
    members: [
      member("p5", mockUsers[1], "owner"),
      member("p5", mockUsers[3], "editor"),
      member("p5", mockUsers[4], "viewer"),
    ],
    taskCount: 27,
    completedTaskCount: 6,
    createdAt: iso(-19),
  },
  {
    id: "p6",
    slug: "security-hardening",
    name: "Security Hardening",
    description: "SOC2 readiness: audit logging, SSO and access reviews.",
    status: "active",
    ownerId: "u1",
    members: [
      member("p6", mockUsers[0], "owner"),
      member("p6", mockUsers[5], "editor"),
    ],
    taskCount: 15,
    completedTaskCount: 11,
    createdAt: iso(-9),
  },
];

const t = (
  id: string,
  projectId: string,
  title: string,
  description: string,
  status: Task["status"],
  priority: Task["priority"],
  due: number | null,
  assignee: User | null,
  creator: User,
): Task => ({
  id,
  projectId,
  title,
  description,
  status,
  priority,
  dueDate: due === null ? null : iso(due),
  assigneeId: assignee?.id ?? null,
  assignee,
  creatorId: creator.id,
  creator,
  createdAt: iso(-14),
});

export const mockTasks: Task[] = [
  t("t1", "p1", "Audit spacing scale", "Reconcile the 4pt grid across all primitives.", "in_progress", "high", 2, mockUsers[2], mockUsers[0]),
  t("t2", "p1", "Ship Dialog v2", "Focus trap, scroll lock and stacked dialog support.", "todo", "urgent", 4, mockUsers[4], mockUsers[0]),
  t("t3", "p1", "Document color tokens", "Publish semantic token reference in the docs site.", "done", "medium", -3, mockUsers[0], mockUsers[0]),
  t("t4", "p2", "Map legacy invoice schema", "Field-by-field mapping to the new billing tables.", "in_progress", "urgent", 1, mockUsers[3], mockUsers[1]),
  t("t5", "p2", "Dry-run migration script", "Run against the staging snapshot and record timings.", "todo", "high", 6, mockUsers[1], mockUsers[1]),
  t("t6", "p2", "Proration edge cases", "Mid-cycle upgrades and downgrades.", "todo", "medium", 9, null, mockUsers[1]),
  t("t7", "p3", "Offline sync spike", "Evaluate conflict resolution strategies.", "in_progress", "medium", 3, mockUsers[5], mockUsers[4]),
  t("t8", "p3", "Push notification setup", "APNs and FCM credentials plus test harness.", "todo", "low", 12, mockUsers[2], mockUsers[4]),
  t("t9", "p3", "Native shell scaffold", "Routing, deep links and cold-start metrics.", "done", "high", -6, mockUsers[4], mockUsers[4]),
  t("t10", "p4", "Pricing page copy", "Final pass with the positioning doc.", "done", "medium", -2, mockUsers[5], mockUsers[5]),
  t("t11", "p5", "Event schema registry", "Version and validate all producer schemas.", "todo", "high", 5, mockUsers[3], mockUsers[1]),
  t("t12", "p5", "Warehouse cost model", "Estimate monthly spend at projected volume.", "in_progress", "low", 8, mockUsers[0], mockUsers[1]),
  t("t13", "p6", "SSO rollout plan", "Phased enablement per workspace tier.", "in_progress", "urgent", 0, mockUsers[0], mockUsers[0]),
  t("t14", "p6", "Access review workflow", "Quarterly review with automated reminders.", "todo", "medium", 15, mockUsers[5], mockUsers[0]),
  t("t15", "p6", "Audit log retention", "Define retention windows and export format.", "done", "low", -8, mockUsers[0], mockUsers[0]),
];

export const mockActivity: ActivityEvent[] = [
  { 
    id: "a1", 
    type: "task", 
    message: "completed Document color tokens",
    actor: mockUsers[2], 
    user: mockUsers[2],
    action: "completed", 
    target: "Document color tokens", 
    href: null,
    timestamp: iso(-1),
    createdAt: iso(-1) 
  },
  { 
    id: "a2", 
    type: "task", 
    message: "commented on Map legacy invoice schema",
    actor: mockUsers[3], 
    user: mockUsers[3],
    action: "commented on", 
    target: "Map legacy invoice schema", 
    href: null,
    timestamp: iso(-1),
    createdAt: iso(-1) 
  },
  { 
    id: "a3", 
    type: "project", 
    message: "created Security Hardening",
    actor: mockUsers[5], 
    user: mockUsers[5],
    action: "created", 
    target: "Security Hardening", 
    href: null,
    timestamp: iso(-2),
    createdAt: iso(-2) 
  },
  { 
    id: "a4", 
    type: "task", 
    message: "assigned you to Offline sync spike",
    actor: mockUsers[4], 
    user: mockUsers[4],
    action: "assigned you to", 
    target: "Offline sync spike", 
    href: null,
    timestamp: iso(-2),
    createdAt: iso(-2) 
  },
  { 
    id: "a5", 
    type: "task", 
    message: "moved Dry-run migration script",
    actor: mockUsers[1], 
    user: mockUsers[1],
    action: "moved", 
    target: "Dry-run migration script", 
    href: null,
    timestamp: iso(-3),
    createdAt: iso(-3) 
  },
];
