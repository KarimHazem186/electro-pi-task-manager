"use client";

import {
  CheckSquare,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  UserRound,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { UserAvatar } from "@/components/shared/user-avatar";
import { currentUser } from "@/data/mock";
import { Link, usePathname, useRouter } from "@/i18n/routing";

export function AppSidebar() {
  const t = useTranslations("nav");
  const tAuth = useTranslations("auth.layout");
  const locale = useLocale();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = usePathname();
  const router = useRouter();

  const mainNav = [
    { title: t("dashboard"), url: "/", icon: LayoutDashboard },
    { title: t("projects"), url: "/projects", icon: FolderKanban },
    { title: t("myTasks"), url: "/tasks", icon: CheckSquare },
    { title: t("members"), url: "/members", icon: Users },
  ] as const;

  const accountNav = [
    { title: t("profile"), url: "/profile", icon: UserRound },
    { title: t("settings"), url: "/settings", icon: Settings },
  ] as const;

  const isActive = (url: string) =>
    url === "/" ? pathname === "/" : pathname.startsWith(url);

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="border-b border-border px-3 py-4">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            N
          </span>
          {!collapsed && (
            <span className="truncate text-sm font-semibold tracking-tight">
              {tAuth("brand")}
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-1 py-2">
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>{t("workspace")}</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <Link href={item.url} className="flex items-center gap-2.5">
                      <item.icon className="size-4 shrink-0" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>{t("account")}</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {accountNav.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <Link href={item.url} className="flex items-center gap-2.5">
                      <item.icon className="size-4 shrink-0" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip={currentUser.name}
              className="h-auto py-2"
            >
              <Link
                href="/profile"
                locale={locale}
                className="flex min-w-0 items-center gap-2.5"
              >
                <UserAvatar user={currentUser} className="size-7 shrink-0" />
                {!collapsed && (
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium">
                      {currentUser.name}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {currentUser.email}
                    </span>
                  </span>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={t("logOut")}>
              <Link
                href="/login"
                locale={locale}
                className="flex items-center gap-2.5"
                onClick={() => router.push("/login", { locale })}
              >
                <LogOut className="size-4 shrink-0" />
                <span>{t("logOut")}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
