import { useState, useEffect, useRef, useCallback } from "react";
import { getCandles, getPrediction, getMarketAssets } from "@/lib/mock-data";
import { AlertTriangle, Zap, ChevronDown } from "lucide-react";
import { CryptoTradingBox } from "@/components/panels/CryptoTradingBox";

const SYMBOLS = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "AAPL", "NVDA", "MSFT", "TSLA", "XRP/USDT", "DOGE/USDT"];
const TIMEFRAMES = ["1s", "10s", "15s", "30s", "50s", "1m", "5m", "15m", "1h", "4h", "1d", "1w"];

function getTimeframeSeconds(tf: string): number {
  const map: Record<string, number> = {
    "1s": 1, "10s": 10, "15s": 15, "30s": 30, "50s": 50,
    "1m": 60, "5m": 300, "15m": 900, "1h": 3600,
    "4h": 14400, "1d": 86400, "1w": 604800,
  };
  return map[tf] || 60;
}

function getSecondsUntilNext(tf: string): number {
  const secs = getTimeframeSeconds(tf);
  const nowSec = Date.now() / 1000;
  return secs - (nowSec % secs);
}

function formatCountdown(remaining: number): string {
  const s = Math.max(0, Math.ceil(remaining));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  if (s < 3600) return `${m}:${rem.toString().padStart(2, "0")}`;
  const h = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  return `${h}h${mm.toString().padStart(2, "0")}m`;
}

function formatPrice(p: number) {
  if (!p || isNaN(p)) return "—";
  if (p >= 10000) return p.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (p >= 1000) return p.toLocaleString(undefined, { maximumFractionDigits: 1 });
  if (p > 10) return p.toFixed(2);
  return p.toFixed(4);
}

interface CandleData { open: number; high: number; low: number; close: number; volume: number; }

