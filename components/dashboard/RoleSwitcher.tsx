"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ROLE_LABELS } from "@/lib/navigation";
import type { Role } from "@/types";

const ROLES: Role[] = ["volunteer", "organization", "admin", "partner"];

const roleColors: Record<Role, string> = {
  volunteer: "border-emerald-500/50 bg-emerald-950/40 text-emerald-300",
  organization: "border-blue-500/50 bg-blue-950/40 text-blue-300",
  admin: "border-amber-500/50 bg-amber-950/40 text-amber-300",
  partner: "border-pink-500/50 bg-pink-950/40 text-pink-300",
};

export function RoleSwitcher() {
  const { user, switchRole } = useAuth();
  const router = useRouter();

  if (!user) return null;

  return (
    <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/60 p-1 backdrop-blur">
      <span className="hidden px-2 text-xs text-zinc-500 lg:inline">DEV</span>
      {ROLES.map((role) => (
        <button
          key={role}
          type="button"
          onClick={() => {
            switchRole(role);
            router.push('/dashboard');
          }}
          className={`rounded-md border px-2 py-1 text-xs font-medium transition-all ${
            user.role === role
              ? roleColors[role]
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
          title={`Переключить на: ${ROLE_LABELS[role]}`}
        >
          <span className="hidden sm:inline">{ROLE_LABELS[role]}</span>
          <span className="sm:hidden">{ROLE_LABELS[role].slice(0, 3)}</span>
        </button>
      ))}
    </div>
  );
}
