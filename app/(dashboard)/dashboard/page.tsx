"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ROLE_LABELS, ROLE_NAVIGATION } from "@/lib/navigation";
import { Card } from "@/components/ui/Card";
import { TokenBalanceWidget } from "@/components/dashboard/TokenBalanceWidget";
import { VerificationBadge } from "@/components/dashboard/VerificationBadge";

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  const navItems = ROLE_NAVIGATION[user.role];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">
          Добро пожаловать, {user.name}
        </h1>
        <p className="mt-1 text-zinc-400">
          Панель {ROLE_LABELS[user.role].toLowerCase()}а · {user.city}
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        {user.role === "volunteer" ? (
          <TokenBalanceWidget balance={user.tokenBalance} />
        ) : null}
        {user.role === "organization" ? (
          <VerificationBadge status={user.verificationStatus} />
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="group h-full transition-all hover:border-violet-500/30 hover:bg-zinc-800/40">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <h3 className="font-semibold text-zinc-100 group-hover:text-violet-300">
                    {item.label}
                  </h3>
                  <p className="mt-1 text-xs text-zinc-500">Перейти в раздел →</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
