"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskCard } from "@/components/tasks/task-card";
import { EmptyState } from "@/components/shared/empty-state";
import type { Task, TaskStatus, Project } from "@/types";

const columns: TaskStatus[] = ["todo", "in_progress", "done"];

export function KanbanBoard({
  tasks,
  isLoading,
  project,
  canCreate = true,
  onCreate,
  onEdit,
  onDelete,
}: {
  tasks: Task[];
  isLoading?: boolean;
  project?: Project | null;
  canCreate?: boolean;
  onCreate: (status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  const t = useTranslations("tasks");

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {columns.map((status) => {
        const columnTasks = tasks.filter((task) => task.status === status);
        const label = t(`status.${status}`);
        return (
          <section
            key={status}
            aria-label={label}
            className="flex flex-col rounded-xl border border-border bg-secondary/40 p-3"
          >
            <header className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                {label}
                <span className="rounded-md bg-card px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                  {columnTasks.length}
                </span>
              </h3>
              {canCreate && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  aria-label={t("addToColumn", { name: label })}
                  onClick={() => onCreate(status)}
                >
                  <Plus className="size-4" />
                </Button>
              )}
            </header>

            <div className="flex flex-col gap-3">
              {isLoading ? (
                Array.from({ length: 2 }).map((_, index) => (
                  <Skeleton key={index} className="h-32 rounded-xl" />
                ))
              ) : columnTasks.length ? (
                columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    project={project}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))
              ) : (
                <EmptyState
                  title={t("empty")}
                  description={t("columnEmpty")}
                />
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
