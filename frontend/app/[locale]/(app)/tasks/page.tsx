"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { DataPagination } from "@/components/shared/data-pagination";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ErrorState } from "@/components/shared/error-state";
import { TaskTable } from "@/components/tasks/task-table";
import { TaskFilters } from "@/components/tasks/task-filters";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { Button } from "@/components/ui/button";
import { useDeleteTask, useTasks } from "@/hooks/use-tasks";
import type { Task, TaskListQuery } from "@/types";

export default function TasksPage() {
  const t = useTranslations("tasks");
  const tCommon = useTranslations("common");

  const [filters, setFilters] = useState<TaskListQuery>({
    page: 1,
    pageSize: 8,
    search: "",
    status: "all",
    priority: "all",
    assigneeId: "all",
    sortDir: "asc",
  });
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);

  const query = useTasks(filters);
  const remove = useDeleteTask();

  const patch = (next: Partial<TaskListQuery>) =>
    setFilters((prev) => ({ ...prev, ...next, page: 1 }));

  const rows = [...(query.data?.data ?? [])].sort((a, b) =>
    filters.sortDir === "asc"
      ? a.title.localeCompare(b.title)
      : b.title.localeCompare(a.title),
  );

  return (
    <>
      <PageHeader
        title={t("title")}
        description={t("subtitle")}
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" /> {t("newTask")}
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <SearchInput
          value={filters.search ?? ""}
          onChange={(search) => patch({ search })}
          placeholder={t("searchPlaceholder")}
        />
        <TaskFilters value={filters} onChange={patch} />
      </div>

      {query.isError ? (
        <ErrorState onRetry={() => query.refetch()} />
      ) : (
        <>
          <TaskTable
            tasks={rows}
            isLoading={query.isLoading}
            sortDir={filters.sortDir ?? "asc"}
            onToggleSort={() =>
              setFilters((prev) => ({
                ...prev,
                sortDir: prev.sortDir === "asc" ? "desc" : "asc",
              }))
            }
            onEdit={(task) => {
              setEditing(task);
              setFormOpen(true);
            }}
            onDelete={setDeleting}
          />
          {query.data && query.data.total > 0 && (
            <div className="mt-6">
              <DataPagination
                page={query.data.page}
                totalPages={query.data.totalPages}
                total={query.data.total}
                onPageChange={(page) =>
                  setFilters((prev) => ({ ...prev, page }))
                }
              />
            </div>
          )}
        </>
      )}

      <TaskFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        task={editing}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={t("delete.title")}
        description={t("delete.description", { title: deleting?.title ?? "" })}
        confirmLabel={tCommon("delete")}
        cancelLabel={tCommon("cancel")}
        destructive
        loading={remove.isPending}
        onConfirm={async () => {
          if (!deleting) return;
          await remove.mutateAsync(deleting.id);
          toast.success(t("delete.title"));
          setDeleting(null);
        }}
      />
    </>
  );
}
