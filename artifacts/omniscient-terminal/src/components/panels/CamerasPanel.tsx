import { useState } from "react";
import { Play, Users, X, Maximize2 } from "lucide-react";

// Curated live cameras with verified working YouTube embed IDs or stream URLs
const CAMERAS = [
  {
    id: "iss",
    name: "International Space Station",
    location: "Low Earth Orbit • 408 km",
    category: "space",
    // NASA ISS HD Earth Viewing Experiment - official NASA live stream
    embedUrl: "https://www.youtube.com/embed/xRPjKQtRXR8?autoplay=1&mute=1&rel=0&modestbranding=1",
    thumbnail: "https://img.youtube.com/vi/xRPjKQtRXR8/mqdefault.jpg",
    isLive: true,
    viewerCount: 98000,
  },
  {
    id: "earthfromspace",
    name: "Earth from Space — NASA Live",
    location: "Geostationary Orbit",
    category: "space",
    embedUrl: "https://www.youtube.com/embed/21X5lGlDOfg?autoplay=1&mute=1&rel=0&modestbranding=1",
    thumbnail: "https://img.youtube.com/vi/21X5lGlDOfg/mqdefault.jpg",
    isLive: true,
    viewerCount: 45000,
  },
  {
    id: "times-square",
    name: "Times Square Live",
    location: "New York, USA",
    category: "cityscape",
    embedUrl: "https://www.youtube.com/embed/mfG91pORCLE?autoplay=1&mute=1&rel=0&modestbranding=1",
    thumbnail: "https://img.youtube.com/vi/mfG91pORCLE/mqdefault.jpg",
    isLive: true,
    viewerCount: 42000,
  },
  {
    id: "niagara",
    name: "Niagara Falls Live",
    location: "Ontario, Canada",
    category: "nature",
    embedUrl: "https://www.youtube.com/embed/8AMsIxVtXIY?autoplay=1&mute=1&rel=0&modestbranding=1",
    thumbnail: "https://img.youtube.com/vi/8AMsIxVtXIY/mqdefault.jpg",
    isLive: true,
    viewerCount: 9800,
  },
  {
    id: "volcano",
    name: "Kilauea Volcano — USGS",
    location: "Hawaii, USA",
    category: "volcano",
    embedUrl: "https://www.youtube.com/embed/zFIWWM0Iy_I?autoplay=1&mute=1&rel=0&modestbranding=1",
    thumbnail: "https://img.youtube.com/vi/zFIWWM0Iy_I/mqdefault.jpg",
    isLive: true,
    viewerCount: 24000,
  },
  {
    id: "yellowstone",
    name: "Yellowstone Old Faithful",
    location: "Wyoming, USA",
    category: "nature",
    embedUrl: "https://www.youtube.com/embed/4-ebu_tXqEY?autoplay=1&mute=1&rel=0&modestbranding=1",
    thumbnail: "https://img.youtube.com/vi/4-ebu_tXqEY/mqdefault.jpg",
    isLive: true,
    viewerCount: 6300,
  },
  {
    id: "relaxing-earth",
    name: "Relaxing Nature — 24/7 Live",
    location: "Various Locations",
    category: "nature",
    embedUrl: "https://www.youtube.com/embed/0wAtNWA93hM?autoplay=1&mute=1&rel=0&modestbranding=1",
    thumbnail: "https://img.youtube.com/vi/0wAtNWA93hM/mqdefault.jpg",
    isLive: true,
    viewerCount: 12000,
  },
  {
    id: "nyc-skyline",
    name: "New York City Skyline",
    location: "New York, USA",
    category: "cityscape",
    embedUrl: "https://www.youtube.com/embed/1OtTmDpIvxo?autoplay=1&mute=1&rel=0&modestbranding=1",
    thumbnail: "https://img.youtube.com/vi/1OtTmDpIvxo/mqdefault.jpg",
    isLive: true,
    viewerCount: 18000,
  },
  {
    id: "lofi",
    name: "Lo-fi Chill — 24/7 Radio",
    location: "Online",
    category: "ambient",
    embedUrl: "https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&mute=1&rel=0&modestbranding=1",
    thumbnail: "https://img.youtube.com/vi/jfKfPfyJRdk/mqdefault.jpg",
    isLive: true,
    viewerCount: 30000,
  },
  {
    id: "deep-sea",
    name: "Deep Ocean — Monterey Bay",
    location: "Monterey Bay, USA",
    category: "nature",
    embedUrl: "https://www.youtube.com/embed/sRuqoFHajAg?autoplay=1&mute=1&rel=0&modestbranding=1",
    thumbnail: "https://img.youtube.com/vi/sRuqoFHajAg/mqdefault.jpg",
    isLive: true,
    viewerCount: 5200,
  },
  {
    id: "earth-relax",
    name: "Earth Relaxation — 4K",
    location: "Space",
    category: "space",
    embedUrl: "https://www.youtube.com/embed/RpDYtR3ECJM?autoplay=1&mute=1&rel=0&modestbranding=1",
    thumbnail: "https://img.youtube.com/vi/RpDYtR3ECJM/mqdefault.jpg",
    isLive: false,
    viewerCount: 7800,
  },
  {
    id: "storm",
    name: "Storm Chaser — Live Weather",
    location: "Central USA",
    category: "weather",
    embedUrl: "https://www.youtube.com/embed/sHlWMhShGxo?autoplay=1&mute=1&rel=0&modestbranding=1",
    thumbnail: "https://img.youtube.com/vi/sHlWMhShGxo/mqdefault.jpg",
    isLive: false,
    viewerCount: 5400,
  },
];

