"use client";

import { CalendarDays, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

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
import { dueDateTone, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";

export function TaskCard({
  task,
  onEdit,
  onDelete,
}: {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  const t = useTranslations("tasks");
  const tCommon = useTranslations("common");

  return (
    <Card className="gap-3 rounded-xl border-border bg-card p-3.5 shadow-soft transition-shadow duration-200 hover:shadow-lifted">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
        <p className="min-w-0 text-sm font-medium leading-snug">{task.title}</p>
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

      {task.description && (
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {task.description}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <PriorityBadge priority={task.priority} />
        <span
          className={cn(
            "flex items-center gap-1 text-xs",
            dueDateTone(task.dueDate),
          )}
        >
          <CalendarDays className="size-3.5" aria-hidden />
          {formatDate(task.dueDate)}
        </span>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-3">
        <span className="truncate text-xs text-muted-foreground">
          {task.creator
            ? t("byCreator", { name: task.creator.name })
            : tCommon("unknown")}
        </span>
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
      </div>
    </Card>
  );
}
