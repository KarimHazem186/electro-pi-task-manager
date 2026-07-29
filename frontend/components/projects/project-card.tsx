"use client";

import { MoreHorizontal, Pencil, Trash2, Users } from "lucide-react";
import { useTranslations } from "next-intl";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AvatarGroup } from "@/components/shared/user-avatar";
import { useApp } from "@/lib/app-context";
import { canManageProject } from "@/lib/permissions";
import { formatDate } from "@/lib/format";
import { Link } from "@/i18n/routing";
import type { Project } from "@/types";

export function ProjectCard({
  project,
  onEdit,
  onDelete,
}: {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}) {
  const t = useTranslations("projects");
  const tCommon = useTranslations("common");

  const { currentUser } = useApp();
  const allowed = canManageProject(currentUser, project);

  const progress = project.taskCount
    ? Math.round((project.completedTaskCount / project.taskCount) * 100)
    : 0;

  return (
    <Card className="group gap-0 rounded-xl border-border bg-card shadow-soft transition-shadow duration-200 hover:shadow-lifted">
      <CardHeader className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 pb-3">
        <div className="min-w-0">
          <Link
            href={`/projects/${project.slug}`}
            className="truncate text-base font-semibold tracking-tight transition-colors hover:text-primary"
          >
            {project.name}
          </Link>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {project.description}
          </p>
        </div>
        {allowed && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0"
                aria-label={tCommon("actionsFor", { name: project.name })}
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onSelect={() => onEdit(project)}>
                <Pencil className="size-4" /> {tCommon("edit")}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={() => onDelete(project)}
              >
                <Trash2 className="size-4" /> {tCommon("delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>

      <CardContent className="space-y-2 pb-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {t("card.tasksProgress", {
              completed: project.completedTaskCount,
              total: project.taskCount,
            })}
          </span>
          <span className="font-medium text-foreground">{progress}%</span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t border-border pt-4">
        {project.members.length ? (
          <AvatarGroup users={project.members.map((m) => m.user)} />
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="size-3.5" /> {t("details.noMembers")}
          </span>
        )}
        <span className="text-xs text-muted-foreground">
          {formatDate(project.createdAt)}
        </span>
      </CardFooter>
    </Card>
  );
}
