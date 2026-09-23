"use client";

import Image from "next/image";
import { useState, useMemo, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { MOCK_REWARDS } from "@/lib/mock-rewards";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Reward, RewardCategory } from "@/types";

// ────────────────────────────────────────────────────────────────
// Local Types
// ────────────────────────────────────────────────────────────────

type FilterKey =
  | "all"
  | "discount_service"
  | "item"
  | "event"
  | "education";

type SortKey = "price" | "popular";

type PurchaseStatus = "pending" | "confirmed" | "cancelled";

interface PurchaseRecord {
  id: string;
  rewardId: string;
  rewardTitle: string;
  rewardCost: number;
  partnerName: string;
  category: RewardCategory;
  status: PurchaseStatus;
  purchasedAt: string;
  promoCode: string | null;
  isPremium: boolean;
}

type PageTab = "shop" | "purchases";

// ────────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────────

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Все" },
  { key: "discount_service", label: "Скидки и Услуги" },
  { key: "item", label: "Мерч и Товары" },
  { key: "event", label: "События и Поездки" },
  { key: "education", label: "Образование" },
];

const FILTER_MAP: Record<FilterKey, RewardCategory[]> = {
  all: ["discount", "item", "service", "event", "education"],
  discount_service: ["discount", "service"],
  item: ["item"],
  event: ["event"],
  education: ["education"],
};

const CATEGORY_GRADIENT: Record<RewardCategory, string> = {
  discount: "from-amber-600/30 via-orange-600/20 to-amber-900/30",
  item: "from-cyan-600/30 via-blue-600/20 to-cyan-900/30",
  service: "from-emerald-600/30 via-teal-600/20 to-emerald-900/30",
  event: "from-violet-600/30 via-purple-600/20 to-violet-900/30",
  education: "from-indigo-600/30 via-pink-600/20 to-indigo-900/30",
};

const CATEGORY_ICON: Record<RewardCategory, string> = {
  discount: "🏷️",
  item: "📦",
  service: "🔧",
  event: "🎪",
  education: "📚",
};

const CATEGORY_LABEL: Record<RewardCategory, string> = {
  discount: "Скидка",
  item: "Товар",
  service: "Услуга",
  event: "Событие",
  education: "Обучение",
};

function isPremium(reward: Reward): boolean {
  return reward.requiresApproval;
}

function generatePromoCode(): string {
  const p1 = Math.random().toString(36).substring(2, 6).toUpperCase();
  const p2 = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `NEO-${p1}-${p2}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ────────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────────

/** Glowing token balance badge for the shop header */
function ShopBalanceBadge({ balance }: { balance: number }) {
  return (
    <div className="inline-flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/60 via-zinc-900/50 to-emerald-950/60 px-5 py-3 shadow-lg shadow-emerald-500/10 backdrop-blur-xl">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-lg">
        🪙
      </div>
      <div className="flex flex-col">
        <span className="text-[11px] font-medium uppercase tracking-widest text-emerald-400/60">
          Баланс
        </span>
        <span className="font-mono text-xl font-bold text-emerald-300 drop-shadow-[0_0_12px_rgba(16,185,129,0.4)]">
          {balance} ST
        </span>
      </div>
    </div>
  );
}

/** Capsule-style filter button */
function FilterCapsule({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-900/40"
          : "border border-zinc-700/60 bg-zinc-900/40 text-zinc-400 backdrop-blur-sm hover:border-zinc-600 hover:text-zinc-200"
      }`}
    >
      {label}
    </button>
  );
}

/** Sort toggle button */
function SortToggle({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
        active
          ? "bg-indigo-900/40 text-indigo-300 ring-1 ring-indigo-500/30"
          : "text-zinc-500 hover:text-zinc-300"
      }`}
    >
      {label}
    </button>
  );
}

/** Category badge chip */
function CategoryBadge({ category }: { category: RewardCategory }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${CATEGORY_GRADIENT[category]} px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-zinc-200/90 backdrop-blur-sm`}
    >
      <span className="text-xs">{CATEGORY_ICON[category]}</span>
      {CATEGORY_LABEL[category]}
    </span>
  );
}

