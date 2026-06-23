import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/Sidebar";
import { NewsTicker } from "@/components/panels/NewsTicker";
import { MarketBar } from "@/components/panels/MarketBar";
import { ChartPanel } from "@/components/panels/ChartPanel";
import { SignalsPanel } from "@/components/panels/SignalsPanel";
import { WorldMapPanel } from "@/components/panels/WorldMapPanel";
import { NewsFeed } from "@/components/panels/NewsFeed";
import { SatelliteTV } from "@/components/panels/SatelliteTV";
import { PineIDE } from "@/components/panels/PineIDE";
import { AlertManager } from "@/components/panels/AlertManager";
import { Watchlist } from "@/components/panels/Watchlist";
import { TradingSimulator } from "@/components/panels/TradingSimulator";
import { Menu, RefreshCw } from "lucide-react";

export type PanelId =
  | "news"
  | "charts"
  | "signals"
  | "worldmap"
  | "simulator"
  | "tv"
  | "pine"
  | "alerts"
  | "watchlist";

const panelTitles: Record<PanelId, string> = {
  news: "Global News Feed",
  charts: "Financial Charts & AI Prediction",
  signals: "Buy/Sell Signal Engine",
  worldmap: "World Navigation Map — Markets & News",
  simulator: "Trading Simulator — Learn to Invest",
  tv: "Satellite TV",
  pine: "Pine Script IDE",
  alerts: "Alert Manager",
  watchlist: "Watchlist",
};

function PanelContent({ id, refreshKey }: { id: PanelId; refreshKey: number }) {
  switch (id) {
    case "news": return <NewsFeed key={refreshKey} />;
    case "charts": return <ChartPanel key={refreshKey} />;
    case "signals": return <SignalsPanel key={refreshKey} />;
    case "worldmap": return <WorldMapPanel key={refreshKey} />;
    case "simulator": return <TradingSimulator key={refreshKey} />;
    case "tv": return <SatelliteTV key={refreshKey} />;
    case "pine": return <PineIDE key={refreshKey} />;
    case "alerts": return <AlertManager key={refreshKey} />;
    case "watchlist": return <Watchlist key={refreshKey} />;
    default: return null;
  }
}

export default function Dashboard() {
  const [activePanel, setActivePanel] = useState<PanelId>("charts");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  function handleSelect(id: PanelId) {
    setActivePanel(id);
    setSidebarOpen(false);
  }

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setRefreshKey(prev => prev + 1);
    setTimeout(() => setIsRefreshing(false), 800);
  }, []);

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-background text-foreground">
      <NewsTicker />
      <MarketBar />

      <div className="flex flex-1 min-h-0 overflow-hidden relative bg-background">
        {/* Sidebar */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 240 }}
              exit={{ width: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="z-50 h-full overflow-hidden flex-shrink-0 shadow-2xl"
            >
              <div className="w-[240px] h-full">
                <Sidebar active={activePanel} onSelect={handleSelect} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Full-screen active panel */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePanel}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full"
            >
              {/* Panel header with REFRESH button */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/80 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSidebarOpen(prev => !prev)}
                    className="w-8 h-8 flex items-center justify-center rounded-md border border-border bg-card/50 text-muted-foreground hover:text-cyan-400 hover:border-cyan-400/50 transition-all shadow-sm flex-shrink-0"
                    title={sidebarOpen ? "Close menu" : "Open menu"}
                  >
                    <Menu size={16} />
                  </button>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse ml-2" />
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">{panelTitles[activePanel]}</span>
                </div>
                <div className="flex items-center gap-3">
                  {/* Refresh button */}
                  <button
                    onClick={handleRefresh}
                    className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-cyan-400 border border-border hover:border-cyan-400/40 px-2.5 py-1 rounded transition-all hover:bg-cyan-400/5 active:scale-95"
                    title="Refresh this panel"
                  >
                    <RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} />
                    <span className="font-medium">Refresh</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-muted-foreground font-mono">LIVE</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  </div>
                </div>
              </div>
              {/* Panel content */}
              <div className="flex-1 min-h-0 overflow-hidden">
                <PanelContent id={activePanel} refreshKey={refreshKey} />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
