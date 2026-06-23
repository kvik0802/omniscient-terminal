import { useState, useRef } from "react";
import { Play, RotateCcw, TrendingUp, TrendingDown } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const DEFAULT_SCRIPT = `//@version=5
strategy("Omniscient EMA Cross", overlay=true, default_qty_type=strategy.percent_of_equity, default_qty_value=10)

// === INPUTS ===
fastLen = input.int(9, "Fast EMA")
slowLen = input.int(21, "Slow EMA")
rsiLen  = input.int(14, "RSI Period")
rsiOB   = input.int(70, "RSI Overbought")
rsiOS   = input.int(30, "RSI Oversold")

// === CALCULATIONS ===
fastEMA = ta.ema(close, fastLen)
slowEMA = ta.ema(close, slowLen)
rsi     = ta.rsi(close, rsiLen)

// === SIGNALS ===
buySignal  = ta.crossover(fastEMA, slowEMA) and rsi < rsiOB
sellSignal = ta.crossunder(fastEMA, slowEMA) and rsi > rsiOS

// === PLOTS ===
plot(fastEMA, color=color.new(color.cyan, 0), linewidth=1)
plot(slowEMA, color=color.new(color.purple, 0), linewidth=1)

// === EXECUTION ===
if buySignal
    strategy.entry("Long", strategy.long)
    alert("BUY signal: " + syminfo.ticker, alert.freq_once_per_bar)

if sellSignal
    strategy.close("Long")
    alert("SELL signal: " + syminfo.ticker, alert.freq_once_per_bar)`;

function generateEquityCurve() {
  const data = [];
  let equity = 10000;
  for (let i = 0; i < 60; i++) {
    const r = (Math.random() - 0.44) * 0.025;
    equity = equity * (1 + r);
    data.push({ day: i + 1, equity: parseFloat(equity.toFixed(2)) });
  }
  return data;
}

const mockTrades = [
  { date: "2025-03-12", type: "BUY", price: 67200, exitPrice: 71800, pnl: "+6.84%", result: "win" },
  { date: "2025-03-18", type: "BUY", price: 70100, exitPrice: 68900, pnl: "-1.71%", result: "loss" },
  { date: "2025-04-02", type: "BUY", price: 65800, exitPrice: 72400, pnl: "+10.03%", result: "win" },
  { date: "2025-04-15", type: "BUY", price: 73200, exitPrice: 71100, pnl: "-2.87%", result: "loss" },
  { date: "2025-04-28", type: "BUY", price: 69400, exitPrice: 74200, pnl: "+6.92%", result: "win" },
];

const KEYWORDS = ["strategy", "input", "ta", "close", "open", "high", "low", "volume", "color", "plot", "alert", "syminfo", "if", "and", "or", "not", "true", "false"];
const FUNCTIONS = ["ema", "rsi", "macd", "bb", "crossover", "crossunder", "sma", "atr", "stoch"];

