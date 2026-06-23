<div align="center">
  <h1>🧠 Omniscient Terminal</h1>
  <p><strong>A dark-themed mission control dashboard for financial markets intelligence and trading</strong></p>
  <p>
    <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white" alt="TypeScript 5.9" />
    <img src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white" alt="Vite 7" />
    <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4" />
    <img src="https://img.shields.io/badge/pnpm-workspace-F69220?logo=pnpm&logoColor=white" alt="pnpm workspace" />
  </p>
  <p>
    <a href="#features">Features</a> •
    <a href="#screenshots">Screenshots</a> •
    <a href="#architecture">Architecture</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#quick-start">Quick Start</a> •
    <a href="#project-structure">Project Structure</a>
  </p>
</div>

---

A unified command center for traders and market enthusiasts. Monitor global markets in real time, analyze candlestick charts with AI-generated predictions, receive buy/sell trade signals, explore country-specific stocks on an interactive world map, practice paper trading, watch global news TV, write and backtest Pine Script strategies, and more — all wrapped in a sleek terminal-inspired dark interface.

**Fully functional with mock data — no backend or database required to explore the UI.**

---

## ✨ Features

<div align="center">
  <table>
    <tr>
      <td align="center"><strong>📊 Market Bar</strong></td>
      <td>Live BTC, ETH, SPY, AAPL, GLD, EUR/USD prices & Fear & Greed index</td>
    </tr>
    <tr>
      <td align="center"><strong>📰 News Feed</strong></td>
      <td>Filterable global news with sentiment breakdown & auto-refresh</td>
    </tr>
    <tr>
      <td align="center"><strong>📈 Candlestick Charts</strong></td>
      <td>Custom SVG charts, multi-timeframe, AI prediction with confidence meter</td>
    </tr>
    <tr>
      <td align="center"><strong>🔔 Trade Signals</strong></td>
      <td>Buy/sell signals with conviction labels, TP/SL levels, portfolio stats</td>
    </tr>
    <tr>
      <td align="center"><strong>🌍 World Map</strong></td>
      <td>Interactive map with country-specific stocks, news & charts</td>
    </tr>
    <tr>
      <td align="center"><strong>💰 Trading Simulator</strong></td>
      <td>Paper-trade stocks & crypto with $1,000 virtual capital & P&L tracking</td>
    </tr>
    <tr>
      <td align="center"><strong>📺 Satellite TV</strong></td>
      <td>Embedded YouTube live streams from 15+ global news broadcasters</td>
    </tr>
    <tr>
      <td align="center"><strong>📝 Pine Script IDE</strong></td>
      <td>Write & backtest TradingView Pine Script strategies with equity curves</td>
    </tr>
    <tr>
      <td align="center"><strong>⚡ Alert Manager</strong></td>
      <td>Price alerts with browser, email, Telegram & webhook notifications</td>
    </tr>
    <tr>
      <td align="center"><strong>⭐ Watchlist</strong></td>
      <td>Track custom symbols with directional price changes</td>
    </tr>
    <tr>
      <td align="center"><strong>✈️ Flight Map</strong></td>
      <td>Global flight tracking with 150+ simulated flights by category</td>
    </tr>
  </table>
</div>



## 🏗 Architecture

The project is organized as a **pnpm monorepo** with the following workspace structure:

```
omniscient-terminal/
├── artifacts/                    # Deployable applications
│   ├── omniscient-terminal/      # Main React frontend (Vite)
│   ├── api-server/               # Express 5 API backend
│   └── mockup-sandbox/           # UI component sandbox
├── lib/                          # Shared libraries
│   ├── db/                       # Drizzle ORM + PostgreSQL schema
│   ├── api-spec/                 # OpenAPI specification (source of truth)
│   ├── api-zod/                  # Auto-generated Zod schemas from spec
│   └── api-client-react/         # Auto-generated React Query hooks
├── scripts/                      # Utility scripts
└── attached_assets/              # Screenshots & design assets
```

### Data Flow

```
 OpenAPI Spec (api-spec)
   ├──▶ api-zod (Zod schemas)
   └──▶ api-client-react (React Query hooks)
          │
 Frontend (omniscient-terminal) ───▶ API Server (api-server)
   │                                      │
   │  Mock data layer                      │
   │  (lib/mock-data.ts)                   │
   │                                      ▼
   │  Fully functional offline        PostgreSQL (db)
   │  without backend
```

The frontend is fully self-contained with a **mock data layer** (`src/lib/mock-data.ts`) that simulates real-time price streams, news, signals, and flight data. This means the entire UI runs without the API server or database — perfect for exploration and development.

When connected to the backend stack:
1. **OpenAPI spec** (`lib/api-spec/openapi.yaml`) serves as the single source of truth
2. **Orval** codegen produces Zod schemas (`lib/api-zod`) and React client hooks (`lib/api-client-react`)
3. **Express 5 server** (`artifacts/api-server`) handles actual API requests
4. **Drizzle ORM** (`lib/db`) manages PostgreSQL persistence

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript 5.9, Vite 7, Tailwind CSS v4 |
| **Routing** | Wouter |
| **Data Fetching** | TanStack React Query v5 |
| **UI Components** | Radix UI primitives, Framer Motion, Recharts |
| **Maps** | Leaflet + react-leaflet |
| **Forms** | react-hook-form + Zod |
| **Backend** | Express 5 |
| **Database** | PostgreSQL + Drizzle ORM |
| **Codegen** | Orval (OpenAPI → Zod + React hooks) |
| **Package Manager** | pnpm (workspaces + catalogs) |
| **Build** | esbuild, TypeScript project references |

---

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start the frontend dev server (port 5173)
pnpm dev
```

Open **http://localhost:5173** in your browser. The app runs entirely on mock data — no API server, database, or environment variables needed.

### Additional Commands

| Command | Description |
|---|---|
| `pnpm build` | Full typecheck + build all packages |
| `pnpm typecheck` | TypeScript type-check across the entire monorepo |
| `pnpm --filter @workspace/api-server dev` | Start the Express API server (port 5000) |
| `pnpm --filter @workspace/api-spec run codegen` | Regenerate API schemas & hooks from OpenAPI spec |
| `pnpm --filter @workspace/db run push` | Push Drizzle schema to PostgreSQL |

---

## 📁 Project Structure

```
artifacts/omniscient-terminal/src/
├── App.tsx                          # Root component (wouter, react-query, toaster)
├── main.tsx                         # Entry point
├── index.css                        # Tailwind + terminal-themed CSS vars
├── pages/
│   ├── Dashboard.tsx                # Main dashboard layout
│   └── not-found.tsx                # 404 page
├── components/
│   ├── Sidebar.tsx                  # Collapsible navigation sidebar
│   ├── ui/                          # Radix UI primitives (60+ components)
│   └── panels/                      # Feature panels
│       ├── MarketBar.tsx
│       ├── NewsFeed.tsx
│       ├── ChartPanel.tsx
│       ├── SignalsPanel.tsx
│       ├── WorldMapPanel.tsx
│       ├── TradingSimulator.tsx
│       ├── SatelliteTV.tsx
│       ├── PineIDE.tsx
│       ├── AlertManager.tsx
│       ├── Watchlist.tsx
│       ├── FlightMap.tsx / GlobeMap.tsx
│       ├── CamerasPanel.tsx
│       ├── CryptoTradingBox.tsx
│       ├── NewsTicker.tsx
│       └── ...
└── lib/
    ├── mock-data.ts                 # All simulated data & price streams
    └── utils.ts                     # cn() helper & utilities
```


