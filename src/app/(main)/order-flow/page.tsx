'use client';

import { Card, CardHeader, Badge } from '@/components/ui';

export default function OrderFlowPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Order Flow</h1>
          <p className="text-slate-400 mt-1">Visualize market liquidity and order book dynamics</p>
        </div>
      </div>

      {/* Order Flow Components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Heatmap */}
        <Card>
          <CardHeader
            title="Order Book Heatmap"
            subtitle="Liquidity visualization"
          />
          <div className="h-[300px] flex items-center justify-center bg-slate-900/50 rounded-lg border border-slate-700/50">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              <p className="text-slate-400">Heatmap visualization</p>
              <p className="text-sm text-slate-500 mt-1">Price levels colored by order size</p>
            </div>
          </div>
        </Card>

        {/* Trades Tape */}
        <Card>
          <CardHeader
            title="Recent Trades"
            subtitle="Live trade flow"
          />
          <div className="h-[300px] overflow-hidden">
            <div className="space-y-1 p-2">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-slate-800/30 rounded">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${i % 3 === 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <span className="text-sm text-slate-300">${(65000 + Math.random() * 1000).toFixed(2)}</span>
                  </div>
                  <span className="text-sm text-slate-400">{Math.random().toFixed(4)}</span>
                  <span className="text-xs text-slate-500">{i}m ago</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Order Book */}
      <Card>
        <CardHeader
          title="Order Book"
          subtitle="Bid/Ask depth"
        />
        <div className="grid grid-cols-2 gap-4">
          {/* Bids */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-emerald-400">Bids</span>
              <span className="text-xs text-slate-400">Price</span>
            </div>
            <div className="space-y-1">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div 
                    className="h-6 bg-emerald-500/20 rounded" 
                    style={{ width: `${100 - i * 10}%` }}
                  />
                  <span className="text-sm text-emerald-400">
                    ${(64900 - i * 10).toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-500">
                    {(Math.random() * 2).toFixed(3)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Asks */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-red-400">Asks</span>
              <span className="text-xs text-slate-400">Price</span>
            </div>
            <div className="space-y-1">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div 
                    className="h-6 bg-red-500/20 rounded" 
                    style={{ width: `${100 - i * 10}%` }}
                  />
                  <span className="text-sm text-red-400">
                    ${(65100 + i * 10).toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-500">
                    {(Math.random() * 2).toFixed(3)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Delta */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card padding="sm">
          <div className="text-center">
            <div className="text-sm text-slate-400 mb-1">Buy Volume</div>
            <div className="text-2xl font-bold text-emerald-400">--</div>
          </div>
        </Card>
        <Card padding="sm">
          <div className="text-center">
            <div className="text-sm text-slate-400 mb-1">Sell Volume</div>
            <div className="text-2xl font-bold text-red-400">--</div>
          </div>
        </Card>
        <Card padding="sm">
          <div className="text-center">
            <div className="text-sm text-slate-400 mb-1">Delta</div>
            <div className="text-2xl font-bold text-slate-100">--</div>
          </div>
        </Card>
      </div>
    </div>
  );
}