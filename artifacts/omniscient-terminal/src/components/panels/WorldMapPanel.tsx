import { useState, useMemo, useEffect, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Search, TrendingUp, TrendingDown, Newspaper, BarChart2, X, ArrowLeft, AlertTriangle, Zap } from "lucide-react";
import { getCountryStocks, getCountryNews, type CountryStock, type CountryNewsItem } from "@/lib/mock-data";

// ── Country definitions ──────────────────────────────────────────────────────
const COUNTRIES = [
  { id: "IN", name: "India", flag: "🇮🇳", lat: 20.5, lng: 78.9, color: "#FF6B35", exchange: "NSE/BSE", stockCount: 6000, region: "Asia" },
  { id: "US", name: "United States", flag: "🇺🇸", lat: 37.1, lng: -95.7, color: "#00D4FF", exchange: "NYSE/NASDAQ", stockCount: 4200, region: "Americas" },
  { id: "CN", name: "China", flag: "🇨🇳", lat: 35.9, lng: 104.2, color: "#C8102E", exchange: "SSE/SZSE", stockCount: 5300, region: "Asia" },
  { id: "JP", name: "Japan", flag: "🇯🇵", lat: 36.2, lng: 138.3, color: "#009CDE", exchange: "TSE", stockCount: 3800, region: "Asia" },
  { id: "GB", name: "United Kingdom", flag: "🇬🇧", lat: 55.4, lng: -3.4, color: "#CF142B", exchange: "LSE", stockCount: 1900, region: "Europe" },
  { id: "DE", name: "Germany", flag: "🇩🇪", lat: 51.2, lng: 10.5, color: "#FFCC00", exchange: "FSE", stockCount: 1200, region: "Europe" },
  { id: "FR", name: "France", flag: "🇫🇷", lat: 46.2, lng: 2.2, color: "#0052A5", exchange: "Euronext", stockCount: 900, region: "Europe" },
  { id: "BR", name: "Brazil", flag: "🇧🇷", lat: -14.2, lng: -51.9, color: "#009C3B", exchange: "B3", stockCount: 500, region: "Americas" },
  { id: "AU", name: "Australia", flag: "🇦🇺", lat: -25.3, lng: 133.8, color: "#00843D", exchange: "ASX", stockCount: 2100, region: "Oceania" },
  { id: "KR", name: "South Korea", flag: "🇰🇷", lat: 35.9, lng: 127.8, color: "#003087", exchange: "KRX", stockCount: 2500, region: "Asia" },
  { id: "CA", name: "Canada", flag: "🇨🇦", lat: 56.1, lng: -106.3, color: "#FF0000", exchange: "TSX", stockCount: 1500, region: "Americas" },
  { id: "AE", name: "UAE", flag: "🇦🇪", lat: 23.4, lng: 53.8, color: "#009A44", exchange: "DFM/ADX", stockCount: 150, region: "Middle East" },
  { id: "SG", name: "Singapore", flag: "🇸🇬", lat: 1.35, lng: 103.8, color: "#EF3340", exchange: "SGX", stockCount: 700, region: "Asia" },
  { id: "HK", name: "Hong Kong", flag: "🇭🇰", lat: 22.3, lng: 114.2, color: "#DE2910", exchange: "HKEX", stockCount: 2500, region: "Asia" },
  { id: "ZA", name: "South Africa", flag: "🇿🇦", lat: -30.6, lng: 22.9, color: "#007A4D", exchange: "JSE", stockCount: 350, region: "Africa" },
  { id: "MX", name: "Mexico", flag: "🇲🇽", lat: 23.6, lng: -102.6, color: "#006847", exchange: "BMV", stockCount: 140, region: "Americas" },
  { id: "ID", name: "Indonesia", flag: "🇮🇩", lat: -0.8, lng: 113.9, color: "#CE1126", exchange: "IDX", stockCount: 900, region: "Asia" },
  { id: "RU", name: "Russia", flag: "🇷🇺", lat: 61.5, lng: 105.3, color: "#0039A6", exchange: "MOEX", stockCount: 700, region: "Europe/Asia" },
];

type CountryDef = typeof COUNTRIES[0];

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatPrice(p: number) {
  if (p >= 10000) return p.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (p >= 1000) return p.toLocaleString(undefined, { maximumFractionDigits: 1 });
  if (p > 10) return p.toFixed(2);
  return p.toFixed(4);
}

