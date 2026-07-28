import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  isLoading,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  hint?: string;
  isLoading?: boolean;
}) {
  return (
    <Card className="gap-0 rounded-xl border-border bg-card p-5 shadow-soft transition-shadow duration-200 hover:shadow-lifted">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className="grid size-8 place-items-center rounded-lg bg-accent text-accent-foreground">
          <Icon className="size-4" aria-hidden />
        </span>
      </div>
      {isLoading ? (
        <Skeleton className="mt-3 h-8 w-16" />
      ) : (
        <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
      )}
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </Card>
  );
}
