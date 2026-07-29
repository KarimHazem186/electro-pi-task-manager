"use client";

import { useTranslations } from "next-intl";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SearchPopover } from "@/components/shared/search-popover";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { NotificationsPopover } from "@/components/notifications/notifications-popover";
import { ProfileMenu } from "@/components/layout/profile-menu";
import { useApp } from "@/lib/app-context";

export function Topbar() {
  const tCommon = useTranslations("common");
  const { currentUser } = useApp();

  return (
    <TooltipProvider delayDuration={150} skipDelayDuration={300}>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-card/95 px-3 backdrop-blur-none sm:px-5">
        <SidebarTrigger
          className="shrink-0"
          aria-label={tCommon("toggleSidebar")}
        />
        <Separator orientation="vertical" className="hidden h-5 sm:block" />

        <SearchPopover />

        <div className="ms-auto flex shrink-0 items-center gap-1">
          <LanguageSwitcher />
          <NotificationsPopover />
          {currentUser && <ProfileMenu />}
        </div>
      </header>
    </TooltipProvider>
  );
}
