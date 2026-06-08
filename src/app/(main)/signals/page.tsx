'use client';

import { Card, CardHeader, Badge } from '@/components/ui';

export default function SignalsPage() {
  const features = [
    {
      title: 'Technical Analysis',
      description: 'AI-powered technical analysis using multiple indicators and patterns',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      status: 'Coming Soon',
    },
    {
      title: 'Volume Analysis',
      description: 'Detect unusual volume patterns and institutional activity',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      status: 'Coming Soon',
    },
    {
      title: 'Price Action',
      description: 'Identify key support/resistance levels and price patterns',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      ),
      status: 'Coming Soon',
    },
    {
      title: 'Momentum Indicators',
      description: 'RSI, MACD, Stochastic and other momentum signals',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      status: 'Coming Soon',
    },
    {
      title: 'Trend Analysis',
      description: 'Multi-timeframe trend detection and following systems',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      status: 'Coming Soon',
    },
    {
      title: 'Custom Strategies',
      description: 'Create and backtest your own trading strategies',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      status: 'Coming Soon',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Trading Signals</h1>
          <p className="text-slate-400 mt-1">AI-powered trading signals and analysis</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="info">AI Powered</Badge>
          <Badge variant="success">Real-time</Badge>
        </div>
      </div>

      {/* Signal Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {features.map((feature, index) => (
          <Card key={index} padding="md">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">
                {feature.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-slate-200">{feature.title}</h3>
                  <Badge variant="default">{feature.status}</Badge>
                </div>
                <p className="text-sm text-slate-400">{feature.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Signals */}
      <Card>
        <CardHeader
          title="Recent Signals"
          subtitle="Latest trading opportunities"
        />
        <div className="min-h-[250px] flex items-center justify-center bg-slate-900/50 rounded-lg border border-slate-700/50">
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <h3 className="text-lg font-medium text-slate-300 mb-2">Signals Engine Coming Soon</h3>
            <p className="text-slate-500 max-w-md">
              Our AI-powered signal engine will analyze market data, detect patterns, 
              and generate actionable trading signals with entry, exit, and stop-loss recommendations.
            </p>
          </div>
        </div>
      </Card>

      {/* Signal Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card padding="sm">
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-100">--</div>
            <div className="text-sm text-slate-400 mt-1">Total Signals</div>
          </div>
        </Card>
        <Card padding="sm">
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-400">--%</div>
            <div className="text-sm text-slate-400 mt-1">Win Rate</div>
          </div>
        </Card>
        <Card padding="sm">
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-100">--</div>
            <div className="text-sm text-slate-400 mt-1">Avg. P&L</div>
          </div>
        </Card>
      </div>
    </div>
  );
}