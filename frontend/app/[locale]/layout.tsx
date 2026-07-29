import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { Inter, Cairo } from "next/font/google";

import { Providers } from "@/app/providers";
import { localeDirs, routing } from "@/i18n/routing";
import { DebugInfo } from "@/components/debug-info";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-cairo",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  return {
    title: isAr ? "مدير المهام" : "Task Manager",
    description: isAr
      ? "تتبع المشاريع والمهام المسندة والمواعيد النهائية ونشاط الفريق في نظرة واحدة على مساحة العمل."
      : "Track projects, assigned tasks, deadlines and team activity in one workspace overview.",
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const dir = localeDirs[locale as keyof typeof localeDirs] ?? "ltr";

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning className={`${inter.variable} ${cairo.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
        {/* <DebugInfo /> */}
      </body>
    </html>
  );
}
