"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/shared/user-avatar";
import { useAllUsers } from "@/hooks/use-users";
import { useAddProjectMember } from "@/hooks/use-projects";
import { getErrorTranslationKey } from "@/lib/api/error-handler";
import type { ProjectMember, ProjectMemberRole } from "@/types";

interface AddProjectMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
  existingMembers: ProjectMember[];
}

const ROLE_VALUES: ProjectMemberRole[] = ["editor", "viewer"];

export function AddProjectMemberDialog({
  open,
  onOpenChange,
  projectId,
  projectName,
  existingMembers,
}: AddProjectMemberDialogProps) {
  const t = useTranslations("projects.members");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors.api");

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [role, setRole] = useState<ProjectMemberRole>("editor");

  const usersQuery = useAllUsers();
  const addMember = useAddProjectMember(projectId);

  const existingUserIds = useMemo(
    () => new Set(existingMembers.map((m) => m.userId)),
    [existingMembers],
  );

  const options: ComboboxOption[] = useMemo(() => {
    const users = usersQuery.data ?? [];
    return users
      .filter((user) => !existingUserIds.has(user.id))
      .map((user) => ({
        value: user.id,
        label: user.name,
        description: user.email,
        searchValue: `${user.name} ${user.email}`,
      }));
  }, [usersQuery.data, existingUserIds]);

  useEffect(() => {
    if (!open) {
      setSelectedUserId(null);
      setRole("editor");
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!selectedUserId) return;
    try {
      await addMember.mutateAsync({ userId: selectedUserId, role });
      toast.success(t("addSuccess", { name: projectName }));
      onOpenChange(false);
    } catch (error) {
      const errorKey = getErrorTranslationKey(error);
      const key = errorKey.replace("errors.api.", "");
      toast.error(tErrors(key as never));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="size-5" />
            {t("addTitle")}
          </DialogTitle>
          <DialogDescription>{t("addDescription", { name: projectName })}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("selectMember")}</label>
            {usersQuery.isLoading ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <Combobox
                value={selectedUserId}
                onValueChange={setSelectedUserId}
                options={options}
                placeholder={t("selectMemberPlaceholder")}
                searchPlaceholder={tCommon("search")}
                emptyText={t("allAlreadyAdded")}
              />
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t("projectRole")}</label>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as ProjectMemberRole)}
              disabled={addMember.isPending}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_VALUES.map((value) => (
                  <SelectItem key={value} value={value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{t(value)}</span>
                      <span className="text-xs text-muted-foreground">
                        {t(`roleDescriptions.${value}`)}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedUserId && (
            <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/40 p-3">
              {(() => {
                const user = (usersQuery.data ?? []).find((u) => u.id === selectedUserId);
                if (!user) return null;
                return (
                  <>
                    <UserAvatar user={user} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={addMember.isPending}
          >
            {tCommon("cancel")}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedUserId || addMember.isPending}
          >
            {addMember.isPending ? tCommon("loading") : t("submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
