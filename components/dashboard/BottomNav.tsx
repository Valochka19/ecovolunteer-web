"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ROLE_NAVIGATION } from "@/lib/navigation";

export function BottomNav() {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const navItems = ROLE_NAVIGATION[user.role].slice(0, 5);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t border-zinc-900 bg-zinc-950/95 backdrop-blur-md lg:hidden pb-[env(safe-area-inset-bottom,0px)]">
      <div className="flex items-center justify-around h-full px-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 text-xs transition-colors ${
                isActive ? "text-violet-400" : "text-zinc-500"
              }`}
            >
              <span className="text-lg" aria-hidden>
                {item.icon}
              </span>
              <span className="max-w-[4rem] truncate">{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

