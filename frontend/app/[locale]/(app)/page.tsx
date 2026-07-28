"use client";

import {
  CheckCircle2,
  Clock,
  FolderKanban,
  ListChecks,
  Plus,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/shared/empty-state";
import { UserAvatar } from "@/components/shared/user-avatar";
import { PriorityBadge, StatusBadge } from "@/components/shared/badges";
import { useActivityFeed, useDashboardStats } from "@/hooks/use-users";
import { useProjects } from "@/hooks/use-projects";
import { useAllTasks } from "@/hooks/use-tasks";
import { currentUser } from "@/data/mock";
import { dueDateTone, formatDate, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/routing";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const tEmpty = useTranslations("empty");

  const stats = useDashboardStats();
  const projects = useProjects({ page: 1, pageSize: 3 });
  const tasks = useAllTasks({ assigneeId: currentUser.id });
  const activity = useActivityFeed();

  const assigned = tasks.data ?? [];
  const upcoming = [...(tasks.data ?? [])]
    .filter((task) => task.dueDate && task.status !== "done")
    .sort((a, b) => (a.dueDate! < b.dueDate! ? -1 : 1))
    .slice(0, 4);

  return (
    <>
      <PageHeader
        title={t("welcome", { name: currentUser.name.split(" ")[0] })}
        description={t("subtitle")}
        actions={
          <Button asChild>
            <Link href="/projects">
              <Plus className="size-4" /> {t("newProject")}
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t("stats.totalProjects")}
          value={stats.data?.totalProjects ?? 0}
          icon={FolderKanban}
          isLoading={stats.isLoading}
        />
        <StatCard
          label={t("stats.totalTasks")}
          value={stats.data?.totalTasks ?? 0}
          icon={ListChecks}
          isLoading={stats.isLoading}
        />
        <StatCard
          label={t("stats.completed")}
          value={stats.data?.completedTasks ?? 0}
          icon={CheckCircle2}
          isLoading={stats.isLoading}
        />
        <StatCard
          label={t("stats.pending")}
          value={stats.data?.pendingTasks ?? 0}
          icon={Clock}
          isLoading={stats.isLoading}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="rounded-xl border-border shadow-soft lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">{t("recentProjects")}</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/projects">{t("viewAll")}</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {projects.isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))
            ) : projects.data?.data.length ? (
              projects.data.data.map((project) => {
                const pct = project.taskCount
                  ? Math.round(
                    (project.completedTaskCount / project.taskCount) * 100,
                  )
                  : 0;
                return (
                  <Link
                    key={project.id}
                    href={`/projects/${project.slug}`}
                    className="block rounded-xl border border-border p-4 transition-colors duration-200 hover:bg-secondary/60"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-medium">
                        {project.name}
                      </p>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {pct}%
                      </span>
                    </div>
                    <Progress value={pct} className="mt-2 h-1.5" />
                  </Link>
                );
              })
            ) : (
              <EmptyState title={t("noProjects")} />
            )}
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">{t("upcomingDeadlines")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasks.isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-xl" />
              ))
            ) : upcoming.length ? (
              upcoming.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start justify-between gap-3"
                >
                  <p className="min-w-0 truncate text-sm">{task.title}</p>
                  <span
                    className={cn(
                      "shrink-0 text-xs",
                      dueDateTone(task.dueDate),
                    )}
                  >
                    {formatDate(task.dueDate)}
                  </span>
                </div>
              ))
            ) : (
              <EmptyState title={t("nothingDue")} description={t("allCaughtUp")} />
            )}
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border shadow-soft lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">{t("myAssignedTasks")}</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/tasks">{t("viewAll")}</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasks.isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-xl" />
              ))
            ) : assigned.length ? (
              assigned.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border p-3"
                >
                  <p className="min-w-0 flex-1 truncate text-sm font-medium">
                    {task.title}
                  </p>
                  <div className="flex shrink-0 items-center gap-2">
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} />
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                title={tEmpty("default")}
                description={t("assignedHint")}
              />
            )}
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">{t("activity")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activity.isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 rounded-xl" />
              ))
              : activity.data?.map((event) => (
                <div key={event.id} className="flex min-w-0 gap-3">
                  <UserAvatar
                    user={event.actor}
                    className="size-7 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm leading-snug">
                      <span className="font-medium">{event.actor.name}</span>{" "}
                      {event.action}{" "}
                      <span className="font-medium">{event.target}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelative(event.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
