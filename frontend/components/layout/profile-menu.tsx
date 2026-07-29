"use client";

import { useTransition } from "react";
import {
  Bell,
  LogOut,
  Settings,
  User as UserIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Link } from "@/i18n/routing";
import { useApp } from "@/lib/app-context";
import { useRouter } from "@/i18n/routing";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ProfileMenu() {
  const t = useTranslations("topbar");
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const { currentUser, setUser, logout } = useApp();
  const router = useRouter();
  const qc = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (!currentUser) {
    return null;
  }

  const handleLogout = () => {
    startTransition(async () => {
      try {
        await logout();
      } catch {
        // ignore - we still want to clear local state
      }
      setUser(null);
      qc.clear();
      toast.success(t("logoutSuccess"));
      router.replace("/login");
    });
  };

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <Tooltip open={dropdownOpen ? false : undefined}>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={t("profile")}
              className="group grid size-10 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-ring data-[state=open]:bg-accent data-[state=open]:text-foreground"
            >
              <UserAvatar user={currentUser} className="size-7 border-0" />
            </button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">{t("profile")}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="flex items-center gap-3 py-3">
          <UserAvatar user={currentUser} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{currentUser.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {currentUser.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer">
            <UserIcon className="size-4" />
            {tNav("profile")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="cursor-pointer">
            <Settings className="size-4" />
            {tNav("settings")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profile#notifications" className="cursor-pointer">
            <Bell className="size-4" />
            {t("notifications")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isPending}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="size-4" />
          {isPending ? tCommon("loading") : tNav("logOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
