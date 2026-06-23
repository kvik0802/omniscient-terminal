import { useState, useMemo } from "react";
import { getMarketAssets, getMarketSummary } from "@/lib/mock-data";

const keySymbols = ["BTC/USDT", "ETH/USDT", "SPY", "AAPL", "GLD", "EUR/USD"];

export function MarketBar() {
  const [assets] = useState(() => getMarketAssets());
  const [summary] = useState(() => getMarketSummary());

  const featured = useMemo(() => assets.filter(a => keySymbols.includes(a.symbol)), [assets]);

  const fgIndex = summary.fearGreedIndex;
  const fgColor = fgIndex > 75 ? "text-red-400" : fgIndex > 55 ? "text-green-400" : fgIndex > 40 ? "text-amber-400" : "text-red-400";

  return (
    <div className="h-9 border-b border-border bg-card/50 flex items-center px-3 gap-4 overflow-x-auto flex-shrink-0 text-xs">
      <div className="flex items-center gap-2 flex-shrink-0 border-r border-border pr-4">
        <span className="text-muted-foreground text-[10px] uppercase tracking-wider">Fear &amp; Greed</span>
        <span className={`font-bold font-mono ${fgColor}`}>{summary.fearGreedIndex}</span>
        <span className={`text-[10px] ${fgColor}`}>{summary.fearGreedLabel}</span>
      </div>
      {featured.map(asset => (
        <div key={asset.symbol} className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-muted-foreground font-mono text-[10px]">{asset.symbol}</span>
          <span className="font-mono font-semibold text-foreground">
            {asset.price > 100 ? asset.price.toLocaleString(undefined, { maximumFractionDigits: 2 }) : asset.price.toFixed(4)}
          </span>
          <span className={`font-mono text-[10px] font-bold ${asset.changePercent >= 0 ? "text-green-400" : "text-red-400"}`}>
            {asset.changePercent >= 0 ? "+" : ""}{asset.changePercent.toFixed(2)}%
          </span>
        </div>
      ))}
    </div>
  );
}
