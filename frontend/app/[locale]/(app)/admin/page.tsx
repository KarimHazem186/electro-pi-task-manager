"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { ShieldCheck, Users, FolderKanban, Activity } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/lib/app-context";
import { isAdmin } from "@/lib/permissions";
import { useRouter } from "@/i18n/routing";

export default function AdminPage() {
  const t = useTranslations("admin");
  const tNav = useTranslations("nav");
  const { currentUser, ready } = useApp();
  const router = useRouter();

  // Redirect non-admins
  useEffect(() => {
    if (ready && !isAdmin(currentUser)) {
      router.push("/");
    }
  }, [currentUser, ready, router]);

  // Don't render anything for non-admins
  if (!ready || !isAdmin(currentUser)) {
    return null;
  }

  return (
    <>
      <PageHeader
        title={tNav("admin")}
        description={t("description")}
        icon={<ShieldCheck className="size-6" />}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-xl border-border shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t("cards.users.title")}
            </CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {t("cards.users.description")}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t("cards.projects.title")}
            </CardTitle>
            <FolderKanban className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {t("cards.projects.description")}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t("cards.activity.title")}
            </CardTitle>
            <Activity className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {t("cards.activity.description")}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 rounded-xl border-border shadow-soft">
        <CardHeader>
          <CardTitle>{t("coming_soon.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t("coming_soon.description")}
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="text-muted-foreground">•</span>
              {t("coming_soon.features.user_management")}
            </li>
            <li className="flex items-center gap-2">
              <span className="text-muted-foreground">•</span>
              {t("coming_soon.features.role_management")}
            </li>
            <li className="flex items-center gap-2">
              <span className="text-muted-foreground">•</span>
              {t("coming_soon.features.audit_logs")}
            </li>
            <li className="flex items-center gap-2">
              <span className="text-muted-foreground">•</span>
              {t("coming_soon.features.workspace_settings")}
            </li>
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
