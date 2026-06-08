// Market Data Hub - Central Data Management Service
// This is the single source of truth for all market data

import { Exchange, type Ticker, type OHLCV, type OrderBook, type Trade } from '@/types';
import { BINANCE_API, REFRESH_INTERVALS, DEFAULT_SYMBOLS } from '@/constants';

export type DataSource = 'binance' | 'bybit' | 'okx' | 'mock';

export interface MarketDataHubConfig {
  enabledExchanges: Exchange[];
  defaultSymbol: string;
  defaultInterval: string;
  refreshRates: {
    ticker: number;
    kline: number;
    orderBook: number;
    trades: number;
  };
}

export interface DataProviderConnection {
  exchange: Exchange;
  isConnected: boolean;
  lastUpdate: number;
  latency: number;
  error: string | null;
}

// ============================================
// DATA PROVIDER INTERFACE
// ============================================

export interface DataProvider {
  name: Exchange;
  connect(): Promise<void>;
  disconnect(): void;
  getTicker(symbol: string): Promise<Ticker | null>;
  getTickers(symbols?: string[]): Promise<Map<string, Ticker>>;
  getKlines(symbol: string, interval: string, limit?: number): Promise<OHLCV[]>;
  getOrderBook(symbol: string, limit?: number): Promise<OrderBook | null>;
  getRecentTrades(symbol: string, limit?: number): Promise<Trade[]>;
  subscribeTicker(symbol: string, callback: (ticker: Ticker) => void): () => void;
  subscribeOrderBook(symbol: string, callback: (orderBook: OrderBook) => void): () => void;
  subscribeTrades(symbol: string, callback: (trade: Trade) => void): () => void;
  getConnectionStatus(): DataProviderConnection;
}

// ============================================
// BINANCE DATA PROVIDER
// ============================================

export class BinanceDataProvider implements DataProvider {
  name: Exchange = Exchange.BINANCE;
  private wsConnections: Map<string, WebSocket> = new Map();
  private subscriptions: Map<string, Set<(...args: unknown[]) => void>> = new Map();
  private connectionStatus: DataProviderConnection = {
    exchange: Exchange.BINANCE,
    isConnected: false,
    lastUpdate: 0,
    latency: 0,
    error: null,
  };

