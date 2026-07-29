import { Bell, Search } from "lucide-react";
import { useTranslations } from "next-intl";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { UserAvatar } from "@/components/shared/user-avatar";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { useApp } from "@/lib/app-context";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Topbar() {
  const t = useTranslations("topbar");
  const tCommon = useTranslations("common");
  const { currentUser } = useApp();
  
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-card/95 px-3 backdrop-blur-none sm:px-5">
      <SidebarTrigger
        className="shrink-0"
        aria-label={tCommon("toggleSidebar")}
      />
      <Separator orientation="vertical" className="hidden h-5 sm:block" />

      <div className="relative min-w-0 flex-1 sm:max-w-sm">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground rtl:left-auto rtl:right-3"
          aria-hidden
        />
        <Input
          type="search"
          placeholder={t("search")}
          aria-label={t("search")}
          className="h-9 rounded-xl ps-9"
        />
      </div>

      <div className="ms-auto flex shrink-0 items-center gap-2">
        <LanguageSwitcher />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl"
              aria-label={t("notifications")}
            >
              <Bell className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t("notifications")}</TooltipContent>
        </Tooltip>
        {currentUser && <UserAvatar user={currentUser} className="size-8" />}
      </div>
    </header>
  );
}
