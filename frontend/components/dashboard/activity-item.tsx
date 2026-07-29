"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/shared/user-avatar";
import { PriorityBadge, StatusBadge } from "@/components/shared/badges";
import type { ActivityEvent } from "@/types";

interface ActivityItemProps {
  event: ActivityEvent;
  formatRelative: (date: string) => string;
}

export function ActivityItem({ event, formatRelative }: ActivityItemProps) {
  const t = useTranslations("activity");
  const locale = useLocale();
  const isRtl = locale === "ar";
  
  const user = event.actor ?? event.user;
  if (!user) return null;

  // Determine icon based on action type
  const getActionIcon = () => {
    switch (event.type) {
      case 'created':
        return '✨';
      case 'updated':
        return '📝';
      case 'deleted':
        return '🗑️';
      case 'status_changed':
        return '🔄';
      case 'assigned':
        return '👤';
      case 'unassigned':
        return '👋';
      case 'priority_changed':
        return '⚡';
      case 'due_date_changed':
        return '📅';
      default:
        return '📌';
    }
  };

  // Determine entity icon
  const getEntityIcon = () => {
    switch (event.entityType) {
      case 'task':
        return '✓';
      case 'project':
        return '📁';
      case 'project_member':
        return '👥';
      default:
        return '•';
    }
  };

  // Get action color class
  const getActionColorClass = () => {
    switch (event.type) {
      case 'created':
        return 'text-green-600 dark:text-green-400';
      case 'deleted':
        return 'text-red-600 dark:text-red-400';
      case 'status_changed':
        return 'text-blue-600 dark:text-blue-400';
      case 'priority_changed':
        return 'text-orange-600 dark:text-orange-400';
      default:
        return 'text-muted-foreground';
    }
  };

  // Get translated action text
  const getActionText = () => {
    try {
      return t(`actions.${event.type}`);
    } catch {
      return event.action;
    }
  };

  // Get translated entity type
  const getEntityTypeText = () => {
    try {
      return t(`entityTypes.${event.entityType}`);
    } catch {
      return event.entityType;
    }
  };

  const inner = (
    <>
      <div className="relative shrink-0">
        <UserAvatar user={user} className="size-8 shrink-0" />
        <span 
          className={cn(
            "absolute -bottom-1 text-xs flex items-center justify-center size-5 rounded-full bg-background border border-border",
            getActionColorClass(),
            isRtl ? "-left-1" : "-right-1"
          )}
        >
          {getActionIcon()}
        </span>
      </div>
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm leading-snug" dir={isRtl ? "rtl" : "ltr"}>
            <span className="font-medium text-foreground">{user.name}</span>{" "}
            <span className="text-muted-foreground">{getActionText()}</span>{" "}
            <span className="font-medium text-foreground">
              {event.target.length > 50 
                ? `${event.target.substring(0, 50)}...` 
                : event.target}
            </span>
          </p>
          <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
            {formatRelative(event.createdAt ?? event.timestamp)}
          </span>
        </div>

        {/* Show status change details */}
        {event.details?.statusChange && (
          <div className="flex items-center gap-2 text-xs" dir={isRtl ? "rtl" : "ltr"}>
            <StatusBadge status={event.details.statusChange.from} />
            <span className="text-muted-foreground">←</span>
            <StatusBadge status={event.details.statusChange.to} />
          </div>
        )}

        {/* Show priority change details */}
        {event.details?.priorityChange && (
          <div className="flex items-center gap-2 text-xs" dir={isRtl ? "rtl" : "ltr"}>
            <span className="text-muted-foreground" dir={isRtl ? "rtl" : "ltr"}>{t("priorityLabel")}</span>
            <PriorityBadge priority={event.details.priorityChange.from} />
            <span className="text-muted-foreground">←</span>
            <PriorityBadge priority={event.details.priorityChange.to} />
          </div>
        )}

        {/* Show priority set details (for creation) */}
        {event.details?.prioritySet && !event.details?.priorityChange && (
          <div className="flex items-center gap-2 text-xs" dir={isRtl ? "rtl" : "ltr"}>
            <span className="text-muted-foreground" dir={isRtl ? "rtl" : "ltr"}>{t("priorityLabel")}</span>
            <PriorityBadge priority={event.details.prioritySet.value} />
          </div>
        )}

        {/* Show due date change details */}
        {event.details?.dueDateChange && (event.details.dueDateChange.from || event.details.dueDateChange.to) && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground" dir={isRtl ? "rtl" : "ltr"}>
            <span>📅</span>
            <span>
              {event.details.dueDateChange.from ? (
                <>
                  {new Date(event.details.dueDateChange.from).toLocaleDateString(locale)}
                  {" ← "}
                  {event.details.dueDateChange.to 
                    ? new Date(event.details.dueDateChange.to).toLocaleDateString(locale)
                    : t("noDate")}
                </>
              ) : event.details.dueDateChange.to ? (
                `${t("setTo")} ${new Date(event.details.dueDateChange.to).toLocaleDateString(locale)}`
              ) : null}
            </span>
          </div>
        )}

        {/* Entity type indicator */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground" dir={isRtl ? "rtl" : "ltr"}>
          <span className="inline-flex items-center gap-1">
            {getEntityIcon()} {getEntityTypeText()}
          </span>
        </div>
      </div>
    </>
  );

  const baseClasses = "flex min-w-0 items-start gap-3 rounded-lg p-3 border border-transparent";

  return event.href ? (
    <Link
      href={event.href}
      className={cn(
        baseClasses,
        "-mx-2 transition-all hover:border-border hover:bg-secondary/60 hover:shadow-sm"
      )}
    >
      {inner}
    </Link>
  ) : (
    <div className={baseClasses}>{inner}</div>
  );
}

