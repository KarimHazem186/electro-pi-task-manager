"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  brand,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
  brand?: string;
}) {
  const tAuth = useTranslations("auth.layout");
  const resolvedBrand = brand ?? tAuth("brand");
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            N
          </span>
          <span className="text-sm font-semibold tracking-tight">{resolvedBrand}</span>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-soft sm:p-8">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">{subtitle}</p>
          {children}
        </div>
        <p className="mt-5 text-center text-sm text-muted-foreground">{footer}</p>
      </div>
    </div>
  );
}