function makeCandles(basePrice: number, count = 60, vol = 0.012) {
  let p = basePrice;
  return Array.from({ length: count }, () => {
    const o = p;
    const ch = p * (Math.random() - 0.47) * vol;
    const c = p + ch;
    const h = Math.max(o, c) * (1 + Math.random() * 0.004);
    const l = Math.min(o, c) * (1 - Math.random() * 0.004);
    p = c;
    return { open: o, high: h, low: l, close: c };
  });
}

// ── Mini SVG Candlestick ──────────────────────────────────────────────────────
function MiniCandlestick({ candles, width = 60, height = 24 }: {
  candles: { open: number; high: number; low: number; close: number }[];
  width?: number; height?: number;
}) {
  if (!candles.length) return null;
  const allP = candles.flatMap(c => [c.high, c.low]);
  const minP = Math.min(...allP) * 0.999;
  const maxP = Math.max(...allP) * 1.001;
  const range = maxP - minP || 1;
  const py = (p: number) => height - ((p - minP) / range) * height;
  const step = width / candles.length;
  const bw = Math.max(1.5, step * 0.58);
  return (
    <svg width={width} height={height} style={{ display: "block", flexShrink: 0 }}>
      {candles.map((c, i) => {
        const cx = i * step + step / 2;
        const bull = c.close >= c.open;
        const color = bull ? "#00d97e" : "#ff4757";
        const bodyTop = py(Math.max(c.open, c.close));
        const bodyBot = py(Math.min(c.open, c.close));
        return (
          <g key={i}>
            <line x1={cx} y1={py(c.high)} x2={cx} y2={py(c.low)} stroke={color} strokeWidth={0.8} opacity={0.7} />
            <rect x={cx - bw / 2} y={bodyTop} width={bw} height={Math.max(1, bodyBot - bodyTop)} fill={color} opacity={0.85} />
          </g>
        );
      })}
    </svg>
  );
}

