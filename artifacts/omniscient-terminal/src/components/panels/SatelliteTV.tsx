import { useState, useRef, useEffect } from "react";
import { Tv, Signal, ExternalLink, AlertCircle } from "lucide-react";

const CHANNELS = [
  {
    id: "al-jazeera", name: "Al Jazeera English", region: "QA 🇶🇦", color: "#009E60",
    embedUrl: "https://www.youtube-nocookie.com/embed/live_stream?channel=UCNye-wNBqNL5ZzHSJj3l8Bg&autoplay=1&mute=0&rel=0",
    watchUrl: "https://www.youtube.com/@AlJazeeraEnglish/live",
  },
  {
    id: "france24", name: "France 24 English", region: "FR 🇫🇷", color: "#0052A5",
    embedUrl: "https://www.youtube-nocookie.com/embed/live_stream?channel=UCQfwfsi5VrQ8yKZ-UWmAEFg&autoplay=1&mute=0&rel=0",
    watchUrl: "https://www.youtube.com/@FRANCE24English/live",
  },
  {
    id: "dw", name: "DW News", region: "DE 🇩🇪", color: "#C8002D",
    embedUrl: "https://www.youtube-nocookie.com/embed/live_stream?channel=UCknLrEdhRCp1aegoMqRhGGw&autoplay=1&mute=0&rel=0",
    watchUrl: "https://www.youtube.com/@dwnews/live",
  },
  {
    id: "sky", name: "Sky News", region: "UK 🇬🇧", color: "#E8173E",
    embedUrl: "https://www.youtube-nocookie.com/embed/live_stream?channel=UCoMdktPbSTixAyNGwb-UYkQ&autoplay=1&mute=0&rel=0",
    watchUrl: "https://www.youtube.com/@SkyNews/live",
  },
  {
    id: "euronews", name: "Euronews", region: "EU 🇪🇺", color: "#0066CC",
    embedUrl: "https://www.youtube-nocookie.com/embed/live_stream?channel=UCW2QcKZiU8aUGg4yxCIditg&autoplay=1&mute=0&rel=0",
    watchUrl: "https://www.youtube.com/@euronews/live",
  },
  {
    id: "wion", name: "WION News", region: "IN 🇮🇳", color: "#FF6B35",
    embedUrl: "https://www.youtube-nocookie.com/embed/live_stream?channel=UC_gUM8rL-Lrg6O3adPW9K1g&autoplay=1&mute=0&rel=0",
    watchUrl: "https://www.youtube.com/@WIONews/live",
  },
  {
    id: "cgtn", name: "CGTN", region: "CN 🇨🇳", color: "#C8102E",
    embedUrl: "https://www.youtube-nocookie.com/embed/live_stream?channel=UCgrNz-aDmcr2uuto8_DL2jg&autoplay=1&mute=0&rel=0",
    watchUrl: "https://www.youtube.com/@CGTNOfficial/live",
  },
  {
    id: "nhk", name: "NHK World Japan", region: "JP 🇯🇵", color: "#009CDE",
    embedUrl: "https://www.youtube-nocookie.com/embed/live_stream?channel=UCi4fSGlVFOQq-h4lJFYJi8A&autoplay=1&mute=0&rel=0",
    watchUrl: "https://www.youtube.com/@NHKWorldJapan/live",
  },
  {
    id: "arirang", name: "Arirang TV", region: "KR 🇰🇷", color: "#003087",
    embedUrl: "https://www.youtube-nocookie.com/embed/live_stream?channel=UCMFMeYge_hnId6lJUglxPYQ&autoplay=1&mute=0&rel=0",
    watchUrl: "https://www.youtube.com/@arirang/live",
  },
  {
    id: "trt", name: "TRT World", region: "TR 🇹🇷", color: "#0072CE",
    embedUrl: "https://www.youtube-nocookie.com/embed/live_stream?channel=UC7fWeaHhqgM4Lba7jesJJOg&autoplay=1&mute=0&rel=0",
    watchUrl: "https://www.youtube.com/@TRTWorld/live",
  },
  {
    id: "india-today", name: "India Today", region: "IN 🇮🇳", color: "#ED1C24",
    embedUrl: "https://www.youtube-nocookie.com/embed/live_stream?channel=UCYPvAwZP8pZhSMW8qs7cVCw&autoplay=1&mute=0&rel=0",
    watchUrl: "https://www.youtube.com/@IndiaToday/live",
  },
  {
    id: "abc-au", name: "ABC Australia", region: "AU 🇦🇺", color: "#00A9CE",
    embedUrl: "https://www.youtube-nocookie.com/embed/live_stream?channel=UCVgO39Bk5sMo66-6o6Spn6Q&autoplay=1&mute=0&rel=0",
    watchUrl: "https://www.youtube.com/@ABC/live",
  },
  {
    id: "cna", name: "CNA (Asia)", region: "SG 🇸🇬", color: "#FF0000",
    embedUrl: "https://www.youtube-nocookie.com/embed/live_stream?channel=UCo8bcnLyZH8tBIH9V1mLgqQ&autoplay=1&mute=0&rel=0",
    watchUrl: "https://www.youtube.com/@CNA/live",
  },
  {
    id: "ndtv", name: "NDTV 24x7", region: "IN 🇮🇳", color: "#E41B23",
    embedUrl: "https://www.youtube-nocookie.com/embed/live_stream?channel=UCZFMm1mMw2VSvm6E5pBjKPA&autoplay=1&mute=0&rel=0",
    watchUrl: "https://www.youtube.com/@ndtv/live",
  },
];

