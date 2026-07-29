"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  UserPlus,
  MoreHorizontal,
  Calendar,
  CheckCircle2,
  ListTodo,
  Users,
  Clock,
} from "lucide-react";
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
import { StatCard } from "@/components/dashboard/stat-card";
import { KanbanBoard } from "@/components/tasks/kanban-board";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { ProjectFormDialog } from "@/components/projects/project-form-dialog";
import { AddProjectMemberDialog } from "@/components/projects/add-project-member-dialog";
import { ImageUpload } from "@/components/shared/image-upload";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useDeleteProject,
  useProjectBySlug,
  useRemoveProjectMember,
  useUpdateProjectMember,
} from "@/hooks/use-projects";
import { useAllTasks, useDeleteTask } from "@/hooks/use-tasks";
import { useProjectCover } from "@/hooks/use-upload";
import { useApp } from "@/lib/app-context";
import { canManageProject, canCreateTask } from "@/lib/permissions";
import { formatDate } from "@/lib/format";
import { Link, useRouter } from "@/i18n/routing";
import type { ProjectMember, Task, TaskStatus } from "@/types";

export function ProjectDetails({ projectSlug }: { projectSlug: string }) {
  const t = useTranslations("projects");
  const tMembers = useTranslations("projects.members");
  const tNav = useTranslations("nav");
  const tTasks = useTranslations("tasks");
  const tCommon = useTranslations("common");
  const tUpload = useTranslations("upload");

  const router = useRouter();
  const { data: project, isLoading } = useProjectBySlug(projectSlug);
  const tasks = useAllTasks(
    { projectId: project?.id },
    { enabled: Boolean(project?.id) },
  );
  const removeProject = useDeleteProject();
  const removeTask = useDeleteTask();
  const removeMember = useRemoveProjectMember(project?.id ?? "");
  const updateMember = useUpdateProjectMember(project?.id ?? "");

  const { currentUser } = useApp();
  const canManage = canManageProject(currentUser, project);
  const canCreate = canCreateTask(currentUser, project);

  const { uploadCover, deleteCover, isUploading, isDeleting } = useProjectCover(
    project?.id ?? ""
  );

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>("todo");
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [removingMember, setRemovingMember] = useState<ProjectMember | null>(null);

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

  const taskList = tasks.data ?? [];
  const inProgressCount = taskList.filter((task) => task.status === "in_progress").length;
  const todoCount = taskList.filter((task) => task.status === "todo").length;
  const pct = project.taskCount
    ? Math.round((project.completedTaskCount / project.taskCount) * 100)
    : 0;

  const ownerMember =
    project.members.find((m) => m.role === "owner") ?? project.members[0];

  const handleRemoveMember = async () => {
    if (!removingMember) return;
    try {
      await removeMember.mutateAsync(removingMember.id);
      toast.success(tMembers("removeSuccess", { name: removingMember.user.name }));
      setRemovingMember(null);
    } catch {
      toast.error(tCommon("tryAgain"));
    }
  };

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
        title={
          <span className="flex flex-wrap items-center gap-2">
            <span className="truncate">{project.name}</span>
            <Badge
              variant={project.status === "active" ? "default" : "secondary"}
              className="capitalize"
            >
              {t(`status.${project.status}`)}
            </Badge>
          </span>
        }
        description={project.description}
        actions={
          <>
            {canManage && (
              <>
                <Button variant="outline" onClick={() => setEditOpen(true)}>
                  <Pencil className="size-4" /> {tCommon("edit")}
                </Button>
                <Button variant="outline" onClick={() => setDeleteOpen(true)}>
                  <Trash2 className="size-4" /> {tCommon("delete")}
                </Button>
              </>
            )}
            {canCreate && (
              <Button
                onClick={() => {
                  setEditingTask(null);
                  setTaskOpen(true);
                }}
              >
                <Plus className="size-4" /> {t("details.newTask")}
              </Button>
            )}
          </>
        }
      />

      <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("details.stats.totalTasks")}
          value={project.taskCount}
          icon={ListTodo}
        />
        <StatCard
          label={t("details.stats.completed")}
          value={project.completedTaskCount}
          icon={CheckCircle2}
        />
        <StatCard
          label={t("details.stats.inProgress")}
          value={inProgressCount}
          icon={Clock}
        />
        <StatCard
          label={t("details.stats.members")}
          value={project.members.length}
          icon={Users}
        />
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-5">
          <TabsTrigger value="overview">
            {t("details.tabs.overview")}
          </TabsTrigger>
          <TabsTrigger value="board">{t("details.tabs.board")}</TabsTrigger>
          <TabsTrigger value="members">
            {t("details.tabs.members")}
          </TabsTrigger>
          {canManage && (
            <TabsTrigger value="settings">
              {t("details.tabs.settings")}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="rounded-xl border-border shadow-soft lg:col-span-2">
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
                <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                  <div className="rounded-lg bg-secondary/40 p-2">
                    <p className="text-xs text-muted-foreground">
                      {tTasks("status.todo")}
                    </p>
                    <p className="text-lg font-semibold">{todoCount}</p>
                  </div>
                  <div className="rounded-lg bg-secondary/40 p-2">
                    <p className="text-xs text-muted-foreground">
                      {tTasks("status.in_progress")}
                    </p>
                    <p className="text-lg font-semibold">{inProgressCount}</p>
                  </div>
                  <div className="rounded-lg bg-secondary/40 p-2">
                    <p className="text-xs text-muted-foreground">
                      {tTasks("status.done")}
                    </p>
                    <p className="text-lg font-semibold">
                      {project.completedTaskCount}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-border shadow-soft">
              <CardHeader>
                <CardTitle className="text-base">
                  {t("details.about")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  {ownerMember ? (
                    <>
                      <UserAvatar user={ownerMember.user} />
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {ownerMember.user.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {tMembers("owner")}
                        </p>
                      </div>
                    </>
                  ) : (
                    <span className="text-muted-foreground">
                      {tCommon("unknown")}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="size-4" />
                  <span>
                    {t("details.createdAt", { date: formatDate(project.createdAt) })}
                  </span>
                </div>
                {project.updatedAt && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="size-4" />
                    <span>
                      {t("details.updatedAt", {
                        date: formatDate(project.updatedAt),
                      })}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="board">
          <KanbanBoard
            tasks={taskList}
            isLoading={tasks.isLoading}
            project={project}
            canCreate={canCreate}
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
              {canManage && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setAddMemberOpen(true)}
                >
                  <UserPlus className="size-4" /> {t("details.addMember")}
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {project.members.length ? (
                project.members.map((member) => {
                  const isOwner = member.role === "owner";
                  const canManageMember = canManage && !isOwner;
                  return (
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
                      <div className="flex shrink-0 items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {tMembers(member.role)}
                        </Badge>
                        {canManageMember && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="size-7"
                                aria-label={tCommon("actionsFor", {
                                  name: member.user.name,
                                })}
                              >
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem disabled>
                                {tMembers("changeRole")}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setRemovingMember(member)}
                              >
                                <Trash2 className="size-4" />
                                {tMembers("removeFromProject")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <EmptyState title={t("details.noMembers")} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {canManage && (
          <TabsContent value="settings" className="space-y-4">
            <Card className="rounded-xl border-border shadow-soft">
              <CardHeader>
                <CardTitle className="text-base">
                  {tUpload("projectCover.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  value={project.coverImage || undefined}
                  onFileSelect={(file) => uploadCover(file)}
                  isUploading={isUploading}
                  aspectRatio="video"
                  className="max-w-2xl"
                />
                {project.coverImage && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => deleteCover()}
                    disabled={isDeleting}
                  >
                    <Trash2 className="size-4" />
                    {isDeleting ? tUpload("image.uploading") : tUpload("projectCover.remove")}
                  </Button>
                )}
              </CardContent>
            </Card>

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
        )}
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
      <AddProjectMemberDialog
        open={addMemberOpen}
        onOpenChange={setAddMemberOpen}
        projectId={project.id}
        projectName={project.name}
        existingMembers={project.members}
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
      <ConfirmDialog
        open={Boolean(removingMember)}
        onOpenChange={(open) => !open && setRemovingMember(null)}
        title={tMembers("removeDialog.title")}
        description={
          removingMember
            ? tMembers("removeDialog.description", { name: removingMember.user.name })
            : ""
        }
        confirmLabel={tCommon("delete")}
        cancelLabel={tCommon("cancel")}
        destructive
        loading={removeMember.isPending}
        onConfirm={handleRemoveMember}
      />
    </>
  );
}
