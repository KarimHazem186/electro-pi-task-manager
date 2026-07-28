import { format, formatDistanceToNow, isPast, isToday } from "date-fns";

export function formatDate(value?: string | null) {
  if (!value) return "No due date";
  return format(new Date(value), "MMM d, yyyy");
}

export function formatRelative(value: string) {
  return formatDistanceToNow(new Date(value), { addSuffix: true });
}

export function dueDateTone(value?: string | null) {
  if (!value) return "text-muted-foreground";
  const date = new Date(value);
  if (isToday(date)) return "text-warning";
  if (isPast(date)) return "text-destructive";
  return "text-muted-foreground";
}

/**
 * Convert a project name/title into a URL-safe slug.
 * - Lowercases the input
 * - Replaces non-alphanumeric characters with hyphens
 * - Collapses repeated/leading/trailing hyphens
 * - Falls back to "project" when the result is empty
 */
export function slugify(value: string): string {
  return (
    value
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "project"
  );
}

/**
 * Ensure a slug is unique across an existing list by appending a numeric suffix
 * when a collision is detected.
 */
export function uniqueSlug(
  base: string,
  existing: Iterable<string>,
  ignore?: string,
): string {
  const used = new Set(
    Array.from(existing).filter((s) => s !== ignore),
  );
  if (!used.has(base)) return base;
  let suffix = 2;
  while (used.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}