export function SatelliteTV() {
  const [activeId, setActiveId] = useState<string>("al-jazeera");
  const [muted, setMuted] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [embedKey, setEmbedKey] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const active = CHANNELS.find(c => c.id === activeId);

  function handleChannelSelect(id: string) {
    setActiveId(id);
    setLoadError(false);
    setEmbedKey(k => k + 1);
  }

  function handleRetry() {
    setLoadError(false);
    setEmbedKey(k => k + 1);
  }

  useEffect(() => {
    setLoadError(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [activeId]);

  if (!active) return null;

  const embedUrl = `${active.embedUrl}&mute=${muted ? 1 : 0}`;

  return (
    <div className="flex flex-col h-full">
      {/* Main video area */}
      <div className="flex-1 min-h-0 border-b border-border relative bg-black">
        {loadError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-card/90">
            <AlertCircle size={40} className="text-muted-foreground/40" />
            <div className="text-center">
              <p className="text-sm text-foreground font-semibold mb-1">Live stream blocked in embed</p>
              <p className="text-xs text-muted-foreground mb-4">YouTube restricts some live streams from embedded playback</p>
              <div className="flex items-center gap-3 justify-center">
                <button
                  onClick={() => window.open(active.watchUrl, "_blank")}
                  className="flex items-center gap-2 text-xs bg-red-500/20 text-red-400 border border-red-400/40 px-4 py-2 rounded hover:bg-red-500/30 transition-colors font-semibold"
                >
                  <ExternalLink size={13} />
                  Watch Live on YouTube
                </button>
                <button
                  onClick={handleRetry}
                  className="text-xs text-cyan-400 border border-cyan-400/40 px-4 py-2 rounded hover:bg-cyan-400/10 transition-colors"
                >
                  Retry Embed
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full">
            <iframe
              key={`${activeId}-${muted}-${embedKey}`}
              src={embedUrl}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-presentation"
              style={{ border: "none" }}
              onError={() => setLoadError(true)}
            />
            {/* Fallback overlay with YouTube link — always visible so user can open externally */}
            <div className="absolute top-2 right-2 z-10">
              <button
                onClick={() => window.open(active.watchUrl, "_blank")}
                title="Open in YouTube"
                className="flex items-center gap-1.5 text-[10px] bg-black/70 text-white/80 border border-white/20 px-2.5 py-1 rounded backdrop-blur-sm hover:bg-black/90 transition-colors"
              >
                <ExternalLink size={10} />
                Open in YouTube
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Now-playing bar */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-card/60 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
          <Signal size={10} className="text-red-400" />
          <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Live</span>
        </div>
        <div style={{ color: active.color }} className="font-semibold text-xs ml-1">{active.name}</div>
        <span className="text-[10px] text-muted-foreground">{active.region}</span>
        <button
          onClick={() => window.open(active.watchUrl, "_blank")}
          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground ml-1 transition-colors"
        >
          <ExternalLink size={9} />
          <span>YouTube</span>
        </button>
        <button
          onClick={() => setMuted(m => !m)}
          className="ml-auto text-[10px] px-2 py-0.5 rounded border border-border text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors"
        >
          {muted ? "🔇 Unmute" : "🔊 Mute"}
        </button>
      </div>

      {/* Channel grid */}
      <div className="flex-shrink-0 overflow-y-auto" style={{ maxHeight: "38%" }}>
        <div className="p-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5">
          {CHANNELS.map(ch => {
            const isActive = ch.id === activeId;
            return (
              <button
                key={ch.id}
                onClick={() => handleChannelSelect(ch.id)}
                className={`flex items-center gap-2.5 p-2 rounded border text-left transition-all ${isActive ? "border-cyan-400/60 bg-cyan-400/8 ring-1 ring-cyan-400/20" : "border-border bg-card hover:border-border/70 hover:bg-card/70"}`}
              >
                <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0 text-white" style={{ backgroundColor: `${ch.color}25`, border: `1px solid ${ch.color}50` }}>
                  <Tv size={13} style={{ color: ch.color }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold text-foreground truncate leading-tight">{ch.name}</p>
                  <p className="text-[9px] text-muted-foreground">{ch.region}</p>
                </div>
                {isActive && <div className="ml-auto flex-shrink-0"><div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" /></div>}
              </button>
            );
          })}
        </div>
        <p className="text-[9px] text-muted-foreground/50 text-center pb-2 px-3">
          If the stream does not load, click "Open in YouTube" — some channels restrict embedded live playback.
        </p>
      </div>
    </div>
  );
}
