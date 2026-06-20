// Core market data types
export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  isFinal: boolean;
}

export interface Tick {
  time: number;
  price: number;
  volume: number;
  isBuy: boolean;
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

export interface Ticker {
  symbol: string;
  lastPrice: number;
  priceChange: number;
  priceChangePercent: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  quoteVolume24h: number;
  bidPrice: number;
  askPrice: number;
  timestamp: number;
}

// Chart types
export interface Point {
  x: number;
  y: number;
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface TimeRange {
  start: number;
  end: number;
}

export type Timeframe = '1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d';

export const TIMEFRAME_LABELS: Record<Timeframe, string> = {
  '1m': '1m',
  '3m': '3m',
  '5m': '5m',
  '15m': '15m',
  '30m': '30m',
  '1h': '1H',
  '4h': '4H',
  '1d': '1D',
};

export const TIMEFRAME_MS: Record<Timeframe, number> = {
  '1m': 60 * 1000,
  '3m': 3 * 60 * 1000,
  '5m': 5 * 60 * 1000,
  '15m': 15 * 60 * 1000,
  '30m': 30 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '4h': 4 * 60 * 60 * 1000,
  '1d': 24 * 60 * 60 * 1000,
};

// Symbol types
export interface Symbol {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  pricePrecision: number;
  quantityPrecision: number;
  minQuantity: number;
  tickSize: number;
  minNotional: number;
}

export interface WatchlistItem {
  symbol: string;
  lastPrice: number;
  priceChange: number;
  priceChangePercent: number;
  high24h: number;
  low24h: number;
  volume24h: number;
}

// Drawing types
export type DrawingType = 
  | 'trendline'
  | 'horizontal_line'
  | 'vertical_line'
  | 'ray_line'
  | 'rectangle'
  | 'support_zone'
  | 'resistance_zone'
  | 'text'
  | 'arrow'
  | 'fibonacci';

export interface DrawingPoint {
  time: number;
  price: number;
}

export interface BaseDrawing {
  id: string;
  type: DrawingType;
  visible: boolean;
  locked: boolean;
  color: string;
  lineWidth: number;
  name?: string;
}

export interface TrendlineDrawing extends BaseDrawing {
  type: 'trendline';
  points: [DrawingPoint, DrawingPoint];
}

export interface HorizontalLineDrawing extends BaseDrawing {
  type: 'horizontal_line';
  price: number;
}

export interface VerticalLineDrawing extends BaseDrawing {
  type: 'vertical_line';
  time: number;
}

export interface RayLineDrawing extends BaseDrawing {
  type: 'ray_line';
  point: DrawingPoint;
  direction: 'up' | 'down';
}

export interface RectangleDrawing extends BaseDrawing {
  type: 'rectangle';
  points: [DrawingPoint, DrawingPoint];
}

export interface SupportZoneDrawing extends BaseDrawing {
  type: 'support_zone';
  topPrice: number;
  bottomPrice: number;
  time: number;
  endTime: number;
}

export interface ResistanceZoneDrawing extends BaseDrawing {
  type: 'resistance_zone';
  topPrice: number;
  bottomPrice: number;
  time: number;
  endTime: number;
}

export interface TextDrawing extends BaseDrawing {
  type: 'text';
  point: DrawingPoint;
  text: string;
  fontSize: number;
}

export interface ArrowDrawing extends BaseDrawing {
  type: 'arrow';
  points: [DrawingPoint, DrawingPoint];
  arrowType: 'forward' | 'backward' | 'bidirectional';
}

export interface FibonacciDrawing extends BaseDrawing {
  type: 'fibonacci';
  points: [DrawingPoint, DrawingPoint];
  levels: number[];
}

export type Drawing = 
  | TrendlineDrawing
  | HorizontalLineDrawing
  | VerticalLineDrawing
  | RayLineDrawing
  | RectangleDrawing
  | SupportZoneDrawing
  | ResistanceZoneDrawing
  | TextDrawing
  | ArrowDrawing
  | FibonacciDrawing;

// Indicator types
export type IndicatorType = 'ema' | 'vwap' | 'volume' | 'sma' | 'rsi' | 'macd';

export interface IndicatorConfig {
  id: string;
  type: IndicatorType;
  params: Record<string, number>;
  visible: boolean;
  color: string;
  pane: 'main' | 'separate';
}

export interface IndicatorValue {
  time: number;
  value: number;
}

export interface EMAConfig extends IndicatorConfig {
  type: 'ema';
  params: { period: number };
}

export interface VWAPConfig extends IndicatorConfig {
  type: 'vwap';
  params: {};
}

// Pane types for future expansion
export type PaneType = 
  | 'price'
  | 'volume'
  | 'delta'
  | 'footprint'
  | 'orderbook'
  | 'rsi'
  | 'macd';

export interface Pane {
  id: string;
  type: PaneType;
  visible: boolean;
  height: number;
  indicators: string[];
}

// Chart state
export interface ChartState {
  symbol: string;
  timeframe: Timeframe;
  candles: Candle[];
  visibleRange: TimeRange;
  priceRange: PriceRange;
  crosshair: Point | null;
  zoom: number;
  panOffset: Point;
  panes: Pane[];
  drawings: Drawing[];
  indicators: IndicatorConfig[];
  isLoading: boolean;
  isLive: boolean;
}

// Theme types
export interface ThemeColors {
  background: string;
  surface: string;
  border: string;
  text: string;
  textSecondary: string;
  candle: {
    up: string;
    down: string;
    upWick: string;
    downWick: string;
  };
  volume: {
    up: string;
    down: string;
  };
  grid: string;
  crosshair: string;
}

export const DARK_THEME: ThemeColors = {
  background: '#0a0e17',
  surface: '#111827',
  border: '#1f2937',
  text: '#f3f4f6',
  textSecondary: '#9ca3af',
  candle: {
    up: '#10b981',
    down: '#ef4444',
    upWick: '#059669',
    downWick: '#dc2626',
  },
  volume: {
    up: 'rgba(16, 185, 129, 0.3)',
    down: 'rgba(239, 68, 68, 0.3)',
  },
  grid: '#1f2937',
  crosshair: '#6366f1',
};

// Interaction types
export type InteractionMode = 
  | 'pan'
  | 'zoom'
  | 'crosshair'
  | 'drawing'
  | 'select';

export interface InteractionState {
  mode: InteractionMode;
  activeDrawing: DrawingType | null;
  selectedDrawingId: string | null;
  isDragging: boolean;
  isResizing: boolean;
}

// WebSocket message types
export type WSMessageType = 
  | 'candle'
  | 'ticker'
  | 'trade'
  | 'orderbook'
  | 'snapshot';

export interface WSMessage {
  type: WSMessageType;
  symbol: string;
  data: unknown;
  timestamp: number;
}

// OHLCV is an alias for Candle for compatibility
export type OHLCV = Candle;

// Trade type for compatibility
export interface Trade {
  id: string;
  symbol: string;
  price: number;
  quantity: number;
  time: number;
  isBuyerMaker: boolean;
}

// Exchange type for market data
export type Exchange = 'binance' | 'bybit' | 'okx' | 'coinbase' | 'kraken';
