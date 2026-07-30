"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { preferencesService } from "@/services/preferences.service";

export default function SettingsPage() {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const queryClient = useQueryClient();

  // Fetch preferences
  const { data: preferences, isLoading } = useQuery({
    queryKey: ["preferences"],
    queryFn: preferencesService.get,
  });

  // Local state for switches
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [weeklyEnabled, setWeeklyEnabled] = useState(false);
  const [deadlinesEnabled, setDeadlinesEnabled] = useState(false);

  // Update local state when preferences load
  useEffect(() => {
    if (preferences) {
      setEmailEnabled(preferences.notifications.email);
      setWeeklyEnabled(preferences.notifications.weekly);
      setDeadlinesEnabled(preferences.notifications.deadlines);
    }
  }, [preferences]);

  // Update preferences mutation
  const updateMutation = useMutation({
    mutationFn: preferencesService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["preferences"] });
      toast.success(t("saved"));
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Failed to update settings";
      toast.error(message);
    },
  });

  const handleToggle = (key: "email" | "weekly" | "deadlines", value: boolean) => {
    // Update local state immediately for better UX
    if (key === "email") setEmailEnabled(value);
    if (key === "weekly") setWeeklyEnabled(value);
    if (key === "deadlines") setDeadlinesEnabled(value);

    // Update backend
    updateMutation.mutate({
      notifications: {
        [key]: value,
      },
    });
  };

  const toggles = [
    { id: "email", key: "email" as const, checked: emailEnabled },
    { id: "weekly", key: "weekly" as const, checked: weeklyEnabled },
    { id: "deadlines", key: "deadlines" as const, checked: deadlinesEnabled },
  ];

  return (
    <>
      <PageHeader title={t("title")} description={t("subtitle")} />

      <Card className="max-w-2xl rounded-xl border-border shadow-soft">
        <CardHeader>
          <CardTitle className="text-base">{t("notifications")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  {i > 1 && <Separator className="my-3" />}
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <Skeleton className="mb-1 h-4 w-40" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                    <Skeleton className="h-6 w-11" />
                  </div>
                </div>
              ))}
            </>
          ) : (
            toggles.map((item, index) => (
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
                  <Switch
                    id={item.id}
                    checked={item.checked}
                    onCheckedChange={(checked) => handleToggle(item.key, checked)}
                    disabled={updateMutation.isPending}
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </>
  );
}
