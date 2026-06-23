import { Activity, BarChart2, Map, Radio, Code, Bell, List, Newspaper, Eye, BookOpen } from "lucide-react";
import type { PanelId } from "@/pages/Dashboard";

const navItems: { id: PanelId; icon: React.ElementType; label: string; color: string }[] = [
  { id: "news", icon: Newspaper, label: "Global News Feed", color: "text-red-400" },
  { id: "charts", icon: BarChart2, label: "Financial Charts", color: "text-cyan-400" },
  { id: "signals", icon: Activity, label: "Buy/Sell Signals", color: "text-green-400" },
  { id: "worldmap", icon: Map, label: "World Map & Stocks", color: "text-amber-400" },
  { id: "simulator", icon: BookOpen, label: "Trading Simulator", color: "text-green-400" },
  { id: "tv", icon: Radio, label: "Satellite TV", color: "text-purple-400" },
  { id: "pine", icon: Code, label: "Pine Script IDE", color: "text-green-400" },
  { id: "alerts", icon: Bell, label: "Alert Manager", color: "text-amber-400" },
  { id: "watchlist", icon: List, label: "Watchlist", color: "text-cyan-400" },
];

interface SidebarProps {
  active: PanelId;
  onSelect: (id: PanelId) => void;
}

export function Sidebar({ active, onSelect }: SidebarProps) {
  return (
    <div className="w-60 bg-card/95 backdrop-blur-md border-r border-border flex flex-col h-full shadow-2xl">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
        <div className="w-9 h-9 rounded-lg bg-cyan-400/15 flex items-center justify-center border border-cyan-400/40 flex-shrink-0">
          <Eye size={18} className="text-cyan-400" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-foreground tracking-tight">OMNISCIENT</h1>
          <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Mission Control</p>
        </div>
      </div>

      <div className="flex flex-col gap-0.5 px-2 py-3 flex-1 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all text-left group ${
                isActive
                  ? `bg-cyan-400/10 ${item.color}`
                  : "text-muted-foreground hover:text-foreground hover:bg-border/30"
              }`}
            >
              {isActive && (
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-7 rounded-r ${item.color.replace("text-", "bg-")}`} />
              )}
              <Icon size={17} className={isActive ? item.color : ""} />
              <span className={`text-xs font-medium ${isActive ? "text-foreground" : ""}`}>{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      <div className="px-4 py-3 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] text-muted-foreground">All Systems Operational</span>
        </div>
      </div>
    </div>
  );
}