/** Image placeholder with gradient + icon overlay */
function RewardImage({
  category,
  partnerName,
  className = "",
}: {
  category: RewardCategory;
  partnerName: string;
  className?: string;
}) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${CATEGORY_GRADIENT[category]} ${className}`}
    >
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="absolute h-24 w-24 rounded-full bg-white/5 blur-3xl" />
      <span className="relative z-10 text-4xl drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]">
        {CATEGORY_ICON[category]}
      </span>
      <span className="absolute bottom-2 right-3 text-[10px] font-medium text-white/20">
        {partnerName}
      </span>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Card – Type A: Standard (vertical)
// ────────────────────────────────────────────────────────────────

function StandardRewardCard({
  reward,
  balance,
  onClick,
}: {
  reward: Reward;
  balance: number;
  onClick: () => void;
}) {
  const canAfford = balance >= reward.tokenCost;
  const isSoldOut = reward.status === "out_of_stock" || reward.itemsLeft <= 0;

  return (
    <Card
      glow="emerald"
      className="group flex cursor-pointer flex-col overflow-hidden p-0 transition-all duration-300 hover:border-emerald-700/40 hover:shadow-emerald-900/20"
      onClick={isSoldOut ? undefined : onClick}
    >
      <div className="relative h-40 w-full">
        <RewardImage
          category={reward.category}
          partnerName={reward.partnerName}
          className="h-full w-full"
        />
        <div className="absolute left-3 top-3">
          <CategoryBadge category={reward.category} />
        </div>
        {isSoldOut && (
          <div className="absolute right-3 top-3 rounded-full bg-red-900/70 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-red-300 backdrop-blur-sm">
            Нет в наличии
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-[11px] font-medium uppercase tracking-widest text-zinc-500">
          {reward.partnerName}
        </span>
        <h3 className="text-sm font-semibold leading-snug text-zinc-100">
          {reward.title}
        </h3>
        <p className="line-clamp-2 text-xs leading-relaxed text-zinc-400">
          {reward.description}
        </p>
        <div className="mt-auto flex flex-col gap-3 pt-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-500">
              {isSoldOut
                ? "Нет в наличии"
                : `Осталось: ${reward.itemsLeft} шт.`}
            </span>
            {reward.itemsLeft > 0 && reward.itemsLeft <= 5 && (
              <span className="rounded bg-amber-900/40 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-400">
                Мало
              </span>
            )}
          </div>
          <Button
            variant={canAfford && !isSoldOut ? "primary" : "secondary"}
            disabled={!canAfford || isSoldOut}
            size="sm"
            className="w-full pointer-events-none"
          >
            {isSoldOut
              ? "Нет в наличии"
              : canAfford
                ? `Купить за ${reward.tokenCost} ST`
                : `Нужно ${reward.tokenCost - balance} ST`}
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ────────────────────────────────────────────────────────────────
// Card – Type B: Premium (horizontal, double-width)
// ────────────────────────────────────────────────────────────────

function PremiumRewardCard({
  reward,
  balance,
  onClick,
}: {
  reward: Reward;
  balance: number;
  onClick: () => void;
}) {
  const canAfford = balance >= reward.tokenCost;
  const isSoldOut = reward.status === "out_of_stock" || reward.itemsLeft <= 0;

  return (
    <Card
      glow="violet"
      className="group col-span-1 flex cursor-pointer flex-col overflow-hidden p-0 transition-all duration-300 hover:border-violet-700/40 hover:shadow-violet-900/20 md:col-span-2 md:flex-row"
      onClick={isSoldOut ? undefined : onClick}
    >
      <div className="relative h-48 w-full shrink-0 md:h-auto md:w-56">
        <RewardImage
          category={reward.category}
          partnerName={reward.partnerName}
          className="h-full w-full"
        />
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <CategoryBadge category={reward.category} />
        </div>
        <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-violet-900/70 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-violet-300 shadow-lg shadow-violet-900/40 backdrop-blur-sm">
          <span className="text-xs">⚠️</span>
          Требует подтверждения
        </div>
        {isSoldOut && (
          <div className="absolute bottom-3 right-3 rounded-full bg-red-900/70 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-red-300 backdrop-blur-sm">
            Нет в наличии
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
          <span className="text-[11px] font-medium uppercase tracking-widest text-violet-400/70">
            {reward.partnerName}
          </span>
        </div>
        <h3 className="text-lg font-bold leading-tight text-zinc-100">
          {reward.title}
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-zinc-400">
          {reward.description}
        </p>
        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
          <span>🎯 {reward.tokenCost} ST</span>
          <span className="text-zinc-700">|</span>
          <span>
            {isSoldOut
              ? "Нет в наличии"
              : `Осталось: ${reward.itemsLeft} шт.`}
          </span>
          {reward.itemsLeft > 0 && reward.itemsLeft <= 5 && (
            <span className="rounded bg-amber-900/40 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-400">
              Мало
            </span>
          )}
        </div>
        <div className="mt-auto flex items-center gap-3 pt-2">
          <Button
            variant={canAfford && !isSoldOut ? "primary" : "secondary"}
            disabled={!canAfford || isSoldOut}
            size="md"
            className="flex-1 pointer-events-none"
          >
            {isSoldOut
              ? "Нет в наличии"
              : canAfford
                ? `Подать заявку за ${reward.tokenCost} ST`
                : `Нужно ${reward.tokenCost - balance} ST`}
          </Button>
          <span className="hidden text-[11px] text-zinc-600 sm:block">
            Одобрение координатора
          </span>
        </div>
      </div>
    </Card>
  );
}

// ────────────────────────────────────────────────────────────────
// Modal 1: Reward Detail + Confirm Purchase
// ────────────────────────────────────────────────────────────────

function RewardDetailModal({
  reward,
  balance,
  onClose,
  onConfirm,
}: {
  reward: Reward;
  balance: number;
  onClose: () => void;
  onConfirm: (reward: Reward) => void;
}) {
  const canAfford = balance >= reward.tokenCost;
  const isSoldOut = reward.status === "out_of_stock" || reward.itemsLeft <= 0;
  const premium = isPremium(reward);

  // Close on backdrop click
  const handleBackdrop = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-zinc-950/80 p-4 backdrop-blur-md overflow-y-auto"
      onClick={handleBackdrop}
    >
      {/* Modal card */}
      <div className="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-zinc-700/50 bg-zinc-900 shadow-2xl shadow-zinc-950/60 my-4 md:flex-row md:items-stretch">
        {/* Close X */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900/80 text-sm text-zinc-400 backdrop-blur transition-colors hover:bg-zinc-800 hover:text-white"
        >
          ✕
        </button>

        {/* ── LEFT: Image + expiration ───────────────────────────── */}
        <div className="relative flex h-56 w-full shrink-0 flex-col md:h-auto md:w-[280px]">
          <RewardImage
            category={reward.category}
            partnerName={reward.partnerName}
            className="h-full w-full"
          />
          {/* Expiration banner */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/60 to-transparent px-4 pb-3 pt-8">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-900/60 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300 backdrop-blur-sm">
              <span>⏳</span>
              Доступно до {formatDate(reward.expirationDate)}
            </span>
          </div>
          {/* Category badge top-left */}
          <div className="absolute left-3 top-3">
            <CategoryBadge category={reward.category} />
          </div>
          {/* Sold out badge */}
          {isSoldOut && (
            <div className="absolute right-3 top-3 rounded-full bg-red-900/70 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-red-300 backdrop-blur-sm">
              Нет в наличии
            </div>
          )}
        </div>

        {/* ── RIGHT: Content ─────────────────────────────────────── */}
        <div className="flex flex-1 flex-col gap-4 p-5">
          {/* Partner */}
          <span className="text-[11px] font-medium uppercase tracking-widest text-zinc-500">
            {reward.partnerName}
          </span>

          {/* Title */}
          <h2 className="text-xl font-bold leading-tight text-zinc-100">
            {reward.title}
          </h2>

          {/* Full description */}
          <p className="text-sm leading-relaxed text-zinc-400">
            {reward.description}
          </p>

          {/* Usage terms */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
            <h4 className="mb-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Как получить
            </h4>
            <p className="text-xs leading-relaxed text-zinc-300">
              {premium
                ? "После подтверждения заявки координатор свяжется с вами в течение 3 рабочих дней."
                : "Покажите полученный промо-код на кассе партнёра или введите его при онлайн-заказе."}
            </p>
          </div>

          {/* Price + remaining */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-zinc-100">
                🎯 {reward.tokenCost} ST
              </span>
              {premium && (
                <span className="rounded-md border border-violet-800/30 bg-violet-950/40 px-2 py-0.5 text-[10px] font-bold uppercase text-violet-400">
                  Premium
                </span>
              )}
            </div>
            <span className="text-xs text-zinc-500">
              Осталось: {reward.itemsLeft} шт.
            </span>
          </div>

          {/* Confirm button */}
          <Button
            variant={canAfford && !isSoldOut ? "primary" : "secondary"}
            disabled={!canAfford || isSoldOut}
            size="lg"
            className="mt-1 w-full"
            onClick={() => onConfirm(reward)}
          >
            {isSoldOut
              ? "Нет в наличии"
              : canAfford
                ? `Подтвердить покупку за ${reward.tokenCost} ST`
                : `Не хватает ${reward.tokenCost - balance} ST`}
          </Button>

          {premium && canAfford && !isSoldOut && (
            <p className="text-center text-[10px] text-zinc-600">
              После подтверждения токены будут заморожены до решения координатора
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Modal 2: Purchase Detail (QR / Promo Code)
// ────────────────────────────────────────────────────────────────

function PurchaseDetailModal({
  purchase,
  onClose,
}: {
  purchase: PurchaseRecord;
  onClose: () => void;
}) {
  const handleBackdrop = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-md"
      onClick={handleBackdrop}
    >
      <div className="relative w-full max-w-sm rounded-2xl border border-zinc-700/50 bg-zinc-900 p-6 shadow-2xl shadow-zinc-950/60">
        {/* Close X */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-sm text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white"
        >
          ✕
        </button>

        <div className="flex flex-col items-center gap-4">
          {/* Status icon */}
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-full ${
              purchase.status === "confirmed"
                ? "bg-emerald-500/10"
                : purchase.status === "pending"
                  ? "bg-amber-500/10"
                  : "bg-red-500/10"
            }`}
          >
            <span className="text-3xl">
              {purchase.status === "confirmed"
                ? "✅"
                : purchase.status === "pending"
                  ? "⏳"
                  : "↩️"}
            </span>
          </div>

          <h3 className="text-lg font-bold text-zinc-100">
            {purchase.rewardTitle}
          </h3>

          {purchase.status === "confirmed" && purchase.promoCode ? (
            <>
              <p className="text-center text-xs text-zinc-400">
                Покажите этот код на кассе партнёра или введите при
                онлайн-заказе
              </p>
              {/* Mock QR Code */}
              <div className="flex flex-col items-center gap-2 rounded-xl border border-zinc-700 bg-white p-4">
                <div className="grid grid-cols-8 gap-0.5">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 w-2 rounded-sm ${
                        // Pseudo-random QR pattern
                        (i * 7 + i * i * 3) % 5 === 0
                          ? "bg-black"
                          : "bg-white"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-zinc-500">
                  {purchase.promoCode}
                </span>
              </div>

              {/* Copyable promo code */}
              <div className="flex w-full items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/60 px-4 py-2.5">
                <span className="flex-1 font-mono text-sm font-bold tracking-wider text-emerald-300">
                  {purchase.promoCode}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      purchase.promoCode ?? ""
                    );
                  }}
                  className="rounded-md bg-zinc-700/60 px-2 py-1 text-[10px] font-medium text-zinc-300 transition-colors hover:bg-zinc-600"
                >
                  Копировать
                </button>
              </div>
            </>
          ) : purchase.status === "pending" ? (
            <div className="flex flex-col items-center gap-2">
              <span className="rounded-full bg-amber-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Ожидает подтверждения
              </span>
              <p className="text-center text-xs text-zinc-500">
                Координатор свяжется с вами в течение 3 рабочих дней.
                Токены зарезервированы.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <span className="rounded-full bg-red-900/30 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-red-400">
                Отменена
              </span>
              <p className="text-center text-xs text-zinc-500">
                Токены возвращены на ваш баланс.
              </p>
            </div>
          )}

          {/* Meta */}
          <div className="flex w-full items-center justify-between border-t border-zinc-800 pt-3 text-xs text-zinc-600">
            <span>{formatDate(purchase.purchasedAt)}</span>
            <span>— {purchase.rewardCost} ST</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// History List Item
