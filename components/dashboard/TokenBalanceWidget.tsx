interface TokenBalanceWidgetProps {
  balance: number;
}

export function TokenBalanceWidget({ balance }: TokenBalanceWidgetProps) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-violet-500/30 bg-gradient-to-r from-violet-950/60 to-indigo-950/60 px-4 py-2 shadow-lg shadow-violet-900/20 backdrop-blur">
      <span className="text-lg" aria-hidden>
        🪙
      </span>
      <div className="flex flex-col leading-none">
        <span className="text-xs text-violet-300/70">Social Tokens</span>
        <span className="font-mono text-sm font-bold text-violet-200">
          {balance} ST
        </span>
      </div>
    </div>
  );
}