function syntaxHighlight(code: string) {
  return code.split("\n").map((line, lineIdx) => {
    const tokens = line.split(/(\s+|[()=+\-*/,<>!.]+|"[^"]*"|\/\/.*)/);
    return (
      <div key={lineIdx} className="flex">
        <span className="select-none text-muted-foreground/50 w-8 text-right pr-3 flex-shrink-0 text-[10px] leading-5">{lineIdx + 1}</span>
        <span className="flex-1 text-[11px] leading-5 font-mono">
          {tokens.map((token, i) => {
            if (token.startsWith("//")) return <span key={i} className="text-green-400/60">{token}</span>;
            if (token.startsWith('"')) return <span key={i} className="text-amber-300">{token}</span>;
            if (KEYWORDS.some(k => token === k)) return <span key={i} className="text-cyan-400 font-semibold">{token}</span>;
            if (FUNCTIONS.some(f => token === f)) return <span key={i} className="text-purple-400">{token}</span>;
            if (/^\d+(\.\d+)?$/.test(token)) return <span key={i} className="text-green-300">{token}</span>;
            return <span key={i} className="text-foreground/90">{token}</span>;
          })}
        </span>
      </div>
    );
  });
}

export function PineIDE() {
  const [code, setCode] = useState(DEFAULT_SCRIPT);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<{ equityCurve: ReturnType<typeof generateEquityCurve> } | null>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  function runBacktest() {
    setRunning(true);
    setTimeout(() => {
      setResults({ equityCurve: generateEquityCurve() });
      setRunning(false);
    }, 1500);
  }

  const stats = results
    ? {
        netPnl: "+24.18%",
        sharpe: "1.42",
        maxDD: "-8.73%",
        winRate: "60%",
        trades: mockTrades.length,
      }
    : null;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border flex-shrink-0">
        <span className="text-[10px] text-muted-foreground font-mono">strategy.pine</span>
        <div className="ml-auto flex gap-2">
          <button onClick={() => { setCode(DEFAULT_SCRIPT); setResults(null); }} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground px-2 py-1 rounded border border-border hover:border-border/80 transition-colors">
            <RotateCcw size={10} /> Reset
          </button>
          <button
            onClick={runBacktest}
            disabled={running}
            className="flex items-center gap-1.5 text-[10px] font-bold text-background bg-green-400 hover:bg-green-300 px-3 py-1 rounded transition-colors disabled:opacity-50"
          >
            <Play size={10} /> {running ? "Running..." : "Run Backtest"}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0 relative overflow-hidden" style={{ maxHeight: results ? "45%" : "100%" }}>
        <div className="absolute inset-0 overflow-auto bg-background">
          <div className="absolute inset-0 pointer-events-none py-2">
            {syntaxHighlight(code)}
          </div>
          <textarea
            ref={textRef}
            value={code}
            onChange={e => setCode(e.target.value)}
            className="absolute inset-0 w-full h-full bg-transparent text-transparent caret-cyan-400 font-mono text-[11px] leading-5 py-2 pl-11 pr-3 resize-none focus:outline-none"
            spellCheck={false}
          />
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="flex-1 min-h-0 border-t border-border overflow-hidden flex flex-col">
          {/* Stats */}
          <div className="grid grid-cols-5 border-b border-border flex-shrink-0">
            {stats && Object.entries(stats).map(([k, v]) => (
              <div key={k} className="px-2 py-1.5 border-r border-border last:border-r-0 text-center">
                <div className="text-[9px] text-muted-foreground capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</div>
                <div className={`text-xs font-mono font-bold ${k === "netPnl" || k === "winRate" ? "text-green-400" : k === "maxDD" ? "text-red-400" : "text-cyan-400"}`}>{v}</div>
              </div>
            ))}
          </div>

          {/* Equity Curve */}
          <div className="flex-1 min-h-0 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={results.equityCurve}>
                <defs>
                  <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00FF9D" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#00FF9D" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A2535" />
                <XAxis dataKey="day" hide />
                <YAxis tick={{ fill: "#4A5568", fontSize: 9 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "#0F1520", border: "1px solid #1A2535", fontSize: 10 }} />
                <Area dataKey="equity" stroke="#00FF9D" strokeWidth={1.5} fill="url(#equityGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Trades */}
          <div className="border-t border-border flex-shrink-0 max-h-28 overflow-y-auto">
            <table className="w-full text-[10px] font-mono">
              <thead className="sticky top-0 bg-card">
                <tr className="text-muted-foreground">
                  {["Date", "Type", "Entry", "Exit", "P&L"].map(h => <th key={h} className="text-left px-2 py-1 border-b border-border font-medium">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {mockTrades.map((t, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-card/50">
                    <td className="px-2 py-1 text-muted-foreground">{t.date}</td>
                    <td className="px-2 py-1">
                      {t.type === "BUY" ? <TrendingUp size={10} className="text-green-400 inline" /> : <TrendingDown size={10} className="text-red-400 inline" />}
                      <span className={t.type === "BUY" ? "text-green-400 ml-1" : "text-red-400 ml-1"}>{t.type}</span>
                    </td>
                    <td className="px-2 py-1 text-foreground">{t.price.toLocaleString()}</td>
                    <td className="px-2 py-1 text-foreground">{t.exitPrice.toLocaleString()}</td>
                    <td className={`px-2 py-1 font-bold ${t.result === "win" ? "text-green-400" : "text-red-400"}`}>{t.pnl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
