"use client";

import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function ErrorState({
  title,
  description,
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  const t = useTranslations("errors");
  const tCommon = useTranslations("common");
  return (
    <Alert variant="destructive" className="rounded-xl">
      <AlertTriangle className="size-4" />
      <AlertTitle>{title ?? t("generic")}</AlertTitle>
      <AlertDescription className="flex flex-col items-start gap-3">
        <span>{description ?? t("generic")}</span>
        {onRetry && (
          <Button size="sm" variant="outline" onClick={onRetry}>
            {tCommon("tryAgain")}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
