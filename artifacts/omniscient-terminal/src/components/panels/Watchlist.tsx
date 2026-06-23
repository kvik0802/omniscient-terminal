import { useState, useMemo } from "react";
import { Plus, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { getDefaultWatchlist, getWatchlistPrices, type WatchlistItem } from "@/lib/mock-data";

const ASSET_TYPES = ["crypto", "stocks", "etf", "forex", "bonds"] as const;

export function Watchlist() {
  const [items, setItems] = useState<WatchlistItem[]>(() => getDefaultWatchlist());
  const prices = useMemo(() => getWatchlistPrices(), []);

  const [showForm, setShowForm] = useState(false);
  const [symbol, setSymbol] = useState("");
  const [assetName, setAssetName] = useState("");
  const [type, setType] = useState<typeof ASSET_TYPES[number]>("crypto");

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!symbol || !assetName) return;
    const newItem: WatchlistItem = {
      id: Date.now(),
      symbol: symbol.toUpperCase(),
      name: assetName,
      type,
    };
    setItems(prev => [...prev, newItem]);
    setSymbol(""); setAssetName(""); setShowForm(false);
  }

  function handleRemove(id: number) {
    setItems(prev => prev.filter(i => i.id !== id));
  }

  const typeColors: Record<string, string> = {
    crypto: "text-cyan-400",
    stocks: "text-green-400",
    etf: "text-purple-400",
    forex: "text-amber-400",
    bonds: "text-red-400",
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border flex-shrink-0">
        <span className="text-xs font-medium text-foreground">Watchlist</span>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 text-[10px] text-cyan-400 border border-cyan-400/40 bg-cyan-400/10 px-2 py-1 rounded hover:bg-cyan-400/20 transition-colors"
        >
          <Plus size={10} /> Add
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <form onSubmit={handleAdd} className="border-b border-border px-3 py-2 flex-shrink-0 bg-card/30 space-y-1.5">
          <div className="grid grid-cols-2 gap-2">
            <input
              value={symbol}
              onChange={e => setSymbol(e.target.value)}
              placeholder="Symbol (e.g. BTC/USDT)"
              className="bg-background border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:border-cyan-400"
            />
            <input
              value={assetName}
              onChange={e => setAssetName(e.target.value)}
              placeholder="Name (e.g. Bitcoin)"
              className="bg-background border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div className="flex gap-2 items-center">
            <select
              value={type}
              onChange={e => setType(e.target.value as typeof ASSET_TYPES[number])}
              className="flex-1 bg-background border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:border-cyan-400"
            >
              {ASSET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <button type="button" onClick={() => setShowForm(false)} className="text-[10px] text-muted-foreground px-2 py-1 rounded border border-border hover:bg-card">Cancel</button>
            <button type="submit" className="text-[10px] font-bold text-background bg-cyan-400 hover:bg-cyan-300 px-3 py-1 rounded">
              Add
            </button>
          </div>
        </form>
      )}

      {/* Items */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <p className="text-xs text-muted-foreground">Your watchlist is empty</p>
            <p className="text-[10px] text-muted-foreground mt-1">Add symbols to track them here</p>
          </div>
        ) : (
          items.map(item => {
            const live = prices[item.symbol];
            return (
              <div key={item.id} className="flex items-center gap-3 px-3 py-2.5 border-b border-border hover:bg-card/40 transition-colors group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-foreground">{item.symbol}</span>
                    <span className={`text-[9px] font-semibold uppercase ${typeColors[item.type] || "text-muted-foreground"}`}>{item.type}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{item.name}</span>
                </div>
                {live ? (
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs font-mono font-bold text-foreground">
                      {live.price > 100 ? live.price.toLocaleString() : live.price.toFixed(4)}
                    </div>
                    <div className={`text-[10px] font-mono font-bold flex items-center justify-end gap-0.5 ${live.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {live.change >= 0 ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                      {live.change >= 0 ? "+" : ""}{live.change.toFixed(2)}%
                    </div>
                  </div>
                ) : (
                  <div className="text-[10px] text-muted-foreground">N/A</div>
                )}
                <button
                  onClick={() => handleRemove(item.id)}
                  className="text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 p-0.5"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
