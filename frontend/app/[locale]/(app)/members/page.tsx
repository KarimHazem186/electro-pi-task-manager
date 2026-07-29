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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRemoveMember, useUsers } from "@/hooks/use-users";
import type { User } from "@/types";

export default function MembersPage() {
  const t = useTranslations("members");
  const tCommon = useTranslations("common");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [removing, setRemoving] = useState<User | null>(null);
  const query = useUsers({ page, pageSize: 8, search });
  const remove = useRemoveMember();

  return (
    <>
      <PageHeader
        title={t("title")}
        description={t("subtitle")}
        actions={
          <Button
            onClick={() => toast.info(t("inviteHint"))}
          >
            <UserPlus className="size-4" /> {t("invite")}
          </Button>
        }
      />

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
                      <Badge variant="outline" className="capitalize">
                        {t(`roles.${user.role}` as never)}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.projectsCount ?? 0}</TableCell>
                    <TableCell className="text-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setRemoving(user)}
                      >
                        {t("remove")}
                      </Button>
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
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setRemoving(user)}
                    className="shrink-0"
                  >
                    {t("remove")}
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="capitalize">
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
          toast.success(t("removeDialog.title"));
          setRemoving(null);
          query.refetch();
        }}
      />
    </>
  );
}
