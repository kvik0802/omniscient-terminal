import { useRef, useMemo, useState, useEffect, useCallback, Component, type ReactNode, Suspense } from "react";
import { getFlights, getFlightStats } from "@/lib/mock-data";
import { RefreshCw } from "lucide-react";

// ── Error boundary ─────────────────────────────────────────────────────────
class ThreeErrorBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  constructor(props: any) { super(props); this.state = { failed: false }; }
  componentDidCatch() { this.setState({ failed: true }); this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}

function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
  } catch { return false; }
}

// ── SVG Flat Map ───────────────────────────────────────────────────────────
const MAP_W = 1000, MAP_H = 500;
function projectMercator(lat: number, lng: number) {
  const x = ((lng + 180) / 360) * MAP_W;
  const latR = (lat * Math.PI) / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latR / 2));
  const y = MAP_H / 2 - (MAP_W * mercN) / (2 * Math.PI);
  return { x, y };
}

const CONTINENT_POLY = [
  "M 130,78 L 198,68 L 228,88 L 218,138 L 178,158 L 138,148 L 108,128 Z",
  "M 168,170 L 198,164 L 208,218 L 193,278 L 168,288 L 153,248 L 158,198 Z",
  "M 390,68 L 440,62 L 450,98 L 418,112 L 380,108 L 362,88 Z",
  "M 388,118 L 445,112 L 460,195 L 430,272 L 388,278 L 358,224 L 363,152 Z",
  "M 452,58 L 628,52 L 660,98 L 638,148 L 575,168 L 488,158 L 445,118 Z",
  "M 578,165 L 628,160 L 638,200 L 610,218 L 580,210 Z",
  "M 588,228 L 658,222 L 672,272 L 640,308 L 588,302 L 564,268 Z",
];

const TYPE_COLORS: Record<string, string> = { commercial: "#00D4FF", military: "#FF3B3B", private: "#9D4EDD", cargo: "#FF9500" };

// ── Regions for Live News ──────────────────────────────────────────────────
const REGIONS = [
  { id: 'us', name: 'United States', lat: 39.8, lng: -98.5, flag: '🇺🇸' },
  { id: 'uk', name: 'United Kingdom', lat: 52.3, lng: -1.5, flag: '🇬🇧' },
  { id: 'jp', name: 'Japan', lat: 36.2, lng: 138.2, flag: '🇯🇵' },
  { id: 'cn', name: 'China', lat: 35.8, lng: 104.1, flag: '🇨🇳' },
  { id: 'in', name: 'India', lat: 20.5, lng: 78.9, flag: '🇮🇳' },
  { id: 'br', name: 'Brazil', lat: -14.2, lng: -51.9, flag: '🇧🇷' },
  { id: 'za', name: 'South Africa', lat: -30.5, lng: 22.9, flag: '🇿🇦' },
  { id: 'au', name: 'Australia', lat: -25.2, lng: 133.7, flag: '🇦🇺' },
  { id: 'fr', name: 'France', lat: 46.2, lng: 2.2, flag: '🇫🇷' },
  { id: 'de', name: 'Germany', lat: 51.1, lng: 10.4, flag: '🇩🇪' },
  { id: 'ca', name: 'Canada', lat: 56.1, lng: -106.3, flag: '🇨🇦' },
  { id: 'ru', name: 'Russia', lat: 61.5, lng: 105.3, flag: '🇷🇺' },
  { id: 'ae', name: 'UAE', lat: 23.4, lng: 53.8, flag: '🇦🇪' },
  { id: 'sg', name: 'Singapore', lat: 1.3, lng: 103.8, flag: '🇸🇬' },
  { id: 'kr', name: 'South Korea', lat: 35.9, lng: 127.7, flag: '🇰🇷' },
];

