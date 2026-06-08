// Utility Functions

import type { OrderBookLevel } from '@/types';

/**
 * Format a number with specified decimal places
 */
export function formatNumber(
  value: number,
  decimals: number = 2,
  options: { compact?: boolean; currency?: boolean } = {}
): string {
  const { compact = false, currency = false } = options;

  if (compact && Math.abs(value) >= 1000000000) {
    return (value / 1000000000).toFixed(2) + 'B';
  }
  if (compact && Math.abs(value) >= 1000000) {
    return (value / 1000000).toFixed(2) + 'M';
  }
  if (compact && Math.abs(value) >= 1000) {
    return (value / 1000).toFixed(2) + 'K';
  }

  const formatted = value.toFixed(decimals);
  
  if (currency) {
    return '$' + formatted;
  }
  
  return formatted;
}

/**
 * Format price with appropriate precision
 */
export function formatPrice(price: number, precision: number = 2): string {
  if (price >= 1000) {
    return formatNumber(price, 2);
  }
  if (price >= 1) {
    return formatNumber(price, precision);
  }
  if (price >= 0.01) {
    return formatNumber(price, 4);
  }
  return formatNumber(price, 8);
}

/**
 * Format percentage with sign
 */
export function formatPercent(value: number, decimals: number = 2): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Format timestamp to readable time
 */
export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Format timestamp to readable date
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format timestamp to readable date and time
 */
export function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Calculate percentage change
 */
export function calculatePercentChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Format large numbers with K, M, B suffixes
 */
export function formatVolume(volume: number): string {
  if (volume >= 1000000000) {
    return (volume / 1000000000).toFixed(2) + 'B';
  }
  if (volume >= 1000000) {
    return (volume / 1000000).toFixed(2) + 'M';
  }
  if (volume >= 1000) {
    return (volume / 1000).toFixed(2) + 'K';
  }
  return volume.toFixed(2);
}

/**
 * Calculate order book depth
 */
export function calculateOrderBookDepth(
  bids: OrderBookLevel[],
  asks: OrderBookLevel[],
  levels: number = 10
): { bidDepth: number; askDepth: number; imbalance: number } {
  const bidLevels = bids.slice(0, levels);
  const askLevels = asks.slice(0, levels);

  const bidDepth = bidLevels.reduce((sum, level) => sum + level.quantity * level.price, 0);
  const askDepth = askLevels.reduce((sum, level) => sum + level.quantity * level.price, 0);

  const totalDepth = bidDepth + askDepth;
  const imbalance = totalDepth > 0 ? ((bidDepth - askDepth) / totalDepth) * 100 : 0;

  return { bidDepth, askDepth, imbalance };
}

/**
 * Calculate VWAP from trades
 */
export function calculateVWAP(trades: { price: number; quantity: number }[]): number {
  if (trades.length === 0) return 0;

  let cumulativeVolume = 0;
  let cumulativePriceVolume = 0;

  for (const trade of trades) {
    cumulativeVolume += trade.quantity;
    cumulativePriceVolume += trade.price * trade.quantity;
  }

  return cumulativeVolume > 0 ? cumulativePriceVolume / cumulativeVolume : 0;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Parse symbol into base and quote
 */
export function parseSymbol(symbol: string): { base: string; quote: string } {
  const quoteAssets = ['USDT', 'BUSD', 'BTC', 'ETH', 'BNB'];
  
  for (const quote of quoteAssets) {
    if (symbol.endsWith(quote)) {
      return {
        base: symbol.slice(0, -quote.length),
        quote,
      };
    }
  }

  return { base: symbol, quote: '' };
}

/**
 * Get color class based on value (positive/negative)
 */
export function getValueColorClass(value: number): string {
  if (value > 0) return 'text-emerald-500';
  if (value < 0) return 'text-red-500';
  return 'text-slate-400';
}

/**
 * Get background color class based on value
 */
export function getValueBgClass(value: number): string {
  if (value > 0) return 'bg-emerald-500/10';
  if (value < 0) return 'bg-red-500/10';
  return 'bg-slate-500/10';
}

/**
 * Class name helper (simple cn implementation)
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}