  async connect(): Promise<void> {
    try {
      const startTime = Date.now();
      const response = await fetch(`${BINANCE_API.BASE_URL}${BINANCE_API.TICKER}?symbol=BTCUSDT`);
      const latency = Date.now() - startTime;

      if (response.ok) {
        this.connectionStatus = {
          exchange: Exchange.BINANCE,
          isConnected: true,
          lastUpdate: Date.now(),
          latency,
          error: null,
        };
      }
    } catch (error) {
      this.connectionStatus = {
        exchange: Exchange.BINANCE,
        isConnected: false,
        lastUpdate: 0,
        latency: 0,
        error: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  disconnect(): void {
    this.wsConnections.forEach((ws) => ws.close());
    this.wsConnections.clear();
    this.subscriptions.clear();
    this.connectionStatus.isConnected = false;
  }

  async getTicker(symbol: string): Promise<Ticker | null> {
    try {
      const response = await fetch(
        `${BINANCE_API.BASE_URL}${BINANCE_API.TICKER}?symbol=${symbol}`
      );
      
      if (!response.ok) return null;
      
      const data = await response.json();
      
      return {
        symbol: data.symbol,
        price: parseFloat(data.lastPrice),
        priceChange: parseFloat(data.priceChange),
        priceChangePercent: parseFloat(data.priceChangePercent),
        high24h: parseFloat(data.highPrice),
        low24h: parseFloat(data.lowPrice),
        volume24h: parseFloat(data.volume),
        quoteVolume24h: parseFloat(data.quoteVolume),
        lastUpdate: Date.now(),
      };
    } catch {
      return null;
    }
  }

  async getTickers(symbols: string[] = DEFAULT_SYMBOLS as unknown as string[]): Promise<Map<string, Ticker>> {
    const tickers = new Map<string, Ticker>();
    
    try {
      const response = await fetch(`${BINANCE_API.BASE_URL}${BINANCE_API.TICKER}`);
      
      if (!response.ok) return tickers;
      
      const data = await response.json();
      
      for (const item of data) {
        if (symbols.includes(item.symbol)) {
          tickers.set(item.symbol, {
            symbol: item.symbol,
            price: parseFloat(item.lastPrice),
            priceChange: parseFloat(item.priceChange),
            priceChangePercent: parseFloat(item.priceChangePercent),
            high24h: parseFloat(item.highPrice),
            low24h: parseFloat(item.lowPrice),
            volume24h: parseFloat(item.volume),
            quoteVolume24h: parseFloat(item.quoteVolume),
            lastUpdate: Date.now(),
          });
        }
      }
    } catch {
      const promises = symbols.map(async (symbol) => {
        const ticker = await this.getTicker(symbol);
        if (ticker) tickers.set(symbol, ticker);
      });
      
      await Promise.all(promises);
    }
    
    return tickers;
  }

  async getKlines(symbol: string, interval: string, limit: number = 100): Promise<OHLCV[]> {
    try {
      const response = await fetch(
        `${BINANCE_API.BASE_URL}${BINANCE_API.KLINE}?symbol=${symbol}&interval=${interval}&limit=${limit}`
      );
      
      if (!response.ok) return [];
      
      const data = await response.json();
      
      return data.map((item: string[]) => ({
        timestamp: parseInt(item[0]),
        open: parseFloat(item[1]),
        high: parseFloat(item[2]),
        low: parseFloat(item[3]),
        close: parseFloat(item[4]),
        volume: parseFloat(item[5]),
      }));
    } catch {
      return [];
    }
  }

  async getOrderBook(symbol: string, limit: number = 20): Promise<OrderBook | null> {
    try {
      const response = await fetch(
        `${BINANCE_API.BASE_URL}${BINANCE_API.ORDER_BOOK}?symbol=${symbol}&limit=${limit}`
      );
      
      if (!response.ok) return null;
      
      const data = await response.json();
      
      return {
        symbol,
        bids: data.bids.map((bid: string[]) => ({
          price: parseFloat(bid[0]),
          quantity: parseFloat(bid[1]),
        })),
        asks: data.asks.map((ask: string[]) => ({
          price: parseFloat(ask[0]),
          quantity: parseFloat(ask[1]),
        })),
        lastUpdateId: data.lastUpdateId,
        timestamp: Date.now(),
      };
    } catch {
      return null;
    }
  }

  async getRecentTrades(symbol: string, limit: number = 50): Promise<Trade[]> {
    try {
      const response = await fetch(
        `${BINANCE_API.BASE_URL}${BINANCE_API.TRADES}?symbol=${symbol}&limit=${limit}`
      );
      
      if (!response.ok) return [];
      
      const data = await response.json();
      
      return data.map((item: { id: number; price: string; qty: string; time: number; isBuyerMaker: boolean }) => ({
        id: item.id,
        symbol,
        price: parseFloat(item.price),
        quantity: parseFloat(item.qty),
        time: item.time,
        isBuyerMaker: item.isBuyerMaker,
      }));
    } catch {
      return [];
    }
  }

  subscribeTicker(symbol: string, callback: (ticker: Ticker) => void): () => void {
    const stream = BINANCE_API.WS_TICKER(symbol);
    return this.subscribe(stream, (data: unknown) => {
      const d = data as Record<string, unknown>;
      callback({
        symbol: d.s as string,
        price: parseFloat(d.c as string),
        priceChange: parseFloat(d.p as string),
        priceChangePercent: parseFloat(d.P as string),
        high24h: parseFloat(d.h as string),
        low24h: parseFloat(d.l as string),
        volume24h: parseFloat(d.v as string),
        quoteVolume24h: parseFloat(d.q as string),
        lastUpdate: Date.now(),
      });
    });
  }

  subscribeOrderBook(symbol: string, callback: (orderBook: OrderBook) => void): () => void {
    const stream = BINANCE_API.WS_ORDER_BOOK(symbol);
    return this.subscribe(stream, (data: unknown) => {
      const d = data as { b: string[][]; a: string[][]; E: number; U: number };
      callback({
        symbol,
        bids: d.b.map((bid) => ({
          price: parseFloat(bid[0]),
          quantity: parseFloat(bid[1]),
        })),
        asks: d.a.map((ask) => ({
          price: parseFloat(ask[0]),
          quantity: parseFloat(ask[1]),
        })),
        lastUpdateId: d.U,
        timestamp: d.E,
      });
    });
  }

  subscribeTrades(symbol: string, callback: (trade: Trade) => void): () => void {
    const stream = BINANCE_API.WS_TRADES(symbol);
    return this.subscribe(stream, (data: unknown) => {
      const d = data as { t: number; p: string; q: string; T: number; m: boolean };
      callback({
        id: d.t,
        symbol,
        price: parseFloat(d.p),
        quantity: parseFloat(d.q),
        time: d.T,
        isBuyerMaker: d.m,
      });
    });
  }

  private subscribe(stream: string, callback: (data: unknown) => void): () => void {
    if (!this.subscriptions.has(stream)) {
      this.subscriptions.set(stream, new Set());
    }
    this.subscriptions.get(stream)!.add(callback);

    if (!this.wsConnections.has(stream)) {
      const ws = new WebSocket(`${BINANCE_API.WS_URL}/${stream}`);
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const subs = this.subscriptions.get(stream);
          if (subs) {
            subs.forEach((cb) => cb(data));
          }
        } catch {
          // Ignore parse errors
        }
      };

      ws.onerror = () => {
        this.connectionStatus.error = 'WebSocket error';
      };

      this.wsConnections.set(stream, ws);
    }

    return () => {
      const subs = this.subscriptions.get(stream);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          this.subscriptions.delete(stream);
          const ws = this.wsConnections.get(stream);
          if (ws) {
            ws.close();
            this.wsConnections.delete(stream);
          }
        }
      }
    };
  }

  getConnectionStatus(): DataProviderConnection {
    return { ...this.connectionStatus };
  }
}

