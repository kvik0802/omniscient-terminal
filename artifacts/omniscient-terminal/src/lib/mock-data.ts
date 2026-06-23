// ============================================================================
// MOCK DATA PROVIDER — replaces all @workspace/api-client-react hooks
// Provides realistic, continuously-updating data for every panel.
// ============================================================================

// ── Helpers ─────────────────────────────────────────────────────────────────

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
function randInt(min: number, max: number) {
  return Math.floor(rand(min, max));
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── NEWS ────────────────────────────────────────────────────────────────────

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  category: string;
  sentiment: string;
  publishedAt: string;
  sourceUrl: string;
  relatedSymbols?: string[];
}

const NEWS_SOURCES = ["Reuters", "Bloomberg", "CNBC", "CoinDesk", "The Block", "Financial Times", "WSJ", "TechCrunch", "CNN", "BBC", "Al Jazeera", "Sky News", "DW News"];

const NEWS_TEMPLATES: { title: string; category: string; sentiment: string; symbols?: string[] }[] = [
  // Breaking
  { title: "Federal Reserve signals potential rate cut in upcoming meeting", category: "breaking", sentiment: "positive", symbols: ["SPY", "DXY"] },
  { title: "Major earthquake strikes Pacific Rim — tsunami warnings issued", category: "breaking", sentiment: "urgent" },
  { title: "G7 leaders announce emergency economic summit", category: "breaking", sentiment: "neutral" },
  { title: "SEC announces new cryptocurrency regulatory framework", category: "breaking", sentiment: "negative", symbols: ["BTC", "ETH"] },
  { title: "Global supply chain disruption as Suez Canal blocked again", category: "breaking", sentiment: "negative" },

  // Finance
  { title: "Bitcoin surges past $75,000 amid institutional buying frenzy", category: "finance", sentiment: "positive", symbols: ["BTC/USDT"] },
  { title: "NVIDIA reports record quarterly earnings, stock jumps 8%", category: "finance", sentiment: "positive", symbols: ["NVDA"] },
  { title: "US Treasury yields hit 5-year high on inflation concerns", category: "finance", sentiment: "negative", symbols: ["TLT", "SPY"] },
  { title: "Goldman Sachs upgrades semiconductor sector to overweight", category: "finance", sentiment: "positive", symbols: ["NVDA", "AMD"] },
  { title: "Oil prices climb as OPEC+ extends production cuts", category: "finance", sentiment: "neutral", symbols: ["USO", "XLE"] },
  { title: "European Central Bank holds rates steady, signals caution", category: "finance", sentiment: "neutral", symbols: ["EUR/USD"] },

  // Crypto
  { title: "Ethereum ETF sees record $2.4B inflows in single day", category: "crypto", sentiment: "positive", symbols: ["ETH/USDT"] },
  { title: "Solana network processes 100k TPS in stress test", category: "crypto", sentiment: "positive", symbols: ["SOL/USDT"] },
  { title: "Whale alert: $500M BTC moved from Binance to cold storage", category: "crypto", sentiment: "neutral", symbols: ["BTC/USDT"] },
  { title: "DeFi TVL crosses $200B milestone for first time", category: "crypto", sentiment: "positive", symbols: ["ETH/USDT"] },
  { title: "Ripple wins landmark case against SEC — XRP surges 25%", category: "crypto", sentiment: "positive", symbols: ["XRP/USDT"] },
  { title: "New stablecoin regulation proposal could reshape market", category: "crypto", sentiment: "negative", symbols: ["USDT", "USDC"] },
  { title: "Bitcoin mining difficulty reaches all-time high", category: "crypto", sentiment: "neutral", symbols: ["BTC/USDT"] },

  // Stocks
  { title: "Apple unveils AI-powered Vision Pro 2 at WWDC", category: "stocks", sentiment: "positive", symbols: ["AAPL"] },
  { title: "Tesla Cybertruck demand exceeds 1 million reservations", category: "stocks", sentiment: "positive", symbols: ["TSLA"] },
  { title: "Amazon expands drone delivery to 15 new cities", category: "stocks", sentiment: "positive", symbols: ["AMZN"] },
  { title: "Microsoft Azure revenue grows 42% year-over-year", category: "stocks", sentiment: "positive", symbols: ["MSFT"] },
  { title: "Meta stock drops 5% on advertising revenue miss", category: "stocks", sentiment: "negative", symbols: ["META"] },

  // Bonds
  { title: "US 10-year Treasury yield breaks above 4.8%", category: "bonds", sentiment: "negative", symbols: ["TLT"] },
  { title: "Corporate bond market sees highest issuance in Q2", category: "bonds", sentiment: "neutral" },
  { title: "Japan BOJ policy shift sends global bond yields higher", category: "bonds", sentiment: "negative", symbols: ["JGB"] },
  { title: "Investment-grade corporate spreads tighten to 2-year low", category: "bonds", sentiment: "positive" },

  // Technology
  { title: "OpenAI announces GPT-6 with multimodal reasoning capabilities", category: "technology", sentiment: "positive" },
  { title: "SpaceX Starship completes successful orbital test flight", category: "technology", sentiment: "positive" },
  { title: "Global semiconductor shortage eases as new fabs come online", category: "technology", sentiment: "positive", symbols: ["INTC", "TSM"] },
  { title: "Quantum computing breakthrough: 1000-qubit processor achieved", category: "technology", sentiment: "positive", symbols: ["IBM"] },

  // Aviation
  { title: "Boeing 797 receives FAA certification for commercial flights", category: "aviation", sentiment: "positive", symbols: ["BA"] },
  { title: "Air traffic control outage disrupts flights across Europe", category: "aviation", sentiment: "negative" },
  { title: "Emirates orders 50 next-gen wide-body aircraft from Airbus", category: "aviation", sentiment: "positive" },
  { title: "New supersonic jet prototype completes first test flight", category: "aviation", sentiment: "positive" },
];

let articleIdCounter = 0;

function generateArticle(template?: typeof NEWS_TEMPLATES[0]): NewsArticle {
  const t = template || pick(NEWS_TEMPLATES);
  const minutesAgo = randInt(1, 180);
  const publishedAt = new Date(Date.now() - minutesAgo * 60000).toISOString();
  return {
    id: `news-${++articleIdCounter}-${Date.now()}`,
    title: t.title,
    summary: `Analysis and market impact assessment for: ${t.title.slice(0, 60)}...`,
    source: pick(NEWS_SOURCES),
    category: t.category,
    sentiment: t.sentiment,
    publishedAt,
    sourceUrl: "#",
    relatedSymbols: t.symbols,
  };
}

