"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

/**
 * Pagination UI placeholder — wired to local state until the REST API
 * returns real page metadata.
 */
export function DataPagination({
  page,
  totalPages,
  total,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  total?: number;
  onPageChange: (page: number) => void;
}) {
  const t = useTranslations("pagination");
  return (
    <nav
      aria-label={t("label")}
      className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4"
    >
      <p className="text-sm text-muted-foreground">
        {t("page", { page, totalPages, total: total ?? 0 })}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          {t("previous")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          {t("next")}
        </Button>
      </div>
    </nav>
  );
}
