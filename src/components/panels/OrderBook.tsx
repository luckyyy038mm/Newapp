'use client';

import React, { useState, useEffect, useRef } from 'react';
import { BinanceMarketDataService } from '@/services/binance';
import { OrderBook as OrderBookType, OrderBookLevel } from '@/types';
import { generateMockOrderBook } from '@/utils/mockData';

interface OrderBookProps {
  symbol: string;
}

export default function OrderBook({ symbol }: OrderBookProps) {
  const [orderBook, setOrderBook] = useState<OrderBookType | null>(null);
  const [maxTotal, setMaxTotal] = useState<number>(0);
  const marketDataRef = useRef<BinanceMarketDataService | null>(null);

  useEffect(() => {
    // Try to use WebSocket first
    let marketData: BinanceMarketDataService | null = null;
    
    try {
      marketData = new BinanceMarketDataService({
        onOrderBook: (data) => {
          setOrderBook(data);
          
          // Calculate max total for depth visualization
          let max = 0;
          let bidTotal = 0;
          let askTotal = 0;
          
          const bids = [...data.bids].slice(0, 15);
          const asks = [...data.asks].slice(0, 15).reverse();
          
          for (const bid of bids) {
            bidTotal += bid.quantity;
            max = Math.max(max, bidTotal);
          }
          
          for (const ask of asks) {
            askTotal += ask.quantity;
            max = Math.max(max, askTotal);
          }
          
          setMaxTotal(max);
        },
      });

      marketDataRef.current = marketData;
      marketData.connect();
      marketData.subscribeToDepth(symbol, 20);
    } catch (error) {
      console.log('Using mock order book data');
      // Use mock data
      const mockBids = generateMockOrderBook(symbol, 15);
      const mockAsks = generateMockOrderBook(symbol, 15);
      
      setOrderBook({
        symbol,
        bids: mockBids,
        asks: mockAsks,
        lastUpdateId: Date.now(),
        timestamp: Date.now(),
      });
      
      // Calculate max for visualization
      let max = 0;
      let total = 0;
      for (const bid of mockBids) {
        total += bid.quantity;
        max = Math.max(max, total);
      }
      setMaxTotal(max);
    }

    return () => {
      marketData?.disconnect();
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

  if (!orderBook) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#0f172a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6b7280',
          fontSize: 12,
          fontFamily: 'JetBrains Mono, monospace',
        }}
      >
        Loading order book...
      </div>
    );
  }

  const bids = orderBook.bids.slice(0, 15);
  const asks = orderBook.asks.slice(0, 15).reverse();
  
  let bidCumulative = 0;
  let askCumulative = 0;

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
          Order Book
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
        <span style={{ textAlign: 'right' }}>Total</span>
      </div>

      {/* Asks (Sell orders) - reversed so lowest ask is at bottom */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        {asks.reverse().map((level, i) => {
          askCumulative += level.quantity;
          const depthPercent = (askCumulative / maxTotal) * 100;
          
          return (
            <div
              key={`ask-${i}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 4,
                padding: '3px 12px',
                position: 'relative',
              }}
            >
              {/* Depth background */}
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: `${depthPercent}%`,
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  pointerEvents: 'none',
                }}
              />
              <span style={{ color: '#ef4444', position: 'relative', zIndex: 1 }}>
                {formatPrice(level.price)}
              </span>
              <span style={{ color: '#f3f4f6', textAlign: 'right', position: 'relative', zIndex: 1 }}>
                {formatQuantity(level.quantity)}
              </span>
              <span style={{ color: '#6b7280', textAlign: 'right', position: 'relative', zIndex: 1 }}>
                {formatQuantity(askCumulative)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Spread */}
      <div
        style={{
          padding: '8px 12px',
          backgroundColor: '#1f2937',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
        }}
      >
        {bids.length > 0 && asks.length > 0 && (
          <>
            <span style={{ color: '#6b7280', fontSize: 10 }}>Spread</span>
            <span style={{ color: '#f3f4f6', fontSize: 11, fontWeight: 600 }}>
              {formatPrice(asks[0].price - bids[0].price)}
            </span>
            <span style={{ color: '#6b7280', fontSize: 10 }}>
              ({((asks[0].price - bids[0].price) / asks[0].price * 100).toFixed(3)}%)
            </span>
          </>
        )}
      </div>

      {/* Bids (Buy orders) */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {bids.map((level, i) => {
          bidCumulative += level.quantity;
          const depthPercent = (bidCumulative / maxTotal) * 100;
          
          return (
            <div
              key={`bid-${i}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 4,
                padding: '3px 12px',
                position: 'relative',
              }}
            >
              {/* Depth background */}
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: `${depthPercent}%`,
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  pointerEvents: 'none',
                }}
              />
              <span style={{ color: '#10b981', position: 'relative', zIndex: 1 }}>
                {formatPrice(level.price)}
              </span>
              <span style={{ color: '#f3f4f6', textAlign: 'right', position: 'relative', zIndex: 1 }}>
                {formatQuantity(level.quantity)}
              </span>
              <span style={{ color: '#6b7280', textAlign: 'right', position: 'relative', zIndex: 1 }}>
                {formatQuantity(bidCumulative)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