export function getNewsFeed(category: string = "all", limit: number = 30): NewsArticle[] {
  const articles: NewsArticle[] = [];
  const templates = category === "all"
    ? NEWS_TEMPLATES
    : NEWS_TEMPLATES.filter(t => t.category === category);

  for (let i = 0; i < Math.min(limit, templates.length * 2); i++) {
    articles.push(generateArticle(templates[i % templates.length]));
  }
  return articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function getNewsSentiment() {
  return { positive: randInt(35, 60), neutral: randInt(20, 35), negative: randInt(10, 30) };
}

// ── NEWS TICKER ─────────────────────────────────────────────────────────────

export interface TickerItem {
  id: string;
  headline: string;
  category: string;
  symbol?: string;
  change?: number;
}

export function getNewsTicker(): TickerItem[] {
  const items: TickerItem[] = [
    { id: "t1", headline: "BTC surges past $75K on institutional demand", category: "finance", symbol: "BTC", change: 4.28 },
    { id: "t2", headline: "Fed signals potential rate cut — markets rally", category: "breaking", symbol: "SPY", change: 1.42 },
    { id: "t3", headline: "NVIDIA hits record high on AI chip demand", category: "finance", symbol: "NVDA", change: 7.82 },
    { id: "t4", headline: "ETH ETF inflows exceed $2.4B in single day", category: "crypto", symbol: "ETH", change: 5.31 },
    { id: "t5", headline: "Boeing 797 certified for commercial flights", category: "aviation" },
    { id: "t6", headline: "10Y Treasury yield tops 4.8% — bond sell-off deepens", category: "bonds", symbol: "TLT", change: -1.89 },
    { id: "t7", headline: "Tesla Cybertruck reservations pass 1M mark", category: "stocks", symbol: "TSLA", change: 3.15 },
    { id: "t8", headline: "SOL network processes 100k TPS in stress test", category: "crypto", symbol: "SOL", change: 8.44 },
    { id: "t9", headline: "Gold hits new ATH amid geopolitical tensions", category: "finance", symbol: "GLD", change: 2.37 },
    { id: "t10", headline: "SEC proposes new crypto stablecoin regulation", category: "crypto", symbol: "USDT", change: -0.02 },
    { id: "t11", headline: "Apple unveils Vision Pro 2 with AI integration", category: "stocks", symbol: "AAPL", change: 2.89 },
    { id: "t12", headline: "ECB holds rates — Euro steady against Dollar", category: "finance", symbol: "EUR/USD", change: 0.15 },
    { id: "t13", headline: "Corporate bond issuance hits record in Q2", category: "bonds" },
    { id: "t14", headline: "Amazon drone delivery expands to 15 cities", category: "stocks", symbol: "AMZN", change: 1.76 },
    { id: "t15", headline: "OpenAI announces GPT-6 with multimodal reasoning", category: "technology" },
    { id: "t16", headline: "XRP surges 25% after Ripple wins SEC case", category: "crypto", symbol: "XRP", change: 25.4 },
    { id: "t17", headline: "Japan BOJ shift sends global bond yields higher", category: "bonds", symbol: "JGB", change: -0.85 },
    { id: "t18", headline: "Global supply chain alert — Suez Canal blocked", category: "breaking" },
  ];
  return items;
}

// ── MARKET ───────────────────────────────────────────────────────────────────

export interface MarketAsset {
  symbol: string;
  price: number;
  changePercent: number;
}

export function getMarketAssets(): MarketAsset[] {
  return [
    { symbol: "BTC/USDT", price: 71842 + rand(-500, 500), changePercent: rand(1, 6) },
    { symbol: "ETH/USDT", price: 3812 + rand(-50, 50), changePercent: rand(2, 8) },
    { symbol: "SPY", price: 528.74 + rand(-3, 3), changePercent: rand(-1, 2) },
    { symbol: "AAPL", price: 221.45 + rand(-2, 2), changePercent: rand(0, 4) },
    { symbol: "GLD", price: 2387.4 + rand(-10, 10), changePercent: rand(0, 2) },
    { symbol: "EUR/USD", price: 1.0842 + rand(-0.005, 0.005), changePercent: rand(-0.5, 0.5) },
    { symbol: "NVDA", price: 894.12 + rand(-10, 10), changePercent: rand(2, 9) },
    { symbol: "SOL/USDT", price: 187.6 + rand(-5, 5), changePercent: rand(-3, 5) },
    { symbol: "TSLA", price: 187.43 + rand(-4, 4), changePercent: rand(-5, 3) },
    { symbol: "MSFT", price: 425.80 + rand(-3, 3), changePercent: rand(0, 3) },
  ];
}

export function getMarketSummary() {
  const idx = randInt(25, 80);
  return {
    fearGreedIndex: idx,
    fearGreedLabel: idx > 75 ? "Extreme Greed" : idx > 55 ? "Greed" : idx > 40 ? "Neutral" : idx > 25 ? "Fear" : "Extreme Fear",
  };
}

// ── CANDLES ──────────────────────────────────────────────────────────────────

export interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export function getCandles(symbol: string, limit: number = 120): Candle[] {
  const basePrices: Record<string, number> = {
    "BTC/USDT": 71000, "ETH/USDT": 3800, "SOL/USDT": 185,
    "AAPL": 220, "NVDA": 890, "MSFT": 425, "TSLA": 185,
  };
  let price = basePrices[symbol] || 100;
  const candles: Candle[] = [];
  for (let i = 0; i < limit; i++) {
    const change = price * rand(-0.02, 0.02);
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.abs(change) * rand(0.1, 0.8);
    const low = Math.min(open, close) - Math.abs(change) * rand(0.1, 0.8);
    candles.push({ open, high, low, close, volume: randInt(1000, 50000) });
    price = close;
  }
  return candles;
}

export function getPrediction(symbol: string) {
  const basePrices: Record<string, number> = {
    "BTC/USDT": 71000, "ETH/USDT": 3800, "SOL/USDT": 185,
    "AAPL": 220, "NVDA": 890, "MSFT": 425, "TSLA": 185,
  };
  const price = basePrices[symbol] || 100;
  const direction = pick(["bullish", "bearish", "neutral"]);
  const target = direction === "bullish" ? price * rand(1.02, 1.08) : direction === "bearish" ? price * rand(0.93, 0.98) : price * rand(0.99, 1.01);
  return {
    direction,
    targetPrice: target,
    confidence: rand(55, 92),
    upperBound: target * 1.03,
    lowerBound: target * 0.97,
    factors: [
      { name: "RSI", weight: rand(0.3, 0.9), signal: pick(["bullish", "bearish", "neutral"]) },
      { name: "MACD", weight: rand(0.3, 0.9), signal: pick(["bullish", "bearish", "neutral"]) },
      { name: "Volume", weight: rand(0.2, 0.7), signal: pick(["bullish", "bearish", "neutral"]) },
      { name: "Sentiment", weight: rand(0.4, 0.8), signal: pick(["bullish", "bearish", "neutral"]) },
    ],
  };
}

// ── SIGNALS ─────────────────────────────────────────────────────────────────

export interface Signal {
  id: string;
  symbol: string;
  type: "buy" | "sell";
  conviction: string;
  entryPrice: number;
  currentPrice: number;
  pnlPercent: number;
  confidence: number;
  tcs: number;
  tp1: number; tp2: number; tp3: number;
  sl1: number; sl2: number;
}

export function getSignals(): Signal[] {
  return [
    { id: "s1", symbol: "BTC/USDT", type: "buy", conviction: "strong_buy", entryPrice: 69500, currentPrice: 71842, pnlPercent: 3.37, confidence: 89, tcs: 82, tp1: 73000, tp2: 75500, tp3: 78000, sl1: 68000, sl2: 66500 },
    { id: "s2", symbol: "ETH/USDT", type: "buy", conviction: "buy", entryPrice: 3650, currentPrice: 3812, pnlPercent: 4.44, confidence: 78, tcs: 65, tp1: 3900, tp2: 4100, tp3: 4300, sl1: 3500, sl2: 3350 },
    { id: "s3", symbol: "NVDA", type: "buy", conviction: "strong_buy", entryPrice: 840, currentPrice: 894, pnlPercent: 6.43, confidence: 92, tcs: 88, tp1: 920, tp2: 950, tp3: 1000, sl1: 820, sl2: 790 },
    { id: "s4", symbol: "TSLA", type: "sell", conviction: "weak_sell", entryPrice: 195, currentPrice: 187, pnlPercent: 4.10, confidence: 61, tcs: -45, tp1: 180, tp2: 170, tp3: 160, sl1: 200, sl2: 210 },
    { id: "s5", symbol: "SOL/USDT", type: "buy", conviction: "buy", entryPrice: 175, currentPrice: 187, pnlPercent: 6.86, confidence: 74, tcs: 58, tp1: 195, tp2: 210, tp3: 230, sl1: 165, sl2: 155 },
    { id: "s6", symbol: "AAPL", type: "buy", conviction: "weak_buy", entryPrice: 215, currentPrice: 221, pnlPercent: 2.79, confidence: 65, tcs: 42, tp1: 228, tp2: 235, tp3: 245, sl1: 210, sl2: 205 },
  ];
}

export function getSignalStats() {
  return {
    todayWinRate: rand(55, 78),
    todayPnl: rand(1, 8),
    weeklyPnl: rand(5, 18),
    activeSignals: 6,
    totalSignals: 24,
  };
}

export function getScanResults() {
  return [
    { symbol: "AVAX/USDT", tcs: 72, changePercent: 4.2, emerging: true },
    { symbol: "LINK/USDT", tcs: 58, changePercent: 3.1, emerging: false },
    { symbol: "DOGE/USDT", tcs: -35, changePercent: -2.8, emerging: false },
    { symbol: "AMD", tcs: 64, changePercent: 5.5, emerging: true },
    { symbol: "MSFT", tcs: 48, changePercent: 1.9, emerging: false },
  ];
}

// ── COUNTRY STOCKS ───────────────────────────────────────────────────────────

export interface CountryStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: number;
  marketCap: number;
  sector: string;
}

