"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

type SessionStatus = "active" | "refreshing" | "expired";

/**
 * Visual indicator showing session status
 * Useful for development/testing to see token refresh in action
 */
export function SessionIndicator({ showInProduction = false }: { showInProduction?: boolean }) {
  const [status, setStatus] = useState<SessionStatus>("active");
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [timeUntilRefresh, setTimeUntilRefresh] = useState<number>(12 * 60); // 12 minutes in seconds

  // Hide in production unless explicitly enabled
  if (process.env.NODE_ENV === "production" && !showInProduction) {
    return null;
  }

  useEffect(() => {
    // Listen for token refresh events
    const handleRefreshStart = () => {
      setStatus("refreshing");
    };

    const handleRefreshSuccess = () => {
      setStatus("active");
      setLastRefresh(new Date());
      setTimeUntilRefresh(12 * 60);
    };

    const handleRefreshFailed = () => {
      setStatus("expired");
    };

    // Add event listeners (if you implement custom events)
    window.addEventListener("token-refresh-start" as any, handleRefreshStart);
    window.addEventListener("token-refresh-success" as any, handleRefreshSuccess);
    window.addEventListener("token-refresh-failed" as any, handleRefreshFailed);

    // Countdown timer
    const timer = setInterval(() => {
      setTimeUntilRefresh((prev) => {
        if (prev <= 0) return 12 * 60;
        return prev - 1;
      });
    }, 1000);

    return () => {
      window.removeEventListener("token-refresh-start" as any, handleRefreshStart);
      window.removeEventListener("token-refresh-success" as any, handleRefreshSuccess);
      window.removeEventListener("token-refresh-failed" as any, handleRefreshFailed);
      clearInterval(timer);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const statusConfig = {
    active: {
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      label: "Active",
    },
    refreshing: {
      icon: Clock,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      label: "Refreshing",
    },
    expired: {
      icon: XCircle,
      color: "text-red-500",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      label: "Expired",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 rounded-lg border ${config.borderColor} ${config.bgColor} p-3 shadow-lg`}
    >
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${config.color}`} />
        <div className="text-sm">
          <div className="font-medium text-gray-900">{config.label} Session</div>
          {status === "active" && (
            <div className="text-xs text-gray-600">
              Refresh in: {formatTime(timeUntilRefresh)}
            </div>
          )}
          {status === "refreshing" && (
            <div className="text-xs text-gray-600 animate-pulse">
              Updating token...
            </div>
          )}
          {status === "expired" && (
            <div className="text-xs text-gray-600">
              Please login again
            </div>
          )}
        </div>
      </div>
      
      {status === "active" && (
        <div className="mt-2">
          <div className="h-1 w-full rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-1000"
              style={{
                width: `${(timeUntilRefresh / (12 * 60)) * 100}%`,
              }}
            />
          </div>
        </div>
      )}
      
      <div className="mt-2 text-xs text-gray-500">
        Last refresh: {lastRefresh.toLocaleTimeString()}
      </div>
    </div>
  );
}
