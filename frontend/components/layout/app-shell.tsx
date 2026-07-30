"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter } from "@/i18n/routing";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Topbar } from "@/components/layout/topbar";
import { SocketNotifications } from "@/components/shared/socket-notifications";
import { useApp } from "@/lib/app-context";

export function AppShell({ children }: { children: ReactNode }) {
  const { currentUser, ready } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (ready && !currentUser) {
      router.replace("/login");
    }
  }, [ready, currentUser, router]);

  // Don't render anything until we know the auth state
  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Redirect happening, show nothing
  if (!currentUser) {
    return null;
  }

  return (
    <SidebarProvider>
      <SocketNotifications />
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
