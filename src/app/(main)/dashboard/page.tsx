'use client';

import { useState, useEffect } from 'react';
import { MarketOverview, PriceDisplay, StatsGrid, QuickStats } from '@/components/dashboard';
import { Card, CardHeader } from '@/components/ui';
import { formatPrice, formatPercent, formatVolume, cn } from '@/utils';
import type { Ticker, OHLCV } from '@/types';

export default function DashboardPage() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [ticker, setTicker] = useState<Ticker | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTicker() {
      try {
        const response = await fetch(
          `https://api.binance.com/api/v3/ticker?symbol=${selectedSymbol}`
        );
        if (!response.ok) return;
        
        const data = await response.json();
        setTicker({
          symbol: data.symbol,
          price: parseFloat(data.lastPrice),
          priceChange: parseFloat(data.priceChange),
          priceChangePercent: parseFloat(data.priceChangePercent),
          high24h: parseFloat(data.highPrice),
          low24h: parseFloat(data.lowPrice),
          volume24h: parseFloat(data.volume),
          quoteVolume24h: parseFloat(data.quoteVolume),
          lastUpdate: Date.now(),
        });
      } catch {
        // Handle error silently
      } finally {
        setLoading(false);
      }
    }

    fetchTicker();
    const interval = setInterval(fetchTicker, 2000);
    return () => clearInterval(interval);
  }, [selectedSymbol]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
          <p className="text-slate-400 mt-1">Real-time market overview and analytics</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span>Live Data</span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Price & Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Price Header */}
          <Card>
            <CardHeader
              title={selectedSymbol.replace('USDT', '/USDT')}
              subtitle="Spot Price"
              action={
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400">Selected</span>
                </div>
              }
            />
            <div className="space-y-4">
              <PriceDisplay
                symbol={selectedSymbol}
                price={ticker?.price}
                change={ticker?.priceChange}
                changePercent={ticker?.priceChangePercent}
              />
              <StatsGrid ticker={ticker} loading={loading} />
            </div>
          </Card>

          {/* Chart Placeholder */}
          <Card>
            <CardHeader
              title="Price Chart"
              subtitle="1 Hour Interval"
            />
            <div className="h-[300px] flex items-center justify-center bg-slate-900/50 rounded-lg border border-slate-700/50">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                <p className="text-slate-500">Chart component will be added</p>
                <p className="text-sm text-slate-600 mt-1">Navigate to Chart Analysis for full functionality</p>
              </div>
            </div>
          </Card>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickStats
              title="Active Positions"
              value="0"
              subvalue="Paper trading"
              trend="neutral"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
            />
            <QuickStats
              title="Open Orders"
              value="0"
              subvalue="Active"
              trend="neutral"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              }
            />
            <QuickStats
              title="Signals"
              value="0"
              subvalue="Today"
              trend="neutral"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              }
            />
            <QuickStats
              title="P&L Today"
              value="$0.00"
              subvalue="0%"
              trend="neutral"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </div>
        </div>

        {/* Right Column - Market Overview */}
        <div className="space-y-6">
          <MarketOverview
            selectedSymbol={selectedSymbol}
            onSelectSymbol={setSelectedSymbol}
          />

          {/* Recent Activity */}
          <Card>
            <CardHeader
              title="Recent Activity"
              subtitle="Latest updates"
            />
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg">
                <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-sm text-slate-300">System Initialized</div>
                  <div className="text-xs text-slate-500">Connected to Binance</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-sm text-slate-300">Market Data Hub Ready</div>
                  <div className="text-xs text-slate-500">Real-time feeds active</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg">
                <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-sm text-slate-300">Platform Ready</div>
                  <div className="text-xs text-slate-500">All systems operational</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}