function FlatMap({ flights, selected, onSelect }: { flights: any[]; selected: string | null; onSelect: (id: string | null) => void }) {
  // Simple flat map flight movement simulation
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    const render = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;
      flights.forEach(f => {
        const moveSpeed = (f.speed / 1000) * delta * 5;
        f.lat += Math.cos(f.heading * Math.PI / 180) * moveSpeed;
        f.lng += Math.sin(f.heading * Math.PI / 180) * moveSpeed;
        if (f.lng > 180) f.lng -= 360;
        if (f.lng < -180) f.lng += 360;
      });
      setFrame(prev => prev + 1);
      animationFrameId = requestAnimationFrame(render);
    };
    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [flights]);

  return (
    <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="w-full h-full" style={{ background: "linear-gradient(180deg,#040c1a 0%,#020609 100%)" }}>
      {Array.from({ length: 13 }).map((_, i) => <line key={`v${i}`} x1={(i+1)*(MAP_W/14)} y1={0} x2={(i+1)*(MAP_W/14)} y2={MAP_H} stroke="#1A2535" strokeWidth={0.4} />)}
      {Array.from({ length: 6 }).map((_, i) => <line key={`h${i}`} x1={0} y1={(i+1)*(MAP_H/7)} x2={MAP_W} y2={(i+1)*(MAP_H/7)} stroke="#1A2535" strokeWidth={0.4} />)}
      <line x1={0} y1={MAP_H*0.495} x2={MAP_W} y2={MAP_H*0.495} stroke="#1a3a5c" strokeWidth={0.8} strokeDasharray="6 4" />
      {CONTINENT_POLY.map((d, i) => <path key={i} d={d} fill="#112040" stroke="#1e3d6a" strokeWidth={0.8} opacity={0.9} />)}
      {flights.map(f => {
        const { x, y } = projectMercator(f.lat, f.lng);
        if (x < 0 || x > MAP_W || y < 0 || y > MAP_H) return null;
        const color = f.isAlert ? "#FF9500" : (TYPE_COLORS[f.type] || "#00D4FF");
        const isSelected2 = f.icao24 === selected;
        return (
          <g key={f.icao24} style={{ cursor: "pointer" }} onClick={() => onSelect(isSelected2 ? null : f.icao24)} transform={`translate(${x},${y}) rotate(${f.heading || 0})`}>
            {f.isAlert && (<circle cx={0} cy={0} r={12} fill="none" stroke="#FF9500" strokeWidth={1.2} opacity={0.5}><animate attributeName="r" values="5;15;5" dur="2s" repeatCount="indefinite" /><animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" /></circle>)}
            {isSelected2 && <circle cx={0} cy={0} r={10} fill="none" stroke={color} strokeWidth={1.5} opacity={0.9} />}
            {/* Airplane shape — body + wings + tail */}
            <polygon points="0,-7 2,-3 7,1 2,0 1.5,6 0,4 -1.5,6 -2,0 -7,1 -2,-3" fill={color} opacity={isSelected2 ? 1 : 0.85} style={{ filter: isSelected2 ? `drop-shadow(0 0 6px ${color})` : `drop-shadow(0 0 2px ${color})` }} />
          </g>
        );
      })}
    </svg>
  );
}

// ── 3D Globe ───────────────────────────────────────────────────────────────
let GlobeCanvas: React.ComponentType<{ flights: any[]; selected: string | null; onSelect: (id: string | null) => void; selectedRegion: any; onSelectRegion: (r: any) => void }> | null = null;

async function load3DGlobe() {
  const [ThreeFiber, ThreeDrei, THREE] = await Promise.all([import("@react-three/fiber"), import("@react-three/drei"), import("three")]);
  const { Canvas, useFrame, useThree } = ThreeFiber;
  const { OrbitControls, Stars, Html, useTexture } = ThreeDrei;

  function latLngToVec3(lat: number, lng: number, r: number) {
    const phi = (90 - lat) * (Math.PI / 180), theta = (lng + 180) * (Math.PI / 180);
    return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
  }
  function slerp(a: THREE.Vector3, b: THREE.Vector3, t: number) {
    const an = a.clone().normalize(), bn = b.clone().normalize();
    const dot = Math.min(1, an.dot(bn)), omega = Math.acos(dot);
    if (Math.abs(omega) < 0.001) return a.clone().lerp(b, t);
    return an.multiplyScalar(Math.sin((1-t)*omega)/Math.sin(omega)).add(bn.clone().multiplyScalar(Math.sin(t*omega)/Math.sin(omega))).multiplyScalar(1.018);
  }

  const ROUTES: [number,number,number,number][] = [[40.7,-73.9,51.5,-0.1],[51.5,-0.1,25.2,55.3],[25.2,55.3,1.3,103.8],[1.3,103.8,35.7,139.7],[35.7,139.7,-33.9,151.2],[-33.9,151.2,37.6,-122.4],[37.6,-122.4,40.7,-73.9]];

  const DOT_COLORS: Record<string, THREE.Color> = { commercial: new THREE.Color("#00D4FF"), military: new THREE.Color("#FF3B3B"), private: new THREE.Color("#9D4EDD"), cargo: new THREE.Color("#FF9500") };

  // Realistic Earth Rendering using downloaded textures
  function Earth() { 
    const [colorMap, specMap, normalMap, emissiveMap] = useTexture(["/earth.jpg", "/earth_specular.jpg", "/earth_normal.jpg", "/earth_night.jpg"]);
    return (
      <mesh>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhongMaterial 
          map={colorMap} 
          specularMap={specMap} 
          normalMap={normalMap} 
          emissiveMap={emissiveMap}
          emissive={new THREE.Color(0xffffff)}
          emissiveIntensity={0.6}
          specular={new THREE.Color("grey")}
          shininess={15} 
        />
      </mesh>
    ); 
  }

  function Clouds() {
    const cloudMap = useTexture("/earth_clouds.png");
    const cloudRef = useRef<THREE.Mesh>(null!);
    useFrame(() => {
      if (cloudRef.current) cloudRef.current.rotation.y += 0.0003;
    });
    return (
      <mesh ref={cloudRef}>
        <sphereGeometry args={[1.006, 64, 64]} />
        <meshPhongMaterial 
          map={cloudMap}
          transparent={true}
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    );
  }

  function Atmosphere() { return (<mesh><sphereGeometry args={[1.025, 48, 48]} /><meshPhongMaterial color="#88bbff" emissive="#003366" transparent opacity={0.2} side={THREE.BackSide} blending={THREE.AdditiveBlending} /></mesh>); }

  // 3D airplane shape as a flat polygon extruded slightly, smoothly animated
  function FlightDot({ initialLat, initialLng, type, isAlert, callsign, altitude, speed, heading, isSelected, onClick }: any) {
    const planeRef = useRef<THREE.Group>(null!);
    const loc = useRef({ lat: initialLat, lng: initialLng });
    const color = isAlert ? new THREE.Color("#FF9500") : (DOT_COLORS[type] || DOT_COLORS.commercial);

    // Create airplane mesh geometry (a flat shape)
    const planeGeo = useMemo(() => {
      const shape = new THREE.Shape();
      // Fuselage + wings + tail
      shape.moveTo(0, 0.025);       // nose
      shape.lineTo(0.008, 0.008);
      shape.lineTo(0.025, -0.005);  // right wing tip
      shape.lineTo(0.008, -0.003);
      shape.lineTo(0.005, -0.025);  // right tail
      shape.lineTo(0, -0.017);      // tail center
      shape.lineTo(-0.005, -0.025); // left tail
      shape.lineTo(-0.008, -0.003);
      shape.lineTo(-0.025, -0.005); // left wing tip
      shape.lineTo(-0.008, 0.008);
      shape.closePath();
      return new THREE.ShapeGeometry(shape);
    }, []);

    // Contrail geometry
    const trailGeo = useMemo(() => {
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(20 * 3), 3));
      return g;
    }, []);
    const trail = useRef<THREE.Vector3[]>([]);

    useFrame(({ clock }, delta) => {
      if (!planeRef.current) return;
      
      // Interpolate lat/lng smoothly every frame based on actual real-world direction
      const moveSpeed = (speed / 1000) * delta * 5;
      loc.current.lat += Math.cos(heading * Math.PI / 180) * moveSpeed;
      loc.current.lng += Math.sin(heading * Math.PI / 180) * moveSpeed;
      if (loc.current.lng > 180) loc.current.lng -= 360;
      if (loc.current.lng < -180) loc.current.lng += 360;

      // Update position on globe
      const r = 1.015;
      const phi = (90 - loc.current.lat) * (Math.PI / 180);
      const theta = (loc.current.lng + 180) * (Math.PI / 180);
      const pos = new THREE.Vector3(
        -r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      );
      
      planeRef.current.position.copy(pos);

      // Orient plane outward and rotate by heading
      planeRef.current.lookAt(0, 0, 0);
      planeRef.current.rotateX(Math.PI);
      planeRef.current.rotateZ(-(heading || 0) * Math.PI / 180);

      // Pulsate alerts and selected
      if (isAlert || isSelected) {
        planeRef.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 4) * 0.3);
      }

      // Update contrail
      if (Math.floor(clock.elapsedTime * 60) % 4 === 0) {
        trail.current.push(pos.clone());
        if (trail.current.length > 20) trail.current.shift();
        const arr = trailGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < trail.current.length; i++) {
          arr[i*3] = trail.current[i].x;
          arr[i*3+1] = trail.current[i].y;
          arr[i*3+2] = trail.current[i].z;
        }
        trailGeo.setDrawRange(0, trail.current.length);
        (trailGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      }
    });

    return (
      <group>
        <group ref={planeRef} onClick={(e) => { e.stopPropagation(); onClick(); }}>
          <mesh geometry={planeGeo}>
            <meshBasicMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.95} />
          </mesh>
          {/* Vertical Tail Fin */}
          <mesh position={[0, -0.018, -0.005]} rotation={[Math.PI/2, 0, 0]}>
            <coneGeometry args={[0.004, 0.012, 3]} />
            <meshBasicMaterial color={color} />
          </mesh>
          {/* Glow ring for alerts */}
          {isAlert && (
            <mesh>
              <ringGeometry args={[0.02, 0.028, 16]} />
              <meshBasicMaterial color="#FF9500" transparent opacity={0.5} side={THREE.DoubleSide} />
            </mesh>
          )}
          {isSelected && (
            <Html distanceFactor={3} style={{ pointerEvents: "none", width: 160 }}>
              <div style={{ background: "rgba(10,14,23,0.95)", border: "1px solid #1A2535", borderRadius: 6, padding: "6px 10px", fontSize: 10, fontFamily: "monospace", color: "#E8EDF5", boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>
                <div style={{ fontWeight: "bold", fontSize: 12, marginBottom: 2 }}>{callsign}</div>
                <div style={{ color: "#00D4FF" }}>ALT {altitude?.toLocaleString()} ft</div>
                <div style={{ color: "#8899AA" }}>SPD {speed} kts · HDG {heading?.toFixed(0)}°</div>
              </div>
            </Html>
          )}
        </group>
        <points geometry={trailGeo}>
          <pointsMaterial color={color} size={0.003} transparent opacity={0.4} />
        </points>
      </group>
    );
  }

  // Animated airplane following a route
  function AnimatedPlane() {
    const meshRef = useRef<THREE.Mesh>(null!);
    const trailGeo = useMemo(() => { const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(80*3), 3)); return g; }, []);
    const trail = useRef<THREE.Vector3[]>([]);
    const routeIdx = useRef(0), t = useRef(0);
    const fromRef = useRef(latLngToVec3(ROUTES[0][0], ROUTES[0][1], 1)), toRef = useRef(latLngToVec3(ROUTES[0][2], ROUTES[0][3], 1));
    useFrame(() => {
      t.current += 0.002;
      if (t.current >= 1) { t.current = 0; routeIdx.current = (routeIdx.current+1)%ROUTES.length; const r = ROUTES[routeIdx.current]; fromRef.current = latLngToVec3(r[0],r[1],1); toRef.current = latLngToVec3(r[2],r[3],1); trail.current = []; }
      const pos = slerp(fromRef.current, toRef.current, t.current);
      meshRef.current.position.copy(pos); meshRef.current.lookAt(0,0,0); meshRef.current.rotateX(Math.PI/2);
      trail.current.push(pos.clone()); if (trail.current.length > 80) trail.current.shift();
      const arr = trailGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < trail.current.length; i++) { arr[i*3]=trail.current[i].x; arr[i*3+1]=trail.current[i].y; arr[i*3+2]=trail.current[i].z; }
      trailGeo.setDrawRange(0, trail.current.length); (trailGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    });
    return (
      <group>
        <points geometry={trailGeo}><pointsMaterial color="#00D4FF" size={0.005} transparent opacity={0.6} /></points>
        <mesh ref={meshRef}><coneGeometry args={[0.018, 0.045, 6]} /><meshBasicMaterial color="#00D4FF" /></mesh>
      </group>
    );
  }

  // Clickable regions for localized news
  function RegionNode({ region, isSelected, onClick }: any) {
    const pos = useMemo(() => latLngToVec3(region.lat, region.lng, 1.002), [region]);
    const meshRef = useRef<THREE.Mesh>(null!);
    
    useFrame(({ clock }) => {
      if (meshRef.current) {
        meshRef.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 3) * 0.2);
      }
    });

    return (
      <group position={pos} onClick={(e) => { e.stopPropagation(); onClick(); }}>
        <mesh ref={meshRef}>
          <sphereGeometry args={[0.01, 16, 16]} />
          <meshBasicMaterial color={isSelected ? "#00FF41" : "#ffffff"} transparent opacity={isSelected ? 1 : 0.6} />
        </mesh>
        {isSelected && (
          <mesh>
            <ringGeometry args={[0.015, 0.02, 32]} />
            <meshBasicMaterial color="#00FF41" side={THREE.DoubleSide} transparent opacity={0.8} />
          </mesh>
        )}
      </group>
    );
  }

  function Scene({ flights, selected, onSelect, selectedRegion, onSelectRegion }: any) {
    const { camera } = useThree();
    useEffect(() => { (camera as THREE.PerspectiveCamera).position.set(0, 0.3, 2.0); camera.lookAt(0, 0, 0); }, [camera]);
    return (
      <>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 3, 5]} intensity={1.5} color="#ffffff" />
        <directionalLight position={[-3, -2, -3]} intensity={0.3} color="#aaccff" />
        <Stars radius={4} depth={3} count={4000} factor={0.3} fade speed={0.4} />
        <Suspense fallback={null}>
          <Earth />
          <Clouds />
        </Suspense>
        <Atmosphere />
        <AnimatedPlane />
        {REGIONS.map(r => (
          <RegionNode key={r.id} region={r} isSelected={selectedRegion?.id === r.id} onClick={() => onSelectRegion(r)} />
        ))}
        {flights.map((f: any) => (
          <FlightDot key={f.icao24} initialLat={f.lat} initialLng={f.lng} type={f.type} isAlert={f.isAlert}
            callsign={f.callsign} altitude={f.altitude} speed={f.speed} heading={f.heading}
            isSelected={f.icao24 === selected} onClick={() => onSelect(f.icao24 === selected ? null : f.icao24)} />
        ))}
        <OrbitControls enablePan={false} enableZoom minDistance={1.3} maxDistance={4} autoRotate autoRotateSpeed={0.25} rotateSpeed={0.5} />
      </>
    );
  }

  GlobeCanvas = function GlobeCanvas({ flights, selected, onSelect, selectedRegion, onSelectRegion }) {
    return <Canvas dpr={[1, 1.5]} gl={{ antialias: true, alpha: false }} style={{ background: "#020509" }}><Scene flights={flights} selected={selected} onSelect={onSelect} selectedRegion={selectedRegion} onSelectRegion={onSelectRegion} /></Canvas>;
  };
}