const CATEGORIES = ["all", "space", "nature", "cityscape", "weather", "volcano", "ambient"] as const;

export function CamerasPanel() {
  const [category, setCategory] = useState<string>("all");
  const [activeCamera, setActiveCamera] = useState<typeof CAMERAS[0] | null>(null);

  const filtered = category === "all" ? CAMERAS : CAMERAS.filter(c => c.category === category);

  return (
    <div className="flex flex-col h-full">
      {/* Category Filter */}
      <div className="flex gap-1 px-3 py-2 border-b border-border flex-shrink-0 overflow-x-auto">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`text-[10px] px-2 py-1 rounded capitalize flex-shrink-0 transition-colors ${category === cat ? "bg-cyan-400/20 text-cyan-400" : "text-muted-foreground hover:text-foreground"}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Fullscreen overlay player */}
      {activeCamera && (
        <div className="flex-shrink-0 relative border-b border-border bg-black">
          <div style={{ paddingBottom: "42%" }} className="relative">
            <iframe
              key={activeCamera.id}
              src={activeCamera.embedUrl}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              referrerPolicy="no-referrer"
              style={{ border: "none" }}
            />
          </div>
          {/* Active label */}
          <div className="absolute top-2 left-2 flex items-center gap-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            <span className="text-[10px] text-white font-medium">{activeCamera.name}</span>
            <span className="text-[10px] text-muted-foreground">{activeCamera.location}</span>
          </div>
          <button
            onClick={() => setActiveCamera(null)}
            className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white hover:bg-red-500/80 transition-colors rounded p-1"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Grid */}
      <div className="flex-1 overflow-y-auto min-h-0 p-2">
        <div className="grid grid-cols-2 gap-2">
          {filtered.map(cam => {
            const isActive = activeCamera?.id === cam.id;
            return (
              <div
                key={cam.id}
                onClick={() => setActiveCamera(isActive ? null : cam)}
                className={`relative rounded overflow-hidden border cursor-pointer group transition-all ${isActive ? "border-cyan-400 ring-1 ring-cyan-400/30" : "border-border hover:border-cyan-400/50"}`}
              >
                <div className="relative aspect-video bg-black">
                  {/* Thumbnail */}
                  <img
                    src={cam.thumbnail}
                    alt={cam.name}
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity"
                    onError={e => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  {/* Dark overlay */}
                  <div className={`absolute inset-0 flex items-center justify-center transition-colors ${isActive ? "bg-cyan-400/10" : "bg-black/40 group-hover:bg-black/20"}`}>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${isActive ? "bg-cyan-400/30" : "bg-black/60 group-hover:bg-white/20"}`}>
                      {isActive ? <Maximize2 size={14} className="text-cyan-400" /> : <Play size={14} className="text-white ml-0.5" />}
                    </div>
                  </div>
                  {/* LIVE badge */}
                  {cam.isLive && (
                    <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-red-600/90 px-1.5 py-0.5 rounded text-[9px] font-bold text-white">
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      LIVE
                    </div>
                  )}
                  {/* Viewer count */}
                  <div className="absolute top-1.5 right-1.5 flex items-center gap-1 bg-black/70 px-1.5 py-0.5 rounded text-[9px] text-white">
                    <Users size={8} />
                    {cam.viewerCount >= 1000 ? `${(cam.viewerCount / 1000).toFixed(0)}k` : cam.viewerCount}
                  </div>
                </div>
                <div className="px-2 py-1.5 bg-card">
                  <p className="text-[10px] font-medium text-foreground truncate">{cam.name}</p>
                  <p className="text-[9px] text-muted-foreground truncate">{cam.location}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
