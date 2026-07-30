"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { PageHeader } from "@/components/shared/page-header";
import { AvatarUpload } from "@/components/shared/avatar-upload";
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
import { useProfilePictureUpload } from "@/hooks/use-upload";
import { useApp } from "@/lib/app-context";
import { authService } from "@/services/auth.service";

export default function ProfilePage() {
  const t = useTranslations("profile");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("profile.errors");
  const tUpload = useTranslations("upload.avatar");

  const { currentUser, setUser } = useApp();
  const queryClient = useQueryClient();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Pass setUser to the upload hook so it can update the context
  const { upload: uploadAvatar, deleteAvatar: removeAvatar, isUploading, isDeleting } = useProfilePictureUpload();
  
  // Wrapper to update context after avatar upload
  const upload = async (file: File) => {
    await uploadAvatar(file);
    // Refresh user data
    try {
      const updatedUser = await authService.me();
      setUser(updatedUser);
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const deleteAvatar = async () => {
    removeAvatar();
    // Refresh user data after a short delay to let backend process
    setTimeout(async () => {
      try {
        const updatedUser = await authService.me();
        setUser(updatedUser);
      } catch (error) {
        console.error('Failed to refresh user:', error);
      }
    }, 500);
  };

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
    defaultValues: { 
      name: currentUser?.name || "", 
      email: currentUser?.email || "" 
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(passwordSchema as any),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  // Handle profile update
  const handleProfileUpdate = async (data: z.infer<typeof profileSchema>) => {
    try {
      setIsUpdatingProfile(true);
      const updatedUser = await authService.updateProfile(data);
      setUser(updatedUser);
      toast.success(t("profileUpdated"));
    } catch (error: any) {
      const message = error?.response?.data?.message || "Failed to update profile";
      toast.error(message);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (data: z.infer<typeof passwordSchema>) => {
    try {
      setIsChangingPassword(true);
      await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      toast.success(t("passwordChanged"));
      passwordForm.reset();
    } catch (error: any) {
      const message = error?.response?.data?.message || "Failed to change password";
      toast.error(message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <>
      <PageHeader title={t("title")} description={t("subtitle")} />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-xl border-border shadow-soft">
          <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
            <AvatarUpload
              value={currentUser?.avatarUrl || undefined}
              name={currentUser?.name || ""}
              onFileSelect={upload}
              onDelete={deleteAvatar}
              isUploading={isUploading}
              isDeleting={isDeleting}
              size="xl"
            />
            <div>
              <p className="font-semibold">{currentUser?.name}</p>
              <p className="text-sm text-muted-foreground">{currentUser?.email}</p>
            </div>
            <Badge variant="outline" className="capitalize">
              {currentUser?.role}
            </Badge>
            <p className="text-xs text-muted-foreground">{tUpload("title")}</p>
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
                  onSubmit={profileForm.handleSubmit(handleProfileUpdate)}
                >
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{tCommon("name")}</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isUpdatingProfile} />
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
                          <Input type="email" {...field} disabled={isUpdatingProfile} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isUpdatingProfile}>
                    {isUpdatingProfile ? tCommon("saving") : t("saveChanges")}
                  </Button>
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
                  onSubmit={passwordForm.handleSubmit(handlePasswordChange)}
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
                            disabled={isChangingPassword}
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
                            <Input type="password" {...field} disabled={isChangingPassword} />
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
                            <Input type="password" {...field} disabled={isChangingPassword} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" disabled={isChangingPassword}>
                    {isChangingPassword ? tCommon("saving") : t("updatePassword")}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
