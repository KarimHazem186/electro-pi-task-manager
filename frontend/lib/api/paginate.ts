import type { ListQuery, Paginated } from "@/types";

export function paginate<T>(items: T[], query: ListQuery = {}): Paginated<T> {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 9;
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return {
    data: items.slice((page - 1) * pageSize, page * pageSize),
    page,
    pageSize,
    total,
    totalPages,
  };
}

export function matches(haystack: string, needle?: string) {
  if (!needle) return true;
  return haystack.toLowerCase().includes(needle.trim().toLowerCase());
}
