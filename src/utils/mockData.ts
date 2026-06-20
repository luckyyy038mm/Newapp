import { Candle, Ticker, OrderBookLevel } from '@/types';
import { Timeframe, TIMEFRAME_MS } from '@/types';

// Generate mock candle data for demonstration
export function generateMockCandles(
  symbol: string,
  timeframe: Timeframe,
  count: number = 200,
  startPrice?: number
): Candle[] {
  const candles: Candle[] = [];
  const tfMs = TIMEFRAME_MS[timeframe];
  
  // Start from recent time, going backwards
  const endTime = Math.floor(Date.now() / tfMs) * tfMs;
  const startTime = endTime - (count * tfMs);
  
  // Determine starting price based on symbol
  let basePrice = startPrice;
  if (!basePrice) {
    switch (symbol) {
      case 'BTCUSDT': basePrice = 65000 + Math.random() * 5000; break;
      case 'ETHUSDT': basePrice = 3500 + Math.random() * 500; break;
      case 'BNBUSDT': basePrice = 600 + Math.random() * 50; break;
      case 'SOLUSDT': basePrice = 150 + Math.random() * 30; break;
      default: basePrice = 100 + Math.random() * 100;
    }
  }
  
  let currentPrice = basePrice;
  const now = Date.now();
  
  for (let i = 0; i < count; i++) {
    const time = startTime + (i * tfMs);
    
    // Generate realistic price movements
    const volatility = basePrice * 0.002; // 0.2% volatility per candle
    const trend = Math.random() > 0.5 ? 1 : -1;
    const momentum = (Math.random() - 0.5) * volatility * 2;
    
    const open = currentPrice;
    const change = (Math.random() - 0.5) * volatility * 2 + momentum * trend;
    const close = open + change;
    
    const highExtra = Math.random() * volatility;
    const lowExtra = Math.random() * volatility;
    const high = Math.max(open, close) + highExtra;
    const low = Math.min(open, close) - lowExtra;
    
    const volume = (500 + Math.random() * 1000) * (basePrice / 100);
    
    candles.push({
      time,
      open,
      high,
      low,
      close,
      volume,
      isFinal: time < now,
    });
    
    currentPrice = close;
  }
  
  return candles;
}

// Generate mock ticker data
export function generateMockTicker(symbol: string): Ticker {
  let basePrice: number;
  switch (symbol) {
    case 'BTCUSDT': basePrice = 65000 + Math.random() * 5000; break;
    case 'ETHUSDT': basePrice = 3500 + Math.random() * 500; break;
    case 'BNBUSDT': basePrice = 600 + Math.random() * 50; break;
    case 'SOLUSDT': basePrice = 150 + Math.random() * 30; break;
    default: basePrice = 100 + Math.random() * 100;
  }
  
  const change = (Math.random() - 0.5) * basePrice * 0.05;
  const changePercent = (change / basePrice) * 100;
  
  return {
    symbol,
    lastPrice: basePrice,
    priceChange: change,
    priceChangePercent: changePercent,
    high24h: basePrice * 1.03,
    low24h: basePrice * 0.97,
    volume24h: 50000 + Math.random() * 100000,
    quoteVolume24h: basePrice * (50000 + Math.random() * 100000),
    bidPrice: basePrice - basePrice * 0.0001,
    askPrice: basePrice + basePrice * 0.0001,
    timestamp: Date.now(),
  };
}

// Generate mock order book
export function generateMockOrderBook(symbol: string, levels: number = 15): OrderBookLevel[] {
  let basePrice: number;
  switch (symbol) {
    case 'BTCUSDT': basePrice = 65000; break;
    case 'ETHUSDT': basePrice = 3500; break;
    default: basePrice = 100;
  }
  
  const bids: OrderBookLevel[] = [];
  const asks: OrderBookLevel[] = [];
  
  for (let i = 0; i < levels; i++) {
    const bidQty = 0.5 + Math.random() * 5;
    const askQty = 0.5 + Math.random() * 5;
    
    bids.push({
      price: basePrice - (i * basePrice * 0.0001),
      quantity: bidQty,
    });
    
    asks.push({
      price: basePrice + (i * basePrice * 0.0001),
      quantity: askQty,
    });
  }
  
  return bids;
}

// Popular symbols for watchlist
export const MOCK_WATCHLIST = [
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

// Generate all mock watchlist tickers
export function generateMockWatchlist() {
  return MOCK_WATCHLIST.map(symbol => generateMockTicker(symbol));
}
