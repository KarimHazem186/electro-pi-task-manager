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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 px-4 py-10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-400/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/4 h-[600px] w-[600px] rounded-full bg-gradient-to-tl from-purple-400/20 to-pink-400/20 blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="relative">
            <span className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 ring-2 ring-primary/20">
              N
            </span>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-primary/80 blur-md opacity-50" />
          </div>
          <span className="text-lg font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            {resolvedBrand}
          </span>
        </div>

        {/* Auth Card */}
        <div className="group relative">
          {/* Glow effect */}
          <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-100" />
          
          {/* Main card */}
          <div className="relative rounded-2xl border border-border/50 bg-card/95 backdrop-blur-xl p-8 shadow-2xl shadow-black/5 sm:p-10">
            <div className="mb-8">
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                {title}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground/80 leading-relaxed">
                {subtitle}
              </p>
            </div>
            
            {/* Divider */}
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50" />
              </div>
            </div>

            {children}
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-muted-foreground/80 backdrop-blur-sm">
          {footer}
        </p>
      </div>
    </div>
  );
}
