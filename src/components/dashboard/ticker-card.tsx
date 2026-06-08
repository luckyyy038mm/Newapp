'use client';

import { cn, formatPrice, formatPercent, formatVolume } from '@/utils';
import { Card, Badge } from '@/components/ui';
import type { Ticker } from '@/types';

interface TickerCardProps {
  ticker: Ticker;
  onClick?: () => void;
  isSelected?: boolean;
}

export function TickerCard({ ticker, onClick, isSelected }: TickerCardProps) {
  const isPositive = ticker.priceChangePercent >= 0;
  const baseAsset = ticker.symbol.replace('USDT', '');

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:border-slate-600',
        isSelected && 'border-blue-500 bg-blue-500/5'
      )}
      padding="sm"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">
              {baseAsset.slice(0, 2)}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-slate-100">{baseAsset}</h3>
            <p className="text-xs text-slate-400">USDT</p>
          </div>
        </div>
        <Badge variant={isPositive ? 'success' : 'danger'}>
          {formatPercent(ticker.priceChangePercent)}
        </Badge>
      </div>

      <div className="space-y-1">
        <div className="text-xl font-bold text-slate-100">
          ${formatPrice(ticker.price)}
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">
            24h Change: {isPositive ? '+' : ''}{formatPrice(ticker.priceChange)}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">
            Vol: {formatVolume(ticker.quoteVolume24h)}
          </span>
        </div>
      </div>
    </Card>
  );
}

interface TickerRowProps {
  ticker: Ticker;
  onClick?: () => void;
  isSelected?: boolean;
}

export function TickerRow({ ticker, onClick, isSelected }: TickerRowProps) {
  const isPositive = ticker.priceChangePercent >= 0;
  const baseAsset = ticker.symbol.replace('USDT', '');

  return (
    <div
      className={cn(
        'flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors',
        'hover:bg-slate-800/50',
        isSelected && 'bg-blue-500/10 border border-blue-500/30'
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-xs font-bold text-white">
            {baseAsset.slice(0, 2)}
          </span>
        </div>
        <div>
          <div className="font-medium text-slate-100">{baseAsset}</div>
          <div className="text-xs text-slate-400">24h Vol: {formatVolume(ticker.quoteVolume24h)}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-medium text-slate-100">${formatPrice(ticker.price)}</div>
        <div className={cn('text-sm', isPositive ? 'text-emerald-400' : 'text-red-400')}>
          {formatPercent(ticker.priceChangePercent)}
        </div>
      </div>
    </div>
  );
}