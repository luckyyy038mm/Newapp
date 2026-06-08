// React hooks for market data

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { MarketDataHub, type DataProviderConnection } from '@/services/market-data';
import type { Ticker, OHLCV, OrderBook, Trade } from '@/types';
import { DEFAULT_SYMBOLS, REFRESH_INTERVALS } from '@/constants';

// ============================================
// USE MARKET DATA HUB
// ============================================

export function useMarketDataHub() {
  const hubRef = useRef(MarketDataHub.getInstance());

  useEffect(() => {
    hubRef.current.connect();
    return () => {
      hubRef.current.disconnect();
    };
  }, []);

  return hubRef.current;
}

// ============================================
// USE TICKER
// ============================================

export function useTicker(symbol: string, autoRefresh: boolean = true) {
  const [ticker, setTicker] = useState<Ticker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hub = useMarketDataHub();

  const fetchTicker = useCallback(async () => {
    try {
      const data = await hub.fetchTicker(symbol);
      setTicker(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch ticker');
    } finally {
      setLoading(false);
    }
  }, [hub, symbol]);

  useEffect(() => {
    fetchTicker();

    if (autoRefresh) {
      const interval = setInterval(fetchTicker, REFRESH_INTERVALS.TICKER);
      return () => clearInterval(interval);
    }
  }, [fetchTicker, autoRefresh]);

  return { ticker, loading, error, refetch: fetchTicker };
}

// ============================================
// USE MULTIPLE TICKERS
// ============================================

export function useTickers(symbols: string[] = DEFAULT_SYMBOLS as unknown as string[], autoRefresh: boolean = true) {
  const [tickers, setTickers] = useState<Map<string, Ticker>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hub = useMarketDataHub();

  const fetchTickers = useCallback(async () => {
    try {
      const data = await hub.fetchTickers(symbols);
      setTickers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tickers');
    } finally {
      setLoading(false);
    }
  }, [hub, symbols]);

  useEffect(() => {
    fetchTickers();

    if (autoRefresh) {
      const interval = setInterval(fetchTickers, REFRESH_INTERVALS.TICKER);
      return () => clearInterval(interval);
    }
  }, [fetchTickers, autoRefresh]);

  return { tickers, loading, error, refetch: fetchTickers };
}

// ============================================
// USE KLINES (OHLCV DATA)
// ============================================

export function useKlines(
  symbol: string,
  interval: string = '1h',
  limit: number = 100,
  autoRefresh: boolean = false
) {
  const [klines, setKlines] = useState<OHLCV[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hub = useMarketDataHub();

  const fetchKlines = useCallback(async () => {
    try {
      const data = await hub.fetchKlines(symbol, interval, limit);
      setKlines(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch klines');
    } finally {
      setLoading(false);
    }
  }, [hub, symbol, interval, limit]);

  useEffect(() => {
    fetchKlines();

    if (autoRefresh) {
      const interval = setInterval(fetchKlines, REFRESH_INTERVALS.KLINE);
      return () => clearInterval(interval);
    }
  }, [fetchKlines, autoRefresh]);

  return { klines, loading, error, refetch: fetchKlines };
}

// ============================================
// USE ORDER BOOK
// ============================================

export function useOrderBook(symbol: string, limit: number = 20, autoRefresh: boolean = true) {
  const [orderBook, setOrderBook] = useState<OrderBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hub = useMarketDataHub();

  const fetchOrderBook = useCallback(async () => {
    try {
      const data = await hub.fetchOrderBook(symbol, limit);
      setOrderBook(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch order book');
    } finally {
      setLoading(false);
    }
  }, [hub, symbol, limit]);

  useEffect(() => {
    fetchOrderBook();

    if (autoRefresh) {
      const interval = setInterval(fetchOrderBook, REFRESH_INTERVALS.ORDER_BOOK);
      return () => clearInterval(interval);
    }
  }, [fetchOrderBook, autoRefresh]);

  return { orderBook, loading, error, refetch: fetchOrderBook };
}

// ============================================
// USE RECENT TRADES
// ============================================

export function useRecentTrades(symbol: string, limit: number = 50) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hub = useMarketDataHub();

  const fetchTrades = useCallback(async () => {
    try {
      const data = await hub.fetchRecentTrades(symbol, limit);
      setTrades(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch trades');
    } finally {
      setLoading(false);
    }
  }, [hub, symbol, limit]);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  return { trades, loading, error, refetch: fetchTrades };
}

// ============================================
// USE CONNECTION STATUS
// ============================================

export function useConnectionStatus() {
  const [status, setStatus] = useState<DataProviderConnection | null>(null);
  const hub = useMarketDataHub();

  useEffect(() => {
    const updateStatus = () => {
      setStatus(hub.getConnectionStatus());
    };

    updateStatus();
    const interval = setInterval(updateStatus, 5000);

    return () => clearInterval(interval);
  }, [hub]);

  return status;
}

// ============================================
// USE WEBSOCKET SUBSCRIPTIONS
// ============================================

export function useTickerSubscription(symbol: string, onUpdate: (ticker: Ticker) => void) {
  const hub = useMarketDataHub();
  const callbackRef = useRef(onUpdate);
  callbackRef.current = onUpdate;

  useEffect(() => {
    const unsubscribe = hub.subscribeTicker(symbol, callbackRef.current);
    return unsubscribe;
  }, [hub, symbol]);
}

export function useOrderBookSubscription(symbol: string, onUpdate: (orderBook: OrderBook) => void) {
  const hub = useMarketDataHub();
  const callbackRef = useRef(onUpdate);
  callbackRef.current = onUpdate;

  useEffect(() => {
    const unsubscribe = hub.subscribeOrderBook(symbol, callbackRef.current);
    return unsubscribe;
  }, [hub, symbol]);
}

export function useTradesSubscription(symbol: string, onUpdate: (trade: Trade) => void) {
  const hub = useMarketDataHub();
  const callbackRef = useRef(onUpdate);
  callbackRef.current = onUpdate;

  useEffect(() => {
    const unsubscribe = hub.subscribeTrades(symbol, callbackRef.current);
    return unsubscribe;
  }, [hub, symbol]);
}

// ============================================
// USE LOCAL STORAGE STATE
// ============================================

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
}

// ============================================
// USE DEBOUNCED VALUE
// ============================================

export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}