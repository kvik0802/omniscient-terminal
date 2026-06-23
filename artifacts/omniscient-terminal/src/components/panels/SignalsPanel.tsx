import { useMemo } from "react";
import { TrendingUp, TrendingDown, Zap } from "lucide-react";
import { getSignals, getSignalStats, getScanResults } from "@/lib/mock-data";

const convictionConfig: Record<string, { label: string; color: string; glow: string }> = {
  strong_buy: { label: "STRONG BUY", color: "text-green-400", glow: "shadow-[0_0_12px_rgba(0,255,157,0.6)]" },
  buy: { label: "BUY", color: "text-green-400", glow: "" },
  weak_buy: { label: "WEAK BUY", color: "text-green-300", glow: "" },
  neutral: { label: "NEUTRAL", color: "text-muted-foreground", glow: "" },
  weak_sell: { label: "WEAK SELL", color: "text-red-300", glow: "" },
  sell: { label: "SELL", color: "text-red-400", glow: "" },
  strong_sell: { label: "STRONG SELL", color: "text-red-400", glow: "shadow-[0_0_12px_rgba(255,59,59,0.6)]" },
};

function TCSBar({ tcs }: { tcs: number }) {
  const pct = Math.abs(tcs);
  const color = tcs >= 60 ? "#00FF9D" : tcs >= 0 ? "#00FF9D99" : tcs >= -60 ? "#FF3B3B99" : "#FF3B3B";
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-20 h-1.5 bg-border rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-[10px] font-mono font-bold" style={{ color }}>{tcs > 0 ? "+" : ""}{tcs}</span>
    </div>
  );
}

export function SignalsPanel() {
  const signals = useMemo(() => getSignals(), []);
  const stats = useMemo(() => getSignalStats(), []);
  const scanResults = useMemo(() => getScanResults(), []);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-0 border-b border-border flex-shrink-0">
        {[
          { label: "Win Rate", value: `${stats.todayWinRate.toFixed(1)}%`, color: "text-green-400" },
          { label: "Today P&L", value: `+${stats.todayPnl.toFixed(2)}%`, color: "text-green-400" },
          { label: "Weekly P&L", value: `+${stats.weeklyPnl.toFixed(1)}%`, color: "text-green-400" },
          { label: "Active", value: `${stats.activeSignals}/${stats.totalSignals}`, color: "text-cyan-400" },
        ].map(s => (
          <div key={s.label} className="px-3 py-2 border-r border-border last:border-r-0">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</div>
            <div className={`text-sm font-mono font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Active Signals */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {signals.map(signal => {
          const cfg = convictionConfig[signal.conviction] || convictionConfig.neutral;
          const isBuy = signal.type === "buy";
          const pnl = signal.pnlPercent || 0;
          return (
            <div key={signal.id} className="border-b border-border px-3 py-2.5 hover:bg-card/50 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {isBuy ? <TrendingUp size={14} className="text-green-400 flex-shrink-0" /> : <TrendingDown size={14} className="text-red-400 flex-shrink-0" />}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-bold text-foreground">{signal.symbol}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${cfg.color} ${cfg.glow} ${isBuy ? "border-green-400/30 bg-green-400/10" : "border-red-400/30 bg-red-400/10"}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[10px] font-mono">
                      <span className="text-muted-foreground">Entry <span className="text-foreground">{signal.entryPrice.toLocaleString()}</span></span>
                      <span className={pnl >= 0 ? "text-green-400" : "text-red-400"}>{pnl >= 0 ? "+" : ""}{pnl.toFixed(2)}%</span>
                      <span className="text-muted-foreground">Conf <span className="text-cyan-400">{signal.confidence}%</span></span>
                    </div>
                  </div>
                </div>
                <TCSBar tcs={signal.tcs} />
              </div>
              {/* TP/SL Levels */}
              <div className="grid grid-cols-5 gap-1 mt-2">
                {[
                  { label: "TP1", value: signal.tp1, color: "text-green-400" },
                  { label: "TP2", value: signal.tp2, color: "text-green-400" },
                  { label: "TP3", value: signal.tp3, color: "text-green-300" },
                  { label: "SL1", value: signal.sl1, color: "text-red-400" },
                  { label: "SL2", value: signal.sl2, color: "text-red-500" },
                ].map(level => (
                  <div key={level.label} className="text-center">
                    <div className="text-[9px] text-muted-foreground">{level.label}</div>
                    <div className={`text-[10px] font-mono font-semibold ${level.color}`}>
                      {level.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Scanner */}
      {scanResults.length > 0 && (
        <div className="border-t border-border flex-shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border bg-card/30">
            <Zap size={12} className="text-amber-400" />
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Signal Scanner</span>
          </div>
          <div className="flex overflow-x-auto gap-2 px-3 py-2">
            {scanResults.map(scan => {
              const isBull = scan.tcs >= 0;
              return (
                <div key={scan.symbol} className={`flex-shrink-0 border rounded px-2 py-1.5 ${isBull ? "border-green-400/30 bg-green-400/5" : "border-red-400/30 bg-red-400/5"} ${scan.emerging ? "ring-1 ring-amber-400/50" : ""}`}>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-bold text-foreground">{scan.symbol}</span>
                    {scan.emerging && <span className="text-[9px] text-amber-400 font-bold">NEW</span>}
                  </div>
                  <div className={`text-[10px] font-mono ${isBull ? "text-green-400" : "text-red-400"}`}>TCS {isBull ? "+" : ""}{scan.tcs}</div>
                  <div className={`text-[10px] font-mono ${scan.changePercent >= 0 ? "text-green-400" : "text-red-400"}`}>{scan.changePercent >= 0 ? "+" : ""}{scan.changePercent.toFixed(2)}%</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
