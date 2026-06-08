'use client';

import { Card, CardHeader } from '@/components/ui';

export default function ChartAnalysisPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Chart Analysis</h1>
          <p className="text-slate-400 mt-1">Advanced charting and technical analysis tools</p>
        </div>
      </div>

      {/* Main Chart Area */}
      <Card className="min-h-[500px]">
        <CardHeader
          title="BTC/USDT - 1H"
          subtitle="Binance Spot"
        />
        <div className="h-[400px] flex items-center justify-center bg-slate-900/50 rounded-lg border border-slate-700/50">
          <div className="text-center">
            <svg className="w-20 h-20 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            <h3 className="text-lg font-medium text-slate-300 mb-2">Chart Component Coming Soon</h3>
            <p className="text-slate-500 max-w-md">
              This module will include professional-grade charting with multiple timeframes, 
              technical indicators, and drawing tools.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">TradingView Integration</span>
              <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">50+ Indicators</span>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm">Drawing Tools</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card padding="sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-slate-200">Technical Indicators</h3>
              <p className="text-sm text-slate-400">MACD, RSI, Bollinger, EMA</p>
            </div>
          </div>
          <p className="text-sm text-slate-500">
            Access 50+ built-in technical indicators for comprehensive market analysis.
          </p>
        </Card>

        <Card padding="sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-slate-200">Multiple Timeframes</h3>
              <p className="text-sm text-slate-400">1m to 1W supported</p>
            </div>
          </div>
          <p className="text-sm text-slate-500">
            Switch between timeframes to analyze short-term and long-term trends.
          </p>
        </Card>

        <Card padding="sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-slate-200">Drawing Tools</h3>
              <p className="text-sm text-slate-400">Fib, trends, channels</p>
            </div>
          </div>
          <p className="text-sm text-slate-500">
            Professional drawing tools for trend lines, Fibonacci, and patterns.
          </p>
        </Card>
      </div>
    </div>
  );
}