// ────────────────────────────────────────────────────────────────

function PurchaseHistoryItem({
  purchase,
  onClick,
}: {
  purchase: PurchaseRecord;
  onClick: () => void;
}) {
  const statusConfig: Record<
    PurchaseStatus,
    { label: string; classes: string }
  > = {
    pending: {
      label: "Ожидает подтверждения",
      classes:
        "border-amber-500/20 bg-amber-500/10 text-amber-400",
    },
    confirmed: {
      label: "Подтверждена",
      classes:
        "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    },
    cancelled: {
      label: "Отменена",
      classes: "border-red-500/20 bg-red-500/10 text-red-400",
    },
  };

  const cfg = statusConfig[purchase.status];

  return (
    <div
      className={`group flex cursor-pointer items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-800/40 ${
        purchase.status === "confirmed" ? "cursor-pointer" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-zinc-200">
            {purchase.rewardTitle}
          </span>
          {purchase.isPremium && (
            <span className="rounded border border-violet-800/30 bg-violet-950/40 px-1.5 py-0.5 text-[9px] font-bold uppercase text-violet-400">
              Premium
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span>{purchase.partnerName}</span>
          <span className="text-zinc-700">•</span>
          <span>{purchase.rewardCost} ST</span>
          <span className="text-zinc-700">•</span>
          <span>{formatDate(purchase.purchasedAt)}</span>
        </div>
      </div>

      <span
        className={`whitespace-nowrap rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${cfg.classes}`}
      >
        {cfg.label}
      </span>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────────

export default function RewardsShopPage() {
  const { user } = useAuth();

  // ── State ────────────────────────────────────────────────────
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [sortKey, setSortKey] = useState<SortKey>("price");
  const [devBalance, setDevBalance] = useState<number | null>(null);
  const [showDevTools, setShowDevTools] = useState(false);
  const [activeTab, setActiveTab] = useState<PageTab>("shop");

  // Modal states
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [selectedPurchase, setSelectedPurchase] =
    useState<PurchaseRecord | null>(null);

  // Purchase history
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);

  const balance = devBalance ?? user?.tokenBalance ?? 0;

  // ── Handlers ─────────────────────────────────────────────────
  const handleOpenDetail = useCallback((reward: Reward) => {
    setSelectedReward(reward);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedReward(null);
  }, []);

  const handleOpenPurchase = useCallback((purchase: PurchaseRecord) => {
    setSelectedPurchase(purchase);
  }, []);

  const handleClosePurchase = useCallback(() => {
    setSelectedPurchase(null);
  }, []);

  const handleConfirmPurchase = useCallback(
    (reward: Reward) => {
      const premium = isPremium(reward);
      const promoCode = premium ? null : generatePromoCode();
      const now = new Date().toISOString();

      const record: PurchaseRecord = {
        id: `purch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        rewardId: reward.id,
        rewardTitle: reward.title,
        rewardCost: reward.tokenCost,
        partnerName: reward.partnerName,
        category: reward.category,
        status: premium ? "pending" : "confirmed",
        purchasedAt: now,
        promoCode,
        isPremium: premium,
      };

      // Subtract tokens from dev balance
      setDevBalance((prev) => (prev !== null ? prev - reward.tokenCost : null));

      // Append to history
      setPurchases((prev) => [record, ...prev]);

      // Close modal
      setSelectedReward(null);
    },
    []
  );

  // ── Filtered + sorted rewards ────────────────────────────────
  const displayedRewards = useMemo(() => {
    const allowedCategories = FILTER_MAP[activeFilter];
    let filtered = MOCK_REWARDS.filter((r) =>
      allowedCategories.includes(r.category)
    );
    if (sortKey === "price") {
      filtered = [...filtered].sort((a, b) => a.tokenCost - b.tokenCost);
    } else {
      filtered = [...filtered].sort((a, b) => {
        if (a.itemsLeft !== b.itemsLeft) return b.itemsLeft - a.itemsLeft;
        return b.tokenCost - a.tokenCost;
      });
    }
    return filtered;
  }, [activeFilter, sortKey]);

  const premiumRewards = useMemo(
    () => displayedRewards.filter(isPremium),
    [displayedRewards]
  );
  const standardRewards = useMemo(
    () => displayedRewards.filter((r) => !isPremium(r)),
    [displayedRewards]
  );

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-8">
      {/* ── Hero / Header ──────────────────────────────────────── */}
      <div className="mb-6 flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            🎁 Магазин наград
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Обменивайте Social Tokens на бонусы от партнёров
          </p>

          {/* Dev panel toggle */}
          <button
            type="button"
            onClick={() => setShowDevTools((v) => !v)}
            className="mt-2 text-[10px] text-zinc-700 underline decoration-zinc-800 underline-offset-2 hover:text-zinc-500"
          >
            {showDevTools ? "Скрыть dev-панель" : "🧪 Dev: изменить баланс"}
          </button>

          {showDevTools && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-[10px] text-zinc-600">
                Тестовый баланс:
              </span>
              {[150, 500, 1000, 2000].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setDevBalance(amount)}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-all ${
                    devBalance === amount
                      ? "bg-emerald-900/60 text-emerald-300 ring-1 ring-emerald-500/40"
                      : "bg-zinc-900/60 text-zinc-500 hover:text-zinc-300 ring-1 ring-zinc-800"
                  }`}
                >
                  {amount} ST
                </button>
              ))}
              <button
                type="button"
                onClick={() => setDevBalance(null)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-all ${
                  devBalance === null
                    ? "bg-zinc-800/60 text-zinc-300 ring-1 ring-zinc-600"
                    : "bg-zinc-900/60 text-zinc-500 hover:text-zinc-300 ring-1 ring-zinc-800"
                }`}
              >
                Сброс ({user?.tokenBalance ?? 0} ST)
              </button>
            </div>
          )}
        </div>
        <ShopBalanceBadge balance={balance} />
      </div>

      {/* ── Tab bar: Shop / My Purchases ───────────────────────── */}
      <div className="mb-6 flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900/40 p-1">
        <button
          type="button"
          onClick={() => setActiveTab("shop")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            activeTab === "shop"
              ? "bg-zinc-800 text-zinc-100 shadow-sm"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          🛍️ Магазин
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("purchases")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            activeTab === "purchases"
              ? "bg-zinc-800 text-zinc-100 shadow-sm"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          📋 Мои покупки
          {purchases.length > 0 && (
            <span className="ml-2 rounded-full bg-zinc-700 px-2 py-0.5 text-[10px]">
              {purchases.length}
            </span>
          )}
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════ */}
      {/* TAB: SHOP                                                  */}
      {/* ════════════════════════════════════════════════════════ */}
      {activeTab === "shop" && (
        <>
          {/* ── Filter capsules ────────────────────────────────── */}
          <div className="mb-4 flex flex-nowrap items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {FILTERS.map((f) => (
              <FilterCapsule
                key={f.key}
                active={activeFilter === f.key}
                label={f.label}
                onClick={() => setActiveFilter(f.key)}
              />
            ))}
          </div>

          {/* ── Results count + sort ──────────────────────────── */}
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-zinc-800/60 pb-3">
            <span className="text-xs text-zinc-500">
              {displayedRewards.length}{" "}
              {displayedRewards.length === 1 ? "награда" : "наград"}
              {activeFilter !== "all"
                ? ` в разделе «${FILTERS.find((f) => f.key === activeFilter)?.label}»`
                : ""}
            </span>
            <div className="flex items-center gap-1">
              <span className="mr-1 text-[11px] text-zinc-600">
                Сортировка:
              </span>
              <SortToggle
                active={sortKey === "price"}
                label="По цене"
                onClick={() => setSortKey("price")}
              />
              <SortToggle
                active={sortKey === "popular"}
                label="Популярные"
                onClick={() => setSortKey("popular")}
              />
            </div>
          </div>

          {/* ── Premium rewards ───────────────────────────────── */}
          {premiumRewards.length > 0 && (
            <section className="mb-10">
              <div className="mb-4 flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-violet-500 shadow-[0_0_12px_rgba(139,92,246,0.5)]" />
                <h2 className="text-base font-semibold text-zinc-200">
                  Премиум-награды
                </h2>
                <span className="rounded-full border border-violet-800/40 bg-violet-950/40 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-400">
                  Эксклюзив
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {premiumRewards.map((reward) => (
                  <PremiumRewardCard
                    key={reward.id}
                    reward={reward}
                    balance={balance}
                    onClick={() => handleOpenDetail(reward)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ── Standard rewards ──────────────────────────────── */}
          {standardRewards.length > 0 && (
            <section>
              {premiumRewards.length > 0 && (
                <div className="mb-4 flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
                  <h2 className="text-base font-semibold text-zinc-200">
                    Стандартные награды
                  </h2>
                </div>
              )}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {standardRewards.map((reward) => (
                  <StandardRewardCard
                    key={reward.id}
                    reward={reward}
                    balance={balance}
                    onClick={() => handleOpenDetail(reward)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ── Empty state ───────────────────────────────────── */}
          {displayedRewards.length === 0 && (
            <div className="flex flex-col items-center gap-4 py-20">
              <span className="text-5xl opacity-30">🔍</span>
              <p className="text-sm text-zinc-500">
                В этом разделе пока нет наград
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveFilter("all")}
              >
                Сбросить фильтр
              </Button>
            </div>
          )}
        </>
      )}

      {/* ════════════════════════════════════════════════════════ */}
      {/* TAB: MY PURCHASES                                          */}
      {/* ════════════════════════════════════════════════════════ */}
      {activeTab === "purchases" && (
        <div>
          {purchases.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-20">
              <span className="text-5xl opacity-30">📭</span>
              <p className="text-sm text-zinc-500">
                У вас пока нет покупок
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("shop")}
              >
                Перейти в магазин
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {/* Summary bar */}
              <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-zinc-800/60 bg-zinc-900/30 px-4 py-3 text-xs text-zinc-500">
                <span>
                  Всего:{" "}
                  <strong className="text-zinc-300">
                    {purchases.length}
                  </strong>
                </span>
                <span className="text-zinc-700">|</span>
                <span>
                  Подтверждено:{" "}
                  <strong className="text-emerald-400">
                    {purchases.filter((p) => p.status === "confirmed").length}
                  </strong>
                </span>
                <span className="text-zinc-700">|</span>
                <span>
                  Ожидают:{" "}
                  <strong className="text-amber-400">
                    {purchases.filter((p) => p.status === "pending").length}
                  </strong>
                </span>
                <span className="text-zinc-700">|</span>
                <span>
                  Отменено:{" "}
                  <strong className="text-red-400">
                    {purchases.filter((p) => p.status === "cancelled").length}
                  </strong>
                </span>
              </div>

              {/* List */}
              {purchases.map((purchase) => (
                <PurchaseHistoryItem
                  key={purchase.id}
                  purchase={purchase}
                  onClick={() => handleOpenPurchase(purchase)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Modals ────────────────────────────────────────────── */}

      {/* Reward detail modal */}
      {selectedReward && (
        <RewardDetailModal
          reward={selectedReward}
          balance={balance}
          onClose={handleCloseDetail}
          onConfirm={handleConfirmPurchase}
        />
      )}

      {/* Purchase detail modal (QR / Promo) */}
      {selectedPurchase && (
        <PurchaseDetailModal
          purchase={selectedPurchase}
          onClose={handleClosePurchase}
        />
      )}
    </div>
  );
}
