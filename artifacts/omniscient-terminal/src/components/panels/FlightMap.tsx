import { useGetFlights, useGetFlightStats } from "@workspace/api-client-react";
import { useState, useMemo } from "react";

function projectToMap(lat: number, lng: number, width: number, height: number) {
  const x = ((lng + 180) / 360) * width;
  const latRad = (lat * Math.PI) / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const y = (height / 2) - (width * mercN) / (2 * Math.PI);
  return { x, y };
}

function altitudeColor(alt: number, isAlert: boolean) {
  if (isAlert) return "#FF9500";
  if (alt > 35000) return "#00D4FF";
  if (alt > 20000) return "#00FF9D";
  if (alt > 10000) return "#9D4EDD";
  return "#FF9500";
}

const typeColors: Record<string, string> = {
  commercial: "#00D4FF",
  military: "#FF3B3B",
  private: "#9D4EDD",
  cargo: "#FF9500",
};

const MAP_W = 800;
const MAP_H = 400;

// Simplified world continents as SVG paths (approximate)
const continentPaths = [
  // North America
  "M 130,80 L 200,70 L 230,90 L 220,140 L 180,160 L 140,150 L 110,130 Z",
  // South America
  "M 170,170 L 200,165 L 210,220 L 195,280 L 170,290 L 155,250 L 160,200 Z",
  // Europe
  "M 360,70 L 420,65 L 430,100 L 400,115 L 365,110 L 350,90 Z",
  // Africa
  "M 370,120 L 430,115 L 450,200 L 420,280 L 380,285 L 350,230 L 355,155 Z",
  // Asia
  "M 440,60 L 620,55 L 660,100 L 640,150 L 580,170 L 490,160 L 445,120 Z",
  // Australia
  "M 580,230 L 650,225 L 670,275 L 640,310 L 590,305 L 565,270 Z",
];

export function FlightMap() {
  const { data: flights, isLoading } = useGetFlights({ params: { limit: 100 } });
  const { data: stats } = useGetFlightStats();
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "commercial" | "military">("all");

  const filteredFlights = useMemo(() => {
    if (!flights) return [];
    if (filter === "all") return flights;
    return flights.filter(f => f.type === filter);
  }, [flights, filter]);

  const selectedFlight = useMemo(() => flights?.find(f => f.icao24 === selected), [flights, selected]);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Stats Header */}
      <div className="flex items-center gap-4 px-3 py-2 border-b border-border flex-shrink-0">
        {stats && (
          <>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Airborne</span>
              <span className="text-sm font-mono font-bold text-cyan-400">{stats.totalAirborne.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="text-[10px] text-muted-foreground">{stats.commercial.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-[10px] text-muted-foreground">{stats.military.toLocaleString()}</span>
            </div>
            {stats.alertedFlights > 0 && (
              <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[10px] text-amber-400 font-bold">{stats.alertedFlights} ALERTS</span>
              </div>
            )}
          </>
        )}
        <div className="flex gap-1 ml-auto">
          {(["all", "commercial", "military"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`text-[10px] px-2 py-1 rounded font-mono uppercase tracking-wider transition-colors ${filter === f ? "bg-cyan-400/20 text-cyan-400" : "text-muted-foreground hover:text-foreground"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative overflow-hidden">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${MAP_W} ${MAP_H}`}
            className="w-full h-full"
            style={{ background: "linear-gradient(180deg, #0a0e17 0%, #070b12 100%)" }}
          >
            {/* Grid lines */}
            {Array.from({ length: 9 }).map((_, i) => (
              <line key={`v${i}`} x1={(i + 1) * (MAP_W / 10)} y1={0} x2={(i + 1) * (MAP_W / 10)} y2={MAP_H} stroke="#1A2535" strokeWidth={0.5} />
            ))}
            {Array.from({ length: 5 }).map((_, i) => (
              <line key={`h${i}`} x1={0} y1={(i + 1) * (MAP_H / 6)} x2={MAP_W} y2={(i + 1) * (MAP_H / 6)} stroke="#1A2535" strokeWidth={0.5} />
            ))}
            {/* Equator */}
            <line x1={0} y1={MAP_H * 0.5} x2={MAP_W} y2={MAP_H * 0.5} stroke="#1A2535" strokeWidth={1} strokeDasharray="4 4" />

            {/* Continent outlines */}
            {continentPaths.map((d, i) => (
              <path key={i} d={d} fill="#1A2535" stroke="#243050" strokeWidth={0.5} opacity={0.7} />
            ))}

            {/* Flights */}
            {filteredFlights.map(f => {
              const { x, y } = projectToMap(f.lat, f.lng, MAP_W, MAP_H);
              const color = f.isAlert ? "#FF9500" : typeColors[f.type] || "#00D4FF";
              const isSelected = f.icao24 === selected;
              const rad = f.heading * (Math.PI / 180);
              const tx = x + Math.sin(rad) * 8;
              const ty = y - Math.cos(rad) * 8;
              return (
                <g key={f.icao24} onClick={() => setSelected(isSelected ? null : f.icao24)} style={{ cursor: "pointer" }}>
                  {f.isAlert && (
                    <circle cx={x} cy={y} r={8} fill="none" stroke="#FF9500" strokeWidth={1} opacity={0.4}>
                      <animate attributeName="r" values="4;12;4" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  {isSelected && <circle cx={x} cy={y} r={6} fill="none" stroke={color} strokeWidth={1.5} opacity={0.8} />}
                  {/* Heading indicator */}
                  <line x1={x} y1={y} x2={tx} y2={ty} stroke={color} strokeWidth={0.8} opacity={0.6} />
                  <circle cx={x} cy={y} r={isSelected ? 3 : 2} fill={color} opacity={isSelected ? 1 : 0.85} />
                </g>
              );
            })}
          </svg>
        )}

        {/* Selected flight tooltip */}
        {selectedFlight && (
          <div className="absolute top-3 right-3 bg-card border border-border p-3 rounded text-xs font-mono shadow-lg z-10 min-w-[200px]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-foreground">{selectedFlight.callsign}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded`} style={{ color: typeColors[selectedFlight.type], backgroundColor: `${typeColors[selectedFlight.type]}20` }}>
                {selectedFlight.type.toUpperCase()}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
              {selectedFlight.origin && <><span className="text-muted-foreground">From</span><span className="text-foreground">{selectedFlight.origin}</span></>}
              {selectedFlight.destination && <><span className="text-muted-foreground">To</span><span className="text-foreground">{selectedFlight.destination}</span></>}
              <span className="text-muted-foreground">Alt</span><span className="text-cyan-400">{selectedFlight.altitude.toLocaleString()} ft</span>
              <span className="text-muted-foreground">Speed</span><span className="text-foreground">{selectedFlight.speed} kts</span>
              <span className="text-muted-foreground">Hdg</span><span className="text-foreground">{selectedFlight.heading}°</span>
              {selectedFlight.squawk && <><span className="text-muted-foreground">Squawk</span><span className="text-amber-400">{selectedFlight.squawk}</span></>}
            </div>
            {selectedFlight.isAlert && (
              <div className="mt-2 text-amber-400 text-[10px] border-t border-border pt-2">{selectedFlight.alertReason}</div>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-3 py-1.5 border-t border-border flex-shrink-0 text-[10px]">
        {Object.entries(typeColors).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-muted-foreground capitalize">{type}</span>
          </div>
        ))}
        <div className="ml-auto text-muted-foreground">Click aircraft for details</div>
      </div>
    </div>
  );
}
