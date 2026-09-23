"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { BottomNav } from "./BottomNav";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-400" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <Sidebar className="hidden w-64 shrink-0 border-r lg:flex" />

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Закрыть меню"
          />
          <Sidebar
            className="absolute left-0 top-0 h-full w-72 border-r shadow-2xl"
            onNavigate={() => setMobileMenuOpen(false)}
          />
        </div>
      ) : null}

            <div className="flex min-h-screen flex-1 flex-col">
        <Header onMenuToggle={() => setMobileMenuOpen((v) => !v)} />
        <main className="flex-1 overflow-auto px-4 py-4 pb-20 md:px-6 md:py-6 md:pb-6">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}

