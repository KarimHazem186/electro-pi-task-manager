"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  X, 
  Calendar, 
  User, 
  Flag, 
  CheckCircle2, 
  Trash2,
  Paperclip,
  Upload,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserAvatar } from "@/components/shared/user-avatar";
import { PriorityBadge, StatusBadge } from "@/components/shared/badges";
import { useApp } from "@/lib/app-context";
import { canEditTask, canDeleteTask } from "@/lib/permissions";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";

interface TaskDetailModalProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (taskId: string, data: Partial<Task>) => Promise<void>;
  onDelete: (task: Task) => void;
  users?: Array<{ id: string; name: string; email: string; avatarUrl?: string }>;
}

export function TaskDetailModal({
  task,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
  users = [],
}: TaskDetailModalProps) {
  const t = useTranslations("tasks");
  const tCommon = useTranslations("common");
  const { currentUser } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const canEdit = task ? canEditTask(currentUser, task) : false;
  const canDelete = task ? canDeleteTask(currentUser, task) : false;

  const taskSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string(),
    status: z.enum(["todo", "in_progress", "done"]),
    priority: z.enum(["low", "medium", "high", "urgent"]),
    dueDate: z.string().nullable(),
    assigneeId: z.string().nullable(),
  });

  const form = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "todo" as const,
      priority: "medium" as const,
      dueDate: null as string | null,
      assigneeId: null as string | null,
    },
  });

  // Update form when task changes
  useEffect(() => {
    if (task && open) {
      form.reset({
        title: task.title,
        description: task.description || "",
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        assigneeId: task.assigneeId,
      });
      setIsEditing(false);
    }
  }, [task, open, form]);

  const handleSave = async (data: z.infer<typeof taskSchema>) => {
    if (!task) return;

    try {
      setIsSaving(true);
      await onUpdate(task.id, data);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update task:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (task) {
      onDelete(task);
      onOpenChange(false);
    }
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditing ? (
              <Input
                {...form.register("title")}
                className="text-xl font-semibold"
                placeholder={t("form.titleLabel")}
              />
            ) : (
              task.title
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status & Priority */}
          <div className="flex flex-wrap items-center gap-3">
            {isEditing ? (
              <>
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground">
                    {tCommon("status")}
                  </Label>
                  <Select
                    value={form.watch("status")}
                    onValueChange={(value) => form.setValue("status", value as any)}
                  >
                    <SelectTrigger className="h-8 w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">{t("status.todo")}</SelectItem>
                      <SelectItem value="in_progress">{t("status.in_progress")}</SelectItem>
                      <SelectItem value="done">{t("status.done")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground">
                    {tCommon("priority")}
                  </Label>
                  <Select
                    value={form.watch("priority")}
                    onValueChange={(value) => form.setValue("priority", value as any)}
                  >
                    <SelectTrigger className="h-8 w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{t("priority.low")}</SelectItem>
                      <SelectItem value="medium">{t("priority.medium")}</SelectItem>
                      <SelectItem value="high">{t("priority.high")}</SelectItem>
                      <SelectItem value="urgent">{t("priority.urgent")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <>
                <StatusBadge status={task.status} />
                <PriorityBadge priority={task.priority} />
              </>
            )}
          </div>

          <Separator />

          {/* Description */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              {t("form.descriptionLabel")}
            </Label>
            {isEditing ? (
              <Textarea
                {...form.register("description")}
                rows={4}
                placeholder={t("form.descriptionPlaceholder")}
              />
            ) : (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {task.description || t("form.noDescription")}
              </p>
            )}
          </div>

          <Separator />

          {/* Metadata */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Assignee */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <User className="size-4" />
                {tCommon("assignee")}
              </Label>
              {isEditing ? (
                <Select
                  value={form.watch("assigneeId") || "unassigned"}
                  onValueChange={(value) =>
                    form.setValue("assigneeId", value === "unassigned" ? null : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">{t("form.unassigned")}</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : task.assignee ? (
                <div className="flex items-center gap-2">
                  <UserAvatar user={task.assignee} className="size-8" />
                  <div>
                    <p className="text-sm font-medium">{task.assignee.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {task.assignee.email}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{t("form.unassigned")}</p>
              )}
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="size-4" />
                {tCommon("dueDate")}
              </Label>
              {isEditing ? (
                <Input
                  type="date"
                  {...form.register("dueDate")}
                  value={form.watch("dueDate") || ""}
                />
              ) : task.dueDate ? (
                <p className="text-sm">{formatDate(task.dueDate)}</p>
              ) : (
                <p className="text-sm text-muted-foreground">{t("form.noDueDate")}</p>
              )}
            </div>
          </div>

          {/* Creator */}
          {task.creator && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t("form.createdBy")}</Label>
              <div className="flex items-center gap-2">
                <UserAvatar user={task.creator} className="size-8" />
                <div>
                  <p className="text-sm font-medium">{task.creator.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(task.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Attachments */}
          {task.attachments && task.attachments.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Paperclip className="size-4" />
                  {t("form.attachments")} ({task.attachments.length})
                </Label>
                <div className="grid gap-2">
                  {task.attachments.map((attachment: any) => (
                    <div
                      key={attachment._id}
                      className="flex items-center gap-2 rounded-lg border p-2"
                    >
                      <img
                        src={attachment.url}
                        alt="Attachment"
                        className="size-12 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">Attachment</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(attachment.uploadedAt)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(attachment.url, "_blank")}
                      >
                        {tCommon("view")}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex items-center justify-between gap-2">
            <div>
              {canDelete && !isEditing && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                >
                  <Trash2 className="size-4" />
                  {tCommon("delete")}
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      form.reset({
                        title: task.title,
                        description: task.description || "",
                        status: task.status,
                        priority: task.priority,
                        dueDate: task.dueDate,
                        assigneeId: task.assigneeId,
                      });
                    }}
                    disabled={isSaving}
                  >
                    {tCommon("cancel")}
                  </Button>
                  <Button
                    size="sm"
                    onClick={form.handleSubmit(handleSave)}
                    disabled={isSaving}
                  >
                    <CheckCircle2 className="size-4" />
                    {isSaving ? tCommon("saving") : tCommon("save")}
                  </Button>
                </>
              ) : (
                canEdit && (
                  <Button size="sm" onClick={() => setIsEditing(true)}>
                    {tCommon("edit")}
                  </Button>
                )
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