export interface CountryNewsItem {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  sentiment: "positive" | "negative" | "neutral";
  symbol?: string;
  category: string;
}

// India NSE/BSE stocks — representative seed data per sector
const INDIA_STOCKS_SEED: { symbol: string; name: string; basePrice: number; sector: string }[] = [
  // Banking & Finance
  { symbol: "HDFCBANK", name: "HDFC Bank Ltd", basePrice: 1640, sector: "Banking & Finance" },
  { symbol: "ICICIBANK", name: "ICICI Bank Ltd", basePrice: 1080, sector: "Banking & Finance" },
  { symbol: "SBIN", name: "State Bank of India", basePrice: 800, sector: "Banking & Finance" },
  { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank", basePrice: 1800, sector: "Banking & Finance" },
  { symbol: "AXISBANK", name: "Axis Bank Ltd", basePrice: 1150, sector: "Banking & Finance" },
  { symbol: "INDUSINDBK", name: "IndusInd Bank", basePrice: 1420, sector: "Banking & Finance" },
  { symbol: "BANDHANBNK", name: "Bandhan Bank", basePrice: 185, sector: "Banking & Finance" },
  { symbol: "FEDERALBNK", name: "Federal Bank", basePrice: 175, sector: "Banking & Finance" },
  { symbol: "PNB", name: "Punjab National Bank", basePrice: 125, sector: "Banking & Finance" },
  { symbol: "BANKBARODA", name: "Bank of Baroda", basePrice: 255, sector: "Banking & Finance" },
  { symbol: "BAJFINANCE", name: "Bajaj Finance", basePrice: 6900, sector: "Banking & Finance" },
  { symbol: "BAJAJFINSV", name: "Bajaj Finserv", basePrice: 1600, sector: "Banking & Finance" },
  { symbol: "HDFCLIFE", name: "HDFC Life Insurance", basePrice: 640, sector: "Banking & Finance" },
  { symbol: "SBILIFE", name: "SBI Life Insurance", basePrice: 1540, sector: "Banking & Finance" },
  { symbol: "ICICIGI", name: "ICICI Lombard", basePrice: 1880, sector: "Banking & Finance" },
  // IT
  { symbol: "TCS", name: "Tata Consultancy Services", basePrice: 4000, sector: "Information Technology" },
  { symbol: "INFY", name: "Infosys Ltd", basePrice: 1870, sector: "Information Technology" },
  { symbol: "WIPRO", name: "Wipro Ltd", basePrice: 520, sector: "Information Technology" },
  { symbol: "HCLTECH", name: "HCL Technologies", basePrice: 1800, sector: "Information Technology" },
  { symbol: "TECHM", name: "Tech Mahindra", basePrice: 1620, sector: "Information Technology" },
  { symbol: "LTIM", name: "LTIMindtree", basePrice: 5800, sector: "Information Technology" },
  { symbol: "MPHASIS", name: "Mphasis Ltd", basePrice: 2900, sector: "Information Technology" },
  { symbol: "COFORGE", name: "Coforge Ltd", basePrice: 7200, sector: "Information Technology" },
  { symbol: "PERSISTENT", name: "Persistent Systems", basePrice: 5500, sector: "Information Technology" },
  { symbol: "KPITTECH", name: "KPIT Technologies", basePrice: 1580, sector: "Information Technology" },
  // Pharmaceuticals
  { symbol: "SUNPHARMA", name: "Sun Pharmaceutical", basePrice: 1700, sector: "Pharmaceuticals" },
  { symbol: "CIPLA", name: "Cipla Ltd", basePrice: 1450, sector: "Pharmaceuticals" },
  { symbol: "DRREDDY", name: "Dr. Reddy's Laboratories", basePrice: 6800, sector: "Pharmaceuticals" },
  { symbol: "DIVISLAB", name: "Divi's Laboratories", basePrice: 3900, sector: "Pharmaceuticals" },
  { symbol: "BIOCON", name: "Biocon Ltd", basePrice: 360, sector: "Pharmaceuticals" },
  { symbol: "LUPIN", name: "Lupin Ltd", basePrice: 1900, sector: "Pharmaceuticals" },
  { symbol: "AUROPHARMA", name: "Aurobindo Pharma", basePrice: 1250, sector: "Pharmaceuticals" },
  { symbol: "TORNTPHARM", name: "Torrent Pharmaceuticals", basePrice: 2900, sector: "Pharmaceuticals" },
  { symbol: "ALKEM", name: "Alkem Laboratories", basePrice: 5400, sector: "Pharmaceuticals" },
  { symbol: "IPCALAB", name: "IPCA Laboratories", basePrice: 1680, sector: "Pharmaceuticals" },
  // Automobiles
  { symbol: "MARUTI", name: "Maruti Suzuki India", basePrice: 12800, sector: "Automobiles" },
  { symbol: "TATAMOTORS", name: "Tata Motors Ltd", basePrice: 950, sector: "Automobiles" },
  { symbol: "BAJAJ-AUTO", name: "Bajaj Auto Ltd", basePrice: 9800, sector: "Automobiles" },
  { symbol: "HEROMOTOCO", name: "Hero MotoCorp", basePrice: 5200, sector: "Automobiles" },
  { symbol: "M&M", name: "Mahindra & Mahindra", basePrice: 2100, sector: "Automobiles" },
  { symbol: "EICHERMOT", name: "Eicher Motors", basePrice: 4900, sector: "Automobiles" },
  { symbol: "ASHOKLEY", name: "Ashok Leyland", basePrice: 240, sector: "Automobiles" },
  { symbol: "EXIDEIND", name: "Exide Industries", basePrice: 500, sector: "Automobiles" },
  { symbol: "MOTHERSON", name: "Samvardhana Motherson", basePrice: 195, sector: "Automobiles" },
  { symbol: "BOSCHLTD", name: "Bosch Ltd", basePrice: 37000, sector: "Automobiles" },
  // Energy & Oil
  { symbol: "RELIANCE", name: "Reliance Industries", basePrice: 2900, sector: "Energy & Oil" },
  { symbol: "ONGC", name: "Oil & Natural Gas Corp", basePrice: 270, sector: "Energy & Oil" },
  { symbol: "IOC", name: "Indian Oil Corporation", basePrice: 160, sector: "Energy & Oil" },
  { symbol: "BPCL", name: "Bharat Petroleum", basePrice: 630, sector: "Energy & Oil" },
  { symbol: "COALINDIA", name: "Coal India Ltd", basePrice: 470, sector: "Energy & Oil" },
  { symbol: "NTPC", name: "NTPC Ltd", basePrice: 380, sector: "Energy & Oil" },
  { symbol: "POWERGRID", name: "Power Grid Corp", basePrice: 320, sector: "Energy & Oil" },
  { symbol: "ADANIGREEN", name: "Adani Green Energy", basePrice: 1950, sector: "Energy & Oil" },
  { symbol: "TATAPOWER", name: "Tata Power Company", basePrice: 435, sector: "Energy & Oil" },
  { symbol: "HINDPETRO", name: "Hindustan Petroleum", basePrice: 420, sector: "Energy & Oil" },
  // Metals & Mining
  { symbol: "TATASTEEL", name: "Tata Steel Ltd", basePrice: 175, sector: "Metals & Mining" },
  { symbol: "JSWSTEEL", name: "JSW Steel Ltd", basePrice: 920, sector: "Metals & Mining" },
  { symbol: "HINDALCO", name: "Hindalco Industries", basePrice: 680, sector: "Metals & Mining" },
  { symbol: "VEDL", name: "Vedanta Ltd", basePrice: 470, sector: "Metals & Mining" },
  { symbol: "SAIL", name: "Steel Authority of India", basePrice: 135, sector: "Metals & Mining" },
  { symbol: "NATIONALUM", name: "National Aluminium Co", basePrice: 190, sector: "Metals & Mining" },
  { symbol: "NMDC", name: "NMDC Ltd", basePrice: 220, sector: "Metals & Mining" },
  // Consumer Goods
  { symbol: "HINDUNILVR", name: "Hindustan Unilever", basePrice: 2350, sector: "Consumer Goods" },
  { symbol: "ITC", name: "ITC Ltd", basePrice: 480, sector: "Consumer Goods" },
  { symbol: "NESTLEIND", name: "Nestle India", basePrice: 2400, sector: "Consumer Goods" },
  { symbol: "BRITANNIA", name: "Britannia Industries", basePrice: 5200, sector: "Consumer Goods" },
  { symbol: "DABUR", name: "Dabur India", basePrice: 575, sector: "Consumer Goods" },
  { symbol: "MARICO", name: "Marico Ltd", basePrice: 645, sector: "Consumer Goods" },
  { symbol: "GODREJCP", name: "Godrej Consumer Products", basePrice: 1350, sector: "Consumer Goods" },
  { symbol: "COLPAL", name: "Colgate-Palmolive India", basePrice: 2900, sector: "Consumer Goods" },
  { symbol: "EMAMILTD", name: "Emami Ltd", basePrice: 610, sector: "Consumer Goods" },
  { symbol: "TATACONSUM", name: "Tata Consumer Products", basePrice: 1100, sector: "Consumer Goods" },
  // Telecom
  { symbol: "BHARTIARTL", name: "Bharti Airtel", basePrice: 1520, sector: "Telecom" },
  { symbol: "VODAFONE", name: "Vodafone Idea", basePrice: 15, sector: "Telecom" },
  { symbol: "TATACOMM", name: "Tata Communications", basePrice: 1780, sector: "Telecom" },
  { symbol: "ROUTE", name: "Route Mobile", basePrice: 1850, sector: "Telecom" },
  // Real Estate
  { symbol: "DLF", name: "DLF Ltd", basePrice: 880, sector: "Real Estate" },
  { symbol: "GODREJPROP", name: "Godrej Properties", basePrice: 2700, sector: "Real Estate" },
  { symbol: "OBEROIRLTY", name: "Oberoi Realty", basePrice: 1920, sector: "Real Estate" },
  { symbol: "PRESTIGE", name: "Prestige Estates", basePrice: 1540, sector: "Real Estate" },
  { symbol: "BRIGADE", name: "Brigade Enterprises", basePrice: 1100, sector: "Real Estate" },
  // Infrastructure
  { symbol: "LT", name: "Larsen & Toubro", basePrice: 3700, sector: "Infrastructure" },
  { symbol: "ADANIPORTS", name: "Adani Ports & SEZ", basePrice: 1380, sector: "Infrastructure" },
  { symbol: "GMRINFRA", name: "GMR Airports Infra", basePrice: 95, sector: "Infrastructure" },
  { symbol: "IRB", name: "IRB Infrastructure", basePrice: 65, sector: "Infrastructure" },
  { symbol: "NCC", name: "NCC Ltd", basePrice: 285, sector: "Infrastructure" },
  // Chemicals
  { symbol: "PIDILITIND", name: "Pidilite Industries", basePrice: 3000, sector: "Chemicals" },
  { symbol: "AARTIIND", name: "Aarti Industries", basePrice: 580, sector: "Chemicals" },
  { symbol: "NAVINFLUOR", name: "Navin Fluorine Intl", basePrice: 3800, sector: "Chemicals" },
  { symbol: "VINATIORGA", name: "Vinati Organics", basePrice: 1900, sector: "Chemicals" },
  { symbol: "CLEAN", name: "Clean Science", basePrice: 1650, sector: "Chemicals" },
  // Healthcare
  { symbol: "APOLLOHOSP", name: "Apollo Hospitals", basePrice: 6700, sector: "Healthcare" },
  { symbol: "FORTIS", name: "Fortis Healthcare", basePrice: 640, sector: "Healthcare" },
  { symbol: "MAXHEALTH", name: "Max Healthcare", basePrice: 920, sector: "Healthcare" },
  { symbol: "NARAYANA", name: "Narayana Hrudayalaya", basePrice: 1280, sector: "Healthcare" },
];

// US stocks seed
const US_STOCKS_SEED: { symbol: string; name: string; basePrice: number; sector: string }[] = [
  { symbol: "AAPL", name: "Apple Inc.", basePrice: 221, sector: "Technology" },
  { symbol: "MSFT", name: "Microsoft Corp.", basePrice: 425, sector: "Technology" },
  { symbol: "NVDA", name: "NVIDIA Corp.", basePrice: 894, sector: "Technology" },
  { symbol: "GOOGL", name: "Alphabet Inc.", basePrice: 175, sector: "Technology" },
  { symbol: "META", name: "Meta Platforms", basePrice: 520, sector: "Technology" },
  { symbol: "AMZN", name: "Amazon.com", basePrice: 185, sector: "Consumer" },
  { symbol: "TSLA", name: "Tesla Inc.", basePrice: 187, sector: "Automobiles" },
  { symbol: "JPM", name: "JPMorgan Chase", basePrice: 215, sector: "Banking" },
  { symbol: "UNH", name: "UnitedHealth Group", basePrice: 540, sector: "Healthcare" },
  { symbol: "JNJ", name: "Johnson & Johnson", basePrice: 155, sector: "Pharmaceuticals" },
  { symbol: "V", name: "Visa Inc.", basePrice: 280, sector: "Finance" },
  { symbol: "PG", name: "Procter & Gamble", basePrice: 168, sector: "Consumer Goods" },
  { symbol: "XOM", name: "Exxon Mobil", basePrice: 118, sector: "Energy" },
  { symbol: "HD", name: "Home Depot", basePrice: 365, sector: "Retail" },
  { symbol: "MA", name: "Mastercard", basePrice: 470, sector: "Finance" },
  { symbol: "BAC", name: "Bank of America", basePrice: 40, sector: "Banking" },
  { symbol: "CVX", name: "Chevron Corp.", basePrice: 155, sector: "Energy" },
  { symbol: "MRK", name: "Merck & Co.", basePrice: 125, sector: "Pharmaceuticals" },
  { symbol: "LLY", name: "Eli Lilly and Co.", basePrice: 780, sector: "Pharmaceuticals" },
  { symbol: "ABBV", name: "AbbVie Inc.", basePrice: 175, sector: "Pharmaceuticals" },
];

// China/Japan/etc. stocks seed
const CHINA_STOCKS_SEED: { symbol: string; name: string; basePrice: number; sector: string }[] = [
  { symbol: "600519", name: "Kweichow Moutai", basePrice: 1650, sector: "Consumer" },
  { symbol: "601318", name: "Ping An Insurance", basePrice: 42, sector: "Insurance" },
  { symbol: "601398", name: "ICBC", basePrice: 5.8, sector: "Banking" },
  { symbol: "600036", name: "China Merchants Bank", basePrice: 34, sector: "Banking" },
  { symbol: "000858", name: "Wuliangye Yibin", basePrice: 148, sector: "Consumer" },
  { symbol: "601888", name: "China Intl Travel", basePrice: 62, sector: "Tourism" },
  { symbol: "600900", name: "Yangtze Power", basePrice: 23, sector: "Energy" },
  { symbol: "000333", name: "Midea Group", basePrice: 55, sector: "Consumer" },
  { symbol: "002594", name: "BYD Company", basePrice: 285, sector: "Automobiles" },
  { symbol: "600031", name: "Sany Heavy Industry", basePrice: 22, sector: "Infrastructure" },
];

// Generates a large set of stocks for a country using seed data + procedural generation
export function getCountryStocks(countryId: string, count: number = 100): CountryStock[] {
  const seedMap: Record<string, typeof INDIA_STOCKS_SEED> = {
    IN: INDIA_STOCKS_SEED,
    US: US_STOCKS_SEED,
    CN: CHINA_STOCKS_SEED,
  };

  const genericSectors = [
    "Banking & Finance", "Technology", "Pharmaceuticals", "Automobiles",
    "Consumer Goods", "Energy", "Metals & Mining", "Telecom", "Real Estate",
    "Infrastructure", "Chemicals", "Healthcare", "Retail", "Media", "Agriculture",
    "Defense", "Aviation", "Logistics", "Insurance", "Utilities",
  ];

  const seeds = seedMap[countryId] || [];
  const stocks: CountryStock[] = [];

  // Add seed stocks first
  for (const s of seeds) {
    const changePct = rand(-8, 10);
    stocks.push({
      symbol: s.symbol,
      name: s.name,
      price: s.basePrice * (1 + rand(-0.05, 0.05)),
      change: changePct,
      volume: randInt(100000, 50000000),
      marketCap: s.basePrice * randInt(50000000, 5000000000),
      sector: s.sector,
    });
  }

  // Fill rest procedurally
  const prefixMap: Record<string, string> = {
    IN: "", US: "", CN: "", JP: "", GB: "GB", DE: "DE", FR: "FR",
    BR: "BZ", AU: "AU", KR: "KR", CA: "CA", AE: "AE", SG: "SG", HK: "HK",
    ZA: "JSE", MX: "MX", ID: "IDX", RU: "RU",
  };
  const prefix = prefixMap[countryId] || countryId;

  const companyTypes = ["Industries", "Holdings", "Corp", "Group", "Ltd", "Technologies", "Enterprises", "Solutions", "Capital", "Services"];
  const companyPrefixes = ["Alpha", "Beta", "Gamma", "Delta", "Sigma", "Apex", "Summit", "Prime", "Global", "Metro", "Union", "National", "Royal", "Pacific", "Atlantic", "Eastern", "Western", "Northern", "Southern", "Central"];

  let i = stocks.length;
  while (stocks.length < count) {
    i++;
    const sector = genericSectors[i % genericSectors.length];
    const cPrefix = companyPrefixes[i % companyPrefixes.length];
    const cType = companyTypes[Math.floor(i / companyPrefixes.length) % companyTypes.length];
    const sym = prefix ? `${prefix}${i.toString().padStart(4, "0")}` : `${cPrefix.slice(0, 3).toUpperCase()}${i.toString().padStart(3, "0")}`;
    const basePrice = rand(10, 5000);
    stocks.push({
      symbol: sym,
      name: `${cPrefix} ${sector.split(" ")[0]} ${cType}`,
      price: basePrice * (1 + rand(-0.05, 0.05)),
      change: rand(-12, 15),
      volume: randInt(10000, 10000000),
      marketCap: basePrice * randInt(100000, 1000000000),
      sector,
    });
  }

  return stocks.slice(0, count);
}

// Country-specific news data
const COUNTRY_NEWS: Record<string, { title: string; source: string; sentiment: "positive" | "negative" | "neutral"; symbol?: string; category: string }[]> = {
  IN: [
    { title: "Nifty 50 hits record high on strong FII inflows", source: "Economic Times", sentiment: "positive", symbol: "NIFTY50", category: "markets" },
    { title: "RBI keeps repo rate unchanged at 6.5% — inflation under control", source: "Business Standard", sentiment: "neutral", category: "macro" },
    { title: "Sensex surges 800 points as IT stocks lead rally", source: "Mint", sentiment: "positive", symbol: "SENSEX", category: "markets" },
    { title: "TCS wins $2.5B deal with European banking major", source: "Economic Times", sentiment: "positive", symbol: "TCS", category: "stocks" },
    { title: "Reliance Jio eyes 5G expansion into tier-2 cities", source: "Business Today", sentiment: "positive", symbol: "RELIANCE", category: "stocks" },
    { title: "India GDP growth forecast raised to 7.2% by IMF", source: "Livemint", sentiment: "positive", category: "macro" },
    { title: "HDFC Bank reports record quarterly profit of ₹16,500 Cr", source: "CNBC-TV18", sentiment: "positive", symbol: "HDFCBANK", category: "stocks" },
    { title: "Adani Group stocks tumble on short-seller report", source: "Business Standard", sentiment: "negative", symbol: "ADANIGREEN", category: "stocks" },
    { title: "India's IT exports cross $250B annual milestone", source: "NASSCOM", sentiment: "positive", category: "technology" },
    { title: "Sun Pharma receives USFDA approval for oncology drug", source: "Economic Times", sentiment: "positive", symbol: "SUNPHARMA", category: "stocks" },
    { title: "Nifty Bank index touches all-time high of 52,000", source: "Zerodha", sentiment: "positive", category: "markets" },
    { title: "India-UK FTA negotiations accelerate — textile sector to gain", source: "Financial Express", sentiment: "positive", category: "macro" },
    { title: "SEBI tightens F&O trading norms for retail investors", source: "Mint", sentiment: "negative", category: "regulation" },
    { title: "Maruti Suzuki reports highest-ever monthly sales", source: "Auto Today", sentiment: "positive", symbol: "MARUTI", category: "stocks" },
    { title: "Infosys cuts revenue guidance for FY25 — stock drops 4%", source: "ET Markets", sentiment: "negative", symbol: "INFY", category: "stocks" },
    { title: "Coal India dividend payout attracts PSU fund interest", source: "Business Standard", sentiment: "positive", symbol: "COALINDIA", category: "stocks" },
    { title: "India's forex reserves hit $660B new all-time high", source: "RBI", sentiment: "positive", category: "macro" },
    { title: "Tata Motors EV sales triple on Nexon.ev demand surge", source: "Autocar India", sentiment: "positive", symbol: "TATAMOTORS", category: "stocks" },
    { title: "ONGC discovers large oil reserve off Andhra coast", source: "Hindu Business Line", sentiment: "positive", symbol: "ONGC", category: "stocks" },
    { title: "Bajaj Finance faces RBI curbs on digital lending — stock falls 6%", source: "Livemint", sentiment: "negative", symbol: "BAJFINANCE", category: "regulation" },
  ],
  US: [
    { title: "S&P 500 extends record run as tech earnings beat estimates", source: "Bloomberg", sentiment: "positive", symbol: "SPY", category: "markets" },
    { title: "Fed holds rates at 5.25–5.5%, signals two cuts in 2025", source: "Reuters", sentiment: "positive", category: "macro" },
    { title: "NVIDIA's AI chip backlog exceeds $40B — stock hits ATH", source: "CNBC", sentiment: "positive", symbol: "NVDA", category: "stocks" },
    { title: "Apple Vision Pro 2 pre-orders sell out in 24 hours", source: "9to5Mac", sentiment: "positive", symbol: "AAPL", category: "stocks" },
    { title: "Tesla reports record Q4 deliveries, stock soars 12%", source: "Reuters", sentiment: "positive", symbol: "TSLA", category: "stocks" },
    { title: "US CPI cools to 2.8% — core inflation easing", source: "WSJ", sentiment: "positive", category: "macro" },
    { title: "Microsoft Azure AI revenue surpasses $30B annual run-rate", source: "FT", sentiment: "positive", symbol: "MSFT", category: "stocks" },
    { title: "Meta hits 4B daily active users across all platforms", source: "Bloomberg", sentiment: "positive", symbol: "META", category: "stocks" },
    { title: "JPMorgan warns of commercial real estate credit risks", source: "WSJ", sentiment: "negative", symbol: "JPM", category: "stocks" },
    { title: "US jobless claims rise unexpectedly — recession fears resurface", source: "AP", sentiment: "negative", category: "macro" },
  ],
  CN: [
    { title: "China's PMI rebounds to 52.5 — factory activity expands", source: "Caixin", sentiment: "positive", category: "macro" },
    { title: "BYD overtakes Tesla as world's largest EV maker by volume", source: "Reuters", sentiment: "positive", symbol: "002594", category: "stocks" },
    { title: "PBOC cuts reserve ratio to boost credit growth", source: "Xinhua", sentiment: "positive", category: "macro" },
    { title: "Alibaba announces $4B buyback program — stock jumps 8%", source: "SCMP", sentiment: "positive", category: "stocks" },
    { title: "China property sector shows recovery signs — Evergrande restructuring approved", source: "Bloomberg", sentiment: "neutral", category: "real estate" },
    { title: "Xi announces new stimulus package targeting SMEs", source: "Reuters", sentiment: "positive", category: "macro" },
  ],
};

// Generic news for countries without specific data
const GENERIC_COUNTRY_NEWS: Record<string, string[]> = {
  JP: ["BOJ maintains ultra-loose monetary policy", "Toyota reports record global sales", "Softbank Vision Fund returns to profit", "Nikkei 225 hits 34-year high"],
  GB: ["Bank of England signals rate cuts ahead", "FTSE 100 hits record 8,500 level", "UK inflation falls to 2.3%", "BP raises dividend on oil profit surge"],
  DE: ["DAX breaks 20,000 for first time", "Volkswagen EV strategy shift boosts shares", "German factory orders rise 3.2%", "Deutsche Bank profit doubles on interest income"],
  FR: ["CAC 40 recovers post-election uncertainty", "LVMH luxury sales beat expectations", "Renault EV partnership with Nissan approved", "Total Energy expands LNG portfolio"],
  AU: ["ASX 200 hits record on mining boom", "BHP reports $12B half-year profit", "RBA holds rates — housing market surges", "Rio Tinto iron ore shipments at record"],
  KR: ["Samsung Electronics beats Q2 profit estimates", "KOSPI rallies on chip sector demand", "Hyundai EV sales up 45% in US market", "SK Hynix lands NVIDIA HBM4 contract"],
  BR: ["Petrobras dividend attracts global fund interest", "Bovespa gains on Lula economic reforms", "Brazil inflation cools to 4.1%", "Vale iron ore output breaks quarterly record"],
};

let countryNewsCounter = 0;
export function getCountryNews(countryId: string, limit: number = 30): CountryNewsItem[] {
  const specific = COUNTRY_NEWS[countryId] || [];
  const genericTitles = GENERIC_COUNTRY_NEWS[countryId] || [];
  const results: CountryNewsItem[] = [];

  // Add specific news
  for (const item of specific) {
    const mins = randInt(1, 240);
    results.push({
      id: `cn-${countryId}-${++countryNewsCounter}`,
      title: item.title,
      source: item.source,
      publishedAt: new Date(Date.now() - mins * 60000).toISOString(),
      sentiment: item.sentiment,
      symbol: item.symbol,
      category: item.category,
    });
  }

  // Add generic titles for countries without specific data
  for (const title of genericTitles) {
    const mins = randInt(1, 480);
    results.push({
      id: `cn-${countryId}-${++countryNewsCounter}`,
      title,
      source: pick(["Reuters", "Bloomberg", "Financial Times", "AP", "CNBC"]),
      publishedAt: new Date(Date.now() - mins * 60000).toISOString(),
      sentiment: pick(["positive", "positive", "neutral", "negative"]),
      category: "markets",
    });
  }

  // Fill to limit with global finance news contextualized to country
  const globalTemplates = [
    `Institutional investors increase ${countryId} equity allocation by 12%`,
    `${countryId} central bank statement due next week — markets on edge`,
    `Foreign direct investment into ${countryId} hits quarterly record`,
    `${countryId} stock market outperforms regional peers this quarter`,
    `Analyst upgrades ${countryId} market to overweight amid growth outlook`,
    `Currency stability supports ${countryId} equity valuations`,
    `${countryId} earnings season beats expectations — 68% of companies top forecasts`,
    `Global fund flows into ${countryId} ETFs hit 12-month high`,
  ];

  while (results.length < limit) {
    const mins = randInt(1, 720);
    results.push({
      id: `cn-${countryId}-${++countryNewsCounter}`,
      title: pick(globalTemplates),
      source: pick(["Reuters", "Bloomberg", "Financial Times", "CNBC", "AP", "Nikkei", "WSJ"]),
      publishedAt: new Date(Date.now() - mins * 60000).toISOString(),
      sentiment: pick(["positive", "positive", "neutral", "negative"]),
      category: "markets",
    });
  }

  return results.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()).slice(0, limit);
}

