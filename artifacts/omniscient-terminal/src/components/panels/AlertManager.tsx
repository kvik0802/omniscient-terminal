import { useState } from "react";
import { Bell, Trash2, Plus, CheckCircle, Circle } from "lucide-react";
import { getDefaultAlerts, type Alert } from "@/lib/mock-data";

export function AlertManager() {
  const [alerts, setAlerts] = useState<Alert[]>(() => getDefaultAlerts());
  const [name, setName] = useState("");
  const [condition, setCondition] = useState("");
  const [symbol, setSymbol] = useState("");
  const [channel, setChannel] = useState("browser");
  const [showForm, setShowForm] = useState(false);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !condition) return;
    const newAlert: Alert = {
      id: Date.now(),
      name,
      condition,
      symbol,
      channel,
      active: true,
      createdAt: new Date().toISOString(),
    };
    setAlerts(prev => [newAlert, ...prev]);
    setName(""); setCondition(""); setSymbol(""); setShowForm(false);
  }

  function handleDelete(id: number) {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }

  const channelColors: Record<string, string> = {
    browser: "text-cyan-400",
    email: "text-green-400",
    webhook: "text-purple-400",
    telegram: "text-blue-400",
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <Bell size={14} className="text-amber-400" />
          <span className="text-xs font-medium text-foreground">Alert Manager</span>
          <span className="text-[10px] text-muted-foreground">({alerts.length} alerts)</span>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 text-[10px] text-cyan-400 border border-cyan-400/40 bg-cyan-400/10 px-2 py-1 rounded hover:bg-cyan-400/20 transition-colors"
        >
          <Plus size={10} /> New Alert
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="border-b border-border px-3 py-3 flex-shrink-0 space-y-2 bg-card/30">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] text-muted-foreground uppercase tracking-wider">Name</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="BTC above 75k"
                className="w-full bg-background border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:border-cyan-400 mt-0.5"
              />
            </div>
            <div>
              <label className="text-[9px] text-muted-foreground uppercase tracking-wider">Symbol (optional)</label>
              <input
                value={symbol}
                onChange={e => setSymbol(e.target.value)}
                placeholder="BTC/USDT"
                className="w-full bg-background border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:border-cyan-400 mt-0.5"
              />
            </div>
          </div>
          <div>
            <label className="text-[9px] text-muted-foreground uppercase tracking-wider">Condition</label>
            <input
              value={condition}
              onChange={e => setCondition(e.target.value)}
              placeholder='BTC price > 75000 AND CNN headline contains "inflation"'
              className="w-full bg-background border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:border-cyan-400 mt-0.5"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="text-[9px] text-muted-foreground uppercase tracking-wider">Channel</label>
              <select
                value={channel}
                onChange={e => setChannel(e.target.value)}
                className="w-full bg-background border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:border-cyan-400 mt-0.5"
              >
                <option value="browser">Browser</option>
                <option value="email">Email</option>
                <option value="webhook">Webhook</option>
                <option value="telegram">Telegram</option>
              </select>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="button" onClick={() => setShowForm(false)} className="text-[10px] text-muted-foreground px-3 py-1.5 rounded border border-border hover:bg-card transition-colors">Cancel</button>
              <button type="submit" className="text-[10px] font-bold text-background bg-cyan-400 hover:bg-cyan-300 px-3 py-1.5 rounded transition-colors">
                Create Alert
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Alerts list */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <Bell size={24} className="text-border mb-3" />
            <p className="text-xs text-muted-foreground">No alerts configured</p>
            <p className="text-[10px] text-muted-foreground mt-1">Create alerts to monitor price levels, news keywords, and market conditions</p>
          </div>
        ) : (
          alerts.map(alert => (
            <div key={alert.id} className="flex items-start gap-3 px-3 py-2.5 border-b border-border hover:bg-card/40 transition-colors group">
              <div className="mt-0.5 flex-shrink-0">
                {alert.active ? <CheckCircle size={14} className="text-green-400" /> : <Circle size={14} className="text-muted-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-foreground">{alert.name}</span>
                  {alert.symbol && <span className="text-[10px] font-mono text-cyan-400">{alert.symbol}</span>}
                  <span className={`text-[9px] font-bold uppercase ${channelColors[alert.channel] || "text-muted-foreground"}`}>{alert.channel}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{alert.condition}</p>
                <p className="text-[9px] text-muted-foreground/50 mt-0.5">{new Date(alert.createdAt).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => handleDelete(alert.id)}
                className="text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 p-0.5"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
