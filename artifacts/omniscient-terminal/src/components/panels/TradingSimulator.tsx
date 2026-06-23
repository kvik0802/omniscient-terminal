import { useState, useEffect, useMemo } from "react";
import { BookOpen, TrendingUp, TrendingDown, DollarSign, ShoppingCart, CheckCircle, Info, ChevronRight, BarChart2, Award, AlertOctagon, RefreshCw } from "lucide-react";

// ── Countries ────────────────────────────────────────────────────────────────
const COUNTRIES = [
  { code: "US", name: "United States", currency: "USD", symbol: "$", rate: 1, flag: "🇺🇸" },
  { code: "IN", name: "India", currency: "INR", symbol: "₹", rate: 83.5, flag: "🇮🇳" },
  { code: "GB", name: "United Kingdom", currency: "GBP", symbol: "£", rate: 0.79, flag: "🇬🇧" },
  { code: "EU", name: "European Union", currency: "EUR", symbol: "€", rate: 0.92, flag: "🇪🇺" },
  { code: "JP", name: "Japan", currency: "JPY", symbol: "¥", rate: 154.2, flag: "🇯🇵" },
  { code: "CN", name: "China", currency: "CNY", symbol: "¥", rate: 7.24, flag: "🇨🇳" },
  { code: "AU", name: "Australia", currency: "AUD", symbol: "A$", rate: 1.54, flag: "🇦🇺" },
  { code: "CA", name: "Canada", currency: "CAD", symbol: "C$", rate: 1.37, flag: "🇨🇦" },
  { code: "CH", name: "Switzerland", currency: "CHF", symbol: "Fr", rate: 0.90, flag: "🇨🇭" },
  { code: "KR", name: "South Korea", currency: "KRW", symbol: "₩", rate: 1340, flag: "🇰🇷" },
  { code: "SG", name: "Singapore", currency: "SGD", symbol: "S$", rate: 1.35, flag: "🇸🇬" },
  { code: "HK", name: "Hong Kong", currency: "HKD", symbol: "HK$", rate: 7.82, flag: "🇭🇰" },
  { code: "BR", name: "Brazil", currency: "BRL", symbol: "R$", rate: 4.97, flag: "🇧🇷" },
  { code: "MX", name: "Mexico", currency: "MXN", symbol: "Mex$", rate: 17.2, flag: "🇲🇽" },
  { code: "ZA", name: "South Africa", currency: "ZAR", symbol: "R", rate: 18.7, flag: "🇿🇦" },
  { code: "RU", name: "Russia", currency: "RUB", symbol: "₽", rate: 91, flag: "🇷🇺" },
  { code: "SE", name: "Sweden", currency: "SEK", symbol: "kr", rate: 10.5, flag: "🇸🇪" },
  { code: "NO", name: "Norway", currency: "NOK", symbol: "kr", rate: 10.6, flag: "🇳🇴" },
  { code: "DK", name: "Denmark", currency: "DKK", symbol: "kr", rate: 6.9, flag: "🇩🇰" },
  { code: "NZ", name: "New Zealand", currency: "NZD", symbol: "NZ$", rate: 1.63, flag: "🇳🇿" },
  { code: "AE", name: "UAE", currency: "AED", symbol: "د.إ", rate: 3.67, flag: "🇦🇪" },
  { code: "SA", name: "Saudi Arabia", currency: "SAR", symbol: "﷼", rate: 3.75, flag: "🇸🇦" },
  { code: "TR", name: "Turkey", currency: "TRY", symbol: "₺", rate: 32.5, flag: "🇹🇷" },
  { code: "PL", name: "Poland", currency: "PLN", symbol: "zł", rate: 3.97, flag: "🇵🇱" },
  { code: "CZ", name: "Czech Republic", currency: "CZK", symbol: "Kč", rate: 23.1, flag: "🇨🇿" },
  { code: "HU", name: "Hungary", currency: "HUF", symbol: "Ft", rate: 358, flag: "🇭🇺" },
  { code: "MY", name: "Malaysia", currency: "MYR", symbol: "RM", rate: 4.72, flag: "🇲🇾" },
  { code: "TH", name: "Thailand", currency: "THB", symbol: "฿", rate: 36, flag: "🇹🇭" },
  { code: "ID", name: "Indonesia", currency: "IDR", symbol: "Rp", rate: 15800, flag: "🇮🇩" },
  { code: "PH", name: "Philippines", currency: "PHP", symbol: "₱", rate: 56.2, flag: "🇵🇭" },
  { code: "EG", name: "Egypt", currency: "EGP", symbol: "£", rate: 47, flag: "🇪🇬" },
  { code: "NG", name: "Nigeria", currency: "NGN", symbol: "₦", rate: 1490, flag: "🇳🇬" },
  { code: "KE", name: "Kenya", currency: "KES", symbol: "Ksh", rate: 130, flag: "🇰🇪" },
  { code: "AR", name: "Argentina", currency: "ARS", symbol: "$", rate: 870, flag: "🇦🇷" },
  { code: "CL", name: "Chile", currency: "CLP", symbol: "$", rate: 950, flag: "🇨🇱" },
  { code: "CO", name: "Colombia", currency: "COP", symbol: "$", rate: 3950, flag: "🇨🇴" },
  { code: "PK", name: "Pakistan", currency: "PKR", symbol: "₨", rate: 278, flag: "🇵🇰" },
  { code: "BD", name: "Bangladesh", currency: "BDT", symbol: "৳", rate: 110, flag: "🇧🇩" },
  { code: "VN", name: "Vietnam", currency: "VND", symbol: "₫", rate: 24800, flag: "🇻🇳" },
  { code: "UA", name: "Ukraine", currency: "UAH", symbol: "₴", rate: 39, flag: "🇺🇦" },
  { code: "RO", name: "Romania", currency: "RON", symbol: "lei", rate: 4.6, flag: "🇷🇴" },
  { code: "IL", name: "Israel", currency: "ILS", symbol: "₪", rate: 3.7, flag: "🇮🇱" },
  { code: "QA", name: "Qatar", currency: "QAR", symbol: "﷼", rate: 3.64, flag: "🇶🇦" },
  { code: "KW", name: "Kuwait", currency: "KWD", symbol: "K.D.", rate: 0.31, flag: "🇰🇼" },
  { code: "GH", name: "Ghana", currency: "GHS", symbol: "₵", rate: 15, flag: "🇬🇭" },
  { code: "TZ", name: "Tanzania", currency: "TZS", symbol: "TSh", rate: 2550, flag: "🇹🇿" },
  { code: "ET", name: "Ethiopia", currency: "ETB", symbol: "Br", rate: 57, flag: "🇪🇹" },
  { code: "DE", name: "Germany", currency: "EUR", symbol: "€", rate: 0.92, flag: "🇩🇪" },
  { code: "FR", name: "France", currency: "EUR", symbol: "€", rate: 0.92, flag: "🇫🇷" },
  { code: "IT", name: "Italy", currency: "EUR", symbol: "€", rate: 0.92, flag: "🇮🇹" },
  { code: "ES", name: "Spain", currency: "EUR", symbol: "€", rate: 0.92, flag: "🇪🇸" },
];