// ── FLIGHTS ─────────────────────────────────────────────────────────────────

export interface Flight {
  icao24: string;
  callsign: string;
  lat: number;
  lng: number;
  altitude: number;
  speed: number;
  heading: number;
  type: "commercial" | "military" | "private" | "cargo";
  isAlert: boolean;
  alertReason?: string;
  origin?: string;
  destination?: string;
  squawk?: string;
}

const AIRPORTS = ["JFK", "LAX", "LHR", "CDG", "DXB", "SIN", "NRT", "SYD", "FRA", "HKG", "ICN", "BOM", "DEL", "PEK", "SFO", "ORD", "ATL", "MIA", "AMS", "IST"];
const CALLSIGNS = ["UAE", "BA", "AA", "DL", "UA", "LH", "AF", "SQ", "QF", "CX", "KE", "AI", "CA", "TK", "KL", "EK", "QR", "NH", "JL", "SU"];

function generateFlight(i: number): Flight {
  const type = pick(["commercial", "commercial", "commercial", "commercial", "cargo", "private", "military"]) as Flight["type"];
  const isAlert = Math.random() < 0.03;
  return {
    icao24: `${i.toString(16).padStart(6, "0")}`,
    callsign: `${pick(CALLSIGNS)}${randInt(100, 9999)}`,
    lat: rand(-60, 70),
    lng: rand(-170, 170),
    altitude: type === "military" ? randInt(5000, 45000) : randInt(28000, 42000),
    speed: randInt(350, 580),
    heading: rand(0, 360),
    type,
    isAlert,
    alertReason: isAlert ? pick(["Squawk 7700 — Emergency", "Unusual altitude deviation", "Off-route deviation detected"]) : undefined,
    origin: pick(AIRPORTS),
    destination: pick(AIRPORTS),
    squawk: isAlert ? pick(["7700", "7600", "7500"]) : undefined,
  };
}

