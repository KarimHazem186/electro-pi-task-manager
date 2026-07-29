"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { DataPagination } from "@/components/shared/data-pagination";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { UserAvatar } from "@/components/shared/user-avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { InviteMemberDialog } from "@/components/shared/invite-member-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useInviteMember, useRemoveMember, useUsers } from "@/hooks/use-users";
import { getRoleBadgeVariant } from "@/lib/role-utils";
import { useApp } from "@/lib/app-context";
import { MoreVertical, Trash2, Mail } from "lucide-react";
import type { User } from "@/types";

export default function MembersPage() {
  const t = useTranslations("members");
  const tCommon = useTranslations("common");

  const { currentUser } = useApp();
  const canInvite = currentUser?.role === "admin" || currentUser?.role === "manager";
  const canRemove = currentUser?.role === "admin";

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [removing, setRemoving] = useState<User | null>(null);
  const [inviting, setInviting] = useState(false);
  const query = useUsers({ page, pageSize: 8, search });
  const remove = useRemoveMember();
  const invite = useInviteMember();

  const handleInvite = async (data: { email: string; role: User["role"] }) => {
    try {
      await invite.mutateAsync(data);
      toast.success(t("inviteDialog.success", { email: data.email }));
      setInviting(false);
      query.refetch();
    } catch (error) {
      toast.error(t("inviteDialog.error"));
    }
  };

  const stats = {
    total: query.data?.total ?? 0,
    admins: query.data?.data.filter((u) => u.role === "admin").length ?? 0,
    managers: query.data?.data.filter((u) => u.role === "manager").length ?? 0,
    members: query.data?.data.filter((u) => u.role === "member").length ?? 0,
  };

  return (
    <>
      <PageHeader
        title={t("title")}
        description={t("subtitle")}
        actions={
          canInvite ? (
            <Button onClick={() => setInviting(true)}>
              <UserPlus className="size-4" /> {t("invite")}
            </Button>
          ) : undefined
        }
      />

      {/* Statistics Cards */}
      {!query.isLoading && query.data && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card p-4 shadow-soft">
            <div className="text-sm font-medium text-muted-foreground">
              {t("stats.total")}
            </div>
            <div className="mt-1 text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-soft">
            <div className="text-sm font-medium text-muted-foreground">
              {t("rolesPlural.admins")}
            </div>
            <div className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">
              {stats.admins}
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-soft">
            <div className="text-sm font-medium text-muted-foreground">
              {t("rolesPlural.managers")}
            </div>
            <div className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.managers}
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-soft">
            <div className="text-sm font-medium text-muted-foreground">
              {t("rolesPlural.members")}
            </div>
            <div className="mt-1 text-2xl font-bold text-gray-600 dark:text-gray-400">
              {stats.members}
            </div>
          </div>
        </div>
      )}

      <div className="mb-5">
        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder={t("searchPlaceholder")}
        />
      </div>

      {query.isLoading ? (
        <Skeleton className="h-72 rounded-xl" />
      ) : query.data?.data.length ? (
        <>
          {/* Desktop Table View */}
          <div className="hidden overflow-x-auto rounded-xl border border-border bg-card shadow-soft md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("table.name")}</TableHead>
                  <TableHead>{t("table.email")}</TableHead>
                  <TableHead>{t("table.role")}</TableHead>
                  <TableHead>{t("table.projects")}</TableHead>
                  <TableHead className="w-24 text-end">
                    {tCommon("actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.data.data.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex min-w-0 items-center gap-3">
                        <UserAvatar user={user} />
                        <span className="truncate font-medium">
                          {user.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)} className="capitalize">
                        {t(`roles.${user.role}` as never)}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.projectsCount ?? 0}</TableCell>
                    <TableCell className="text-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">{tCommon("actionsFor", { name: user.name })}</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>{tCommon("actions")}</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => {
                              navigator.clipboard.writeText(user.email);
                              toast.success(t("emailCopied"));
                            }}
                          >
                            <Mail className="mr-2 h-4 w-4" />
                            {t("copyEmail")}
                          </DropdownMenuItem>
                          {canRemove && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setRemoving(user)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {t("remove")}
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards View */}
          <div className="flex flex-col gap-3 md:hidden">
            {query.data.data.map((user) => (
              <div
                key={user.id}
                className="rounded-xl border border-border bg-card p-4 shadow-soft"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <UserAvatar user={user} className="size-10" />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{user.name}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  {canRemove && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setRemoving(user)}
                      className="shrink-0 text-destructive"
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      {t("remove")}
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={getRoleBadgeVariant(user.role)} className="capitalize">
                    {t(`roles.${user.role}` as never)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {user.projectsCount ?? 0} {t("table.projects").toLowerCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <DataPagination
              page={query.data.page}
              totalPages={query.data.totalPages}
              total={query.data.total}
              onPageChange={setPage}
            />
          </div>
        </>
      ) : (
        <EmptyState title={t("noMembers")} />
      )}

      <ConfirmDialog
        open={!!removing}
        onOpenChange={(o) => !o && setRemoving(null)}
        title={t("removeDialog.title")}
        description={t("removeDialog.description", { name: removing?.name ?? "" })}
        confirmLabel={tCommon("delete")}
        cancelLabel={tCommon("cancel")}
        destructive
        loading={remove.isPending}
        onConfirm={async () => {
          if (!removing) return;
          await remove.mutateAsync(removing.id);
          toast.success(t("removeDialog.success"));
          setRemoving(null);
          query.refetch();
        }}
      />

      <InviteMemberDialog
        open={inviting}
        onOpenChange={setInviting}
        onInvite={handleInvite}
        loading={invite.isPending}
      />
    </>
  );
}
