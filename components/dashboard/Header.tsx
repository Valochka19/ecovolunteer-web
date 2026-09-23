"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ROLE_LABELS } from "@/lib/navigation";
import { RoleSwitcher } from "./RoleSwitcher";
import { TokenBalanceWidget } from "./TokenBalanceWidget";
import { VerificationBadge } from "./VerificationBadge";

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-zinc-800/80 bg-zinc-950/80 px-4 backdrop-blur-xl lg:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white lg:hidden"
          aria-label="Открыть меню"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div>
          <p className="text-xs text-zinc-500">{ROLE_LABELS[user.role]}</p>
          <h1 className="text-sm font-semibold text-zinc-100">{user.name}</h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
              <span className="hidden lg:contents">
                <RoleSwitcher />
              </span>

        {user.role === "volunteer" ? (
          <TokenBalanceWidget balance={user.tokenBalance} />
        ) : null}

        {user.role === "organization" ? (
          <VerificationBadge status={user.verificationStatus} />
        ) : null}

                                <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="relative block h-9 w-9 overflow-hidden rounded-full border-2 border-violet-500/30 ring-2 ring-violet-500/10 transition-all hover:border-violet-400 hover:ring-violet-400/30"
          >
            <Image
              src={user.avatar}
              alt={user.name}
              fill
              className="object-cover"
              unoptimized
            />
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 z-50">
              <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-2 shadow-2xl shadow-zinc-950/60 backdrop-blur-xl">
                <Link
                  href="/dashboard/volunteer/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-zinc-300 transition-all hover:bg-violet-900/30 hover:text-violet-200"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Личный кабинет
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-zinc-300 transition-all hover:bg-zinc-800 hover:text-zinc-200"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Дашборд
                </Link>
                <hr className="my-1 border-zinc-800" />
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-zinc-400 transition-all hover:bg-red-900/20 hover:text-red-400"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Выйти
                </button>
              </div>
            </div>
          )}
        </div> 

                <button
          type="button"
          onClick={logout}
          className="hidden rounded-lg px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200 sm:block"
        >
          Выйти
        </button>
      </div>
    </header>
  );
}
