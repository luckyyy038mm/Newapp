import { Candle, Ticker, Timeframe, Drawing, IndicatorConfig, WatchlistItem, ThemeColors, DARK_THEME } from '@/types';

// Simple reactive store implementation
type Listener = () => void;

class Store<T extends object> {
  private state: T;
  private listeners: Set<Listener> = new Set();

  constructor(initialState: T) {
    this.state = initialState;
  }

  getState(): T {
    return this.state;
  }

  setState(updater: Partial<T> | ((state: T) => Partial<T>)): void {
    const updates = typeof updater === 'function' ? updater(this.state) : updater;
    this.state = { ...this.state, ...updates };
    this.notify();
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(listener => listener());
  }
}

interface ChartStoreState {
  // Symbol and timeframe
  symbol: string;
  timeframe: Timeframe;
  
  // Market data
  candles: Candle[];
  currentTicker: Ticker | null;
  watchlist: WatchlistItem[];
  
  // Chart state
  isLoading: boolean;
  isLive: boolean;
  isConnected: boolean;
  
  // Drawings
  drawings: Drawing[];
  selectedDrawingId: string | null;
  
  // Indicators
  indicators: IndicatorConfig[];
  
  // UI state
  isFullscreen: boolean;
  showWatchlist: boolean;
  showOrderBook: boolean;
  showTrades: boolean;
  
  // Theme
  theme: ThemeColors;
  
  // Active tool
  activeTool: string | null;
}

const initialState: ChartStoreState = {
  symbol: 'BTCUSDT',
  timeframe: '1h',
  candles: [],
  currentTicker: null,
  watchlist: [],
  isLoading: true,
  isLive: true,
  isConnected: false,
  drawings: [],
  selectedDrawingId: null,
  indicators: [
    { id: 'ema20', type: 'ema', params: { period: 20 }, visible: true, color: '#10b981', pane: 'main' },
    { id: 'ema50', type: 'ema', params: { period: 50 }, visible: true, color: '#3b82f6', pane: 'main' },
    { id: 'vwap', type: 'vwap', params: {}, visible: true, color: '#8b5cf6', pane: 'main' },
  ],
  isFullscreen: false,
  showWatchlist: true,
  showOrderBook: true,
  showTrades: true,
  theme: DARK_THEME,
  activeTool: null,
};

export const chartStore = new Store<ChartStoreState>(initialState);

// Actions
export const chartActions = {
  setSymbol: (symbol: string) => {
    chartStore.setState({ symbol, candles: [], isLoading: true });
  },
  
  setTimeframe: (timeframe: Timeframe) => {
    chartStore.setState({ timeframe, candles: [], isLoading: true });
  },
  
  setCandles: (candles: Candle[]) => {
    chartStore.setState({ candles, isLoading: false });
  },
  
  addCandle: (candle: Candle) => {
    chartStore.setState(state => {
      const candles = [...state.candles];
      if (candles.length > 0 && candles[candles.length - 1].time === candle.time) {
        candles[candles.length - 1] = candle;
      } else if (candles.length === 0 || candle.time > candles[candles.length - 1].time) {
        candles.push(candle);
      }
      return { candles };
    });
  },
  
  updateLastCandle: (candle: Candle) => {
    chartStore.setState(state => {
      const candles = [...state.candles];
      if (candles.length > 0 && candles[candles.length - 1].time === candle.time) {
        candles[candles.length - 1] = candle;
      }
      return { candles };
    });
  },
  
  setTicker: (ticker: Ticker) => {
    chartStore.setState(state => ({
      currentTicker: ticker,
      watchlist: state.watchlist.map(item => 
        item.symbol === ticker.symbol ? {
          ...item,
          lastPrice: ticker.lastPrice,
          priceChange: ticker.priceChange,
          priceChangePercent: ticker.priceChangePercent,
        } : item
      ),
    }));
  },
  
  setWatchlist: (watchlist: WatchlistItem[]) => {
    chartStore.setState({ watchlist });
  },
  
  setLoading: (isLoading: boolean) => {
    chartStore.setState({ isLoading });
  },
  
  setConnected: (isConnected: boolean) => {
    chartStore.setState({ isConnected });
  },
  
  setLive: (isLive: boolean) => {
    chartStore.setState({ isLive });
  },
  
  // Drawing actions
  addDrawing: (drawing: Drawing) => {
    chartStore.setState(state => ({
      drawings: [...state.drawings, drawing],
    }));
  },
  
  updateDrawing: (id: string, updates: Partial<Drawing>) => {
    chartStore.setState(state => ({
      drawings: state.drawings.map(d => 
        d.id === id ? ({ ...d, ...updates } as Drawing) : d
      ),
    }));
  },
  
  deleteDrawing: (id: string) => {
    chartStore.setState(state => ({
      drawings: state.drawings.filter(d => d.id !== id),
      selectedDrawingId: state.selectedDrawingId === id ? null : state.selectedDrawingId,
    }));
  },
  
  selectDrawing: (id: string | null) => {
    chartStore.setState({ selectedDrawingId: id });
  },
  
  // Indicator actions
  addIndicator: (indicator: IndicatorConfig) => {
    chartStore.setState(state => ({
      indicators: [...state.indicators, indicator],
    }));
  },
  
  updateIndicator: (id: string, updates: Partial<IndicatorConfig>) => {
    chartStore.setState(state => ({
      indicators: state.indicators.map(i => 
        i.id === id ? { ...i, ...updates } : i
      ),
    }));
  },
  
  removeIndicator: (id: string) => {
    chartStore.setState(state => ({
      indicators: state.indicators.filter(i => i.id !== id),
    }));
  },
  
  toggleIndicator: (id: string) => {
    chartStore.setState(state => ({
      indicators: state.indicators.map(i => 
        i.id === id ? { ...i, visible: !i.visible } : i
      ),
    }));
  },
  
  // UI actions
  setFullscreen: (isFullscreen: boolean) => {
    chartStore.setState({ isFullscreen });
  },
  
  toggleFullscreen: () => {
    chartStore.setState(state => ({ isFullscreen: !state.isFullscreen }));
  },
  
  setShowWatchlist: (show: boolean) => {
    chartStore.setState({ showWatchlist: show });
  },
  
  setShowOrderBook: (show: boolean) => {
    chartStore.setState({ showOrderBook: show });
  },
  
  setShowTrades: (show: boolean) => {
    chartStore.setState({ showTrades: show });
  },
  
  setActiveTool: (tool: string | null) => {
    chartStore.setState({ activeTool: tool });
  },
  
  setTheme: (theme: ThemeColors) => {
    chartStore.setState({ theme });
  },
};
