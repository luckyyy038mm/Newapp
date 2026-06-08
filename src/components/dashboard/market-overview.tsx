'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, Skeleton, Badge } from '@/components/ui';
import { TickerRow } from './ticker-card';
import type { Ticker } from '@/types';
import { formatPrice, formatPercent, formatVolume } from '@/utils';
import { DEFAULT_SYMBOLS } from '@/constants';

interface MarketOverviewProps {
  selectedSymbol?: string;
  onSelectSymbol?: (symbol: string) => void;
}

export function MarketOverview({ selectedSymbol = 'BTCUSDT', onSelectSymbol }: MarketOverviewProps) {
  const [tickers, setTickers] = useState<Map<string, Ticker>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTickers() {
      try {
        // Fetch from Binance
        const response = await fetch('https://api.binance.com/api/v3/ticker');
        if (!response.ok) throw new Error('Failed to fetch');
        
        const data = await response.json();
        const tickerMap = new Map<string, Ticker>();
        
        for (const item of data) {
          if (DEFAULT_SYMBOLS.includes(item.symbol)) {
            tickerMap.set(item.symbol, {
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
        
        setTickers(tickerMap);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch market data');
      } finally {
        setLoading(false);
      }
    }

    fetchTickers();
    const interval = setInterval(fetchTickers, 5000);
    return () => clearInterval(interval);
  }, []);

  const sortedTickers = Array.from(tickers.values()).sort(
    (a, b) => b.quoteVolume24h - a.quoteVolume24h
  );

  return (
    <Card>
      <CardHeader
        title="Market Overview"
        subtitle="Live cryptocurrency prices"
      />
      <div className="space-y-1">
        {loading ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8 text-slate-400">
            <p>Unable to load market data</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        ) : (
          sortedTickers.map((ticker) => (
            <TickerRow
              key={ticker.symbol}
              ticker={ticker}
              isSelected={ticker.symbol === selectedSymbol}
              onClick={() => onSelectSymbol?.(ticker.symbol)}
            />
          ))
        )}
      </div>
    </Card>
  );
}

interface PriceDisplayProps {
  symbol: string;
  price?: number;
  change?: number;
  changePercent?: number;
}

export function PriceDisplay({ symbol, price, change, changePercent }: PriceDisplayProps) {
  const isPositive = (changePercent ?? 0) >= 0;
  
  return (
    <div className="space-y-2">
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-slate-100">
          {price ? `$${formatPrice(price)}` : '--'}
        </span>
        <Badge variant={isPositive ? 'success' : 'danger'}>
          {changePercent !== undefined ? formatPercent(changePercent) : '--'}
        </Badge>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <div className="text-slate-400">
          24h Change:{' '}
          <span className={isPositive ? 'text-emerald-400' : 'text-red-400'}>
            {change !== undefined ? `${isPositive ? '+' : ''}${formatPrice(change)}` : '--'}
          </span>
        </div>
      </div>
    </div>
  );
}