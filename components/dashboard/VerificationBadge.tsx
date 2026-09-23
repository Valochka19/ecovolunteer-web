import type { VerificationStatus } from "@/types";

const statusConfig: Record<
  VerificationStatus,
  { label: string; className: string }
> = {
  verified: {
    label: "✓ Верифицирована",
    className: "border-emerald-500/40 bg-emerald-950/50 text-emerald-300",
  },
  pending: {
    label: "⏳ На проверке",
    className: "border-amber-500/40 bg-amber-950/50 text-amber-300",
  },
  rejected: {
    label: "✕ Отклонена",
    className: "border-red-500/40 bg-red-950/50 text-red-300",
  },
  none: {
    label: "—",
    className: "border-zinc-700 bg-zinc-900/50 text-zinc-500",
  },
};

interface VerificationBadgeProps {
  status: VerificationStatus;
}

export function VerificationBadge({ status }: VerificationBadgeProps) {
  const config = statusConfig[status];

  if (status === "none") return null;

  return (
    <div
      className={`rounded-full border px-4 py-2 text-sm font-medium backdrop-blur ${config.className}`}
    >
      {config.label}
    </div>
  );
}