// ============================================
// MARKET DATA HUB (SINGLETON)
// ============================================

class MarketDataHubClass {
  private static instance: MarketDataHubClass | null = null;
  private providers: Map<Exchange, DataProvider> = new Map();
  private activeProvider: DataProvider | null = null;
  private config: MarketDataHubConfig;
  private tickers: Map<string, Ticker> = new Map();
  private klines: Map<string, OHLCV[]> = new Map();
  private orderBooks: Map<string, OrderBook> = new Map();
  private recentTrades: Map<string, Trade[]> = new Map();
  private subscribers: Map<string, Set<(data: unknown) => void>> = new Map();

  private constructor(config: MarketDataHubConfig) {
    this.config = config;
    this.initializeProviders();
  }

  static getInstance(config?: Partial<MarketDataHubConfig>): MarketDataHubClass {
    if (!MarketDataHubClass.instance) {
      const defaultConfig: MarketDataHubConfig = {
        enabledExchanges: [Exchange.BINANCE],
        defaultSymbol: 'BTCUSDT',
        defaultInterval: '1h',
        refreshRates: {
          ticker: REFRESH_INTERVALS.TICKER,
          kline: REFRESH_INTERVALS.KLINE,
          orderBook: REFRESH_INTERVALS.ORDER_BOOK,
          trades: REFRESH_INTERVALS.TRADES,
        },
        ...config,
      };
      MarketDataHubClass.instance = new MarketDataHubClass(defaultConfig);
    }
    return MarketDataHubClass.instance;
  }

  private initializeProviders(): void {
    const binanceProvider = new BinanceDataProvider();
    this.providers.set(Exchange.BINANCE, binanceProvider);
    this.activeProvider = binanceProvider;
  }

  async connect(): Promise<void> {
    for (const provider of this.providers.values()) {
      await provider.connect();
    }
  }

  disconnect(): void {
    for (const provider of this.providers.values()) {
      provider.disconnect();
    }
  }

  setActiveExchange(exchange: Exchange): void {
    const provider = this.providers.get(exchange);
    if (provider) {
      this.activeProvider = provider;
    }
  }

