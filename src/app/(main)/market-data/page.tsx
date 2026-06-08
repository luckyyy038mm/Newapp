'use client';

import { Card, CardHeader, Badge, Select } from '@/components/ui';
import { useState } from 'react';

export default function MarketDataPage() {
  const [selectedExchange, setSelectedExchange] = useState('binance');
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');

  const exchangeOptions = [
    { value: 'binance', label: 'Binance' },
    { value: 'bybit', label: 'Bybit' },
    { value: 'okx', label: 'OKX' },
  ];

  const symbolOptions = [
    { value: 'BTCUSDT', label: 'BTC/USDT' },
    { value: 'ETHUSDT', label: 'ETH/USDT' },
    { value: 'SOLUSDT', label: 'SOL/USDT' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Market Data Hub</h1>
          <p className="text-slate-400 mt-1">Centralized market data management</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="success">Connected</Badge>
          <div className="text-sm text-slate-400">
            Last update: <span className="text-slate-300">Just now</span>
          </div>
        </div>
      </div>

      {/* Data Configuration */}
      <Card>
        <CardHeader
          title="Data Source Configuration"
          subtitle="Configure your market data providers"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Select
              label="Exchange"
              options={exchangeOptions}
              value={selectedExchange}
              onChange={(e) => setSelectedExchange(e.target.value)}
            />
            <Select
              label="Symbol"
              options={symbolOptions}
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
            />
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-300 mb-3">Architecture</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span className="text-sm text-slate-400">Market Data Hub (Central)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                <span className="text-sm text-slate-400">Binance Provider</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-slate-600 rounded-full" />
                <span className="text-sm text-slate-400">Bybit Provider (Coming)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-slate-600 rounded-full" />
                <span className="text-sm text-slate-400">OKX Provider (Coming)</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Data Streams */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-300">Ticker</span>
            <Badge variant="success">Active</Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Symbol</span>
              <span className="text-slate-300">{selectedSymbol}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Interval</span>
              <span className="text-slate-300">1s</span>
            </div>
          </div>
        </Card>

        <Card padding="sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-300">Klines</span>
            <Badge variant="success">Active</Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Interval</span>
              <span className="text-slate-300">1m - 1w</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Max</span>
              <span className="text-slate-300">500 candles</span>
            </div>
          </div>
        </Card>

        <Card padding="sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-300">Order Book</span>
            <Badge variant="success">Active</Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Depth</span>
              <span className="text-slate-300">20 levels</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Update</span>
              <span className="text-slate-300">Real-time</span>
            </div>
          </div>
        </Card>

        <Card padding="sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-300">Trades</span>
            <Badge variant="success">Active</Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">History</span>
              <span className="text-slate-300">50 trades</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Stream</span>
              <span className="text-slate-300">WebSocket</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Data Flow Diagram */}
      <Card>
        <CardHeader
          title="Data Flow Architecture"
          subtitle="How market data flows through the system"
        />
        <div className="bg-slate-900/50 rounded-lg p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-500/20 border border-blue-500/50 rounded-lg flex items-center justify-center mb-2">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <span className="text-sm text-slate-400">Exchange</span>
              <span className="text-xs text-slate-500">Binance</span>
            </div>

            <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/50 rounded-lg flex items-center justify-center mb-2">
                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <span className="text-sm text-slate-400">Data Hub</span>
              <span className="text-xs text-slate-500">Cache & Distribute</span>
            </div>

            <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-purple-500/20 border border-purple-500/50 rounded-lg flex items-center justify-center mb-2">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-sm text-slate-400">Consumers</span>
              <span className="text-xs text-slate-500">All Modules</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Provider Status */}
      <Card>
        <CardHeader
          title="Provider Status"
          subtitle="Data provider connection status"
        />
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
              <div>
                <div className="font-medium text-slate-200">Binance</div>
                <div className="text-xs text-slate-400">Primary Data Source</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-emerald-400">Connected</div>
              <div className="text-xs text-slate-500">Latency: --ms</div>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-slate-600 rounded-full" />
              <div>
                <div className="font-medium text-slate-400">Bybit</div>
                <div className="text-xs text-slate-500">Coming Soon</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-500">Not Connected</div>
              <div className="text-xs text-slate-500">Planned</div>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-slate-600 rounded-full" />
              <div>
                <div className="font-medium text-slate-400">OKX</div>
                <div className="text-xs text-slate-500">Coming Soon</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-500">Not Connected</div>
              <div className="text-xs text-slate-500">Planned</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}