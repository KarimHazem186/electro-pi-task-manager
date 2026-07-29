"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  ListTodo,
  CheckCircle2,
  RefreshCw,
  UserPlus,
  Megaphone,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { UserAvatar } from "@/components/shared/user-avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { useApp } from "@/lib/app-context";
import { Link, useRouter } from "@/i18n/routing";
import { formatRelative } from "@/lib/format";
import {
  useDeleteNotification,
  useMarkAllAsRead,
  useMarkAsRead,
  useNotifications,
} from "@/hooks/use-notifications";
import type { AppNotification, NotificationType } from "@/types";

const ICON_MAP: Record<NotificationType, typeof Bell> = {
  task_assigned: ListTodo,
  task_updated: RefreshCw,
  task_completed: CheckCircle2,
  task_status_changed: RefreshCw,
  project_member_added: UserPlus,
  project_invite: UserPlus,
  mention: Megaphone,
  system: Bell,
};

const ACCENT_CLASS: Record<NotificationType, string> = {
  task_assigned: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  task_updated: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  task_completed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  task_status_changed: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  project_member_added: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  project_invite: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  mention: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  system: "bg-muted text-muted-foreground",
};

function translateTypeLabel(t: ReturnType<typeof useTranslations>, type: NotificationType) {
  const map: Record<NotificationType, string> = {
    task_assigned: t("type.task_assigned"),
    task_updated: t("type.task_updated"),
    task_completed: t("type.task_completed"),
    task_status_changed: t("type.task_status_changed"),
    project_member_added: t("type.project_member_added"),
    project_invite: t("type.project_invite"),
    mention: t("type.mention"),
    system: t("type.system"),
  };
  return map[type];
}

export function NotificationsPopover() {
  const t = useTranslations("notifications");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { currentUser } = useApp();
  const [open, setOpen] = useState(false);
  const notificationsQuery = useNotifications({ limit: 20 });
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const remove = useDeleteNotification();

  const items = notificationsQuery.data?.items ?? [];
  const unread = notificationsQuery.data?.unreadCount ?? 0;

  const hasUnread = unread > 0;

  const handleOpenItem = (notification: AppNotification) => {
    if (!notification.read) {
      markAsRead.mutate(notification.id);
    }
    if (notification.href) {
      setOpen(false);
      router.push(notification.href as Parameters<typeof router.push>[0]);
    }
  };

  const label = useMemo(
    () => (hasUnread ? `${t("title")} (${unread})` : t("title")),
    [hasUnread, t, unread],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip open={open ? false : undefined}>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label={label}
              className="group relative grid size-10 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-ring data-[state=open]:bg-accent data-[state=open]:text-foreground"
            >
              <Bell className="size-4" />
              {hasUnread && (
                <span
                  aria-hidden
                  className="absolute end-1.5 top-1.5 grid min-h-[16px] min-w-[16px] place-items-center rounded-full bg-destructive px-1 text-[9px] font-semibold leading-none text-destructive-foreground"
                >
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">{label}</TooltipContent>
      </Tooltip>
      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-[min(92vw,400px)] rounded-xl p-0"
      >
        <header className="flex items-center justify-between gap-2 px-4 py-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">{t("title")}</h3>
            <p className="text-xs text-muted-foreground">
              {hasUnread
                ? t("unreadSummary", { count: unread })
                : t("allCaughtUp")}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!hasUnread || markAllAsRead.isPending}
            onClick={() => markAllAsRead.mutate()}
            className="shrink-0"
          >
            <CheckCheck className="size-4" />
            <span className="ms-1">{t("markAll")}</span>
          </Button>
        </header>
        <Separator />
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {notificationsQuery.isLoading ? (
            <div className="space-y-2 p-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="p-3">
              <EmptyState
                title={t("empty")}
                description={t("emptyDesc")}
                icon={Bell}
              />
            </div>
          ) : (
            <ul className="space-y-1">
              {items.map((n) => {
                const Icon = ICON_MAP[n.type] ?? Bell;
                const accent = ACCENT_CLASS[n.type] ?? ACCENT_CLASS.system;
                const typeLabel = translateTypeLabel(t, n.type);

                return (
                  <li key={n.id}>
                    <div
                      className={`group/item relative flex w-full items-start gap-3 rounded-lg border border-transparent p-3 text-start transition-colors ${n.read ? "bg-transparent" : "bg-accent/40"
                        } hover:border-border hover:bg-accent/60`}
                    >
                      <button
                        type="button"
                        onClick={() => handleOpenItem(n)}
                        className="flex min-w-0 flex-1 items-start gap-3 text-start"
                      >
                        {n.actor ? (
                          <UserAvatar user={n.actor} />
                        ) : (
                          <span
                            className={`grid size-8 shrink-0 place-items-center rounded-full ${accent}`}
                            aria-hidden
                          >
                            <Icon className="size-4" />
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px]">
                              {typeLabel}
                            </Badge>
                            {!n.read && (
                              <span
                                aria-label={t("unread")}
                                className="size-1.5 shrink-0 rounded-full bg-destructive"
                              />
                            )}
                          </div>
                          <p className="mt-1 line-clamp-1 text-sm font-medium">
                            {n.title}
                          </p>
                          {n.body && (
                            <p className="line-clamp-2 text-xs text-muted-foreground">
                              {n.body}
                            </p>
                          )}
                          <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                            {formatRelative(n.createdAt)}
                          </p>
                        </div>
                      </button>
                      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover/item:opacity-100">
                        {!n.read && (
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="size-7"
                            aria-label={t("markAsRead")}
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead.mutate(n.id);
                            }}
                          >
                            <Check className="size-3.5" />
                          </Button>
                        )}
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="size-7 text-muted-foreground"
                          aria-label={tCommon("delete")}
                          onClick={(e) => {
                            e.stopPropagation();
                            remove.mutate(n.id);
                          }}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <Separator />
        <footer className="flex items-center justify-between gap-2 px-4 py-2.5 text-xs text-muted-foreground">
          <span>
            {t("lastMessages", { count: items.length })}
          </span>
          {currentUser && (
            <Link
              href="/profile"
              className="font-medium text-foreground hover:underline"
              onClick={() => setOpen(false)}
            >
              {t("manage")}
            </Link>
          )}
        </footer>
      </PopoverContent>
    </Popover>
  );
}
