"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useSocket } from "@/lib/socket";
import { useApp } from "@/lib/app-context";
import type { Task } from "@/types";

/**
 * Socket Notifications Component
 * Listens to WebSocket events and shows real-time notifications
 * Automatically updates React Query cache for seamless UI updates
 */
export function SocketNotifications() {
  const socket = useSocket();
  const queryClient = useQueryClient();
  const { currentUser } = useApp();
  const t = useTranslations("notifications");

  useEffect(() => {
    if (!socket || !currentUser) return;

    // Task Created Event
    const handleTaskCreated = (task: Task) => {
      console.log("📥 Task created:", task);
      
      // Show notification if not created by current user
      if (task.creatorId !== currentUser.id) {
        toast.success(t("taskCreated", { title: task.title }), {
          description: t("taskCreatedDesc"),
          duration: 4000,
        });
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    };

    // Task Updated Event
    const handleTaskUpdated = (task: Task) => {
      console.log("🔄 Task updated:", task);
      
      // Show notification if assigned to current user
      if (task.assigneeId === currentUser.id) {
        toast.info(t("taskUpdated", { title: task.title }), {
          description: t("taskUpdatedDesc"),
          duration: 3000,
        });
      }

      // Update cache
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    };

    // Task Deleted Event
    const handleTaskDeleted = (data: { id: string }) => {
      console.log("🗑️ Task deleted:", data.id);
      
      toast.error(t("taskDeleted"), {
        description: t("taskDeletedDesc"),
        duration: 3000,
      });

      // Update cache
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    };

    // Task Status Changed Event
    const handleTaskStatusChanged = (task: Task) => {
      console.log("✅ Task status changed:", task);
      
      // Show different notification based on status
      if (task.status === "done") {
        toast.success(t("taskCompleted", { title: task.title }), {
          description: t("taskCompletedDesc"),
          duration: 4000,
        });
      } else if (task.assigneeId === currentUser.id) {
        toast.info(t("taskStatusChanged", { title: task.title, status: task.status }), {
          description: t("taskStatusChangedDesc"),
          duration: 3000,
        });
      }

      // Update cache
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    };

    // Register event listeners
    socket.on("task:created", handleTaskCreated);
    socket.on("task:updated", handleTaskUpdated);
    socket.on("task:deleted", handleTaskDeleted);
    socket.on("task:status-changed", handleTaskStatusChanged);

    // Socket connection status
    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error.message);
    });

    // Cleanup
    return () => {
      socket.off("task:created", handleTaskCreated);
      socket.off("task:updated", handleTaskUpdated);
      socket.off("task:deleted", handleTaskDeleted);
      socket.off("task:status-changed", handleTaskStatusChanged);
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, currentUser?.id, queryClient]);
  // Note: 't' is excluded to prevent infinite loop since it's recreated on each render
  // Note: Using currentUser?.id instead of currentUser to avoid re-running on user object changes

  return null; // This is a logic-only component
}
