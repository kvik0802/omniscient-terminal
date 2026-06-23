import { useState, useMemo, useEffect } from "react";
import { ExternalLink, Clock, TrendingUp, TrendingDown, Flame } from "lucide-react";
import { getNewsFeed, getNewsSentiment, type NewsArticle } from "@/lib/mock-data";

const categoryColors: Record<string, string> = {
  breaking: "border-l-red-400 bg-red-400/5",
  politics: "border-l-amber-400 bg-amber-400/5",
  finance: "border-l-cyan-400 bg-cyan-400/5",
  technology: "border-l-green-400 bg-green-400/5",
  aviation: "border-l-purple-400 bg-purple-400/5",
  crypto: "border-l-amber-400 bg-amber-400/5",
  stocks: "border-l-green-400 bg-green-400/5",
  bonds: "border-l-red-300 bg-red-300/5",
  general: "border-l-border bg-transparent",
};

const categoryBadge: Record<string, string> = {
  breaking: "bg-red-400/20 text-red-400",
  finance: "bg-cyan-400/15 text-cyan-400",
  crypto: "bg-amber-400/15 text-amber-400",
  stocks: "bg-green-400/15 text-green-400",
  bonds: "bg-red-300/15 text-red-300",
  technology: "bg-green-400/15 text-green-300",
  aviation: "bg-purple-400/15 text-purple-400",
};

const sentimentBadge: Record<string, { class: string; icon?: any }> = {
  positive: { class: "text-green-400 bg-green-400/10", icon: TrendingUp },
  negative: { class: "text-red-400 bg-red-400/10", icon: TrendingDown },
  neutral: { class: "text-muted-foreground bg-border/30" },
  urgent: { class: "text-amber-400 bg-amber-400/10 animate-pulse", icon: Flame },
};

const CATEGORIES = ["all", "breaking", "finance", "crypto", "stocks", "bonds", "technology", "aviation"] as const;

export function NewsFeed() {
  const [category, setCategory] = useState<string>("all");
  const [sentiment, setSentiment] = useState(() => getNewsSentiment());
  const [articles, setArticles] = useState<NewsArticle[]>(() => getNewsFeed("all", 40));
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Switch category → regenerate
  useEffect(() => {
    setArticles(getNewsFeed(category, 40));
  }, [category]);

  // Auto-refresh every 30 seconds with a new article prepended
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      const newItems = getNewsFeed(category, 2);
      setArticles(prev => {
        const merged = [...newItems, ...prev];
        // deduplicate by title
        const seen = new Set<string>();
        return merged.filter(a => { if (seen.has(a.title)) return false; seen.add(a.title); return true; }).slice(0, 60);
      });
      setSentiment(getNewsSentiment());
    }, 30000);
    return () => clearInterval(interval);
  }, [category, autoRefresh]);

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Sentiment bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border flex-shrink-0 text-[10px] bg-card/30">
        <span className="text-muted-foreground uppercase tracking-wider font-semibold">Global Sentiment</span>
        <div className="flex-1 flex h-2 rounded-full overflow-hidden bg-border">
          <div style={{ width: `${sentiment.positive}%` }} className="bg-green-400 h-full transition-all" />
          <div style={{ width: `${sentiment.neutral}%` }} className="bg-muted-foreground/50 h-full transition-all" />
          <div style={{ width: `${sentiment.negative}%` }} className="bg-red-400 h-full transition-all" />
        </div>
        <span className="text-green-400 font-mono font-bold">{sentiment.positive}%</span>
        <span className="text-muted-foreground/50">|</span>
        <span className="text-red-400 font-mono font-bold">{sentiment.negative}%</span>
        <div className="flex items-center gap-1 ml-2 border-l border-border pl-2">
          <span className="text-muted-foreground">Auto</span>
          <button
            onClick={() => setAutoRefresh(v => !v)}
            className={`w-7 h-3.5 rounded-full transition-colors flex items-center ${autoRefresh ? "bg-green-400/30 justify-end" : "bg-border justify-start"}`}
          >
            <div className={`w-2.5 h-2.5 rounded-full mx-0.5 transition-colors ${autoRefresh ? "bg-green-400" : "bg-muted-foreground"}`} />
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-1 px-4 py-2 border-b border-border flex-shrink-0 overflow-x-auto">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`text-[10px] px-3 py-1.5 rounded-md uppercase tracking-wider font-mono flex-shrink-0 transition-all font-semibold ${
              category === cat
                ? "bg-cyan-400/20 text-cyan-400 border border-cyan-400/40 shadow-sm shadow-cyan-400/10"
                : "text-muted-foreground hover:text-foreground hover:bg-card border border-transparent"
            }`}
          >
            {cat}
          </button>
        ))}
        <span className="text-[10px] text-muted-foreground/40 ml-auto self-center font-mono">{articles.length} articles</span>
      </div>

      {/* Articles */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {articles.map((article, idx) => {
          const sConfig = sentimentBadge[article.sentiment];
          const SentIcon = sConfig?.icon;
          return (
            <div key={article.id} className={`border-b border-border border-l-2 px-4 py-3 hover:bg-card/40 transition-colors ${categoryColors[article.category] || ""}`}>
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  {/* Title */}
                  <p className="text-sm text-foreground leading-snug font-medium">{article.title}</p>
                  {/* Summary */}
                  {article.summary && (
                    <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{article.summary}</p>
                  )}
                  {/* Meta row */}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {/* Category badge */}
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${categoryBadge[article.category] || "bg-border/30 text-muted-foreground"}`}>
                      {article.category}
                    </span>
                    {/* Source */}
                    <span className="text-[10px] text-foreground/60 font-medium">{article.source}</span>
                    {/* Time */}
                    <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                      <Clock size={9} />
                      {timeAgo(article.publishedAt)}
                    </span>
                    {/* Sentiment */}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5 font-semibold ${sConfig?.class || ""}`}>
                      {SentIcon && <SentIcon size={9} />}
                      {article.sentiment}
                    </span>
                    {/* Related symbols */}
                    {article.relatedSymbols?.map(sym => (
                      <span key={sym} className="text-[10px] text-cyan-400 font-mono bg-cyan-400/8 px-1.5 py-0.5 rounded">{sym}</span>
                    ))}
                  </div>
                </div>
                <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground flex-shrink-0 mt-0.5 p-1 rounded hover:bg-card transition-colors">
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>
          );
        })}
        {articles.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <p className="text-xs text-muted-foreground">No articles found for this category</p>
          </div>
        )}
      </div>
    </div>
  );
}
