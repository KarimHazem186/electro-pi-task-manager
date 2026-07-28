"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { KanbanBoard } from "@/components/tasks/kanban-board";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { ProjectFormDialog } from "@/components/projects/project-form-dialog";
import { useDeleteProject, useProjectBySlug } from "@/hooks/use-projects";
import { useAllTasks, useDeleteTask } from "@/hooks/use-tasks";
import { formatDate } from "@/lib/format";
import { Link, useRouter } from "@/i18n/routing";
import type { Task, TaskStatus } from "@/types";

export function ProjectDetails({ projectSlug }: { projectSlug: string }) {
  const t = useTranslations("projects");
  const tNav = useTranslations("nav");
  const tTasks = useTranslations("tasks");
  const tCommon = useTranslations("common");

  const router = useRouter();
  const { data: project, isLoading } = useProjectBySlug(projectSlug);
  const tasks = useAllTasks(
    { projectId: project?.id },
    { enabled: Boolean(project?.id) },
  );
  const removeProject = useDeleteProject();
  const removeTask = useDeleteTask();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>("todo");
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  if (isLoading) {
    return (
      <>
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="mt-4 h-96 rounded-xl" />
      </>
    );
  }

  if (!project) {
    return (
      <EmptyState
        title={t("details.notFound")}
        description={t("details.notFoundDesc")}
        action={
          <Button asChild variant="outline">
            <Link href="/projects">{t("details.backToProjects")}</Link>
          </Button>
        }
      />
    );
  }

  const pct = project.taskCount
    ? Math.round((project.completedTaskCount / project.taskCount) * 100)
    : 0;

  return (
    <>
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/projects">{tNav("projects")}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{project.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeader
        title={project.name}
        description={project.description}
        actions={
          <>
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil className="size-4" /> {tCommon("edit")}
            </Button>
            <Button variant="outline" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="size-4" /> {tCommon("delete")}
            </Button>
            <Button
              onClick={() => {
                setEditingTask(null);
                setTaskOpen(true);
              }}
            >
              <Plus className="size-4" /> {t("details.newTask")}
            </Button>
          </>
        }
      />

      <Tabs defaultValue="overview">
        <TabsList className="mb-5">
          <TabsTrigger value="overview">
            {t("details.tabs.overview")}
          </TabsTrigger>
          <TabsTrigger value="board">{t("details.tabs.board")}</TabsTrigger>
          <TabsTrigger value="members">
            {t("details.tabs.members")}
          </TabsTrigger>
          <TabsTrigger value="settings">
            {t("details.tabs.settings")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="rounded-xl border-border shadow-soft">
            <CardHeader>
              <CardTitle className="text-base">
                {t("details.progress")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {t("details.tasksProgress", {
                    completed: project.completedTaskCount,
                    total: project.taskCount,
                  })}
                </span>
                <span className="font-medium">{pct}%</span>
              </div>
              <Progress value={pct} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {t("details.createdAt", { date: formatDate(project.createdAt) })}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="board">
          <KanbanBoard
            tasks={tasks.data ?? []}
            isLoading={tasks.isLoading}
            onCreate={(status) => {
              setEditingTask(null);
              setDefaultStatus(status);
              setTaskOpen(true);
            }}
            onEdit={(task) => {
              setEditingTask(task);
              setTaskOpen(true);
            }}
            onDelete={setDeletingTask}
          />
        </TabsContent>

        <TabsContent value="members">
          <Card className="rounded-xl border-border shadow-soft">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">
                {t("details.membersHeading")}
              </CardTitle>
              <Button size="sm" variant="outline">
                <UserPlus className="size-4" /> {t("details.addMember")}
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {project.members.length ? (
                project.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border p-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <UserAvatar user={member.user} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {member.user.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {member.user.email}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="shrink-0 capitalize">
                      {member.role}
                    </Badge>
                  </div>
                ))
              ) : (
                <EmptyState title={t("details.noMembers")} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="rounded-xl border-border shadow-soft">
            <CardHeader>
              <CardTitle className="text-base">
                {t("details.dangerZone")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                {t("details.dangerZoneDesc")}
              </p>
              <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="size-4" /> {t("details.deleteProject")}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ProjectFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        project={project}
      />
      <TaskFormDialog
        open={taskOpen}
        onOpenChange={setTaskOpen}
        task={editingTask}
        projectId={project.id}
        defaultStatus={defaultStatus}
      />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t("delete.title")}
        description={t("delete.description", { name: project.name })}
        confirmLabel={tCommon("delete")}
        cancelLabel={tCommon("cancel")}
        destructive
        loading={removeProject.isPending}
        onConfirm={async () => {
          await removeProject.mutateAsync(project.id);
          toast.success(t("delete.title"));
          router.push("/projects");
        }}
      />
      <ConfirmDialog
        open={Boolean(deletingTask)}
        onOpenChange={(open) => !open && setDeletingTask(null)}
        title={tTasks("delete.title")}
        description={tTasks("delete.description", {
          title: deletingTask?.title ?? "",
        })}
        confirmLabel={tCommon("delete")}
        cancelLabel={tCommon("cancel")}
        destructive
        loading={removeTask.isPending}
        onConfirm={async () => {
          if (!deletingTask) return;
          await removeTask.mutateAsync(deletingTask.id);
          toast.success(tTasks("delete.title"));
          setDeletingTask(null);
        }}
      />
    </>
  );
}