// ── Custom SVG Candlestick Chart ─────────────────────────────────────────────
function CandlestickChart({ candles, prediction, width, height }: {
  candles: CandleData[];
  prediction: { targetPrice: number; upperBound: number; lowerBound: number; direction: string; } | null;
  width: number;
  height: number;
}) {
  const [hover, setHover] = useState<{ idx: number; x: number; y: number } | null>(null);

  const PAD = { top: 20, right: 75, bottom: 28, left: 8 };
  const cw = width - PAD.left - PAD.right;
  const ch = height - PAD.top - PAD.bottom;

  const maxVisible = Math.max(10, Math.floor(cw / 10));
  const visible = candles.slice(-maxVisible);
  const n = visible.length;
  if (n === 0 || cw <= 0 || ch <= 0) return null;

  const step = cw / n;
  const bodyW = Math.max(2, step * 0.65);

  const allPx = visible.flatMap(c => [c.high, c.low]);
  if (prediction) { allPx.push(prediction.upperBound, prediction.lowerBound); }
  const minP = Math.min(...allPx) * 0.998;
  const maxP = Math.max(...allPx) * 1.002;
  const range = maxP - minP;

  const py = (p: number) => PAD.top + (1 - (p - minP) / range) * ch;

  const numLabels = 6;
  const labels = Array.from({ length: numLabels + 1 }, (_, i) => {
    const p = minP + (range * i) / numLabels;
    return { p, y: py(p) };
  });

  const dirColor = prediction?.direction === "bullish" ? "#00FF9D" : prediction?.direction === "bearish" ? "#FF3B3B" : "#FF9500";

  const hCandle = hover !== null ? visible[hover.idx] : null;

  return (
    <svg
      width={width}
      height={height}
      style={{ display: "block" }}
      onMouseLeave={() => setHover(null)}
      onMouseMove={e => {
        const rect = e.currentTarget.getBoundingClientRect();
        const mx = e.clientX - rect.left - PAD.left;
        const idx = Math.min(n - 1, Math.max(0, Math.floor(mx / step)));
        setHover({ idx, x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
    >
      {/* Grid */}
      {labels.map((l, i) => (
        <g key={i}>
          <line x1={PAD.left} y1={l.y} x2={PAD.left + cw} y2={l.y} stroke="#1a2535" strokeWidth={0.8} strokeDasharray="3 4" />
          <text x={PAD.left + cw + 5} y={l.y + 3.5} fill="#64748b" fontSize={9} fontFamily="monospace">{formatPrice(l.p)}</text>
        </g>
      ))}

      {/* Prediction zone */}
      {prediction && (
        <>
          <rect x={PAD.left} y={py(prediction.upperBound)} width={cw} height={py(prediction.lowerBound) - py(prediction.upperBound)} fill={dirColor} opacity={0.05} />
          <line x1={PAD.left} y1={py(prediction.targetPrice)} x2={PAD.left + cw} y2={py(prediction.targetPrice)} stroke={dirColor} strokeWidth={1} strokeDasharray="6 3" opacity={0.8} />
          <text x={PAD.left + cw + 5} y={py(prediction.targetPrice) + 3.5} fill={dirColor} fontSize={9} fontFamily="monospace">▶ {formatPrice(prediction.targetPrice)}</text>
        </>
      )}

      {/* Candles */}
      {visible.map((c, i) => {
        const cx = PAD.left + i * step + step / 2;
        const bullish = c.close >= c.open;
        const color = bullish ? "#00d97e" : "#ff4757";
        const bodyTop = py(Math.max(c.open, c.close));
        const bodyBot = py(Math.min(c.open, c.close));
        const bodyH = Math.max(1, bodyBot - bodyTop);
        const isHov = hover?.idx === i;
        return (
          <g key={i}>
            {/* Wick */}
            <line x1={cx} y1={py(c.high)} x2={cx} y2={py(c.low)} stroke={color} strokeWidth={1.2} opacity={0.8} />
            {/* Body */}
            <rect
              x={cx - bodyW / 2}
              y={bodyTop}
              width={bodyW}
              height={bodyH}
              fill={bullish ? color : color}
              stroke={color}
              strokeWidth={isHov ? 1.5 : 0.5}
              opacity={bullish ? 0.88 : 0.72}
            />
            {/* Hover crosshair */}
            {isHov && <line x1={cx} y1={PAD.top} x2={cx} y2={PAD.top + ch} stroke="#ffffff18" strokeWidth={1} />}
          </g>
        );
      })}

      {/* Hover horizontal line */}
      {hover && (
        <line x1={PAD.left} y1={hover.y} x2={PAD.left + cw} y2={hover.y} stroke="#ffffff15" strokeWidth={1} />
      )}

      {/* Hover tooltip */}
      {hover && hCandle && (() => {
        const tx = Math.min(hover.x + 12, width - 120);
        const ty = Math.max(PAD.top, Math.min(hover.y - 45, height - 85));
        const bullish = hCandle.close >= hCandle.open;
        return (
          <g>
            <rect x={tx} y={ty} width={108} height={72} rx={4} fill="#0f1623" stroke="#1a2535" strokeWidth={1} />
            <text x={tx + 6} y={ty + 14} fill="#94a3b8" fontSize={9} fontFamily="monospace">O  {formatPrice(hCandle.open)}</text>
            <text x={tx + 6} y={ty + 26} fill="#00d97e" fontSize={9} fontFamily="monospace">H  {formatPrice(hCandle.high)}</text>
            <text x={tx + 6} y={ty + 38} fill="#ff4757" fontSize={9} fontFamily="monospace">L  {formatPrice(hCandle.low)}</text>
            <text x={tx + 6} y={ty + 50} fill={bullish ? "#00d97e" : "#ff4757"} fontSize={9} fontFamily="monospace">C  {formatPrice(hCandle.close)}</text>
            <text x={tx + 6} y={ty + 62} fill="#475569" fontSize={9} fontFamily="monospace">V  {hCandle.volume.toLocaleString()}</text>
          </g>
        );
      })()}
    </svg>
  );
}

// ── Live Candle Hook ─────────────────────────────────────────────────────────
function useLiveCandles(symbol: string, timeframe: string) {
  const basePrices: Record<string, number> = {
    "BTC/USDT": 71000, "ETH/USDT": 3800, "SOL/USDT": 185,
    "XRP/USDT": 0.62, "DOGE/USDT": 0.12,
    "AAPL": 220, "NVDA": 890, "MSFT": 425, "TSLA": 185,
  };
  const volatility: Record<string, number> = {
    "BTC/USDT": 0.0015, "ETH/USDT": 0.002, "SOL/USDT": 0.003,
    "XRP/USDT": 0.004, "DOGE/USDT": 0.005,
    "AAPL": 0.0008, "NVDA": 0.0012, "MSFT": 0.0007, "TSLA": 0.002,
  };

  const [candles, setCandles] = useState<CandleData[]>(() => {
    const raw = getCandles(symbol, 120);
    return raw as CandleData[];
  });
  const [countdown, setCountdown] = useState(getSecondsUntilNext(timeframe));
  const priceRef = useRef(basePrices[symbol] || 100);
  const prevSymbol = useRef(symbol);
  const prevTf = useRef(timeframe);

  useEffect(() => {
    if (prevSymbol.current !== symbol) {
      prevSymbol.current = symbol;
      const raw = getCandles(symbol, 120);
      setCandles(raw as CandleData[]);
      priceRef.current = basePrices[symbol] || raw[raw.length - 1].close;
    }
  }, [symbol]);

  useEffect(() => {
    prevTf.current = timeframe;
    // Reset countdown on timeframe change
    setCountdown(getSecondsUntilNext(timeframe));
  }, [timeframe]);

  useEffect(() => {
    const tfSecs = getTimeframeSeconds(timeframe);
    // Tick interval: 500ms for sub-minute, 1000ms otherwise
    const tickMs = tfSecs <= 10 ? 200 : tfSecs <= 60 ? 500 : 1000;

    let lastCandleTime = Date.now() - ((Date.now() / 1000 % tfSecs) * 1000);

    const interval = setInterval(() => {
      const vol = volatility[symbol] || 0.001;
      const drift = (Math.random() - 0.48) * vol;
      const newPrice = priceRef.current * (1 + drift);
      priceRef.current = newPrice;

      const remaining = getSecondsUntilNext(timeframe);
      setCountdown(remaining);

      const now = Date.now();
      const elapsed = (now - lastCandleTime) / 1000;
      const shouldClose = elapsed >= tfSecs;

      setCandles(prev => {
        const updated = [...prev];
        const last = { ...updated[updated.length - 1] };

        if (shouldClose) {
          lastCandleTime = now;
          last.close = newPrice;
          updated[updated.length - 1] = last;
          const newCandle: CandleData = {
            open: newPrice,
            high: newPrice * (1 + Math.random() * 0.001),
            low: newPrice * (1 - Math.random() * 0.001),
            close: newPrice,
            volume: Math.floor(Math.random() * 50000) + 1000,
          };
          return [...updated.slice(-119), newCandle];
        } else {
          last.close = newPrice;
          last.high = Math.max(last.high, newPrice);
          last.low = Math.min(last.low, newPrice);
          updated[updated.length - 1] = last;
          return updated;
        }
      });
    }, tickMs);

    return () => clearInterval(interval);
  }, [symbol, timeframe]);

  return { candles, countdown };
}

// ── ChartPanel Component ─────────────────────────────────────────────────────
export function ChartPanel() {
  const [symbol, setSymbol] = useState("BTC/USDT");
  const [timeframe, setTimeframe] = useState("1m");
  const [tradingBoxOpen, setTradingBoxOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 400 });
  const [showSymbolPicker, setShowSymbolPicker] = useState(false);

  const { candles, countdown } = useLiveCandles(symbol, timeframe);
  const prediction = useRef(getPrediction(symbol)).current;
  const assets = useRef(getMarketAssets()).current;
  const currentAsset = assets.find(a => a.symbol === symbol);

  // Track live price
  const livePrice = candles.length > 0 ? candles[candles.length - 1].close : (currentAsset?.price || 0);
  const prevClose = candles.length > 1 ? candles[candles.length - 2].close : livePrice;
  const livePct = prevClose ? ((livePrice - prevClose) / prevClose) * 100 : 0;

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      const e = entries[0];
      if (e) setSize({ w: e.contentRect.width, h: e.contentRect.height });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const tfSecs = getTimeframeSeconds(timeframe);
  const pctElapsed = 1 - (countdown / tfSecs);

  const dirColor = prediction?.direction === "bullish" ? "#00FF9D" : prediction?.direction === "bearish" ? "#FF3B3B" : "#FF9500";

  return (
    <div className="flex flex-col h-full bg-background">
      {/* ── Header ── */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border flex-shrink-0 flex-wrap">
        {/* Symbol picker */}
        <div className="relative">
          <button
            onClick={() => setShowSymbolPicker(p => !p)}
            className="flex items-center gap-1.5 bg-card border border-border text-foreground text-xs px-2.5 py-1.5 rounded font-mono hover:border-cyan-400/50 transition-colors"
          >
            <span className="font-bold">{symbol}</span>
            <ChevronDown size={11} className="text-muted-foreground" />
          </button>
          {showSymbolPicker && (
            <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-xl z-50 min-w-[140px] py-1">
              {SYMBOLS.map(s => (
                <button
                  key={s}
                  onClick={() => { setSymbol(s); setShowSymbolPicker(false); }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-mono hover:bg-border/40 transition-colors ${s === symbol ? "text-cyan-400" : "text-foreground"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Timeframe buttons */}
        <div className="flex gap-0.5 flex-wrap">
          {TIMEFRAMES.map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`text-[10px] px-2 py-1 rounded font-mono transition-colors ${timeframe === tf ? "bg-cyan-400/20 text-cyan-400 border border-cyan-400/40" : "text-muted-foreground hover:text-foreground hover:bg-card"}`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Countdown */}
        <div className="flex items-center gap-1.5 border-l border-border pl-2 ml-auto">
          <div className="relative w-14 h-1.5 bg-border rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all"
              style={{ width: `${Math.min(100, pctElapsed * 100)}%`, backgroundColor: countdown < 5 ? "#ff4757" : "#00d4ff" }}
            />
          </div>
          <span
            className="text-[11px] font-mono font-bold tabular-nums min-w-[36px]"
            style={{ color: countdown < 5 ? "#ff4757" : "#94a3b8" }}
          >
            {formatCountdown(countdown)}
          </span>
          <span className="text-[9px] text-muted-foreground/50 uppercase tracking-wider">next</span>
        </div>

        {/* Live price */}
        <div className="flex items-center gap-2 border-l border-border pl-2">
          <span className="text-base font-mono font-bold text-foreground tabular-nums">{formatPrice(livePrice)}</span>
          <span className={`text-xs font-mono font-bold ${livePct >= 0 ? "text-green-400" : "text-red-400"}`}>
            {livePct >= 0 ? "+" : ""}{livePct.toFixed(2)}%
          </span>
        </div>

        {/* AI signal */}
        {prediction && (
          <div className="flex items-center gap-1.5 border-l border-border pl-2">
            <span className="text-[10px] text-muted-foreground">AI</span>
            <span className="text-[10px] font-bold" style={{ color: dirColor }}>{prediction.direction.toUpperCase()}</span>
            <div className="w-12 h-1.5 bg-border rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${prediction.confidence}%`, backgroundColor: dirColor }} />
            </div>
            <span className="text-[10px] font-mono" style={{ color: dirColor }}>{prediction.confidence.toFixed(0)}%</span>
          </div>
        )}

        {/* Trade button */}
        <button
          onClick={() => setTradingBoxOpen(true)}
          className="flex items-center gap-1.5 text-[10px] font-semibold bg-amber-400/10 text-amber-400 border border-amber-400/40 px-2.5 py-1.5 rounded hover:bg-amber-400/20 transition-colors active:scale-95"
          title="Open leverage trading calculator"
        >
          <Zap size={11} />
          Trade
        </button>
      </div>

      {/* ── Chart ── */}
      <div className="flex-1 min-h-0 overflow-hidden" ref={containerRef}>
        <CandlestickChart
          candles={candles}
          prediction={prediction}
          width={size.w}
          height={size.h}
        />
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center gap-4 px-3 py-1.5 border-t border-border bg-amber-500/5 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <AlertTriangle size={10} className="text-amber-400 flex-shrink-0" />
          <span className="text-[10px] text-amber-400/70">AI-Generated Experimental Analysis — Not Financial Advice</span>
        </div>
        {prediction && (
          <div className="flex gap-3 ml-auto">
            {prediction.factors.map(f => (
              <div key={f.name} className="flex items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground">{f.name}</span>
                <div className="w-8 h-1 bg-border rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${f.weight * 100}%`, backgroundColor: f.signal === "bullish" ? "#00FF9D" : f.signal === "bearish" ? "#FF3B3B" : "#FF9500" }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trading Box Modal */}
      {tradingBoxOpen && prediction && (
        <CryptoTradingBox
          symbol={symbol}
          currentPrice={livePrice}
          direction={prediction.direction as "bullish" | "bearish" | "neutral"}
          targetPrice={prediction.targetPrice}
          confidence={prediction.confidence}
          onClose={() => setTradingBoxOpen(false)}
        />
      )}
    </div>
  );
}
