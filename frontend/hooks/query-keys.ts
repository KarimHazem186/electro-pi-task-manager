export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  projects: {
    all: ["projects"] as const,
    list: (query: unknown) => ["projects", "list", query] as const,
    detail: (id: string) => ["projects", "detail", id] as const,
    members: (id: string) => ["projects", "members", id] as const,
  },
  tasks: {
    all: ["tasks"] as const,
    list: (query: unknown) => ["tasks", "list", query] as const,
    board: (projectId: string) => ["tasks", "board", projectId] as const,
    detail: (id: string) => ["tasks", "detail", id] as const,
  },
  users: {
    all: ["users"] as const,
    list: (query: unknown) => ["users", "list", query] as const,
  },
  dashboard: {
    stats: ["dashboard", "stats"] as const,
    activity: ["dashboard", "activity"] as const,
  },
};
