'use client';

import { Card, CardHeader, Button, Input, Select } from '@/components/ui';

export default function PaperTradingPage() {
  const orderTypes = [
    { value: 'limit', label: 'Limit Order' },
    { value: 'market', label: 'Market Order' },
    { value: 'stop-loss', label: 'Stop Loss' },
    { value: 'take-profit', label: 'Take Profit' },
  ];

  const sides = [
    { value: 'buy', label: 'Buy / Long' },
    { value: 'sell', label: 'Sell / Short' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Paper Trading</h1>
          <p className="text-slate-400 mt-1">Practice trading without risk</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-lg px-4 py-2">
            <span className="text-sm text-emerald-400">Balance: $100,000.00</span>
          </div>
          <Button variant="secondary" size="sm">Reset Balance</Button>
        </div>
      </div>

      {/* Trading Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Form */}
        <Card className="lg:col-span-1">
          <CardHeader
            title="New Order"
            subtitle="Place paper trades"
          />
          <div className="space-y-4">
            {/* Symbol Selection */}
            <Select
              label="Symbol"
              options={[
                { value: 'BTCUSDT', label: 'BTC/USDT' },
                { value: 'ETHUSDT', label: 'ETH/USDT' },
                { value: 'SOLUSDT', label: 'SOL/USDT' },
              ]}
              className="w-full"
            />

            {/* Side Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Side</label>
              <div className="grid grid-cols-2 gap-2">
                <button className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors">
                  Buy / Long
                </button>
                <button className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-medium transition-colors">
                  Sell / Short
                </button>
              </div>
            </div>

            {/* Order Type */}
            <Select
              label="Order Type"
              options={orderTypes}
              className="w-full"
            />

            {/* Price */}
            <Input
              label="Price"
              type="number"
              placeholder="0.00"
              step="0.01"
            />

            {/* Quantity */}
            <Input
              label="Quantity"
              type="number"
              placeholder="0.00"
              step="0.001"
            />

            {/* Quick Percentages */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Amount</label>
              <div className="grid grid-cols-4 gap-2">
                <button className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-sm transition-colors">
                  25%
                </button>
                <button className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-sm transition-colors">
                  50%
                </button>
                <button className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-sm transition-colors">
                  75%
                </button>
                <button className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-sm transition-colors">
                  100%
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-slate-900/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Order Value</span>
                <span className="text-slate-300">$0.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Est. Fee</span>
                <span className="text-slate-300">$0.00</span>
              </div>
              <div className="border-t border-slate-700 pt-2 flex justify-between font-medium">
                <span className="text-slate-300">Total</span>
                <span className="text-slate-100">$0.00</span>
              </div>
            </div>

            {/* Submit Button */}
            <Button className="w-full" variant="success">
              Buy BTC
            </Button>
          </div>
        </Card>

        {/* Open Positions */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Open Positions"
            subtitle="Active paper trades"
          />
          <div className="min-h-[200px] flex items-center justify-center bg-slate-900/50 rounded-lg border border-slate-700/50">
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <p className="text-slate-400">No open positions</p>
              <p className="text-sm text-slate-500 mt-1">Place your first paper trade above</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Order History */}
      <Card>
        <CardHeader
          title="Order History"
          subtitle="Recent paper trades"
        />
        <div className="min-h-[150px] flex items-center justify-center bg-slate-900/50 rounded-lg border border-slate-700/50">
          <div className="text-center py-8">
            <p className="text-slate-400">No order history</p>
            <p className="text-sm text-slate-500 mt-1">Your placed orders will appear here</p>
          </div>
        </div>
      </Card>
    </div>
  );
}