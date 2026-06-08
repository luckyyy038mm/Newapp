'use client';

import { Card, CardHeader } from '@/components/ui';
import { formatPrice, formatVolume } from '@/utils';
import type { Ticker } from '@/types';

interface StatsGridProps {
  ticker: Ticker | null;
  loading?: boolean;
}

export function StatsGrid({ ticker, loading }: StatsGridProps) {
  const stats = [
    { label: '24h High', value: ticker ? formatPrice(ticker.high24h) : '--', color: 'text-emerald-400' },
    { label: '24h Low', value: ticker ? formatPrice(ticker.low24h) : '--', color: 'text-red-400' },
    { label: '24h Volume', value: ticker ? formatVolume(ticker.quoteVolume24h) : '--', prefix: '$', color: 'text-slate-300' },
    { label: 'Base Volume', value: ticker ? formatVolume(ticker.volume24h) : '--', color: 'text-slate-300' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} padding="sm">
          <div className="text-sm text-slate-400 mb-1">{stat.label}</div>
          <div className={`text-lg font-semibold ${stat.color}`}>
            {stat.prefix && <span className="text-slate-400 mr-0.5">{stat.prefix}</span>}
            {stat.value}
          </div>
        </Card>
      ))}
    </div>
  );
}

interface QuickStatsProps {
  title: string;
  value: string;
  subvalue?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
}

export function QuickStats({ title, value, subvalue, trend, icon }: QuickStatsProps) {
  const trendColors = {
    up: 'text-emerald-400',
    down: 'text-red-400',
    neutral: 'text-slate-400',
  };

  return (
    <Card padding="sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-slate-400 mb-1">{title}</div>
          <div className={`text-xl font-bold ${trend ? trendColors[trend] : 'text-slate-100'}`}>
            {value}
          </div>
          {subvalue && (
            <div className="text-sm text-slate-500 mt-1">{subvalue}</div>
          )}
        </div>
        {icon && (
          <div className="text-slate-400">{icon}</div>
        )}
      </div>
    </Card>
  );
}