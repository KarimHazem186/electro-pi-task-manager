"use client";

import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TaskPriority, TaskStatus } from "@/types";

const priorityStyles: Record<TaskPriority, string> = {
  low: "border-border bg-muted text-muted-foreground",
  medium: "border-border bg-secondary text-secondary-foreground",
  high: "border-warning/30 bg-warning/10 text-warning",
  urgent: "border-destructive/30 bg-destructive/10 text-destructive",
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const t = useTranslations("tasks.priority");
  return (
    <Badge
      variant="outline"
      className={cn("rounded-md font-medium", priorityStyles[priority])}
    >
      {t(priority)}
    </Badge>
  );
}

const statusStyles: Record<TaskStatus, string> = {
  todo: "border-border bg-muted text-muted-foreground",
  in_progress: "border-primary/25 bg-accent text-accent-foreground",
  done: "border-success/30 bg-success/10 text-success",
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  const t = useTranslations("tasks.status");
  return (
    <Badge
      variant="outline"
      className={cn("rounded-md font-medium", statusStyles[status])}
    >
      {t(status)}
    </Badge>
  );
}