// ── Main Component ─────────────────────────────────────────────────────────
export function GlobeMap({ onRefresh }: { onRefresh?: () => void }) {
  // We keep the initial flight list fixed; animations are now handled per-frame in Three.js and SVG
  const [flights] = useState(() => getFlights(150));
  const [stats] = useState(() => getFlightStats());
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<any>(null);
  const [filter, setFilter] = useState<"all"|"commercial"|"military"|"cargo">("all");
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [globeLoaded, setGlobeLoaded] = useState(false);
  const [globeFailed, setGlobeFailed] = useState(false);

  useEffect(() => {
    const supported = isWebGLAvailable(); setWebgl(supported);
    if (supported && !GlobeCanvas) { load3DGlobe().then(() => setGlobeLoaded(true)).catch(() => { setGlobeFailed(true); setWebgl(false); }); }
    else if (supported && GlobeCanvas) { setGlobeLoaded(true); }
  }, []);

  const handleGlobeError = useCallback(() => { setGlobeFailed(true); setWebgl(false); }, []);
  const filteredFlights = useMemo(() => filter === "all" ? flights : flights.filter(f => f.type === filter), [flights, filter]);
  const selectedFlight = flights.find(f => f.icao24 === selected);
  const use3D = webgl && globeLoaded && !globeFailed && GlobeCanvas;

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center gap-3 px-3 py-2 border-b border-border flex-shrink-0 flex-wrap">
        <div className="flex items-center gap-1.5"><span className="text-[10px] text-muted-foreground uppercase tracking-wider">Airborne</span><span className="text-sm font-mono font-bold text-cyan-400">{stats.totalAirborne.toLocaleString()}</span></div>
        {[{l:"Commercial",v:stats.commercial,c:"#00D4FF"},{l:"Military",v:stats.military,c:"#FF3B3B"},{l:"Private",v:stats.private,c:"#9D4EDD"}].map(s=>(
          <div key={s.l} className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{backgroundColor:s.c}}/><span className="text-[10px] text-muted-foreground">{s.v.toLocaleString()}</span></div>
        ))}
        {stats.alertedFlights>0&&(<div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded ml-1"><div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"/><span className="text-[10px] text-amber-400 font-bold">{stats.alertedFlights} ALERTS</span></div>)}
        <div className="flex items-center gap-1 ml-auto">
          {use3D&&<span className="text-[9px] text-cyan-400/60 border border-cyan-400/20 px-1.5 py-0.5 rounded mr-2 font-mono">3D GLOBE</span>}
          {(["all","commercial","military","cargo"] as const).map(f=>(<button key={f} onClick={()=>setFilter(f)} className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase tracking-wider transition-colors ${filter===f?"bg-cyan-400/20 text-cyan-400":"text-muted-foreground hover:text-foreground"}`}>{f}</button>))}
        </div>
      </div>

      <div className="flex-1 min-h-0 relative overflow-hidden">
        {use3D && GlobeCanvas ? (
          <ThreeErrorBoundary onError={handleGlobeError}><GlobeCanvas flights={filteredFlights} selected={selected} onSelect={setSelected} selectedRegion={selectedRegion} onSelectRegion={setSelectedRegion} /></ThreeErrorBoundary>
        ) : (
          <FlatMap flights={filteredFlights} selected={selected} onSelect={setSelected} />
        )}

        {/* Live Regional News Overlay */}
        {selectedRegion && (
          <div className="absolute top-4 left-4 w-80 bg-card/95 backdrop-blur-md border border-border rounded-lg shadow-2xl flex flex-col z-20 overflow-hidden animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="flex items-center justify-between p-3 border-b border-border bg-muted/20">
              <div className="flex items-center gap-2">
                <span className="text-xl">{selectedRegion.flag}</span>
                <span className="font-bold text-foreground tracking-wide">{selectedRegion.name}</span>
              </div>
              <button onClick={() => setSelectedRegion(null)} className="text-muted-foreground hover:text-foreground text-lg leading-none">×</button>
            </div>
            <div className="p-3 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-[10px] text-red-400 font-bold uppercase tracking-wider mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                Live Regional Feed
              </div>
              <div className="border-l-2 border-cyan-400/50 pl-2.5">
                <div className="text-[9px] text-muted-foreground mb-0.5">Just Now</div>
                <div className="text-xs text-foreground font-medium">Central bank of {selectedRegion.name} announces revised monetary policy to combat inflation.</div>
              </div>
              <div className="border-l-2 border-emerald-400/50 pl-2.5">
                <div className="text-[9px] text-muted-foreground mb-0.5">12m ago</div>
                <div className="text-xs text-foreground font-medium">Major infrastructure and green energy project breaks ground in {selectedRegion.name}.</div>
              </div>
              <div className="border-l-2 border-amber-400/50 pl-2.5">
                <div className="text-[9px] text-muted-foreground mb-0.5">1h ago</div>
                <div className="text-xs text-foreground font-medium">Tech stocks rally locally as new export agreements are finalized.</div>
              </div>
            </div>
          </div>
        )}

        {selectedFlight && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-card/95 backdrop-blur-sm border border-border rounded-lg px-4 py-2.5 text-xs font-mono shadow-xl flex items-center gap-4 z-10">
            <div><span className="text-muted-foreground text-[9px] uppercase tracking-wider block">Callsign</span><span className="text-foreground font-bold text-sm">{selectedFlight.callsign}</span></div>
            <div><span className="text-muted-foreground text-[9px] uppercase tracking-wider block">Type</span><span className="font-bold capitalize" style={{color:TYPE_COLORS[selectedFlight.type]}}>{selectedFlight.type}</span></div>
            {selectedFlight.origin&&selectedFlight.destination&&<div><span className="text-muted-foreground text-[9px] uppercase tracking-wider block">Route</span><span className="text-foreground">{selectedFlight.origin} → {selectedFlight.destination}</span></div>}
            <div><span className="text-muted-foreground text-[9px] uppercase tracking-wider block">Altitude</span><span className="text-cyan-400">{selectedFlight.altitude.toLocaleString()} ft</span></div>
            <div><span className="text-muted-foreground text-[9px] uppercase tracking-wider block">Speed</span><span className="text-foreground">{selectedFlight.speed} kts</span></div>
            <button onClick={()=>setSelected(null)} className="text-muted-foreground hover:text-foreground ml-1 text-base leading-none">×</button>
          </div>
        )}
        {!selectedFlight && !selectedRegion && (<div className="absolute bottom-2 right-3 text-[9px] text-muted-foreground/40 pointer-events-none">{use3D?"Drag to rotate • Click glowing nodes for news • ":""}Click an airplane for details</div>)}
      </div>

      <div className="flex items-center gap-4 px-3 py-1.5 border-t border-border flex-shrink-0 text-[10px]">
        {Object.entries(TYPE_COLORS).map(([type,color])=>(<div key={type} className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{backgroundColor:color}}/><span className="text-muted-foreground capitalize">{type}</span></div>))}
        {use3D&&<div className="flex items-center gap-1 ml-2"><div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"/><span className="text-cyan-400">Demo route</span></div>}
        <span className="ml-auto text-muted-foreground/50">Simulated Live Trajectories</span>
      </div>
    </div>
  );
}
