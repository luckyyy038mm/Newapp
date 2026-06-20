'use client';

import React, { useState, useEffect } from 'react';
import { chartStore, chartActions } from '@/store/chartStore';
import { BinanceRESTAPI, FUTURES_SYMBOLS } from '@/services/binance';
import { WatchlistItem, Ticker } from '@/types';
import { generateMockWatchlist } from '@/utils/mockData';

const restApi = new BinanceRESTAPI();

export default function Watchlist() {
  const state = chartStore.getState();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadWatchlist = async () => {
      setIsLoading(true);
      const items: WatchlistItem[] = [];
      
      // Try to fetch from Binance API first
      try {
        for (const symbol of FUTURES_SYMBOLS.slice(0, 15)) {
          const ticker = await restApi.get24hrTicker(symbol);
          if (ticker) {
            items.push({
              symbol: ticker.symbol,
              lastPrice: ticker.lastPrice,
              priceChange: ticker.priceChange,
              priceChangePercent: ticker.priceChangePercent,
              high24h: ticker.high24h,
              low24h: ticker.low24h,
              volume24h: ticker.volume24h,
            });
          }
        }
      } catch (error) {
        console.log('Using mock watchlist data');
      }
      
      // If API failed, use mock data
      if (items.length === 0) {
        const mockTickers = generateMockWatchlist();
        items.push(...mockTickers.map(ticker => ({
          symbol: ticker.symbol,
          lastPrice: ticker.lastPrice,
          priceChange: ticker.priceChange,
          priceChangePercent: ticker.priceChangePercent,
          high24h: ticker.high24h,
          low24h: ticker.low24h,
          volume24h: ticker.volume24h,
        })));
      }
      
      setWatchlist(items);
      chartActions.setWatchlist(items);
      setIsLoading(false);
    };
    
    loadWatchlist();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadWatchlist, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSelect = (symbol: string) => {
    chartActions.setSymbol(symbol);
  };

  const formatPrice = (price: number): string => {
    if (price >= 1000) return price.toFixed(2);
    if (price >= 1) return price.toFixed(4);
    return price.toFixed(6);
  };

  const formatVolume = (volume: number): string => {
    if (volume >= 1e9) return (volume / 1e9).toFixed(2) + 'B';
    if (volume >= 1e6) return (volume / 1e6).toFixed(2) + 'M';
    if (volume >= 1e3) return (volume / 1e3).toFixed(2) + 'K';
    return volume.toFixed(2);
  };

  return (
    <div
      style={{
        width: 260,
        height: '100%',
        backgroundColor: '#0f172a',
        borderRight: '1px solid #1f2937',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'JetBrains Mono, monospace',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #1f2937',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 600, color: '#f3f4f6', textTransform: 'uppercase' }}>
          Watchlist
        </span>
        <span style={{ fontSize: 10, color: '#6b7280' }}>{watchlist.length} pairs</span>
      </div>

      {/* Column Headers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 70px 70px',
          gap: 4,
          padding: '8px 16px',
          fontSize: 10,
          color: '#6b7280',
          textTransform: 'uppercase',
          borderBottom: '1px solid #1f2937',
        }}
      >
        <span>Symbol</span>
        <span style={{ textAlign: 'right' }}>Price</span>
        <span style={{ textAlign: 'right' }}>Change</span>
      </div>

      {/* Watchlist Items */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {isLoading ? (
          <div style={{ padding: 20, textAlign: 'center', color: '#6b7280' }}>
            Loading...
          </div>
        ) : (
          watchlist.map((item) => (
            <div
              key={item.symbol}
              onClick={() => handleSelect(item.symbol)}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 70px 70px',
                gap: 4,
                padding: '10px 16px',
                cursor: 'pointer',
                borderLeft: state.symbol === item.symbol ? '3px solid #6366f1' : '3px solid transparent',
                backgroundColor: state.symbol === item.symbol ? '#1f2937' : 'transparent',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (state.symbol !== item.symbol) {
                  e.currentTarget.style.backgroundColor = '#1e293b';
                }
              }}
              onMouseLeave={(e) => {
                if (state.symbol !== item.symbol) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#f3f4f6' }}>
                  {item.symbol.replace('USDT', '')}
                </div>
                <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>
                  Vol: {formatVolume(item.volume24h)}
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: 12, color: '#f3f4f6' }}>
                {formatPrice(item.lastPrice)}
              </div>
              <div
                style={{
                  textAlign: 'right',
                  fontSize: 11,
                  fontWeight: 500,
                  color: item.priceChangePercent >= 0 ? '#10b981' : '#ef4444',
                }}
              >
                {item.priceChangePercent >= 0 ? '+' : ''}
                {item.priceChangePercent.toFixed(2)}%
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Stats for Current Symbol */}
      {state.currentTicker && (
        <div
          style={{
            borderTop: '1px solid #1f2937',
            padding: '12px 16px',
            backgroundColor: '#111827',
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: '#6b7280',
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            {state.symbol} Stats
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px 16px',
              fontSize: 11,
            }}
          >
            <div>
              <span style={{ color: '#6b7280' }}>24h High: </span>
              <span style={{ color: '#10b981' }}>{formatPrice(state.currentTicker.high24h)}</span>
            </div>
            <div>
              <span style={{ color: '#6b7280' }}>24h Low: </span>
              <span style={{ color: '#ef4444' }}>{formatPrice(state.currentTicker.low24h)}</span>
            </div>
            <div>
              <span style={{ color: '#6b7280' }}>24h Vol: </span>
              <span style={{ color: '#f3f4f6' }}>{formatVolume(state.currentTicker.volume24h)}</span>
            </div>
            <div>
              <span style={{ color: '#6b7280' }}>Bid: </span>
              <span style={{ color: '#f3f4f6' }}>{formatPrice(state.currentTicker.bidPrice)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
