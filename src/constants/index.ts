// Application Constants

export const APP_NAME = 'CryptoTerminal';
export const APP_VERSION = '1.0.0';

// ============================================
// ROUTES
// ============================================

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  CHART_ANALYSIS: '/chart-analysis',
  PAPER_TRADING: '/paper-trading',
  SIGNALS: '/signals',
  ORDER_FLOW: '/order-flow',
  MARKET_DATA: '/market-data',
  SETTINGS: '/settings',
} as const;

export const ROUTE_LABELS = {
  [ROUTES.HOME]: 'Dashboard',
  [ROUTES.DASHBOARD]: 'Dashboard',
  [ROUTES.CHART_ANALYSIS]: 'Chart Analysis',
  [ROUTES.PAPER_TRADING]: 'Paper Trading',
  [ROUTES.SIGNALS]: 'Signals',
  [ROUTES.ORDER_FLOW]: 'Order Flow',
  [ROUTES.MARKET_DATA]: 'Market Data Hub',
  [ROUTES.SETTINGS]: 'Settings',
} as const;

// ============================================
// NAVIGATION ITEMS
// ============================================

export const NAV_ITEMS = [
  { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: 'LayoutDashboard' },
  { label: 'Chart Analysis', path: ROUTES.CHART_ANALYSIS, icon: 'LineChart' },
  { label: 'Paper Trading', path: ROUTES.PAPER_TRADING, icon: 'Wallet' },
  { label: 'Signals', path: ROUTES.SIGNALS, icon: 'Radio' },
  { label: 'Order Flow', path: ROUTES.ORDER_FLOW, icon: 'Activity' },
  { label: 'Market Data Hub', path: ROUTES.MARKET_DATA, icon: 'Database' },
  { label: 'Settings', path: ROUTES.SETTINGS, icon: 'Settings' },
] as const;

// ============================================
// TIME INTERVALS
// ============================================

export const INTERVALS = {
  '1m': 60000,
  '3m': 180000,
  '5m': 300000,
  '15m': 900000,
  '30m': 1800000,
  '1h': 3600000,
  '2h': 7200000,
  '4h': 14400000,
  '6h': 21600000,
  '8h': 28800000,
  '12h': 43200000,
  '1d': 86400000,
  '3d': 259200000,
  '1w': 604800000,
} as const;

export const INTERVAL_LABELS = {
  '1m': '1 Min',
  '3m': '3 Min',
  '5m': '5 Min',
  '15m': '15 Min',
  '30m': '30 Min',
  '1h': '1 Hour',
  '2h': '2 Hours',
  '4h': '4 Hours',
  '6h': '6 Hours',
  '8h': '8 Hours',
  '12h': '12 Hours',
  '1d': '1 Day',
  '3d': '3 Days',
  '1w': '1 Week',
} as const;

// ============================================
// DEFAULT SYMBOLS
// ============================================

export const DEFAULT_SYMBOLS = [
  'BTCUSDT',
  'ETHUSDT',
  'BNBUSDT',
  'SOLUSDT',
  'XRPUSDT',
  'ADAUSDT',
  'DOGEUSDT',
  'AVAXUSDT',
] as const;

export const DEFAULT_SYMBOL = 'BTCUSDT';

// ============================================
// REFRESH INTERVALS (ms)
// ============================================

export const REFRESH_INTERVALS = {
  TICKER: 1000,
  KLINE: 5000,
  ORDER_BOOK: 2000,
  TRADES: 3000,
  POSITIONS: 5000,
  ORDERS: 3000,
} as const;

// ============================================
// UI CONSTANTS
// ============================================

export const SIDEBAR_WIDTH = 260;
export const SIDEBAR_COLLAPSED_WIDTH = 72;
export const HEADER_HEIGHT = 64;

export const MAX_ORDER_BOOK_LEVELS = 20;
export const MAX_RECENT_TRADES = 50;
export const MAX_CANDLES = 500;

// ============================================
// COLORS (for consistent theming)
// ============================================

export const COLORS = {
  // Primary
  primary: '#3B82F6',
  primaryHover: '#2563EB',
  
  // Success / Profit
  success: '#10B981',
  successLight: '#D1FAE5',
  
  // Danger / Loss
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  
  // Warning
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  
  // Neutral
  neutral: '#6B7280',
  neutralLight: '#F3F4F6',
  
  // Background
  background: '#0F172A',
  backgroundLight: '#1E293B',
  backgroundLighter: '#334155',
  
  // Text
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  
  // Border
  border: '#334155',
  borderLight: '#475569',
} as const;

// ============================================
// BINANCE API ENDPOINTS
// ============================================

export const BINANCE_API = {
  BASE_URL: 'https://api.binance.com',
  WS_URL: 'wss://stream.binance.com:9443/ws',
  
  // REST Endpoints
  TICKER: '/api/v3/ticker/24hr',
  KLINE: '/api/v3/klines',
  ORDER_BOOK: '/api/v3/depth',
  TRADES: '/api/v3/trades',
  EXCHANGE_INFO: '/api/v3/exchangeInfo',
  
  // WebSocket Streams
  WS_TICKER: (symbol: string) => `${symbol.toLowerCase()}@ticker`,
  WS_KLINE: (symbol: string, interval: string) => `${symbol.toLowerCase()}@kline_${interval}`,
  WS_ORDER_BOOK: (symbol: string) => `${symbol.toLowerCase()}@depth@100ms`,
  WS_TRADES: (symbol: string) => `${symbol.toLowerCase()}@trade`,
} as const;