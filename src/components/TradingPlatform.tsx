'use client';

import React, { useState, useEffect } from 'react';
import { TradingChart } from '@/components/chart';
import { TopBar } from '@/components/layout';
import { Watchlist, OrderBook, RecentTrades } from '@/components/panels';
import { chartStore, chartActions } from '@/store/chartStore';

export default function TradingPlatform() {
  const [state, setState] = useState(chartStore.getState());
  const [rightPanelTab, setRightPanelTab] = useState<'orderbook' | 'trades'>('orderbook');

  useEffect(() => {
    const unsubscribe = chartStore.subscribe(() => {
      setState(chartStore.getState());
    });
    return () => unsubscribe();
  }, []);

  const handleFullscreen = () => {
    chartActions.toggleFullscreen();
    
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      chartActions.setFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0a0e17',
        overflow: 'hidden',
        fontFamily: 'JetBrains Mono, monospace',
      }}
    >
      {/* Top Bar */}
      <TopBar />

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
        }}
      >
        {/* Left Sidebar - Watchlist */}
        {state.showWatchlist && !state.isFullscreen && (
          <Watchlist />
        )}

        {/* Chart Area */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
          }}
        >
          {/* Chart */}
          <div
            style={{
              flex: 1,
              backgroundColor: '#0a0e17',
              position: 'relative',
            }}
          >
            <TradingChart />
          </div>
        </div>

        {/* Right Sidebar */}
        {!state.isFullscreen && (
          <div
            style={{
              width: 300,
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#0f172a',
              borderLeft: '1px solid #1f2937',
            }}
          >
            {/* Tab Headers */}
            <div
              style={{
                display: 'flex',
                borderBottom: '1px solid #1f2937',
              }}
            >
              <button
                onClick={() => setRightPanelTab('orderbook')}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: rightPanelTab === 'orderbook' ? '#1f2937' : 'transparent',
                  border: 'none',
                  borderBottom: rightPanelTab === 'orderbook' ? '2px solid #6366f1' : '2px solid transparent',
                  color: rightPanelTab === 'orderbook' ? '#f3f4f6' : '#6b7280',
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                Order Book
              </button>
              <button
                onClick={() => setRightPanelTab('trades')}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: rightPanelTab === 'trades' ? '#1f2937' : 'transparent',
                  border: 'none',
                  borderBottom: rightPanelTab === 'trades' ? '2px solid #6366f1' : '2px solid transparent',
                  color: rightPanelTab === 'trades' ? '#f3f4f6' : '#6b7280',
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                Trades
              </button>
            </div>

            {/* Tab Content */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              {rightPanelTab === 'orderbook' ? (
                <OrderBook symbol={state.symbol} />
              ) : (
                <RecentTrades symbol={state.symbol} />
              )}
            </div>

            {/* Market Info Footer */}
            <div
              style={{
                padding: '12px',
                borderTop: '1px solid #1f2937',
                backgroundColor: '#111827',
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}
              >
                Market Info
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 8,
                  fontSize: 11,
                }}
              >
                <div>
                  <span style={{ color: '#6b7280' }}>Symbol: </span>
                  <span style={{ color: '#f3f4f6' }}>{state.symbol}</span>
                </div>
                <div>
                  <span style={{ color: '#6b7280' }}>TF: </span>
                  <span style={{ color: '#f3f4f6' }}>{state.timeframe}</span>
                </div>
                <div>
                  <span style={{ color: '#6b7280' }}>Candles: </span>
                  <span style={{ color: '#f3f4f6' }}>{state.candles.length}</span>
                </div>
                <div>
                  <span style={{ color: '#6b7280' }}>Drawings: </span>
                  <span style={{ color: '#f3f4f6' }}>{state.drawings.length}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div
        style={{
          height: 24,
          backgroundColor: '#111827',
          borderTop: '1px solid #1f2937',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          fontSize: 10,
          color: '#6b7280',
          fontFamily: 'JetBrains Mono, monospace',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span>
            {state.symbol} - {state.timeframe.toUpperCase()}
          </span>
          <span>
            {state.candles.length} candles loaded
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: state.isConnected ? '#10b981' : '#ef4444',
              }}
            />
            {state.isConnected ? 'Connected' : 'Disconnected'}
          </span>
          <span>Binance Futures</span>
          <span>v1.0.0</span>
        </div>
      </div>
    </div>
  );
}
