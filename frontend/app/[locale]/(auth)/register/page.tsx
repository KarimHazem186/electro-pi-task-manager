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

export default function RegisterPage() {
  const t = useTranslations("auth.register");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors.api");
  const { register, currentUser, ready } = useApp();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const schema = useMemo(
    () =>
      z
        .object({
          name: z.string().trim().min(2, t("errors.nameMin")),
          email: z
            .string()
            .trim()
            .min(1, t("errors.emailRequired"))
            .email(t("errors.emailInvalid")),
          password: z.string().min(6, t("errors.passwordMin")),
          confirmPassword: z.string(),
        })
        .refine((v) => v.password === v.confirmPassword, {
          message: t("errors.passwordsMismatch"),
          path: ["confirmPassword"],
        }),
    [t],
  );

  type RegisterValues = z.infer<typeof schema>;

  const form = useForm<RegisterValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (ready && currentUser) router.replace("/");
  }, [ready, currentUser, router]);

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    try {
      await register(values.name, values.email, values.password);
      toast.success(t("success"));
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
            href="/login"
            className="font-semibold text-primary hover:underline underline-offset-4 transition-all hover:text-primary/80"
          >
            {t("logIn")}
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">{t("fullName")}</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="name"
                    placeholder={t("fullNamePlaceholder")}
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

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">{tCommon("password")}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      placeholder={t("passwordPlaceholder")}
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
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">{t("confirm")}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      placeholder={t("passwordPlaceholder")}
                      className="h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>

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

      {/* Security notice */}
      <div className="mt-6 rounded-xl border border-border/50 bg-gradient-to-br from-green-50/50 to-emerald-50/30 dark:from-green-950/20 dark:to-emerald-950/10 backdrop-blur-sm p-4">
        <div className="flex items-start gap-2">
          <div className="rounded-full bg-green-500/10 p-1.5">
            <svg className="h-3.5 w-3.5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-green-900 dark:text-green-100">Secure Registration</p>
            <p className="mt-0.5 text-xs text-green-700/80 dark:text-green-300/70 leading-relaxed">
              Your data is encrypted and protected. We never share your information.
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
