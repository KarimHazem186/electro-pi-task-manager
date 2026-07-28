"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { PageHeader } from "@/components/shared/page-header";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { currentUser } from "@/data/mock";

export default function ProfilePage() {
  const t = useTranslations("profile");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("profile.errors");

  const profileSchema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(2, tErrors("nameMin")),
        email: z.string().trim().email(tErrors("emailInvalid")),
      }),
    [tErrors],
  );

  const passwordSchema = useMemo(
    () =>
      z
        .object({
          currentPassword: z.string().min(8, tErrors("currentPasswordMin")),
          newPassword: z.string().min(8, tErrors("newPasswordMin")),
          confirmPassword: z.string().min(8, tErrors("confirmPasswordMin")),
        })
        .refine((v) => v.newPassword === v.confirmPassword, {
          message: tErrors("passwordsMismatch"),
          path: ["confirmPassword"],
        }),
    [tErrors],
  );

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(profileSchema as any),
    defaultValues: { name: currentUser.name, email: currentUser.email },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(passwordSchema as any),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  return (
    <>
      <PageHeader title={t("title")} description={t("subtitle")} />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-xl border-border shadow-soft">
          <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
            <UserAvatar user={currentUser} className="size-16 text-base" />
            <div>
              <p className="font-semibold">{currentUser.name}</p>
              <p className="text-sm text-muted-foreground">{currentUser.email}</p>
            </div>
            <Badge variant="outline" className="capitalize">
              {currentUser.role}
            </Badge>
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <Card className="rounded-xl border-border shadow-soft">
            <CardHeader>
              <CardTitle className="text-base">{t("updateProfile")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form
                  className="space-y-4"
                  onSubmit={profileForm.handleSubmit(() =>
                    toast.success(t("updateProfile")),
                  )}
                >
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{tCommon("name")}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{tCommon("email")}</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">{t("saveChanges")}</Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-border shadow-soft">
            <CardHeader>
              <CardTitle className="text-base">{t("changePassword")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form
                  className="space-y-4"
                  onSubmit={passwordForm.handleSubmit(() => {
                    toast.success(t("changePassword"));
                    passwordForm.reset();
                  })}
                >
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("currentPassword")}</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder={t("currentPasswordPlaceholder")}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("newPassword")}</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("confirmNewPassword")}</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit">{t("updatePassword")}</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