  getActiveProvider(): DataProvider | null {
    return this.activeProvider;
  }

  async fetchTicker(symbol: string): Promise<Ticker | null> {
    if (!this.activeProvider) return null;
    
    const ticker = await this.activeProvider.getTicker(symbol);
    if (ticker) {
      this.tickers.set(symbol, ticker);
      this.notifySubscribers(`ticker:${symbol}`, ticker);
    }
    return ticker;
  }

  async fetchTickers(symbols?: string[]): Promise<Map<string, Ticker>> {
    if (!this.activeProvider) return new Map();
    
    const tickers = await this.activeProvider.getTickers(symbols);
    tickers.forEach((ticker, symbol) => {
      this.tickers.set(symbol, ticker);
      this.notifySubscribers(`ticker:${symbol}`, ticker);
    });
    return tickers;
  }

  async fetchKlines(symbol: string, interval: string, limit?: number): Promise<OHLCV[]> {
    if (!this.activeProvider) return [];
    
    const klines = await this.activeProvider.getKlines(symbol, interval, limit);
    const key = `${symbol}:${interval}`;
    this.klines.set(key, klines);
    this.notifySubscribers(`klines:${key}`, klines);
    return klines;
  }

  async fetchOrderBook(symbol: string, limit?: number): Promise<OrderBook | null> {
    if (!this.activeProvider) return null;
    
    const orderBook = await this.activeProvider.getOrderBook(symbol, limit);
    if (orderBook) {
      this.orderBooks.set(symbol, orderBook);
      this.notifySubscribers(`orderBook:${symbol}`, orderBook);
    }
    return orderBook;
  }

  async fetchRecentTrades(symbol: string, limit?: number): Promise<Trade[]> {
    if (!this.activeProvider) return [];
    
    const trades = await this.activeProvider.getRecentTrades(symbol, limit);
    this.recentTrades.set(symbol, trades);
    this.notifySubscribers(`trades:${symbol}`, trades);
    return trades;
  }

  subscribeTicker(symbol: string, callback: (ticker: Ticker) => void): () => void {
    if (!this.activeProvider) return () => {};
    return this.activeProvider.subscribeTicker(symbol, callback);
  }

  subscribeOrderBook(symbol: string, callback: (orderBook: OrderBook) => void): () => void {
    if (!this.activeProvider) return () => {};
    return this.activeProvider.subscribeOrderBook(symbol, callback);
  }

  subscribeTrades(symbol: string, callback: (trade: Trade) => void): () => void {
    if (!this.activeProvider) return () => {};
    return this.activeProvider.subscribeTrades(symbol, callback);
  }

  subscribe(channel: string, callback: (data: unknown) => void): () => void {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set());
    }
    this.subscribers.get(channel)!.add(callback);

    return () => {
      const subs = this.subscribers.get(channel);
      if (subs) {
        subs.delete(callback);
      }
    };
  }

  private notifySubscribers(channel: string, data: unknown): void {
    const subs = this.subscribers.get(channel);
    if (subs) {
      subs.forEach((callback) => callback(data));
    }
  }

  getCachedTicker(symbol: string): Ticker | undefined {
    return this.tickers.get(symbol);
  }

  getCachedTickers(): Map<string, Ticker> {
    return new Map(this.tickers);
  }

  getCachedKlines(symbol: string, interval: string): OHLCV[] {
    return this.klines.get(`${symbol}:${interval}`) || [];
  }

  getCachedOrderBook(symbol: string): OrderBook | undefined {
    return this.orderBooks.get(symbol);
  }

  getCachedTrades(symbol: string): Trade[] {
    return this.recentTrades.get(symbol) || [];
  }

  getConnectionStatus(): DataProviderConnection | null {
    return this.activeProvider?.getConnectionStatus() || null;
  }

  clearCache(): void {
    this.tickers.clear();
    this.klines.clear();
    this.orderBooks.clear();
    this.recentTrades.clear();
  }

  getConfig(): MarketDataHubConfig {
    return { ...this.config };
  }
}

export const MarketDataHub = {
  getInstance: (config?: Partial<MarketDataHubConfig>) => 
    MarketDataHubClass.getInstance(config),
};