// ── Country-specific stock assets ────────────────────────────────────────────
interface Asset {
  symbol: string;
  name: string;
  basePrice: number;
  category: "crypto" | "stock" | "etf";
  description: string;
  emoji: string;
  volatility: number;
}

const CRYPTO_ASSETS: Asset[] = [
  { symbol: "BTC", name: "Bitcoin", basePrice: 71000, category: "crypto", emoji: "₿", volatility: 0.04, description: "Bitcoin is digital gold — a decentralized cryptocurrency. When more people want it, the price goes up!" },
  { symbol: "ETH", name: "Ethereum", basePrice: 3800, category: "crypto", emoji: "⟠", volatility: 0.05, description: "Ethereum is a platform that runs apps on a blockchain. Think of it as the internet of crypto." },
  { symbol: "SOL", name: "Solana", basePrice: 187, category: "crypto", emoji: "◎", volatility: 0.06, description: "Solana is a very fast cryptocurrency. It can process thousands of transactions per second!" },
];

const COUNTRY_ASSETS: Record<string, Asset[]> = {
  US: [
    { symbol: "AAPL", name: "Apple Inc.", basePrice: 221, category: "stock", emoji: "🍎", volatility: 0.015, description: "Apple makes iPhones, Macs and iPads. When Apple sells more products, its stock price usually rises!" },
    { symbol: "NVDA", name: "NVIDIA", basePrice: 890, category: "stock", emoji: "🎮", volatility: 0.025, description: "NVIDIA makes graphics chips used in games and AI. One of the most powerful tech companies in the world!" },
    { symbol: "MSFT", name: "Microsoft", basePrice: 425, category: "stock", emoji: "💻", volatility: 0.012, description: "Microsoft makes Windows, Office, and Xbox — and the Azure cloud that powers countless apps." },
    { symbol: "TSLA", name: "Tesla", basePrice: 187, category: "stock", emoji: "🚗", volatility: 0.035, description: "Tesla makes electric cars and solar energy products. Very popular with young investors!" },
    { symbol: "AMZN", name: "Amazon", basePrice: 185, category: "stock", emoji: "📦", volatility: 0.02, description: "Amazon runs the world's biggest online store and the largest cloud computing platform (AWS)." },
    { symbol: "META", name: "Meta Platforms", basePrice: 512, category: "stock", emoji: "👥", volatility: 0.025, description: "Meta owns Facebook, Instagram, and WhatsApp — connecting billions of people." },
  ],
  IN: [
    { symbol: "RELIANCE", name: "Reliance Industries", basePrice: 2950, category: "stock", emoji: "🛢️", volatility: 0.015, description: "Reliance is India's largest company by market cap — oil, telecom, retail and more!" },
    { symbol: "TCS", name: "Tata Consultancy Services", basePrice: 3450, category: "stock", emoji: "💻", volatility: 0.012, description: "TCS is India's largest IT services company, working with clients across the world." },
    { symbol: "HDFCBANK", name: "HDFC Bank", basePrice: 1680, category: "stock", emoji: "🏦", volatility: 0.01, description: "HDFC Bank is India's largest private bank — trusted by crores of Indians." },
    { symbol: "INFY", name: "Infosys", basePrice: 1520, category: "stock", emoji: "🖥️", volatility: 0.014, description: "Infosys is a global IT consulting giant from Bangalore — a pride of India!" },
    { symbol: "WIPRO", name: "Wipro", basePrice: 490, category: "stock", emoji: "⚙️", volatility: 0.016, description: "Wipro is a major Indian IT and tech company serving clients worldwide." },
    { symbol: "SBIN", name: "State Bank of India", basePrice: 820, category: "stock", emoji: "🏛️", volatility: 0.018, description: "SBI is India's largest public sector bank — with branches everywhere in India!" },
  ],
  GB: [
    { symbol: "HSBA", name: "HSBC Holdings", basePrice: 650, category: "stock", emoji: "🏦", volatility: 0.012, description: "HSBC is one of the world's largest banks, headquartered in London." },
    { symbol: "BP", name: "BP plc", basePrice: 480, category: "stock", emoji: "⛽", volatility: 0.018, description: "BP is one of the world's largest oil and gas companies — founded in Britain." },
    { symbol: "AZN", name: "AstraZeneca", basePrice: 11200, category: "stock", emoji: "💊", volatility: 0.014, description: "AstraZeneca makes medicines and vaccines — including COVID-19 vaccines!" },
    { symbol: "LLOY", name: "Lloyds Banking", basePrice: 55, category: "stock", emoji: "🏛️", volatility: 0.02, description: "Lloyds is one of Britain's biggest banks, with roots going back 250 years." },
    { symbol: "VOD", name: "Vodafone Group", basePrice: 75, category: "stock", emoji: "📱", volatility: 0.025, description: "Vodafone is a leading global telecom company with customers in many countries." },
    { symbol: "SHEL", name: "Shell plc", basePrice: 2700, category: "stock", emoji: "🐚", volatility: 0.016, description: "Shell is a global energy and petrochemical company. One of the largest in the world." },
  ],
  JP: [
    { symbol: "7203", name: "Toyota Motor", basePrice: 3200, category: "stock", emoji: "🚗", volatility: 0.014, description: "Toyota is the world's largest car manufacturer — famous for reliability!" },
    { symbol: "6758", name: "Sony Group", basePrice: 12500, category: "stock", emoji: "🎮", volatility: 0.018, description: "Sony makes PlayStation, TVs, cameras, and music — a true Japanese tech icon!" },
    { symbol: "9984", name: "SoftBank Group", basePrice: 9200, category: "stock", emoji: "📡", volatility: 0.03, description: "SoftBank is a massive Japanese investment and telecom company." },
    { symbol: "6861", name: "Keyence", basePrice: 56000, category: "stock", emoji: "🔬", volatility: 0.012, description: "Keyence makes sensors and instruments for factories — a high-precision tech company." },
    { symbol: "7974", name: "Nintendo", basePrice: 8200, category: "stock", emoji: "🕹️", volatility: 0.022, description: "Nintendo makes Switch, Mario and Pokémon — beloved by gamers around the world!" },
    { symbol: "4063", name: "Shin-Etsu Chemical", basePrice: 5600, category: "stock", emoji: "⚗️", volatility: 0.013, description: "Shin-Etsu makes silicon wafers — essential for making computer chips!" },
  ],
  CN: [
    { symbol: "BABA", name: "Alibaba Group", basePrice: 78, category: "stock", emoji: "🛒", volatility: 0.03, description: "Alibaba is China's biggest e-commerce company — like Amazon but for China!" },
    { symbol: "TCEHY", name: "Tencent Holdings", basePrice: 42, category: "stock", emoji: "🎮", volatility: 0.025, description: "Tencent owns WeChat, games like PUBG, and invests in companies worldwide." },
    { symbol: "BIDU", name: "Baidu Inc.", basePrice: 92, category: "stock", emoji: "🔍", volatility: 0.03, description: "Baidu is the Google of China — powering search and AI for Chinese users." },
    { symbol: "PDD", name: "PDD Holdings", basePrice: 130, category: "stock", emoji: "📦", volatility: 0.035, description: "PDD runs Pinduoduo — China's fast-growing group-buying and e-commerce platform." },
    { symbol: "NIO", name: "NIO Inc.", basePrice: 5.2, category: "stock", emoji: "⚡", volatility: 0.05, description: "NIO makes premium electric vehicles — often called the Tesla of China!" },
    { symbol: "JD", name: "JD.com", basePrice: 28, category: "stock", emoji: "🏪", volatility: 0.028, description: "JD.com is one of China's largest e-commerce and logistics companies." },
  ],
  KR: [
    { symbol: "005930", name: "Samsung Electronics", basePrice: 71000, category: "stock", emoji: "📱", volatility: 0.015, description: "Samsung makes phones, chips, and TVs — Korea's most famous company!" },
    { symbol: "000660", name: "SK Hynix", basePrice: 178000, category: "stock", emoji: "💾", volatility: 0.02, description: "SK Hynix makes memory chips — essential parts for every phone and computer." },
    { symbol: "035420", name: "NAVER", basePrice: 192000, category: "stock", emoji: "🔍", volatility: 0.022, description: "NAVER is South Korea's biggest search engine and internet company." },
    { symbol: "051910", name: "LG Chem", basePrice: 340000, category: "stock", emoji: "🔋", volatility: 0.018, description: "LG Chem makes batteries for electric cars — powering the EV revolution!" },
    { symbol: "035720", name: "Kakao Corp", basePrice: 45000, category: "stock", emoji: "💬", volatility: 0.025, description: "Kakao runs KakaoTalk — Korea's most popular messaging app used by almost everyone." },
    { symbol: "028260", name: "Samsung C&T", basePrice: 135000, category: "stock", emoji: "🏗️", volatility: 0.014, description: "Samsung C&T is a construction and trading giant — part of the Samsung group." },
  ],
  AU: [
    { symbol: "BHP", name: "BHP Group", basePrice: 44, category: "stock", emoji: "⛏️", volatility: 0.016, description: "BHP is one of the world's largest mining companies — digging iron ore and copper!" },
    { symbol: "CBA", name: "Commonwealth Bank", basePrice: 125, category: "stock", emoji: "🏦", volatility: 0.01, description: "Commonwealth Bank is Australia's largest bank — trusted by millions of Aussies." },
    { symbol: "ANZ", name: "ANZ Banking Group", basePrice: 28, category: "stock", emoji: "🏛️", volatility: 0.012, description: "ANZ is a major Australian bank operating across the Asia-Pacific region." },
    { symbol: "RIO", name: "Rio Tinto", basePrice: 118, category: "stock", emoji: "🪨", volatility: 0.017, description: "Rio Tinto is a giant mining company — mining metals that build our world." },
    { symbol: "CSL", name: "CSL Limited", basePrice: 310, category: "stock", emoji: "🩸", volatility: 0.013, description: "CSL makes blood plasma therapies and vaccines — saving lives around the world." },
    { symbol: "WES", name: "Wesfarmers", basePrice: 75, category: "stock", emoji: "🏪", volatility: 0.011, description: "Wesfarmers owns Bunnings and other retail giants — a massive Australian conglomerate." },
  ],
  DE: [
    { symbol: "SAP", name: "SAP SE", basePrice: 195, category: "stock", emoji: "💾", volatility: 0.013, description: "SAP makes business software used by companies around the world — a German tech giant!" },
    { symbol: "SIE", name: "Siemens AG", basePrice: 182, category: "stock", emoji: "⚡", volatility: 0.014, description: "Siemens builds industrial machines, trains, and medical equipment — engineering at its finest." },
    { symbol: "BMW", name: "BMW AG", basePrice: 96, category: "stock", emoji: "🚘", volatility: 0.018, description: "BMW makes luxury cars and motorcycles — the 'Ultimate Driving Machine' from Bavaria." },
    { symbol: "ALV", name: "Allianz SE", basePrice: 260, category: "stock", emoji: "🛡️", volatility: 0.011, description: "Allianz is one of the world's largest insurance companies — protecting people and assets." },
    { symbol: "BAYN", name: "Bayer AG", basePrice: 28, category: "stock", emoji: "💊", volatility: 0.02, description: "Bayer makes medicines and agricultural products — from aspirin to crop protection." },
    { symbol: "VOW3", name: "Volkswagen AG", basePrice: 104, category: "stock", emoji: "🚗", volatility: 0.02, description: "Volkswagen is Germany's largest automaker — making VW, Audi, Porsche and more!" },
  ],
  BR: [
    { symbol: "VALE3", name: "Vale SA", basePrice: 12.5, category: "stock", emoji: "⛏️", volatility: 0.022, description: "Vale is one of the world's largest miners — producing iron ore and nickel from Brazil." },
    { symbol: "PETR4", name: "Petrobras", basePrice: 14, category: "stock", emoji: "🛢️", volatility: 0.025, description: "Petrobras is Brazil's state-owned oil giant — one of the biggest in Latin America." },
    { symbol: "ITUB4", name: "Itaú Unibanco", basePrice: 7.5, category: "stock", emoji: "🏦", volatility: 0.014, description: "Itaú is Brazil's largest private bank — serving millions of Brazilians." },
    { symbol: "BBDC4", name: "Bradesco", basePrice: 4.8, category: "stock", emoji: "🏛️", volatility: 0.016, description: "Bradesco is one of Brazil's biggest banks, with branches across the country." },
  ],
};

