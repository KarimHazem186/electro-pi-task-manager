"use client";

import { useTranslations } from "next-intl";

import { Combobox } from "@/components/ui/combobox";
import { useAllUsers } from "@/hooks/use-users";
import type { TaskListQuery } from "@/types";

export function TaskFilters({
  value,
  onChange,
}: {
  value: TaskListQuery;
  onChange: (next: Partial<TaskListQuery>) => void;
}) {
  const t = useTranslations("tasks");
  const tCommon = useTranslations("common");
  const { data: users = [] } = useAllUsers();

  const statusOptions = [
    { value: "all", label: t("filters.all") },
    { value: "todo", label: t("status.todo") },
    { value: "in_progress", label: t("status.in_progress") },
    { value: "done", label: t("status.done") },
  ];

  const priorityOptions = [
    { value: "all", label: t("filters.all") },
    { value: "low", label: t("priority.low") },
    { value: "medium", label: t("priority.medium") },
    { value: "high", label: t("priority.high") },
    { value: "urgent", label: t("priority.urgent") },
  ];

  const assigneeOptions = [
    { value: "all", label: t("filters.all") },
    ...users.map((user) => ({
      value: user.id,
      label: user.name,
      description: user.email,
    })),
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Combobox
        aria-label={t("filters.status")}
        value={value.status ?? "all"}
        onValueChange={(status) =>
          onChange({
            status: (status ?? "all") as TaskListQuery["status"],
          })
        }
        options={statusOptions}
        placeholder={t("filters.status")}
        searchPlaceholder={`${tCommon("search")}…`}
        emptyText={t("filters.all")}
        triggerClassName="h-9 w-[150px]"
      />

      <Combobox
        aria-label={t("filters.priority")}
        value={value.priority ?? "all"}
        onValueChange={(priority) =>
          onChange({
            priority: (priority ?? "all") as TaskListQuery["priority"],
          })
        }
        options={priorityOptions}
        placeholder={t("filters.priority")}
        searchPlaceholder={`${tCommon("search")}…`}
        emptyText={t("filters.all")}
        triggerClassName="h-9 w-[150px]"
      />

      <Combobox
        aria-label={t("filters.assignee")}
        value={value.assigneeId ?? "all"}
        onValueChange={(assigneeId) =>
          onChange({ assigneeId: assigneeId ?? "all" })
        }
        options={assigneeOptions}
        placeholder={t("filters.assignee")}
        searchPlaceholder={`${tCommon("search")} ${t("filters.assignee").toLowerCase()}…`}
        emptyText={t("filters.all")}
        triggerClassName="h-9 w-[200px]"
      />
    </div>
  );
}
