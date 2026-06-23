import { useState, useMemo } from "react";
import { X, TrendingUp, TrendingDown, AlertTriangle, Target, ShieldAlert, Zap } from "lucide-react";

interface CryptoTradingBoxProps {
  symbol: string;
  currentPrice: number;
  direction: "bullish" | "bearish" | "neutral";
  targetPrice: number;
  confidence: number;
  onClose: () => void;
}

const LEVERAGE_PRESETS = [1, 2, 5, 10, 20, 25, 50, 75, 100];

function calcLiquidation(entry: number, leverage: number, isBuy: boolean): number {
  if (leverage <= 1) return isBuy ? 0 : Infinity;
  const pct = 1 / leverage;
  return isBuy ? entry * (1 - pct) : entry * (1 + pct);
}

function calcTP(entry: number, leverage: number, isBuy: boolean, tpPct: number): number {
  return isBuy ? entry * (1 + tpPct / leverage) : entry * (1 - tpPct / leverage);
}

export function CryptoTradingBox({ symbol, currentPrice, direction, targetPrice, confidence, onClose }: CryptoTradingBoxProps) {
  const [investment, setInvestment] = useState("1000");
  const [leverage, setLeverage] = useState(10);
  const [side, setSide] = useState<"buy" | "sell">(direction === "bearish" ? "sell" : "buy");

  const isBuy = side === "buy";
  const investmentNum = parseFloat(investment) || 0;
  const positionSize = investmentNum * leverage;

  const tp1 = useMemo(() => calcTP(currentPrice, leverage, isBuy, 0.05), [currentPrice, leverage, isBuy]);
  const tp2 = useMemo(() => calcTP(currentPrice, leverage, isBuy, 0.10), [currentPrice, leverage, isBuy]);
  const tp3 = useMemo(() => calcTP(currentPrice, leverage, isBuy, 0.20), [currentPrice, leverage, isBuy]);
  const sl = useMemo(() => calcTP(currentPrice, leverage, !isBuy, 0.03), [currentPrice, leverage, isBuy]);
  const liquidation = useMemo(() => calcLiquidation(currentPrice, leverage, isBuy), [currentPrice, leverage, isBuy]);

  const tp1Pnl = investmentNum * 0.05 * leverage;
  const tp2Pnl = investmentNum * 0.10 * leverage;
  const tp3Pnl = investmentNum * 0.20 * leverage;

  const riskLevel = leverage <= 5 ? "LOW" : leverage <= 20 ? "MEDIUM" : leverage <= 50 ? "HIGH" : "EXTREME";
  const riskColor = leverage <= 5 ? "text-green-400" : leverage <= 20 ? "text-amber-400" : leverage <= 50 ? "text-orange-400" : "text-red-400";

  const aiRecommendation = useMemo(() => {
    if (direction === "neutral") return { action: "WAIT", color: "text-muted-foreground", msg: "Market is consolidating. Wait for clearer signal before entry." };
    if (direction === "bullish" && isBuy) return { action: "CONFIRM BUY", color: "text-green-400", msg: `AI confirms LONG. Confidence ${confidence.toFixed(0)}%. Entry near current price is optimal.` };
    if (direction === "bearish" && !isBuy) return { action: "CONFIRM SELL", color: "text-red-400", msg: `AI confirms SHORT. Confidence ${confidence.toFixed(0)}%. Entry near current price is optimal.` };
    return { action: "COUNTER-TREND", color: "text-amber-400", msg: `AI signals the opposite direction. Trading against the trend — high risk.` };
  }, [direction, isBuy, confidence]);

  function fmt(n: number): string {
    if (n === 0 || !isFinite(n)) return "—";
    if (n > 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
    if (n > 10) return n.toFixed(2);
    return n.toFixed(4);
  }

  function fmtUSD(n: number): string {
    return `$${Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400/15 flex items-center justify-center border border-amber-400/40">
              <Zap size={15} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">{symbol} — Leverage Trading</h2>
              <p className="text-[10px] text-muted-foreground font-mono">Entry: {fmt(currentPrice)}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-border/50 text-muted-foreground hover:text-foreground transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-4 overflow-y-auto max-h-[80vh]">
          {/* AI Signal */}
          <div className={`flex items-start gap-3 p-3 rounded-lg border ${direction === "bullish" ? "border-green-400/30 bg-green-400/5" : direction === "bearish" ? "border-red-400/30 bg-red-400/5" : "border-border bg-card/50"}`}>
            <div className="flex-shrink-0 mt-0.5">
              {direction === "bullish" ? <TrendingUp size={16} className="text-green-400" /> : direction === "bearish" ? <TrendingDown size={16} className="text-red-400" /> : <Target size={16} className="text-muted-foreground" />}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${aiRecommendation.color}`}>{aiRecommendation.action}</span>
                <div className="flex-1 h-1 bg-border rounded-full overflow-hidden max-w-[80px]">
                  <div className="h-full rounded-full bg-current transition-all" style={{ width: `${confidence}%`, color: direction === "bullish" ? "#00ff9d" : direction === "bearish" ? "#ff3b3b" : "#64748b" }} />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">{confidence.toFixed(0)}%</span>
              </div>
              <p className="text-[11px] text-muted-foreground">{aiRecommendation.msg}</p>
            </div>
          </div>

          {/* Buy / Sell Toggle */}
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setSide("buy")}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${side === "buy" ? "bg-green-400/20 text-green-400" : "text-muted-foreground hover:text-foreground"}`}
            >
              Long / Buy
            </button>
            <button
              onClick={() => setSide("sell")}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${side === "sell" ? "bg-red-400/20 text-red-400" : "text-muted-foreground hover:text-foreground"}`}
            >
              Short / Sell
            </button>
          </div>

          {/* Investment Amount */}
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold block mb-1.5">Investment Amount (USD)</label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-mono">$</span>
                <input
                  type="number"
                  value={investment}
                  onChange={e => setInvestment(e.target.value)}
                  className="w-full bg-background border border-border rounded-md pl-7 pr-3 py-2.5 text-sm font-mono text-foreground focus:outline-none focus:border-cyan-400/60 transition-colors"
                  placeholder="1000"
                  min="1"
                />
              </div>
              {[100, 500, 1000, 5000].map(amt => (
                <button
                  key={amt}
                  onClick={() => setInvestment(String(amt))}
                  className="text-[10px] px-2.5 py-1.5 rounded border border-border text-muted-foreground hover:text-cyan-400 hover:border-cyan-400/40 font-mono transition-colors"
                >
                  {amt >= 1000 ? `${amt / 1000}K` : amt}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 font-mono">Position size: {fmtUSD(positionSize)}</p>
          </div>

          {/* Leverage Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Leverage</label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono font-bold text-foreground">{leverage}x</span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                  riskLevel === "LOW" ? "border-green-400/30 bg-green-400/10 text-green-400" :
                  riskLevel === "MEDIUM" ? "border-amber-400/30 bg-amber-400/10 text-amber-400" :
                  riskLevel === "HIGH" ? "border-orange-400/30 bg-orange-400/10 text-orange-400" :
                  "border-red-400/30 bg-red-400/10 text-red-400 animate-pulse"
                }`}>{riskLevel}</span>
              </div>
            </div>
            <input
              type="range"
              min={1}
              max={100}
              value={leverage}
              onChange={e => setLeverage(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${leverage <= 5 ? "#00ff9d" : leverage <= 20 ? "#fbbf24" : leverage <= 50 ? "#fb923c" : "#ff3b3b"} 0%, ${leverage <= 5 ? "#00ff9d" : leverage <= 20 ? "#fbbf24" : leverage <= 50 ? "#fb923c" : "#ff3b3b"} ${leverage}%, #1a2535 ${leverage}%, #1a2535 100%)`
              }}
            />
            <div className="flex justify-between mt-1">
              <span className="text-[9px] text-muted-foreground font-mono">1x</span>
              <span className="text-[9px] text-muted-foreground font-mono">25x</span>
              <span className="text-[9px] text-muted-foreground font-mono">50x</span>
              <span className="text-[9px] text-muted-foreground font-mono">100x</span>
            </div>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {LEVERAGE_PRESETS.map(lv => (
                <button
                  key={lv}
                  onClick={() => setLeverage(lv)}
                  className={`text-[10px] px-2 py-1 rounded border font-mono transition-colors ${leverage === lv ? "border-cyan-400/60 bg-cyan-400/15 text-cyan-400" : "border-border text-muted-foreground hover:text-foreground hover:border-border/70"}`}
                >
                  {lv}x
                </button>
              ))}
            </div>
          </div>

          {/* Take Profit Levels */}
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold block mb-2">Take Profit Targets</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "TP1 (+5%)", price: tp1, pnl: tp1Pnl, color: "green" },
                { label: "TP2 (+10%)", price: tp2, pnl: tp2Pnl, color: "green" },
                { label: "TP3 (+20%)", price: tp3, pnl: tp3Pnl, color: "emerald" },
              ].map(tp => (
                <div key={tp.label} className="border border-green-400/25 bg-green-400/5 rounded-lg p-2.5 text-center">
                  <div className="text-[9px] text-green-400/70 font-semibold uppercase tracking-wider">{tp.label}</div>
                  <div className="text-xs font-mono font-bold text-green-400 mt-0.5">{fmt(tp.price)}</div>
                  <div className="text-[10px] font-mono text-green-400/80 mt-0.5">+{fmtUSD(tp.pnl)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Stop Loss & Liquidation */}
          <div className="grid grid-cols-2 gap-2">
            <div className="border border-red-400/25 bg-red-400/5 rounded-lg p-2.5 text-center">
              <div className="text-[9px] text-red-400/70 font-semibold uppercase tracking-wider flex items-center justify-center gap-1">
                <ShieldAlert size={9} />Stop Loss (-3%)
              </div>
              <div className="text-xs font-mono font-bold text-red-400 mt-0.5">{fmt(sl)}</div>
              <div className="text-[10px] font-mono text-red-400/80 mt-0.5">-{fmtUSD(investmentNum * 0.03 * leverage)}</div>
            </div>
            <div className="border border-red-500/40 bg-red-500/5 rounded-lg p-2.5 text-center">
              <div className="text-[9px] text-red-500/80 font-semibold uppercase tracking-wider flex items-center justify-center gap-1">
                <AlertTriangle size={9} />Liquidation
              </div>
              <div className="text-xs font-mono font-bold text-red-500 mt-0.5">{fmt(liquidation)}</div>
              <div className="text-[10px] font-mono text-red-500/80 mt-0.5">-{fmtUSD(investmentNum)}</div>
            </div>
          </div>

          {/* Summary Row */}
          <div className={`flex items-center gap-3 p-3 rounded-lg border ${isBuy ? "border-green-400/30 bg-green-400/5" : "border-red-400/30 bg-red-400/5"}`}>
            <div className="flex-1">
              <div className="text-[10px] text-muted-foreground mb-0.5">Entry → AI Target</div>
              <div className="font-mono text-xs font-bold text-foreground">{fmt(currentPrice)} → {fmt(targetPrice)}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-muted-foreground mb-0.5">Max P&L at TP3</div>
              <div className={`font-mono text-sm font-bold ${isBuy ? "text-green-400" : "text-red-400"}`}>+{fmtUSD(tp3Pnl)}</div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-2 bg-amber-500/8 border border-amber-400/20 rounded-lg">
            <AlertTriangle size={11} className="text-amber-400 flex-shrink-0" />
            <p className="text-[10px] text-amber-400/70">This is a simulation. Not financial advice. High leverage can liquidate your entire position rapidly.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
