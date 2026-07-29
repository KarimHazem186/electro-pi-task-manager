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
import { Card } from "@/components/ui/card";
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
    <>
      {/* Desktop Table View */}
      <div className="hidden overflow-x-auto rounded-xl border border-border bg-card shadow-soft md:block">
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

      {/* Mobile Cards View */}
      <div className="flex flex-col gap-3 md:hidden">
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="p-4">
              <Skeleton className="mb-2 h-5 w-3/4" />
              <Skeleton className="mb-3 h-4 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
            </Card>
          ))
          : tasks.map((task) => (
            <Card key={task.id} className="p-4 shadow-soft">
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="mb-1 font-medium">{task.title}</h3>
                  {task.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {task.description}
                    </p>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0"
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
              </div>

              <div className="mb-3 flex flex-wrap gap-2">
                <PriorityBadge priority={task.priority} />
                <StatusBadge status={task.status} />
              </div>

              <div className="flex items-center justify-between gap-3 text-sm">
                <div className="flex min-w-0 items-center gap-2">
                  {task.assignee ? (
                    <>
                      <UserAvatar
                        user={task.assignee}
                        className="size-6"
                      />
                      <span className="truncate">{task.assignee.name}</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">
                      {t("form.unassigned")}
                    </span>
                  )}
                </div>
                <span className={cn("shrink-0", dueDateTone(task.dueDate))}>
                  {formatDate(task.dueDate)}
                </span>
              </div>
            </Card>
          ))}
      </div>
    </>
  );
}
