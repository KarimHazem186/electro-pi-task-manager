"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { AuthLayout } from "@/components/auth/auth-layout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Link, useRouter } from "@/i18n/routing";
import { useApp } from "@/lib/app-context";
import { getErrorTranslationKey } from "@/lib/api/error-handler";

export default function LoginPage() {
  const t = useTranslations("auth.login");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors.api");
  const { login, currentUser, ready } = useApp();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const schema = useMemo(
    () =>
      z.object({
        email: z
          .string()
          .trim()
          .min(1, t("errors.emailRequired"))
          .email(t("errors.emailInvalid")),
        password: z.string().min(6, t("errors.passwordMin")),
      }),
    [t],
  );

  type LoginValues = z.infer<typeof schema>;

  const form = useForm<LoginValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (ready && currentUser) router.replace("/");
  }, [ready, currentUser, router]);

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    try {
      const user = await login(values.email, values.password);
      toast.success(t("success", { name: user.name.split(" ")[0] }));
      router.replace("/");
    } catch (err) {
      // Get translated error message
      const errorKey = getErrorTranslationKey(err);
      const key = errorKey.replace("errors.api.", "");
      setError(tErrors(key));
    }
  });

  return (
    <AuthLayout
      title={t("title")}
      subtitle={t("subtitle")}
      footer={
        <>
          {t("footer")}{" "}
          <Link
            href="/register"
            className="font-semibold text-primary hover:underline underline-offset-4 transition-all hover:text-primary/80"
          >
            {t("createOne")}
          </Link>
        </>
      }
    >
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          {error ? (
            <Alert variant="destructive" className="animate-in fade-in-50 slide-in-from-top-2">
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          ) : null}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">{tCommon("email")}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder={t("emailPlaceholder")}
                    className="h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">{tCommon("password")}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="current-password"
                    placeholder={t("passwordPlaceholder")}
                    className="h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>{t("submit")}</span>
              </>
            ) : (
              t("submit")
            )}
          </Button>
        </form>
      </Form>

      {/* Demo accounts info */}
      <div className="mt-6 rounded-xl border border-border/50 bg-muted/30 backdrop-blur-sm p-4">
        <div className="flex items-start gap-2 mb-2">
          <div className="rounded-full bg-primary/10 p-1.5">
            <svg className="h-3.5 w-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-foreground mb-2">Demo Accounts</p>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Admin</span>
                <span className="font-mono">admin@taskly.dev / admin123</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-md bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">Member</span>
                <span className="font-mono">member@taskly.dev / member123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