export function getFlights(limit: number = 150): Flight[] {
  return Array.from({ length: limit }, (_, i) => generateFlight(i));
}

export function getFlightStats() {
  return {
    totalAirborne: randInt(8500, 12000),
    commercial: randInt(6000, 8000),
    military: randInt(200, 500),
    private: randInt(1500, 2500),
    cargo: randInt(800, 1200),
    alertedFlights: randInt(1, 5),
  };
}

// ── ALERTS ──────────────────────────────────────────────────────────────────

export interface Alert {
  id: number;
  name: string;
  condition: string;
  symbol: string;
  channel: string;
  active: boolean;
  createdAt: string;
}

export function getDefaultAlerts(): Alert[] {
  return [
    { id: 1, name: "BTC above 75K", condition: "BTC price > 75000", symbol: "BTC/USDT", channel: "browser", active: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 2, name: "ETH Breakout", condition: "ETH price > 4000 AND volume > 500M", symbol: "ETH/USDT", channel: "email", active: true, createdAt: new Date(Date.now() - 172800000).toISOString() },
    { id: 3, name: "NVDA Earnings Alert", condition: "NVDA price change > 5% in 1h", symbol: "NVDA", channel: "telegram", active: false, createdAt: new Date(Date.now() - 259200000).toISOString() },
    { id: 4, name: "Bond Yield Spike", condition: "US 10Y yield > 5.0%", symbol: "TLT", channel: "webhook", active: true, createdAt: new Date(Date.now() - 345600000).toISOString() },
  ];
}

