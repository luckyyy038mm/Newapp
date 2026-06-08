// Core Types for Crypto Trading Platform

// ============================================
// MARKET DATA TYPES
// ============================================

export interface Ticker {
  symbol: string;
  price: number;
  priceChange: number;
  priceChangePercent: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  quoteVolume24h: number;
  lastUpdate: number;
}

export interface OHLCV {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface OrderBookLevel {
  price: number;
  quantity: number;
}

export interface OrderBook {
  symbol: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  lastUpdateId: number;
  timestamp: number;
}

export interface OrderBookSnapshot {
  lastUpdateId: number;
  bids: [string, string][];
  asks: [string, string][];
}

export interface Trade {
  id: number;
  symbol: string;
  price: number;
  quantity: number;
  time: number;
  isBuyerMaker: boolean;
}

// ============================================
// SYMBOL TYPES
// ============================================

export interface Symbol {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  pricePrecision: number;
  quantityPrecision: number;
  minQty: number;
  minNotional: number;
  status: SymbolStatus;
}

export enum SymbolStatus {
  TRADING = 'TRADING',
  HALT = 'HALT',
  BREAK = 'BREAK',
}

// ============================================
// TRADING TYPES
// ============================================

export interface Order {
  id: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  price?: number;
  quantity: number;
  filledQuantity: number;
  averagePrice: number;
  status: OrderStatus;
  createdAt: number;
  updatedAt: number;
}

export enum OrderSide {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum OrderType {
  LIMIT = 'LIMIT',
  MARKET = 'MARKET',
  STOP_LOSS = 'STOP_LOSS',
  TAKE_PROFIT = 'TAKE_PROFIT',
  STOP_LOSS_LIMIT = 'STOP_LOSS_LIMIT',
  TAKE_PROFIT_LIMIT = 'TAKE_PROFIT_LIMIT',
}

export enum OrderStatus {
  NEW = 'NEW',
  PARTIALLY_FILLED = 'PARTIALLY_FILLED',
  FILLED = 'FILLED',
  CANCELED = 'CANCELED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

// ============================================
// POSITION TYPES
// ============================================

export interface Position {
  id: string;
  symbol: string;
  side: PositionSide;
  entryPrice: number;
  quantity: number;
  leverage: number;
  unrealizedPnl: number;
  realizedPnl: number;
  liquidationPrice: number;
  margin: number;
  openedAt: number;
}

export enum PositionSide {
  LONG = 'LONG',
  SHORT = 'SHORT',
}

// ============================================
// SIGNAL TYPES
// ============================================

export interface Signal {
  id: string;
  symbol: string;
  type: SignalType;
  direction: SignalDirection;
  strength: SignalStrength;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  timestamp: number;
  indicators: SignalIndicator[];
  description: string;
}

export enum SignalType {
  TECHNICAL = 'TECHNICAL',
  PRICE_ACTION = 'PRICE_ACTION',
  VOLUME = 'VOLUME',
  MOMENTUM = 'MOMENTUM',
  TREND = 'TREND',
}

export enum SignalDirection {
  BULLISH = 'BULLISH',
  BEARISH = 'BEARISH',
  NEUTRAL = 'NEUTRAL',
}

export enum SignalStrength {
  WEAK = 'WEAK',
  MODERATE = 'MODERATE',
  STRONG = 'STRONG',
  VERY_STRONG = 'VERY_STRONG',
}

export interface SignalIndicator {
  name: string;
  value: number;
  signal: SignalDirection;
}

// ============================================
// MARKET DATA HUB TYPES
// ============================================

export interface MarketDataConfig {
  enabledExchanges: Exchange[];
  defaultSymbols: string[];
  refreshIntervals: {
    ticker: number;
    kline: number;
    orderBook: number;
    trades: number;
  };
}

export enum Exchange {
  BINANCE = 'BINANCE',
  BYBIT = 'BYBIT',
  OKX = 'OKX',
  COINBASE = 'COINBASE',
}

export interface DataProviderState {
  isConnected: boolean;
  lastUpdate: number;
  error: string | null;
  latency: number;
}

// ============================================
// UI TYPES
// ============================================

export interface NavigationItem {
  label: string;
  path: string;
  icon: string;
  badge?: string | number;
}

export interface TimeRange {
  start: number;
  end: number;
}

export interface ChartConfig {
  symbol: string;
  interval: string;
  limit: number;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  timestamp: number;
}