// Fallback: global blue chips + crypto for countries without specific stocks
const GLOBAL_ASSETS: Asset[] = [
  { symbol: "AAPL", name: "Apple Inc.", basePrice: 221, category: "stock", emoji: "🍎", volatility: 0.015, description: "Apple makes iPhones, Macs and iPads. When Apple sells more products, its stock price usually rises!" },
  { symbol: "MSFT", name: "Microsoft", basePrice: 425, category: "stock", emoji: "💻", volatility: 0.012, description: "Microsoft makes Windows, Office, and Azure cloud — one of the world's most valuable companies." },
  { symbol: "GOOGL", name: "Alphabet (Google)", basePrice: 175, category: "stock", emoji: "🔍", volatility: 0.018, description: "Google's parent company — owning Search, YouTube, Android, and much more!" },
  { symbol: "GOLD", name: "Gold (XAUUSD)", basePrice: 2390, category: "etf", emoji: "🪙", volatility: 0.008, description: "Gold is a safe-haven metal. People buy it when they're worried about the economy." },
];

function getAssetsForCountry(code: string): Asset[] {
  const specific = COUNTRY_ASSETS[code];
  const base = specific || GLOBAL_ASSETS;
  return [...base, ...CRYPTO_ASSETS];
}

// ── Daily Reload Limit ────────────────────────────────────────────────────────
const RELOAD_KEY = "sim_reloads";
const RELOAD_DATE_KEY = "sim_reload_date";
const MAX_RELOADS = 3;

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

