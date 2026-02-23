"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { banUser, changeUserRole } from "@/actions/admin.actions";

export function UserAdminActions({
  userId,
  currentRole,
  isBanned,
}: {
  userId: string;
  currentRole: string;
  isBanned: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const handleBanToggle = () => {
    if (!confirm(isBanned ? "Unban this user?" : "Ban this user?")) return;
    startTransition(async () => {
      const res = await banUser(userId, !isBanned);
      if (res.success)
        toast.success(isBanned ? "User unbanned!" : "User banned!");
    });
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as "ADMIN" | "SELLER" | "CUSTOMER";
    if (!confirm(`Change role to ${newRole}?`)) return;
    startTransition(async () => {
      const res = await changeUserRole(userId, newRole);
      if (res.success) toast.success("Role updated!");
    });
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={currentRole}
        onChange={handleRoleChange}
        disabled={isPending}
        className="text-xs border rounded-lg px-2 py-1 bg-background"
      >
        <option value="CUSTOMER">Customer</option>
        <option value="SELLER">Seller</option>
        <option value="ADMIN">Admin</option>
      </select>
      <Button
        size="sm"
        variant="outline"
        onClick={handleBanToggle}
        disabled={isPending}
        className={`text-xs h-7 ${isBanned ? "text-green-600 border-green-200 hover:bg-green-50" : "text-red-600 border-red-200 hover:bg-red-50"}`}
      >
        {isBanned ? "Unban" : "Ban"}
      </Button>
    </div>
  );
}
