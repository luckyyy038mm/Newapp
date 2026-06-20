'use client';

import React, { useState, useEffect, useRef } from 'react';
import { BinanceMarketDataService } from '@/services/binance';
import { Tick } from '@/types';

interface RecentTradesProps {
  symbol: string;
}

export default function RecentTrades({ symbol }: RecentTradesProps) {
  const [trades, setTrades] = useState<Tick[]>([]);
  const [maxVolume, setMaxVolume] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const marketDataRef = useRef<BinanceMarketDataService | null>(null);

  useEffect(() => {
    // Initialize with empty trades
    setTrades([]);
    setMaxVolume(0);

    const marketData = new BinanceMarketDataService({
      onTrade: (trade) => {
        setTrades((prev) => {
          const newTrades = [trade, ...prev].slice(0, 50);
          
          // Update max volume
          const max = Math.max(...newTrades.map((t) => t.volume));
          setMaxVolume(max);
          
          return newTrades;
        });
      },
    });

    marketDataRef.current = marketData;
    marketData.connect();
    marketData.subscribeToTrades(symbol);

    return () => {
      marketData.disconnect();
    };
  }, [symbol]);

  const formatPrice = (price: number): string => {
    if (price >= 1000) return price.toFixed(2);
    if (price >= 1) return price.toFixed(4);
    return price.toFixed(6);
  };

  const formatQuantity = (qty: number): string => {
    if (qty >= 1000) return qty.toFixed(2);
    if (qty >= 1) return qty.toFixed(4);
    return qty.toFixed(6);
  };

  const formatTime = (time: number): string => {
    const date = new Date(time);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 11,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '10px 12px',
          borderBottom: '1px solid #1f2937',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 600, color: '#f3f4f6', textTransform: 'uppercase' }}>
          Recent Trades
        </span>
        <span style={{ fontSize: 10, color: '#6b7280' }}>{symbol}</span>
      </div>

      {/* Column Headers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 4,
          padding: '6px 12px',
          fontSize: 10,
          color: '#6b7280',
          textTransform: 'uppercase',
          borderBottom: '1px solid #1f2937',
        }}
      >
        <span>Price</span>
        <span style={{ textAlign: 'right' }}>Size</span>
        <span style={{ textAlign: 'right' }}>Time</span>
      </div>

      {/* Trades List */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          overflowY: 'auto',
        }}
      >
        {trades.length === 0 ? (
          <div
            style={{
              padding: 20,
              textAlign: 'center',
              color: '#6b7280',
            }}
          >
            Waiting for trades...
          </div>
        ) : (
          trades.map((trade, i) => {
            const volumePercent = (trade.volume / maxVolume) * 100;
            
            return (
              <div
                key={`${trade.time}-${i}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: 4,
                  padding: '4px 12px',
                  position: 'relative',
                }}
              >
                {/* Volume bar background */}
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: `${volumePercent}%`,
                    backgroundColor: trade.isBuy
                      ? 'rgba(239, 68, 68, 0.1)'
                      : 'rgba(16, 185, 129, 0.1)',
                    pointerEvents: 'none',
                  }}
                />
                <span
                  style={{
                    color: trade.isBuy ? '#ef4444' : '#10b981',
                    fontWeight: 500,
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {formatPrice(trade.price)}
                </span>
                <span
                  style={{
                    color: '#f3f4f6',
                    textAlign: 'right',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {formatQuantity(trade.volume)}
                </span>
                <span
                  style={{
                    color: '#6b7280',
                    textAlign: 'right',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {formatTime(trade.time)}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Trade indicator */}
      <div
        style={{
          padding: '8px 12px',
          backgroundColor: '#1f2937',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: '#10b981',
            animation: 'pulse 2s infinite',
          }}
        />
        <span style={{ fontSize: 10, color: '#6b7280' }}>
          {trades.length > 0 ? 'Live' : 'Connecting...'}
        </span>
      </div>
    </div>
  );
}
