"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function SearchInput({
  value,
  onChange,
  placeholder,
  className,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}) {
  const t = useTranslations("search");
  const tCommon = useTranslations("common");
  const resolvedPlaceholder = placeholder ?? t("placeholder");
  const resolvedLabel = label ?? tCommon("search");
  return (
    <div className={cn("relative w-full sm:max-w-xs", className)}>
      <Search
        className="pointer-events-none absolute top-1/2 start-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="search"
        aria-label={resolvedLabel}
        value={value}
        placeholder={resolvedPlaceholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 rounded-xl ps-9"
      />
    </div>
  );
}
