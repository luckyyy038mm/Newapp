import { Candle, Ticker, Tick, OrderBook, Timeframe, TIMEFRAME_MS } from '@/types';

export interface MarketDataCallbacks {
  onCandle?: (candle: Candle) => void;
  onCandleUpdate?: (candle: Candle) => void;
  onTicker?: (ticker: Ticker) => void;
  onTrade?: (trade: Tick) => void;
  onOrderBook?: (orderBook: OrderBook) => void;
  onError?: (error: Error) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export class BinanceMarketDataService {
  private wsUrl: string = 'wss://fstream.binance.com:9443/ws';
  private callbacks: MarketDataCallbacks = {};
  private ws: WebSocket | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  private subscriptions: Map<string, Set<Timeframe>> = new Map(); // symbol -> timeframes
  private candleBuffer: Map<string, Candle> = new Map(); // symbol+timeframe -> current candle
  private isConnecting: boolean = false;

  constructor(callbacks: MarketDataCallbacks = {}) {
    this.callbacks = callbacks;
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) return;
    
    this.isConnecting = true;
    
    try {
      this.ws = new WebSocket(this.wsUrl);
      
      this.ws.onopen = () => {
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.callbacks.onConnect?.();
        
        // Resubscribe to previous subscriptions
        this.resubscribe();
      };
      
      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };
      
      this.ws.onerror = (error) => {
        this.isConnecting = false;
        this.callbacks.onError?.(new Error('WebSocket error'));
      };
      
      this.ws.onclose = () => {
        this.isConnecting = false;
        this.callbacks.onDisconnect?.();
        this.attemptReconnect();
      };
    } catch (error) {
      this.isConnecting = false;
      this.callbacks.onError?.(error as Error);
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnection
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    setTimeout(() => {
      if (this.subscriptions.size > 0) {
        this.connect();
      }
    }, delay);
  }

  private resubscribe(): void {
    for (const [symbol, timeframes] of this.subscriptions) {
      for (const timeframe of timeframes) {
        this.subscribeToKline(symbol, timeframe);
      }
    }
  }

  subscribeToKline(symbol: string, timeframe: Timeframe): void {
    if (!this.subscriptions.has(symbol)) {
      this.subscriptions.set(symbol, new Set());
    }
    this.subscriptions.get(symbol)!.add(timeframe);

    if (this.ws?.readyState === WebSocket.OPEN) {
      const stream = `${symbol.toLowerCase()}@kline_${timeframe}`;
      this.ws.send(JSON.stringify({
        method: 'SUBSCRIBE',
        params: [stream],
        id: Date.now(),
      }));
    }
  }

  unsubscribeFromKline(symbol: string, timeframe: Timeframe): void {
    const timeframes = this.subscriptions.get(symbol);
    if (timeframes) {
      timeframes.delete(timeframe);
      if (timeframes.size === 0) {
        this.subscriptions.delete(symbol);
      }
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      const stream = `${symbol.toLowerCase()}@kline_${timeframe}`;
      this.ws.send(JSON.stringify({
        method: 'UNSUBSCRIBE',
        params: [stream],
        id: Date.now(),
      }));
    }
  }