function getReloadsToday(): number {
  try {
    const d = localStorage.getItem(RELOAD_DATE_KEY);
    if (d !== getTodayStr()) return 0;
    return parseInt(localStorage.getItem(RELOAD_KEY) || "0", 10);
  } catch { return 0; }
}

function recordReload() {
  try {
    localStorage.setItem(RELOAD_DATE_KEY, getTodayStr());
    localStorage.setItem(RELOAD_KEY, String(getReloadsToday() + 1));
  } catch {}
}

// ── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ prices, color }: { prices: number[]; color: string }) {
  if (prices.length < 2) return null;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const w = 80; const h = 32;
  const pts = prices.map((p, i) => `${(i / (prices.length - 1)) * w},${h - ((p - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
    </svg>
  );
}

// ── Bankruptcy Screen ────────────────────────────────────────────────────────
function BankruptcyScreen({ country, reloadsUsed, onReload, onReset }: {
  country: typeof COUNTRIES[0];
  reloadsUsed: number;
  onReload: () => void;
  onReset: () => void;
}) {
  const remaining = MAX_RELOADS - reloadsUsed;
  const isBlocked = reloadsUsed >= MAX_RELOADS;

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 gap-6 text-center">
      <div className="text-6xl">{isBlocked ? "🚫" : "💸"}</div>
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">{isBlocked ? "Trading Blocked" : "Bankrupt!"}</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          {isBlocked
            ? "You have used all 3 daily reloads. If you try to trade more, you will be blocked from this platform."
            : `You've lost all your ${country.currency}! Don't worry — every great investor has failed before succeeding.`}
        </p>
      </div>

      {!isBlocked ? (
        <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Daily Reloads Used</span>
            <div className="flex gap-1">
              {Array.from({ length: MAX_RELOADS }, (_, i) => (
                <div key={i} className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${i < reloadsUsed ? "bg-red-400/30 text-red-400" : "bg-green-400/20 text-green-400"}`}>
                  {i < reloadsUsed ? "✕" : "✓"}
                </div>
              ))}
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            <span className="text-green-400 font-bold">{remaining}</span> of {MAX_RELOADS} reloads remaining today.
            Resets at midnight.
          </div>
          <div className="p-3 bg-amber-400/10 border border-amber-400/20 rounded-xl text-xs text-amber-400/80 text-left">
            <Info size={12} className="inline mr-1" />
            In real investing, you can't "reload" — this limit teaches you to be careful with money!
          </div>
          <button
            onClick={onReload}
            className="flex items-center justify-center gap-2 w-full py-3 bg-green-400/20 text-green-400 font-bold rounded-xl border border-green-400/40 hover:bg-green-400/30 transition-colors"
          >
            <RefreshCw size={15} />
            Add {country.symbol}{(1000 * country.rate).toLocaleString(undefined, { maximumFractionDigits: 0 })} ({remaining} left today)
          </button>
        </div>
      ) : (
        <div className="w-full max-w-sm flex flex-col gap-4">
          <div className="bg-red-400/10 border border-red-400/30 rounded-2xl p-6">
            <AlertOctagon size={24} className="text-red-400 mx-auto mb-3" />
            <p className="text-sm text-red-400 font-bold mb-1">⚠️ Warning</p>
            <p className="text-xs text-muted-foreground">
              You have exceeded your daily reload limit of <strong>3 times</strong>.
              Continuing to attempt reloads will result in being <strong>permanently blocked</strong> from this platform.
            </p>
          </div>
          <div className="text-[11px] text-muted-foreground bg-card border border-border rounded-xl p-4">
            <p className="font-semibold text-foreground mb-1">💡 What to do instead?</p>
            <p>Go to the <strong>Learn</strong> tab and study trading strategies. Come back tomorrow with 3 fresh reloads!</p>
          </div>
          <button onClick={onReset} className="text-xs text-muted-foreground underline opacity-60 hover:opacity-100 transition-opacity">
            Start over with a different country
          </button>
        </div>
      )}
    </div>
  );
}

