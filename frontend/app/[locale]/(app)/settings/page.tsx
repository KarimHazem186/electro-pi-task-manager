"use client";

import { useTranslations } from "next-intl";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  const t = useTranslations("settings");

  const toggles = [
    { id: "email", key: "email" as const, defaultChecked: true },
    { id: "weekly", key: "weekly" as const, defaultChecked: false },
    { id: "deadlines", key: "deadlines" as const, defaultChecked: false },
  ];

  return (
    <>
      <PageHeader title={t("title")} description={t("subtitle")} />

      <Card className="max-w-2xl rounded-xl border-border shadow-soft">
        <CardHeader>
          <CardTitle className="text-base">{t("notifications")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {toggles.map((item, index) => (
            <div key={item.id}>
              {index > 0 && <Separator className="my-3" />}
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <Label htmlFor={item.id} className="text-sm font-medium">
                    {t(`toggles.${item.key}.label`)}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {t(`toggles.${item.key}.hint`)}
                  </p>
                </div>
                <Switch id={item.id} defaultChecked={item.defaultChecked} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