  subscribeToTicker(symbol: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const stream = `${symbol.toLowerCase()}@ticker`;
      this.ws.send(JSON.stringify({
        method: 'SUBSCRIBE',
        params: [stream],
        id: Date.now(),
      }));
    }
  }

  subscribeToTrades(symbol: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const stream = `${symbol.toLowerCase()}@trade`;
      this.ws.send(JSON.stringify({
        method: 'SUBSCRIBE',
        params: [stream],
        id: Date.now(),
      }));
    }
  }

  subscribeToDepth(symbol: string, level: number = 20): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const stream = `${symbol.toLowerCase()}@depth${level}@100ms`;
      this.ws.send(JSON.stringify({
        method: 'SUBSCRIBE',
        params: [stream],
        id: Date.now(),
      }));
    }
  }

  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data);
      
      if (message.e === 'kline') {
        this.handleKline(message);
      } else if (message.e === '24hrTicker') {
        this.handleTicker(message);
      } else if (message.e === 'trade') {
        this.handleTrade(message);
      } else if (message.lastUpdateId && message.bids && message.asks) {
        this.handleDepth(message);
      }
    } catch (error) {
      // Ignore parse errors
    }
  }

  private handleKline(data: any): void {
    const kline = data.k;
    const timeframe = this.mapTimeframe(kline.i);
    const candle: Candle = {
      time: kline.t,
      open: parseFloat(kline.o),
      high: parseFloat(kline.h),
      low: parseFloat(kline.l),
      close: parseFloat(kline.c),
      volume: parseFloat(kline.v),
      isFinal: kline.x,
    };

    const bufferKey = `${data.s}_${timeframe}`;
    
    if (candle.isFinal) {
      this.callbacks.onCandle?.(candle);
      this.candleBuffer.delete(bufferKey);
    } else {
      this.callbacks.onCandleUpdate?.(candle);
      this.candleBuffer.set(bufferKey, candle);
    }
  }

  private handleTicker(data: any): void {
    const ticker: Ticker = {
      symbol: data.s,
      lastPrice: parseFloat(data.c),
      priceChange: parseFloat(data.p),
      priceChangePercent: parseFloat(data.P),
      high24h: parseFloat(data.h),
      low24h: parseFloat(data.l),
      volume24h: parseFloat(data.v),
      quoteVolume24h: parseFloat(data.q),
      bidPrice: parseFloat(data.b),
      askPrice: parseFloat(data.a),
      timestamp: data.E,
    };
    
    this.callbacks.onTicker?.(ticker);
  }

  private handleTrade(data: any): void {
    const trade: Tick = {
      time: data.T,
      price: parseFloat(data.p),
      volume: parseFloat(data.q),
      isBuy: data.m, // m = true means buyer is market maker
    };
    
    this.callbacks.onTrade?.(trade);
  }

  private handleDepth(data: any): void {
    const orderBook: OrderBook = {
      symbol: '', // Would need to track this
      bids: data.bids.map((b: any) => ({ price: parseFloat(b[0]), quantity: parseFloat(b[1]) })),
      asks: data.asks.map((a: any) => ({ price: parseFloat(a[0]), quantity: parseFloat(a[1]) })),
      lastUpdateId: data.lastUpdateId,
      timestamp: Date.now(),
    };
    
    this.callbacks.onOrderBook?.(orderBook);
  }

  private mapTimeframe(tf: string): Timeframe {
    const mapping: Record<string, Timeframe> = {
      '1m': '1m',
      '3m': '3m',
      '5m': '5m',
      '15m': '15m',
      '30m': '30m',
      '1h': '1h',
      '4h': '4h',
      '1d': '1d',
    };
    return mapping[tf] || '1h';
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// REST API for historical data
export class BinanceRESTAPI {
  private baseUrl: string = 'https://fapi.binance.com';

  async getKlines(
    symbol: string,
    timeframe: Timeframe,
    limit: number = 500,
    startTime?: number,
    endTime?: number
  ): Promise<Candle[]> {
    const interval = this.mapTimeframeToInterval(timeframe);
    
    let url = `${this.baseUrl}/fapi/v1/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    if (startTime) url += `&startTime=${startTime}`;
    if (endTime) url += `&endTime=${endTime}`;

    try {
      const response = await fetch(url);
      
      // Check if response is valid
      if (!response.ok) {
        console.error(`Failed to fetch klines: ${response.status} ${response.statusText}`);
        return [];
      }
      
      const data = await response.json();
      
      // Check if data is an array (Binance returns error object otherwise)
      if (!Array.isArray(data)) {
        console.error('Invalid response from Binance klines API');
        return [];
      }
      
      return data.map((k: any) => ({
        time: k[0],
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        volume: parseFloat(k[5]),
        isFinal: true,
      }));
    } catch (error) {
      console.error('Failed to fetch klines:', error);
      return [];
    }
  }

  async get24hrTicker(symbol: string): Promise<Ticker | null> {
    try {
      const response = await fetch(`${this.baseUrl}/fapi/v1/ticker/24hr?symbol=${symbol}`);
      const data = await response.json();
      
      return {
        symbol: data.symbol,
        lastPrice: parseFloat(data.lastPrice),
        priceChange: parseFloat(data.priceChange),
        priceChangePercent: parseFloat(data.priceChangePercent),
        high24h: parseFloat(data.highPrice),
        low24h: parseFloat(data.lowPrice),
        volume24h: parseFloat(data.volume),
        quoteVolume24h: parseFloat(data.quoteVolume),
        bidPrice: parseFloat(data.bidPrice),
        askPrice: parseFloat(data.askPrice),
        timestamp: data.closeTime,
      };
    } catch (error) {
      console.error('Failed to fetch ticker:', error);
      return null;
    }
  }

  async getExchangeInfo(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/fapi/v1/exchangeInfo`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch exchange info:', error);
      return null;
    }
  }

  private mapTimeframeToInterval(tf: Timeframe): string {
    const mapping: Record<Timeframe, string> = {
      '1m': '1m',
      '3m': '3m',
      '5m': '5m',
      '15m': '15m',
      '30m': '30m',
      '1h': '1h',
      '4h': '4h',
      '1d': '1d',
    };
    return mapping[tf];
  }
}

// Popular futures symbols
export const FUTURES_SYMBOLS = [
  'BTCUSDT',
  'ETHUSDT',
  'BNBUSDT',
  'SOLUSDT',
  'XRPUSDT',
  'DOGEUSDT',
  'ADAUSDT',
  'AVAXUSDT',
  'DOTUSDT',
  'LINKUSDT',
  'MATICUSDT',
  'LTCUSDT',
  'ATOMUSDT',
  'UNIUSDT',
  'XLMUSDT',
];
