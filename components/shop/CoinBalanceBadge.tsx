interface CoinBalanceBadgeProps {
  balance: number | null;
  className?: string;
}

export function CoinBalanceBadge({ balance, className }: CoinBalanceBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/80 px-3 py-1.5 text-sm font-medium text-bloom-text ${className ?? ""}`}
    >
      <span aria-hidden>🌱</span>
      {balance === null ? "—" : balance.toLocaleString()} Bloom Coins
    </span>
  );
}
