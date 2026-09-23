"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ROLE_NAVIGATION } from "@/lib/navigation";

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function Sidebar({ className = "", onNavigate }: SidebarProps) {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const navItems = ROLE_NAVIGATION[user.role];

  return (
    <aside
      className={`flex flex-col border-zinc-800 bg-zinc-950/90 backdrop-blur-xl ${className}`}
    >
      <div className="border-b border-zinc-800 p-4">
        <Link href="/dashboard" className="flex items-center gap-2" onClick={onNavigate}>
          <span className="text-xl">🌱</span>
          <span className="bg-gradient-to-r from-emerald-400 to-violet-400 bg-clip-text text-lg font-bold text-transparent">
            EcoVolunteer
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "border border-violet-500/30 bg-violet-950/40 text-violet-200 shadow-sm shadow-violet-900/20"
                  : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100"
              }`}
            >
              <span className="text-base" aria-hidden>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
