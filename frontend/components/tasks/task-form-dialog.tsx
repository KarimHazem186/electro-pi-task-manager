"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { z } from "zod";
import { getErrorTranslationKey } from "@/lib/api/error-handler";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { DatePicker } from "@/components/shared/date-picker";
import { useAllUsers } from "@/hooks/use-users";
import { useCreateTask, useUpdateTask } from "@/hooks/use-tasks";
import type { Task, TaskStatus } from "@/types";

export function TaskFormDialog({
  open,
  onOpenChange,
  task,
  projectId,
  defaultStatus = "todo",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  projectId?: string;
  defaultStatus?: TaskStatus;
}) {
  const t = useTranslations("tasks");
  const tForm = useTranslations("tasks.form");
  const tFormErrors = useTranslations("tasks.form.errors");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors.api");

  const { data: users = [] } = useAllUsers();
  const create = useCreateTask();
  const update = useUpdateTask();
  const pending = create.isPending || update.isPending;

  const schema = useMemo(
    () =>
      z.object({
        title: z.string().trim().min(3, tFormErrors("titleMin")),
        description: z.string().trim().max(1000),
        status: z.enum(["todo", "in_progress", "done"]),
        priority: z.enum(["low", "medium", "high", "urgent"]),
        dueDate: z.string().optional().nullable(),
        assigneeId: z.string().optional().nullable(),
      }),
    [tFormErrors],
  );

  const form = useForm<z.infer<typeof schema>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any),
    defaultValues: {
      title: "",
      description: "",
      status: defaultStatus,
      priority: "medium",
      dueDate: null,
      assigneeId: null,
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      title: task?.title ?? "",
      description: task?.description ?? "",
      status: task?.status ?? defaultStatus,
      priority: task?.priority ?? "medium",
      dueDate: task?.dueDate ?? null,
      assigneeId: task?.assigneeId ?? null,
    });
  }, [open, task, defaultStatus, form]);

  const onSubmit = async (values: z.infer<typeof schema>) => {
    const payload = {
      ...values,
      description: values.description ?? "",
      dueDate: values.dueDate ?? null,
      assigneeId: values.assigneeId ?? null,
      projectId,
    };
    try {
      if (task) {
        await update.mutateAsync({ id: task.id, payload });
        toast.success(tForm("submitUpdate"));
      } else {
        await create.mutateAsync(payload);
        toast.success(tForm("submitCreate"));
      }
      onOpenChange(false);
    } catch (err) {
      const errorKey = getErrorTranslationKey(err);
      const key = errorKey.replace("errors.api.", "");
      toast.error(tErrors(key));
    }
  };

  const statusOptions = [
    { value: "todo", label: t("status.todo") },
    { value: "in_progress", label: t("status.in_progress") },
    { value: "done", label: t("status.done") },
  ];

  const priorityOptions = [
    { value: "low", label: t("priority.low") },
    { value: "medium", label: t("priority.medium") },
    { value: "high", label: t("priority.high") },
    { value: "urgent", label: t("priority.urgent") },
  ];

  const assigneeOptions = [
    { value: "__unassigned__", label: tForm("unassigned") },
    ...users.map((user) => ({
      value: user.id,
      label: user.name,
      description: user.email,
    })),
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-xl sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{task ? tForm("edit") : tForm("create")}</DialogTitle>
          <DialogDescription>
            {task ? tForm("edit") : tForm("create")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tForm("titleLabel")}</FormLabel>
                  <FormControl>
                    <Input placeholder={tForm("titlePlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tForm("descriptionLabel")}</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder={tForm("descriptionPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tForm("statusLabel")}</FormLabel>
                    <FormControl>
                      <Combobox
                        value={field.value}
                        onValueChange={(value) => {
                          if (value) field.onChange(value);
                        }}
                        options={statusOptions}
                        placeholder={tForm("statusLabel")}
                        searchPlaceholder={`${tCommon("search")}…`}
                        emptyText={t("status.todo")}
                        triggerClassName="h-9 w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tForm("priorityLabel")}</FormLabel>
                    <FormControl>
                      <Combobox
                        value={field.value}
                        onValueChange={(value) => {
                          if (value) field.onChange(value);
                        }}
                        options={priorityOptions}
                        placeholder={tForm("priorityLabel")}
                        searchPlaceholder={`${tCommon("search")}…`}
                        emptyText={t("priority.medium")}
                        triggerClassName="h-9 w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tForm("dueDateLabel")}</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value ?? null}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assigneeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tForm("assigneeLabel")}</FormLabel>
                    <FormControl>
                      <Combobox
                        // Sentinel value so the placeholder shows when the
                        // form has no assignee, while keeping the form value
                        // as `null` for the API payload.
                        value={field.value ?? "__unassigned__"}
                        onValueChange={(value) => {
                          if (!value || value === "__unassigned__") {
                            field.onChange(null);
                          } else {
                            field.onChange(value);
                          }
                        }}
                        options={assigneeOptions}
                        placeholder={tForm("assigneeLabel")}
                        searchPlaceholder={`${tCommon("search")} ${tForm("assigneeLabel").toLowerCase()}…`}
                        emptyText={tForm("unassigned")}
                        triggerClassName="h-9 w-full"
                        clearable
                        clearLabel={tForm("unassigned")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {tCommon("cancel")}
              </Button>
              <Button type="submit" disabled={pending}>
                {pending
                  ? tCommon("loading")
                  : task
                    ? tForm("submitUpdate")
                    : tForm("submitCreate")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
