import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

interface UserAvatarProps {
  user: Pick<User, "name" | "avatarUrl"> | null | undefined;
  className?: string;
}

export function UserAvatar({ user, className }: UserAvatarProps) {
  return (
    <Avatar className={cn("size-8 border border-border", className)}>
      {user?.avatarUrl ? (
        <AvatarImage src={user.avatarUrl} alt={user.name} />
      ) : null}
      <AvatarFallback className="bg-accent text-[11px] font-semibold text-accent-foreground">
        {user ? initials(user.name) : "?"}
      </AvatarFallback>
    </Avatar>
  );
}

export function AvatarGroup({
  users,
  max = 4,
}: {
  users: Array<Pick<User, "id" | "name" | "avatarUrl">>;
  max?: number;
}) {
  const shown = users.slice(0, max);
  const rest = users.length - shown.length;

  return (
    <div className="flex items-center -space-x-2">
      {shown.map((user) => (
        <UserAvatar
          key={user.id}
          user={user}
          className="size-7 ring-2 ring-card"
        />
      ))}
      {rest > 0 && (
        <span className="grid size-7 place-items-center rounded-full border border-border bg-muted text-[11px] font-semibold text-muted-foreground ring-2 ring-card">
          +{rest}
        </span>
      )}
    </div>
  );
}
