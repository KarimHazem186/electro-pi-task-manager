"use client";

import { useState } from "react";
import { CalendarDays, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PriorityBadge } from "@/components/shared/badges";
import { UserAvatar } from "@/components/shared/user-avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TaskDetailModal } from "@/components/tasks/task-detail-modal";
import { useApp } from "@/lib/app-context";
import { canEditTask, canDeleteTask } from "@/lib/permissions";
import { dueDateTone, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAllUsers } from "@/hooks/use-users";
import { useUpdateTask } from "@/hooks/use-tasks";
import type { Task, Project, TaskPayload } from "@/types";

export function TaskCard({
  task,
  project,
  onEdit,
  onDelete,
}: {
  task: Task;
  project?: Project | null;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  const t = useTranslations("tasks");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const { currentUser } = useApp();
  const canEdit = canEditTask(currentUser, task);
  const canDelete = canDeleteTask(currentUser, task);
  const hasAnyPermission = canEdit || canDelete;

  const [detailOpen, setDetailOpen] = useState(false);

  const { data: usersData } = useAllUsers();
  const updateTask = useUpdateTask();

  const users = (usersData ?? []).map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    avatarUrl: u.avatarUrl,
  }));

  const handleUpdate = async (taskId: string, data: Partial<Task>) => {
    await updateTask.mutateAsync({
      id: taskId,
      payload: data as Partial<TaskPayload>,
    });
  };

  return (
    <>
      <Card
        className="gap-3 rounded-xl border-border bg-card p-3.5 shadow-soft transition-shadow duration-200 hover:shadow-lifted"
      >
        <div
          className={cn(
            "grid items-start gap-2",
            isRtl
              ? "grid-cols-[auto_minmax(0,1fr)]"
              : "grid-cols-[minmax(0,1fr)_auto]",
          )}
        >
          {isRtl && hasAnyPermission && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 shrink-0"
                  aria-label={tCommon("actionsFor", { name: task.title })}
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-36"
                sideOffset={5}
                collisionPadding={10}
              >
                {canEdit && (
                  <DropdownMenuItem onSelect={() => onEdit(task)}>
                    <Pencil className="size-4" /> {tCommon("edit")}
                  </DropdownMenuItem>
                )}
                {canDelete && (
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onSelect={() => onDelete(task)}
                  >
                    <Trash2 className="size-4" /> {tCommon("delete")}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Clickable title */}
          <button
            type="button"
            className={cn(
              "min-w-0 text-sm font-medium leading-snug hover:underline focus:outline-none",
              isRtl && "text-right",
            )}
            onClick={() => setDetailOpen(true)}
          >
            {task.title}
          </button>

          {!isRtl && hasAnyPermission && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 shrink-0"
                  aria-label={tCommon("actionsFor", { name: task.title })}
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-36"
                sideOffset={5}
                collisionPadding={10}
              >
                {canEdit && (
                  <DropdownMenuItem onSelect={() => onEdit(task)}>
                    <Pencil className="size-4" /> {tCommon("edit")}
                  </DropdownMenuItem>
                )}
                {canDelete && (
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onSelect={() => onDelete(task)}
                  >
                    <Trash2 className="size-4" /> {tCommon("delete")}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {task.description && (
          <p
            className={cn(
              "line-clamp-2 text-xs text-muted-foreground",
              isRtl && "text-right",
            )}
          >
            {task.description}
          </p>
        )}

        <div
          className={cn(
            "flex flex-wrap items-center gap-2",
            isRtl && "flex-row-reverse justify-end",
          )}
        >
          <PriorityBadge priority={task.priority} />
          <span
            className={cn(
              "flex items-center gap-1 text-xs",
              dueDateTone(task.dueDate),
              isRtl && "flex-row-reverse",
            )}
          >
            <CalendarDays className="size-3.5" aria-hidden />
            {formatDate(task.dueDate)}
          </span>
        </div>

        <div
          className={cn(
            "flex items-center justify-between border-t border-border pt-3",
            isRtl && "flex-row-reverse",
          )}
        >
          {task.assignee ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <UserAvatar user={task.assignee} className="size-6" />
                </span>
              </TooltipTrigger>
              <TooltipContent>{task.assignee.name}</TooltipContent>
            </Tooltip>
          ) : (
            <span className="text-xs text-muted-foreground">
              {t("form.unassigned")}
            </span>
          )}
          <span
            className={cn(
              "truncate text-xs text-muted-foreground",
              isRtl && "text-right",
            )}
          >
            {task.creator
              ? t("byCreator", { name: task.creator.name })
              : tCommon("unknown")}
          </span>
        </div>
      </Card>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={task}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onUpdate={handleUpdate}
        onDelete={(t) => {
          setDetailOpen(false);
          onDelete(t);
        }}
        users={users}
      />
    </>
  );
}
