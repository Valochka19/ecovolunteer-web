import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: "violet" | "emerald" | "none";
}

const glowStyles = {
  violet: "shadow-violet-900/20 hover:shadow-violet-800/30",
  emerald: "shadow-emerald-900/20 hover:shadow-emerald-800/30",
  none: "",
};

export function Card({
  glow = "none",
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur transition-shadow duration-300 ${glowStyles[glow]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
