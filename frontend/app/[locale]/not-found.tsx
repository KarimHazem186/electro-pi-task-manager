import { useTranslations } from "next-intl";

import { Link } from "@/i18n/routing";

export default function LocaleNotFound() {
  const t = useTranslations("errors.notFound");
  const tCommon = useTranslations("common");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">{t("code")}</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          {t("title")}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("description")}</p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {tCommon("goHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
