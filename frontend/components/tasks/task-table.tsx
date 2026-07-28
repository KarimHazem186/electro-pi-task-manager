"use client";

import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PriorityBadge, StatusBadge } from "@/components/shared/badges";
import { UserAvatar } from "@/components/shared/user-avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { dueDateTone, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";

export function TaskTable({
  tasks,
  isLoading,
  sortDir,
  onToggleSort,
  onEdit,
  onDelete,
}: {
  tasks: Task[];
  isLoading?: boolean;
  sortDir: "asc" | "desc";
  onToggleSort: () => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  const t = useTranslations("tasks");
  const tCommon = useTranslations("common");

  if (!isLoading && tasks.length === 0) {
    return (
      <EmptyState title={t("empty")} description={t("emptyDesc")} />
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-soft">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="min-w-56">
              <button
                type="button"
                onClick={onToggleSort}
                className="flex items-center gap-1.5 font-medium transition-colors hover:text-foreground"
              >
                {tCommon("title")}
                <ArrowUpDown className="size-3.5" aria-hidden />
                <span className="sr-only">
                  Sort {sortDir === "asc" ? "descending" : "ascending"}
                </span>
              </button>
            </TableHead>
            <TableHead>{tCommon("priority")}</TableHead>
            <TableHead>{tCommon("status")}</TableHead>
            <TableHead>{tCommon("assignee")}</TableHead>
            <TableHead>{tCommon("dueDate")}</TableHead>
            <TableHead className="w-12 text-right">
              {tCommon("actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                {Array.from({ length: 6 }).map((__, cell) => (
                  <TableCell key={cell}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
            : tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="max-w-xs">
                  <p className="truncate font-medium">{task.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {task.description}
                  </p>
                </TableCell>
                <TableCell>
                  <PriorityBadge priority={task.priority} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={task.status} />
                </TableCell>
                <TableCell>
                  {task.assignee ? (
                    <span className="flex min-w-0 items-center gap-2">
                      <UserAvatar
                        user={task.assignee}
                        className="size-6"
                      />
                      <span className="truncate text-sm">
                        {task.assignee.name}
                      </span>
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      {t("form.unassigned")}
                    </span>
                  )}
                </TableCell>
                <TableCell
                  className={cn("text-sm", dueDateTone(task.dueDate))}
                >
                  {formatDate(task.dueDate)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        aria-label={tCommon("actionsFor", { name: task.title })}
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      <DropdownMenuItem onSelect={() => onEdit(task)}>
                        <Pencil className="size-4" /> {tCommon("edit")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onSelect={() => onDelete(task)}
                      >
                        <Trash2 className="size-4" /> {tCommon("delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