// ── WATCHLIST ────────────────────────────────────────────────────────────────

export interface WatchlistItem {
  id: number;
  symbol: string;
  name: string;
  type: string;
}

export function getDefaultWatchlist(): WatchlistItem[] {
  return [
    { id: 1, symbol: "BTC/USDT", name: "Bitcoin", type: "crypto" },
    { id: 2, symbol: "ETH/USDT", name: "Ethereum", type: "crypto" },
    { id: 3, symbol: "AAPL", name: "Apple Inc.", type: "stocks" },
    { id: 4, symbol: "NVDA", name: "NVIDIA Corp.", type: "stocks" },
    { id: 5, symbol: "SPY", name: "S&P 500 ETF", type: "etf" },
    { id: 6, symbol: "GLD", name: "Gold Trust", type: "etf" },
    { id: 7, symbol: "SOL/USDT", name: "Solana", type: "crypto" },
    { id: 8, symbol: "TSLA", name: "Tesla Inc.", type: "stocks" },
  ];
}

export function getWatchlistPrices(): Record<string, { price: number; change: number }> {
  return {
    "BTC/USDT": { price: 71842 + rand(-500, 500), change: rand(1, 6) },
    "ETH/USDT": { price: 3812 + rand(-50, 50), change: rand(2, 8) },
    "SOL/USDT": { price: 187.6 + rand(-5, 5), change: rand(-3, 5) },
    "AAPL": { price: 221.45 + rand(-2, 2), change: rand(0, 4) },
    "NVDA": { price: 894.12 + rand(-10, 10), change: rand(2, 9) },
    "TSLA": { price: 187.43 + rand(-4, 4), change: rand(-5, 3) },
    "SPY": { price: 528.74 + rand(-3, 3), change: rand(-1, 2) },
    "GLD": { price: 2387.4 + rand(-10, 10), change: rand(0, 2) },
    "MSFT": { price: 425.80 + rand(-3, 3), change: rand(0, 3) },
    "EUR/USD": { price: 1.0842 + rand(-0.005, 0.005), change: rand(-0.5, 0.5) },
  };
}
