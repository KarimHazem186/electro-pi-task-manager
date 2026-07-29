"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { z } from "zod";
import { getErrorTranslationKey } from "@/lib/api/error-handler";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCreateProject, useUpdateProject } from "@/hooks/use-projects";
import { slugify } from "@/lib/format";
import type { Project } from "@/types";

export function ProjectFormDialog({
  open,
  onOpenChange,
  project,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
  onSuccess?: () => void;
}) {
  const tForm = useTranslations("projects.form");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("projects.form.errors");
  const tApiErrors = useTranslations("errors.api");

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(3, tErrors("nameMin")),
        slug: z
          .string()
          .trim()
          .min(3, tErrors("slugMin"))
          .regex(/^[a-z0-9-]+$/, tErrors("slugPattern")),
        description: z.string().trim().min(10, tErrors("descriptionMin")),
      }),
    [tErrors],
  );

  const form = useForm<z.infer<typeof schema>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any),
    defaultValues: { name: "", slug: "", description: "" },
  });

  const create = useCreateProject();
  const update = useUpdateProject(project?.id ?? "");
  const pending = create.isPending || update.isPending;

  useEffect(() => {
    if (open) {
      form.reset({
        name: project?.name ?? "",
        slug: project?.slug ?? "",
        description: project?.description ?? "",
      });
    }
  }, [open, project, form]);

  // Auto-generate slug from name until the user edits the slug manually.
  const nameValue = form.watch("name");
  const slugValue = form.watch("slug");
  useEffect(() => {
    if (!open) return;
    if (project) return; // don't override the existing slug while editing
    const expected = slugify(nameValue ?? "");
    if (expected && expected !== slugValue) {
      form.setValue("slug", expected, { shouldValidate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameValue, open, project]);

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      if (project) {
        await update.mutateAsync({
          name: values.name,
          description: values.description,
        });
        toast.success(tForm("submitUpdate"));
      } else {
        await create.mutateAsync({
          name: values.name,
          description: values.description,
        });
        toast.success(tForm("submitCreate"));
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      const errorKey = getErrorTranslationKey(err);
      const key = errorKey.replace("errors.api.", "");
      toast.error(tApiErrors(key));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {project ? tForm("edit") : tForm("create")}
          </DialogTitle>
          <DialogDescription>
            {project ? tForm("edit") : tForm("create")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tForm("nameLabel")}</FormLabel>
                  <FormControl>
                    <Input placeholder={tForm("namePlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tForm("slugLabel")}</FormLabel>
                  <FormControl>
                    <Input placeholder={tForm("slugPlaceholder")} {...field} />
                  </FormControl>
                  <FormDescription>{tForm("slugHint")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tForm("descriptionLabel")}</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder={tForm("descriptionPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {tCommon("cancel")}
              </Button>
              <Button type="submit" disabled={pending}>
                {pending
                  ? tCommon("loading")
                  : project
                    ? tForm("submitUpdate")
                    : tForm("submitCreate")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