// ── Setup Screen ──────────────────────────────────────────────────────────────
function SetupScreen({ onStart }: { onStart: (country: typeof COUNTRIES[0]) => void }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<typeof COUNTRIES[0] | null>(COUNTRIES[0]);

  const filtered = useMemo(() =>
    COUNTRIES.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.currency.toLowerCase().includes(search.toLowerCase())
    ), [search]);

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex flex-col items-center px-6 py-8 gap-5 min-h-full">
        {/* Logo + intro */}
        <div className="text-center flex-shrink-0">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-green-400/10 flex items-center justify-center mx-auto mb-4 border border-cyan-400/30">
            <BookOpen size={28} className="text-cyan-400" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Trading Simulator</h1>
          <p className="text-sm text-muted-foreground max-w-md">
            Learn how investing works! Start with <span className="text-green-400 font-bold">$1,000 of virtual money</span> — no real money at risk. Pick your country and start trading!
          </p>
        </div>

        {/* Country selector */}
        <div className="w-full max-w-sm flex-shrink-0">
          <label className="block text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">Select Your Country & Currency</label>
          <div className="relative mb-2">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search country or currency..."
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-400/60 transition-colors"
            />
          </div>
          <div className="border border-border rounded-lg overflow-hidden bg-card" style={{ maxHeight: 200, overflowY: "auto" }}>
            {filtered.map(c => (
              <button
                key={c.code}
                onClick={() => setSelected(c)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${selected?.code === c.code ? "bg-cyan-400/10 border-l-2 border-cyan-400" : "hover:bg-card/70 border-l-2 border-transparent"}`}
              >
                <span className="text-base">{c.flag}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.currency} ({c.symbol})</div>
                </div>
                {selected?.code === c.code && <CheckCircle size={14} className="text-cyan-400 flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        {/* Balance preview */}
        {selected && (
          <div className="w-full max-w-sm bg-green-400/5 border border-green-400/20 rounded-xl p-4 flex-shrink-0">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign size={16} className="text-green-400" />
              <span className="text-sm font-semibold text-foreground">Your Starting Balance</span>
            </div>
            <div className="text-3xl font-mono font-bold text-green-400 mb-1">
              {selected.symbol}{(1000 * selected.rate).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-muted-foreground">= $1,000 USD equivalent in {selected.currency}</p>
            {selected && COUNTRY_ASSETS[selected.code] && (
              <p className="text-xs text-cyan-400/70 mt-1.5">
                📈 Includes real {selected.name} stocks to trade!
              </p>
            )}
          </div>
        )}

        {/* Start button — always visible */}
        <button
          onClick={() => selected && onStart(selected)}
          disabled={!selected}
          className="flex items-center gap-2 bg-cyan-400 text-background font-bold px-10 py-3.5 rounded-xl hover:bg-cyan-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm flex-shrink-0 shadow-lg shadow-cyan-400/20"
        >
          Start Trading
          <ChevronRight size={16} />
        </button>

        {/* Spacer */}
        <div className="h-4" />
      </div>
    </div>
  );
}

// ── Main TradingSimulator ─────────────────────────────────────────────────────
interface Position {
  id: string; symbol: string; name: string; emoji: string;
  quantity: number; buyPrice: number; currentPrice: number; timestamp: number;
}

interface Transaction {
  id: string; type: "buy" | "sell"; symbol: string;
  quantity: number; price: number; total: number; pnl?: number; timestamp: number;
}

export function TradingSimulator() {
  const [country, setCountry] = useState<typeof COUNTRIES[0] | null>(null);
  const [balance, setBalance] = useState(1000); // USD internally
  const [positions, setPositions] = useState<Position[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [priceHistory, setPriceHistory] = useState<Record<string, number[]>>({});
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [tab, setTab] = useState<"trade" | "portfolio" | "learn">("trade");
  const [buyAmount, setBuyAmount] = useState("100");
  const [tip, setTip] = useState(0);
  const [toast, setToast] = useState<{ msg: string; type: "buy" | "sell" | "info" | "warn" } | null>(null);
  const [reloadsUsed, setReloadsUsed] = useState(getReloadsToday);
  const [warnAttempts, setWarnAttempts] = useState(0);

  const assets = useMemo(() => country ? getAssetsForCountry(country.code) : [], [country?.code]);

  // Init prices when assets change
  useEffect(() => {
    if (!assets.length) return;
    setPrices(Object.fromEntries(assets.map(a => [a.symbol, a.basePrice])));
    setPriceHistory(Object.fromEntries(assets.map(a => [a.symbol, [a.basePrice]])));
    setSelectedAsset(null);
  }, [assets]);

  // Live price updates
  useEffect(() => {
    if (!assets.length) return;
    const interval = setInterval(() => {
      setPrices(prev => {
        const next = { ...prev };
        assets.forEach(a => {
          const drift = (Math.random() - 0.48) * a.volatility;
          next[a.symbol] = (prev[a.symbol] || a.basePrice) * (1 + drift * 0.18);
        });
        return next;
      });
      setPriceHistory(prev => {
        const next = { ...prev };
        assets.forEach(a => {
          const h = [...(prev[a.symbol] || [a.basePrice])];
          h.push(prices[a.symbol] || a.basePrice);
          if (h.length > 40) h.shift();
          next[a.symbol] = h;
        });
        return next;
      });
      setPositions(prev => prev.map(p => ({ ...p, currentPrice: prices[p.symbol] || p.currentPrice })));
    }, 2000);
    return () => clearInterval(interval);
  }, [assets, prices]);

  const tips = [
    "💡 Buy low, sell high! Try to buy when the price dips.",
    "📊 Diversify! Don't put all your money in one asset.",
    "⏰ Patience is key. Good investors hold for the long term.",
    "🛡️ Never invest more than you can afford to lose.",
    "📰 News moves markets! Big announcements can spike prices.",
    "💰 Compound interest: small gains add up over time!",
    "🔍 Research before you buy — learn what a company does.",
    "📉 Losing trades are part of investing. Learn from them!",
  ];
  useEffect(() => {
    const t = setInterval(() => setTip(n => (n + 1) % tips.length), 8000);
    return () => clearInterval(t);
  }, []);

  function showToast(msg: string, type: "buy" | "sell" | "info" | "warn") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  const fmt = (usd: number) => {
    if (!country) return `$${usd.toFixed(2)}`;
    const local = usd * country.rate;
    if (local >= 100000) return `${country.symbol}${local.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    if (local >= 1000) return `${country.symbol}${local.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    return `${country.symbol}${local.toFixed(2)}`;
  };

  const totalPortfolioUSD = positions.reduce((sum, p) => sum + p.quantity * (prices[p.symbol] || p.currentPrice), 0);
  const totalUSD = balance + totalPortfolioUSD;
  const isBankrupt = totalUSD < 0.5 && positions.length === 0;

  function handleBuy() {
    if (!selectedAsset || !country) return;
    const amtUSD = parseFloat(buyAmount) / country.rate;
    if (amtUSD <= 0 || amtUSD > balance) { showToast("Not enough balance!", "info"); return; }
    const price = prices[selectedAsset.symbol] || selectedAsset.basePrice;
    const qty = amtUSD / price;
    setPositions(prev => [...prev, { id: `p-${Date.now()}`, symbol: selectedAsset.symbol, name: selectedAsset.name, emoji: selectedAsset.emoji, quantity: qty, buyPrice: price, currentPrice: price, timestamp: Date.now() }]);
    setBalance(prev => prev - amtUSD);
    setTransactions(prev => [{ id: `t-${Date.now()}`, type: "buy", symbol: selectedAsset.symbol, quantity: qty, price, total: amtUSD, timestamp: Date.now() }, ...prev]);
    showToast(`Bought ${selectedAsset.emoji} ${selectedAsset.symbol} for ${fmt(amtUSD)}!`, "buy");
  }

  function handleSell(pos: Position) {
    const currentPrice = prices[pos.symbol] || pos.currentPrice;
    const valueUSD = pos.quantity * currentPrice;
    const pnl = valueUSD - pos.quantity * pos.buyPrice;
    setBalance(prev => prev + valueUSD);
    setPositions(prev => prev.filter(p => p.id !== pos.id));
    setTransactions(prev => [{ id: `t-${Date.now()}`, type: "sell", symbol: pos.symbol, quantity: pos.quantity, price: currentPrice, total: valueUSD, pnl, timestamp: Date.now() }, ...prev]);
    showToast(`Sold ${pos.emoji} ${pos.symbol}! ${pnl >= 0 ? "Profit" : "Loss"}: ${fmt(Math.abs(pnl))}`, "sell");
  }

  function handleReload() {
    if (!country) return;
    const used = getReloadsToday();
    if (used >= MAX_RELOADS) {
      const attempts = warnAttempts + 1;
      setWarnAttempts(attempts);
      if (attempts >= 2) {
        showToast("⚠️ You will be blocked from this platform!", "warn");
      } else {
        showToast("Daily limit reached! You have 0 reloads left today.", "warn");
      }
      return;
    }
    recordReload();
    setReloadsUsed(used + 1);
    setBalance(1000);
    showToast(`Reloaded ${country.symbol}${(1000 * country.rate).toLocaleString(undefined, { maximumFractionDigits: 0 })}! (${MAX_RELOADS - used - 1} left today)`, "info");
  }

  if (!country) return <SetupScreen onStart={c => { setCountry(c); setBuyAmount(String(Math.round(100 * c.rate))); }} />;

  if (isBankrupt) {
    return (
      <BankruptcyScreen
        country={country}
        reloadsUsed={reloadsUsed}
        onReload={handleReload}
        onReset={() => { setCountry(null); setBalance(1000); setPositions([]); setTransactions([]); setReloadsUsed(getReloadsToday()); }}
      />
    );
  }

  const totalPnL = totalUSD - 1000;
  const totalPnLPct = (totalPnL / 1000) * 100;

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      {/* Toast */}
      {toast && (
        <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-xl shadow-xl text-sm font-semibold border backdrop-blur-sm transition-all ${toast.type === "buy" ? "bg-green-400/20 border-green-400/40 text-green-400" : toast.type === "sell" ? "bg-red-400/20 border-red-400/40 text-red-400" : toast.type === "warn" ? "bg-red-500/30 border-red-500/50 text-red-300" : "bg-cyan-400/20 border-cyan-400/40 text-cyan-400"}`}>
          {toast.type === "buy" ? <TrendingUp size={14} /> : toast.type === "sell" ? <TrendingDown size={14} /> : toast.type === "warn" ? <AlertOctagon size={14} /> : <Info size={14} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/60 flex-shrink-0">
        <BookOpen size={15} className="text-cyan-400" />
        <span className="text-sm font-bold text-foreground">Trading Simulator</span>
        <span className="text-[10px] bg-green-400/15 text-green-400 border border-green-400/30 px-2 py-0.5 rounded font-bold uppercase tracking-wider">EDUCATIONAL</span>
        <span className="text-[10px] text-muted-foreground">{country.flag} {country.name}</span>
        <div className="ml-auto flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] text-muted-foreground">Portfolio</div>
            <div className="text-sm font-mono font-bold text-foreground">{fmt(totalUSD)}</div>
          </div>
          <div className={`text-sm font-mono font-bold ${totalPnL >= 0 ? "text-green-400" : "text-red-400"}`}>
            {totalPnL >= 0 ? "+" : ""}{totalPnLPct.toFixed(2)}%
          </div>
          <button onClick={() => { setCountry(null); setBalance(1000); setPositions([]); setTransactions([]); }} className="text-[10px] text-muted-foreground hover:text-foreground border border-border rounded px-2 py-1 transition-colors">
            Change Country
          </button>
        </div>
      </div>

      {/* Tip Bar */}
      <div className="flex items-center gap-2 px-4 py-1.5 bg-cyan-400/5 border-b border-cyan-400/20 flex-shrink-0">
        <Info size={11} className="text-cyan-400 flex-shrink-0" />
        <p className="text-[11px] text-cyan-400/80">{tips[tip]}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 border-b border-border flex-shrink-0">
        {[
          { label: "Cash", value: fmt(balance), sub: country.currency, color: "text-foreground" },
          { label: "In Market", value: fmt(totalPortfolioUSD), sub: `${positions.length} position${positions.length !== 1 ? "s" : ""}`, color: "text-cyan-400" },
          { label: "P&L", value: `${totalPnL >= 0 ? "+" : ""}${fmt(Math.abs(totalPnL))}`, sub: `${totalPnLPct >= 0 ? "+" : ""}${totalPnLPct.toFixed(2)}%`, color: totalPnL >= 0 ? "text-green-400" : "text-red-400" },
        ].map(s => (
          <div key={s.label} className="flex flex-col items-center justify-center py-2.5 border-r last:border-r-0 border-border">
            <div className="text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">{s.label}</div>
            <div className={`text-sm font-mono font-bold ${s.color}`}>{s.value}</div>
            <div className="text-[9px] text-muted-foreground">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border flex-shrink-0">
        {(["trade", "portfolio", "learn"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-[11px] font-semibold uppercase tracking-wider transition-colors ${tab === t ? "text-cyan-400 border-b-2 border-cyan-400 bg-cyan-400/5" : "text-muted-foreground hover:text-foreground"}`}>
            {t === "trade" ? "📈 Trade" : t === "portfolio" ? "💼 Portfolio" : "📚 Learn"}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden">

        {/* TRADE */}
        {tab === "trade" && (
          <div className="flex h-full">
            {/* Asset list */}
            <div className="w-60 flex-shrink-0 border-r border-border overflow-y-auto">
              {assets.map(asset => {
                const price = prices[asset.symbol] || asset.basePrice;
                const hist = priceHistory[asset.symbol] || [];
                const prev = hist.length >= 2 ? hist[hist.length - 2] : price;
                const chg = ((price - prev) / prev) * 100;
                const isUp = chg >= 0;
                const isSel = selectedAsset?.symbol === asset.symbol;
                return (
                  <button key={asset.symbol} onClick={() => setSelectedAsset(asset)}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 border-b border-border/40 text-left hover:bg-card/50 transition-colors ${isSel ? "bg-cyan-400/8 border-l-2 border-cyan-400" : "border-l-2 border-transparent"}`}>
                    <span className="text-lg">{asset.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">{asset.symbol}</span>
                        <span className={`text-[10px] font-mono font-bold ${isUp ? "text-green-400" : "text-red-400"}`}>{isUp ? "+" : ""}{chg.toFixed(2)}%</span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-[10px] text-muted-foreground truncate">{asset.name}</span>
                        <Sparkline prices={hist.slice(-15)} color={isUp ? "#00d97e" : "#ff4757"} />
                      </div>
                      <div className="text-[11px] font-mono text-foreground mt-0.5">{fmt(price)}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Buy panel */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
              {selectedAsset ? (
                <>
                  <div className="flex items-center gap-4 p-4 bg-card/50 border border-border rounded-xl">
                    <span className="text-4xl">{selectedAsset.emoji}</span>
                    <div className="flex-1">
                      <div className="text-lg font-bold text-foreground">{selectedAsset.name}</div>
                      <div className="text-2xl font-mono font-bold text-cyan-400">{fmt(prices[selectedAsset.symbol] || selectedAsset.basePrice)}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5 capitalize">{selectedAsset.category}</div>
                    </div>
                    <Sparkline prices={(priceHistory[selectedAsset.symbol] || []).slice(-25)} color="#00d4ff" />
                  </div>

                  <div className="p-3 bg-blue-400/5 border border-blue-400/20 rounded-xl">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Info size={12} className="text-blue-400" />
                      <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">What is {selectedAsset.symbol}?</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{selectedAsset.description}</p>
                  </div>

                  <div className="p-4 bg-green-400/5 border border-green-400/20 rounded-xl">
                    <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                      <ShoppingCart size={14} className="text-green-400" />
                      Buy {selectedAsset.symbol}
                    </h3>
                    <div className="relative mb-2">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-sm">{country.symbol}</span>
                      <input type="number" value={buyAmount} onChange={e => setBuyAmount(e.target.value)}
                        className="w-full bg-background border border-border rounded-lg pl-8 pr-3 py-2.5 text-sm font-mono text-foreground focus:outline-none focus:border-green-400/60 transition-colors"
                        placeholder="Amount" />
                    </div>
                    <div className="flex gap-2 mb-3">
                      {[10, 25, 50, 100].map(pct => {
                        const amt = Math.round(balance * country.rate * pct / 100);
                        return (
                          <button key={pct} onClick={() => setBuyAmount(String(amt))}
                            className="flex-1 text-[10px] py-1.5 rounded border border-border text-muted-foreground hover:text-green-400 hover:border-green-400/40 transition-colors font-mono">
                            {pct}%
                          </button>
                        );
                      })}
                    </div>
                    {parseFloat(buyAmount) > 0 && (
                      <div className="text-[11px] text-muted-foreground mb-3 font-mono">
                        ≈ {(parseFloat(buyAmount) / country.rate / (prices[selectedAsset.symbol] || selectedAsset.basePrice)).toFixed(6)} {selectedAsset.symbol} units
                      </div>
                    )}
                    <button onClick={handleBuy} disabled={(parseFloat(buyAmount) || 0) > balance * country.rate}
                      className="w-full py-3 bg-green-400/20 text-green-400 font-bold rounded-lg border border-green-400/40 hover:bg-green-400/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      <TrendingUp size={15} />
                      Buy {selectedAsset.symbol}
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                  <BarChart2 size={40} className="text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">Select an asset on the left to start trading</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PORTFOLIO */}
        {tab === "portfolio" && (
          <div className="p-4 overflow-y-auto h-full flex flex-col gap-4">
            {positions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <ShoppingCart size={40} className="text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground text-center">No open positions yet!<br />Go to the Trade tab and buy something.</p>
              </div>
            ) : (
              <>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Open Positions</h3>
                {positions.map(pos => {
                  const curPrice = prices[pos.symbol] || pos.currentPrice;
                  const value = pos.quantity * curPrice;
                  const cost = pos.quantity * pos.buyPrice;
                  const pnl = value - cost;
                  const pnlPct = (pnl / cost) * 100;
                  return (
                    <div key={pos.id} className="border border-border rounded-xl p-4 bg-card/40">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{pos.emoji}</span>
                        <div className="flex-1">
                          <div className="font-bold text-foreground">{pos.symbol}</div>
                          <div className="text-[11px] text-muted-foreground font-mono">{pos.quantity.toFixed(6)} units @ {fmt(pos.buyPrice)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-mono font-bold text-foreground">{fmt(value)}</div>
                          <div className={`text-xs font-mono font-bold ${pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {pnl >= 0 ? "+" : ""}{fmt(pnl)} ({pnl >= 0 ? "+" : ""}{pnlPct.toFixed(2)}%)
                          </div>
                        </div>
                      </div>
                      <button onClick={() => handleSell(pos)}
                        className="w-full py-2 text-xs font-bold text-red-400 border border-red-400/40 rounded-lg hover:bg-red-400/10 transition-colors flex items-center justify-center gap-2">
                        <TrendingDown size={12} />
                        Sell for {fmt(value)}
                      </button>
                    </div>
                  );
                })}
              </>
            )}
            {transactions.length > 0 && (
              <>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-2">Transaction History</h3>
                {transactions.slice(0, 12).map(tx => (
                  <div key={tx.id} className="flex items-center gap-3 px-3 py-2.5 bg-card/30 border border-border/40 rounded-lg">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${tx.type === "buy" ? "bg-green-400/20" : "bg-red-400/20"}`}>
                      {tx.type === "buy" ? <TrendingUp size={12} className="text-green-400" /> : <TrendingDown size={12} className="text-red-400" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-foreground">{tx.type === "buy" ? "Bought" : "Sold"} {tx.symbol}</div>
                      <div className="text-[10px] text-muted-foreground">{new Date(tx.timestamp).toLocaleTimeString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono text-foreground">{fmt(tx.total)}</div>
                      {tx.pnl !== undefined && (
                        <div className={`text-[10px] font-mono font-bold ${tx.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {tx.pnl >= 0 ? "+" : ""}{fmt(tx.pnl)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* LEARN */}
        {tab === "learn" && (
          <div className="p-4 overflow-y-auto h-full flex flex-col gap-4 max-w-2xl mx-auto">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Award size={18} className="text-amber-400" />
              Learn How Investing Works
            </h2>
            {[
              { emoji: "📈", title: "What is a Stock?", content: "A stock is like owning a tiny piece of a company. If the company grows, your piece becomes more valuable. If you owned 0.001% of Apple, you'd own a tiny slice of every iPhone sold!" },
              { emoji: "₿", title: "What is Cryptocurrency?", content: "Cryptocurrencies like Bitcoin are digital money that nobody controls — no bank, no government. They use math (called cryptography) to stay secure. Their price moves with supply and demand." },
              { emoji: "💰", title: "Buy Low, Sell High", content: "The basic rule of investing! You buy an asset at a low price, wait for it to go up, then sell at a higher price. The difference is your profit. But prices can also go DOWN — that's the risk!" },
              { emoji: "🧺", title: "Don't Put All Eggs in One Basket", content: "Diversification means spreading your money across many different assets. If one goes down, the others might stay up. This reduces your overall risk significantly." },
              { emoji: "⏰", title: "Time in the Market Wins", content: "Experienced investors say: 'It's time IN the market, not timing the market.' Holding good investments for a long time tends to be more profitable than trying to buy and sell at perfect moments." },
              { emoji: "📉", title: "What is a Market Crash?", content: "Sometimes prices fall quickly — called a crash. This can be scary, but experienced investors often see crashes as a chance to buy at a discount. Markets have always recovered historically." },
              { emoji: "🎓", title: "The 3-Reload Rule", content: "In this simulator you get 3 daily reloads if you go bankrupt. In real life, there are no reloads — so always invest responsibly and only what you can afford to lose!" },
            ].map(lesson => (
              <div key={lesson.title} className="p-4 bg-card/40 border border-border rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{lesson.emoji}</span>
                  <h3 className="font-bold text-foreground">{lesson.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{lesson.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
