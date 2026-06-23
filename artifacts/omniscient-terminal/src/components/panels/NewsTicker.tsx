import { useEffect, useRef, useState } from "react";
import { getNewsTicker, type TickerItem } from "@/lib/mock-data";

const categoryColors: Record<string, string> = {
  breaking: "text-red-400",
  politics: "text-amber-400",
  finance: "text-cyan-400",
  technology: "text-green-400",
  aviation: "text-purple-400",
  general: "text-gray-400",
  crypto: "text-amber-400",
  stocks: "text-green-400",
  bonds: "text-red-300",
};

const categoryLabels: Record<string, string> = {
  breaking: "BREAKING",
  politics: "POLITICS",
  finance: "MARKETS",
  technology: "TECH",
  aviation: "AVIATION",
  general: "NEWS",
  crypto: "CRYPTO",
  stocks: "STOCKS",
  bonds: "BONDS",
};

export function NewsTicker() {
  const [items] = useState<TickerItem[]>(() => getNewsTicker());
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trackRef.current || !items.length) return;
    const el = trackRef.current;
    let pos = 0;
    let raf: number;
    const speed = 0.5;

    function step() {
      const totalWidth = el.scrollWidth / 2;
      pos += speed;
      if (pos >= totalWidth) pos = 0;
      el.style.transform = `translateX(-${pos}px)`;
      raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [items]);

  const doubled = [...items, ...items];

  return (
    <div className="h-8 bg-card border-b border-border flex items-center overflow-hidden flex-shrink-0">
      <div className="flex-shrink-0 px-3 border-r border-border h-full flex items-center bg-red-500/10">
        <span className="text-xs font-bold text-red-400 tracking-widest whitespace-nowrap">LIVE</span>
      </div>
      <div className="flex-1 overflow-hidden relative">
        <div ref={trackRef} className="flex items-center gap-8 whitespace-nowrap" style={{ willChange: "transform" }}>
          {doubled.map((item, i) => (
            <div key={`${item.id}-${i}`} className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-[10px] font-bold tracking-wider ${categoryColors[item.category] || "text-muted-foreground"} bg-current/10 px-1.5 py-0.5 rounded`}>
                {categoryLabels[item.category] || "NEWS"}
              </span>
              <span className="text-xs text-foreground">{item.headline}</span>
              {item.symbol && (
                <span className={`text-xs font-mono font-bold ${(item.change || 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {item.symbol} {(item.change || 0) >= 0 ? "+" : ""}{item.change?.toFixed(2)}%
                </span>
              )}
              <span className="text-muted-foreground text-xs select-none mx-2">•</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