// ── Full SVG Candlestick Chart (for Stock Detail) ─────────────────────────────
function FullCandlestickChart({ candles, prediction, width, height }: {
  candles: { open: number; high: number; low: number; close: number }[];
  prediction: { direction: string; targetPrice: number; upperBound: number; lowerBound: number } | null;
  width: number; height: number;
}) {
  const [hover, setHover] = useState<{ idx: number; x: number; y: number } | null>(null);
  const PAD = { top: 20, right: 80, bottom: 28, left: 8 };
  const cw = width - PAD.left - PAD.right;
  const ch = height - PAD.top - PAD.bottom;
  const maxV = Math.max(10, Math.floor(cw / 10));
  const visible = candles.slice(-maxV);
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
  const labels = Array.from({ length: 7 }, (_, i) => ({
    p: minP + (range * i) / 6,
    y: py(minP + (range * i) / 6),
  }));
  const dirColor = prediction?.direction === "bullish" ? "#00FF9D" : "#FF3B3B";

  return (
    <svg width={width} height={height} style={{ display: "block" }}
      onMouseLeave={() => setHover(null)}
      onMouseMove={e => {
        const rect = e.currentTarget.getBoundingClientRect();
        const mx = e.clientX - rect.left - PAD.left;
        const idx = Math.min(n - 1, Math.max(0, Math.floor(mx / step)));
        setHover({ idx, x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
    >
      {labels.map((l, i) => (
        <g key={i}>
          <line x1={PAD.left} y1={l.y} x2={PAD.left + cw} y2={l.y} stroke="#1a2535" strokeWidth={0.8} strokeDasharray="3 4" />
          <text x={PAD.left + cw + 5} y={l.y + 3.5} fill="#64748b" fontSize={9} fontFamily="monospace">{formatPrice(l.p)}</text>
        </g>
      ))}
      {prediction && (
        <>
          <rect x={PAD.left} y={py(prediction.upperBound)} width={cw} height={py(prediction.lowerBound) - py(prediction.upperBound)} fill={dirColor} opacity={0.05} />
          <line x1={PAD.left} y1={py(prediction.targetPrice)} x2={PAD.left + cw} y2={py(prediction.targetPrice)} stroke={dirColor} strokeWidth={1} strokeDasharray="6 3" opacity={0.8} />
          <text x={PAD.left + cw + 5} y={py(prediction.targetPrice) + 3.5} fill={dirColor} fontSize={9} fontFamily="monospace">▶ {formatPrice(prediction.targetPrice)}</text>
        </>
      )}
      {visible.map((c, i) => {
        const cx = PAD.left + i * step + step / 2;
        const bull = c.close >= c.open;
        const color = bull ? "#00d97e" : "#ff4757";
        const bodyTop = py(Math.max(c.open, c.close));
        const bodyBot = py(Math.min(c.open, c.close));
        const bodyH = Math.max(1, bodyBot - bodyTop);
        const isHov = hover?.idx === i;
        return (
          <g key={i}>
            <line x1={cx} y1={py(c.high)} x2={cx} y2={py(c.low)} stroke={color} strokeWidth={1.2} opacity={0.8} />
            <rect x={cx - bodyW / 2} y={bodyTop} width={bodyW} height={bodyH} fill={color} stroke={color} strokeWidth={isHov ? 1.5 : 0.5} opacity={bull ? 0.88 : 0.72} />
            {isHov && <line x1={cx} y1={PAD.top} x2={cx} y2={PAD.top + ch} stroke="#ffffff18" strokeWidth={1} />}
          </g>
        );
      })}
      {hover && <line x1={PAD.left} y1={hover.y} x2={PAD.left + cw} y2={hover.y} stroke="#ffffff12" strokeWidth={1} />}
      {hover && visible[hover.idx] && (() => {
        const hc = visible[hover.idx];
        const tx = Math.min(hover.x + 12, width - 115);
        const ty = Math.max(PAD.top, Math.min(hover.y - 45, height - 90));
        const bull = hc.close >= hc.open;
        return (
          <g>
            <rect x={tx} y={ty} width={110} height={78} rx={4} fill="#0f1623" stroke="#1a2535" strokeWidth={1} />
            <text x={tx + 6} y={ty + 14} fill="#94a3b8" fontSize={9} fontFamily="monospace">O  {formatPrice(hc.open)}</text>
            <text x={tx + 6} y={ty + 26} fill="#00d97e" fontSize={9} fontFamily="monospace">H  {formatPrice(hc.high)}</text>
            <text x={tx + 6} y={ty + 38} fill="#ff4757" fontSize={9} fontFamily="monospace">L  {formatPrice(hc.low)}</text>
            <text x={tx + 6} y={ty + 50} fill={bull ? "#00d97e" : "#ff4757"} fontSize={9} fontFamily="monospace">C  {formatPrice(hc.close)}</text>
          </g>
        );
      })()}
    </svg>
  );
}

// ── Stock Detail Full-Screen ───────────────────────────────────────────────────
const TIMEFRAMES_DETAIL = ["1m", "5m", "15m", "1h", "4h", "1d"];

function StockDetailView({ stock, country, onClose }: { stock: CountryStock; country: CountryDef; onClose: () => void }) {
  const [tf, setTf] = useState("5m");
  const [candles, setCandles] = useState(() => makeCandles(stock.price, 100));
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 300 });
  const priceRef = useRef(stock.price);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(e => {
      const r = e[0];
      if (r) setSize({ w: r.contentRect.width, h: r.contentRect.height });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const vol = 0.002;
    const interval = setInterval(() => {
      const drift = (Math.random() - 0.47) * vol;
      const newP = priceRef.current * (1 + drift);
      priceRef.current = newP;
      setCandles(prev => {
        const updated = [...prev];
        const last = { ...updated[updated.length - 1] };
        last.close = newP;
        last.high = Math.max(last.high, newP);
        last.low = Math.min(last.low, newP);
        updated[updated.length - 1] = last;
        return updated;
      });
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const livePrice = candles[candles.length - 1]?.close || stock.price;
  const isUp = stock.change >= 0;
  const direction = isUp ? "bullish" : "bearish";
  const dirColor = isUp ? "#00FF9D" : "#FF3B3B";
  const confidence = Math.min(92, 55 + Math.abs(stock.change) * 4 + Math.random() * 10);
  const targetPrice = livePrice * (isUp ? 1 + Math.random() * 0.08 + 0.02 : 1 - Math.random() * 0.08 - 0.02);
  const upperBound = targetPrice * 1.03;
  const lowerBound = targetPrice * 0.97;

  const stats = [
    { label: "Market Cap", value: `${(stock.price * (Math.random() * 900 + 100)).toLocaleString(undefined, { maximumFractionDigits: 0 })} Cr` },
    { label: "P/E Ratio", value: (12 + Math.random() * 40).toFixed(1) },
    { label: "52W High", value: formatPrice(stock.price * (1 + Math.random() * 0.4)) },
    { label: "52W Low", value: formatPrice(stock.price * (1 - Math.random() * 0.35)) },
    { label: "Avg Volume", value: `${(Math.random() * 50 + 5).toFixed(1)}M` },
    { label: "Beta", value: (0.5 + Math.random() * 1.5).toFixed(2) },
    { label: "Dividend", value: `${(Math.random() * 4).toFixed(2)}%` },
    { label: "Sector", value: stock.sector },
  ];

  const factors = [
    { name: "Momentum", signal: isUp ? "bullish" : "bearish", weight: 0.4 + Math.random() * 0.5 },
    { name: "Volume", signal: Math.random() > 0.4 ? "bullish" : "bearish", weight: 0.3 + Math.random() * 0.5 },
    { name: "RSI", signal: Math.random() > 0.5 ? "bullish" : "neutral", weight: 0.2 + Math.random() * 0.6 },
    { name: "MACD", signal: isUp ? "bullish" : "bearish", weight: 0.5 + Math.random() * 0.4 },
  ];

  return (
    <div className="absolute inset-0 z-[2000] bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/80 flex-shrink-0">
        <button onClick={onClose} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-1.5 transition-colors hover:border-cyan-400/50">
          <ArrowLeft size={13} />
          Back
        </button>
        <div className="flex items-center gap-2 ml-1">
          <span className="text-base">{country.flag}</span>
          <span className="text-sm font-mono font-bold text-foreground">{stock.symbol}</span>
          <span className="text-[10px] text-muted-foreground bg-border/50 px-1.5 py-0.5 rounded">{country.exchange}</span>
          <span className="text-[10px] text-muted-foreground">{stock.sector}</span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <div>
            <div className="text-xl font-mono font-bold text-foreground">{formatPrice(livePrice)}</div>
            <div className={`text-xs font-mono font-bold ${isUp ? "text-green-400" : "text-red-400"}`}>
              {isUp ? "+" : ""}{stock.change.toFixed(2)}%
            </div>
          </div>
          <div className="border-l border-border pl-4">
            <div className="text-[10px] text-muted-foreground">AI Signal</div>
            <div className="flex items-center gap-2 mt-0.5">
              <Zap size={11} style={{ color: dirColor }} />
              <span className="text-xs font-bold" style={{ color: dirColor }}>{direction.toUpperCase()}</span>
              <div className="w-16 h-1.5 bg-border rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${confidence}%`, backgroundColor: dirColor }} />
              </div>
              <span className="text-xs font-mono" style={{ color: dirColor }}>{confidence.toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Company name */}
      <div className="px-4 py-2 border-b border-border/40 bg-card/30 flex-shrink-0">
        <span className="text-sm text-foreground font-medium">{stock.name}</span>
        <span className="text-xs text-muted-foreground ml-3">{country.name} · {country.exchange}</span>
      </div>

      {/* Timeframe buttons */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-border/40 flex-shrink-0">
        {TIMEFRAMES_DETAIL.map(t => (
          <button key={t} onClick={() => setTf(t)}
            className={`text-[10px] px-2.5 py-1 rounded font-mono transition-colors ${tf === t ? "bg-cyan-400/20 text-cyan-400 border border-cyan-400/40" : "text-muted-foreground hover:text-foreground hover:bg-card"}`}>
            {t}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Live</span>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0 overflow-hidden" ref={containerRef}>
        <FullCandlestickChart
          candles={candles}
          prediction={{ direction, targetPrice, upperBound, lowerBound }}
          width={size.w}
          height={size.h}
        />
      </div>

      {/* AI Disclaimer */}
      <div className="flex items-center gap-2 px-4 py-1.5 bg-amber-500/5 border-t border-border flex-shrink-0">
        <AlertTriangle size={10} className="text-amber-400" />
        <span className="text-[10px] text-amber-400/70">AI-Generated Experimental Analysis — Not Financial Advice</span>
        <div className="ml-auto flex gap-4">
          {factors.map(f => (
            <div key={f.name} className="flex items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground">{f.name}</span>
              <div className="w-10 h-1 bg-border rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${f.weight * 100}%`, backgroundColor: f.signal === "bullish" ? "#00FF9D" : f.signal === "bearish" ? "#FF3B3B" : "#FF9500" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-8 border-t border-border flex-shrink-0 bg-card/40">
        {stats.map(s => (
          <div key={s.label} className="flex flex-col items-center justify-center py-3 border-r last:border-r-0 border-border/40">
            <div className="text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">{s.label}</div>
            <div className="text-[11px] font-mono font-semibold text-foreground">{s.value}</div>
          </div>
        ))}
      </div>

      {/* AI Prediction Summary */}
      <div className="flex items-center gap-4 px-4 py-3 border-t border-border bg-card/30 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dirColor }} />
          <span className="text-xs font-bold" style={{ color: dirColor }}>
            {direction === "bullish" ? "📈 BULLISH" : "📉 BEARISH"} — {confidence.toFixed(0)}% confidence
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          Target: <span style={{ color: dirColor }}>{formatPrice(targetPrice)}</span>
          <span className="ml-2 text-muted-foreground/60">Range: {formatPrice(lowerBound)} – {formatPrice(upperBound)}</span>
        </span>
      </div>
    </div>
  );
}

// ── Stock Row ─────────────────────────────────────────────────────────────────
function StockRow({ stock, onClick }: { stock: CountryStock; onClick: () => void }) {
  const [candles] = useState(() => makeCandles(stock.price, 20, 0.018));
  const isUp = stock.change >= 0;
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-cyan-400/5 border-b border-border/30 transition-colors text-left group"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-mono font-bold text-foreground group-hover:text-cyan-400 transition-colors">{stock.symbol}</span>
          <span className="text-[9px] text-muted-foreground/60 truncate">{stock.sector}</span>
        </div>
        <p className="text-[10px] text-muted-foreground truncate leading-tight">{stock.name}</p>
      </div>
      <MiniCandlestick candles={candles} width={60} height={24} />
      <div className="text-right flex-shrink-0 ml-1 min-w-[60px]">
        <div className="text-[11px] font-mono font-bold text-foreground">{formatPrice(stock.price)}</div>
        <div className={`text-[10px] font-mono font-bold flex items-center justify-end gap-0.5 ${isUp ? "text-green-400" : "text-red-400"}`}>
          {isUp ? <TrendingUp size={8} /> : <TrendingDown size={8} />}
          {isUp ? "+" : ""}{stock.change.toFixed(2)}%
        </div>
      </div>
    </button>
  );
}

// ── News Row ──────────────────────────────────────────────────────────────────
function NewsRow({ item }: { item: CountryNewsItem }) {
  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  }
  const sentColor = item.sentiment === "positive" ? "text-green-400 bg-green-400/10" : item.sentiment === "negative" ? "text-red-400 bg-red-400/10" : "text-muted-foreground bg-border/30";
  return (
    <div className="border-b border-border/30 px-3 py-2.5 hover:bg-card/40 transition-colors">
      <p className="text-[11px] text-foreground font-medium leading-snug">{item.title}</p>
      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
        <span className="text-[9px] text-muted-foreground">{item.source}</span>
        <span className="text-[9px] text-muted-foreground/50">{timeAgo(item.publishedAt)}</span>
        {item.symbol && <span className="text-[9px] text-cyan-400 font-mono bg-cyan-400/10 px-1.5 py-0.5 rounded">{item.symbol}</span>}
        <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${sentColor}`}>{item.sentiment}</span>
      </div>
    </div>
  );
}

// ── Country Panel ─────────────────────────────────────────────────────────────
function CountryPanel({ country, onClose }: { country: CountryDef; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"stocks" | "news">("stocks");
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [stockPage, setStockPage] = useState(0);
  const [tick, setTick] = useState(0);
  const [selectedStock, setSelectedStock] = useState<CountryStock | null>(null);
  const STOCKS_PER_PAGE = 80;

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 15000);
    return () => clearInterval(interval);
  }, []);

  const stocks = useMemo(() => getCountryStocks(country.id, country.stockCount), [country.id, tick]);
  const news = useMemo(() => getCountryNews(country.id, 60), [country.id, tick]);

  const sectors = useMemo(() => {
    const s = new Set(stocks.map(st => st.sector));
    return ["all", ...Array.from(s).sort()];
  }, [stocks]);

  const filtered = useMemo(() =>
    stocks.filter(st => {
      const ms = !search || st.symbol.toLowerCase().includes(search.toLowerCase()) || st.name.toLowerCase().includes(search.toLowerCase());
      const mf = sectorFilter === "all" || st.sector === sectorFilter;
      return ms && mf;
    }), [stocks, search, sectorFilter]);

  const paged = useMemo(() => filtered.slice(stockPage * STOCKS_PER_PAGE, (stockPage + 1) * STOCKS_PER_PAGE), [filtered, stockPage]);
  const totalPages = Math.ceil(filtered.length / STOCKS_PER_PAGE);

  const gainers = stocks.filter(s => s.change > 0).length;
  const losers = stocks.filter(s => s.change < 0).length;
  const [indexCandles] = useState(() => makeCandles(10000 + Math.random() * 5000, 40));

  return (
    <div className="absolute top-0 right-0 bottom-0 w-[44%] z-[1000] border-l border-border flex flex-col bg-background shadow-2xl">
      {/* Stock detail overlay */}
      {selectedStock && (
        <StockDetailView
          stock={selectedStock}
          country={country}
          onClose={() => setSelectedStock(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-3 px-3 py-3 border-b border-border bg-card/80 flex-shrink-0">
        <span className="text-2xl">{country.flag}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-foreground">{country.name}</h2>
            <span className="text-[9px] font-mono text-muted-foreground bg-border/50 px-1.5 py-0.5 rounded">{country.exchange}</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] mt-0.5">
            <span className="text-muted-foreground">{country.stockCount.toLocaleString()} stocks</span>
            <span className="text-green-400 font-mono">{gainers} ↑</span>
            <span className="text-red-400 font-mono">{losers} ↓</span>
          </div>
        </div>
        <MiniCandlestick candles={indexCandles.slice(-20)} width={80} height={32} />
        <button onClick={onClose} className="p-1.5 rounded hover:bg-border/50 text-muted-foreground hover:text-foreground transition-colors">
          <X size={14} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border flex-shrink-0">
        <button onClick={() => setActiveTab("stocks")} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-semibold uppercase tracking-wider transition-colors ${activeTab === "stocks" ? "text-cyan-400 border-b-2 border-cyan-400 bg-cyan-400/5" : "text-muted-foreground hover:text-foreground"}`}>
          <BarChart2 size={12} />
          Stocks ({filtered.length.toLocaleString()})
        </button>
        <button onClick={() => setActiveTab("news")} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-semibold uppercase tracking-wider transition-colors ${activeTab === "news" ? "text-red-400 border-b-2 border-red-400 bg-red-400/5" : "text-muted-foreground hover:text-foreground"}`}>
          <Newspaper size={12} />
          News 24/7
        </button>
      </div>

      {activeTab === "stocks" && (
        <>
          {/* Tap-to-view hint */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-400/5 border-b border-cyan-400/10 flex-shrink-0">
            <span className="text-[9px] text-cyan-400/70">Tap any stock to view full chart & AI prediction →</span>
          </div>
          <div className="flex flex-col gap-1.5 px-2 py-2 border-b border-border flex-shrink-0 bg-card/30">
            <div className="relative">
              <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setStockPage(0); }}
                placeholder="Search symbol or company..."
                className="w-full bg-background border border-border rounded-md pl-7 pr-3 py-1.5 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-400/60"
              />
            </div>
            <div className="flex gap-1 overflow-x-auto pb-0.5">
              {sectors.slice(0, 10).map(sec => (
                <button key={sec} onClick={() => { setSectorFilter(sec); setStockPage(0); }}
                  className={`text-[9px] px-2 py-1 rounded flex-shrink-0 font-mono uppercase tracking-wider transition-colors ${sectorFilter === sec ? "bg-amber-400/20 text-amber-400 border border-amber-400/40" : "text-muted-foreground hover:text-foreground border border-transparent hover:border-border/50"}`}>
                  {sec === "all" ? "All" : sec.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto min-h-0">
            {paged.map((s, i) => (
              <StockRow key={s.symbol + i} stock={s} onClick={() => setSelectedStock(s)} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-3 py-2 border-t border-border flex-shrink-0 bg-card/30">
              <button onClick={() => setStockPage(p => Math.max(0, p - 1))} disabled={stockPage === 0} className="text-[10px] px-2 py-1 rounded border border-border text-muted-foreground disabled:opacity-30 hover:text-foreground">Prev</button>
              <span className="text-[10px] text-muted-foreground font-mono">{stockPage + 1}/{totalPages} · {filtered.length.toLocaleString()} stocks</span>
              <button onClick={() => setStockPage(p => Math.min(totalPages - 1, p + 1))} disabled={stockPage >= totalPages - 1} className="text-[10px] px-2 py-1 rounded border border-border text-muted-foreground disabled:opacity-30 hover:text-foreground">Next</button>
            </div>
          )}
        </>
      )}

      {activeTab === "news" && (
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-card/30 sticky top-0">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            <span className="text-[9px] text-red-400 font-bold uppercase tracking-wider">Live 24/7 · {country.name}</span>
          </div>
          {news.map((item, i) => <NewsRow key={item.id + i} item={item} />)}
        </div>
      )}
    </div>
  );
}

// ── Map Controller ────────────────────────────────────────────────────────────
function MapController({ selectedCountry }: { selectedCountry: CountryDef | null }) {
  const map = useMap();
  useEffect(() => {
    if (selectedCountry) {
      map.setView([selectedCountry.lat, selectedCountry.lng], 4, { animate: true });
    } else {
      map.setView([20, 10], 2, { animate: true });
    }
  }, [selectedCountry?.id]);
  return null;
}

// ── Main WorldMapPanel ────────────────────────────────────────────────────────
export function WorldMapPanel() {
  const [selectedCountry, setSelectedCountry] = useState<CountryDef | null>(null);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Map fills entire panel */}
      <MapContainer
        center={[20, 10]}
        zoom={2}
        style={{ position: "absolute", inset: 0, background: "#040c1a" }}
        zoomControl={true}
        scrollWheelZoom={true}
        minZoom={1}
        maxZoom={18}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          subdomains="abcd"
          maxZoom={19}
        />
        <MapController selectedCountry={selectedCountry} />

        {COUNTRIES.map(country => {
          const isSelected = selectedCountry?.id === country.id;
          return (
            <CircleMarker
              key={country.id}
              center={[country.lat, country.lng]}
              radius={isSelected ? 16 : 10}
              pathOptions={{
                color: "#ffffff",
                fillColor: country.color,
                fillOpacity: isSelected ? 1 : 0.75,
                weight: isSelected ? 3 : 1.5,
              }}
              eventHandlers={{ click: () => setSelectedCountry(prev => prev?.id === country.id ? null : country) }}
            >
              <Popup>
                <div style={{ fontFamily: "monospace", minWidth: 170, color: "#e2e8f0" }}>
                  <div style={{ fontWeight: "bold", fontSize: 14, marginBottom: 4 }}>{country.flag} {country.name}</div>
                  <div style={{ color: "#94a3b8", fontSize: 11, marginBottom: 4 }}>{country.exchange}</div>
                  <div style={{ color: country.color, fontSize: 12, marginBottom: 8 }}>{country.stockCount.toLocaleString()} listed stocks</div>
                  <button
                    onClick={() => setSelectedCountry(country)}
                    style={{ width: "100%", padding: "6px 10px", background: country.color + "28", color: country.color, border: `1px solid ${country.color}55`, borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: "bold" }}
                  >
                    View Stocks & Charts →
                  </button>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Hint overlay (only when no country selected) */}
      {!selectedCountry && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] text-[10px] text-white/60 bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm pointer-events-none flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
          Click any country marker to explore stocks & live news
        </div>
      )}

      {/* Country Panel — absolute overlay on the right */}
      {selectedCountry && (
        <CountryPanel
          country={selectedCountry}
          onClose={() => setSelectedCountry(null)}
        />
      )}
    </div>
  );
}
