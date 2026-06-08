'use client';

import { useState } from 'react';
import { cn } from '@/utils';
import { Select, Badge } from '@/components/ui';
import { DEFAULT_SYMBOLS } from '@/constants';

interface HeaderProps {
  title?: string;
  onMenuClick?: () => void;
}

export function Header({ title, onMenuClick }: HeaderProps) {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useState(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  });

  const symbolOptions = DEFAULT_SYMBOLS.map((s) => ({
    value: s,
    label: s.replace('USDT', '/USDT'),
  }));

  return (
    <header className="h-16 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between px-4 lg:px-6">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-400 hover:text-slate-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Page Title */}
        {title && (
          <h1 className="text-lg font-semibold text-slate-100 hidden sm:block">
            {title}
          </h1>
        )}
      </div>

      {/* Center Section - Symbol Selector */}
      <div className="flex items-center gap-3">
        <Select
          value={selectedSymbol}
          onChange={(e) => setSelectedSymbol(e.target.value)}
          options={symbolOptions}
          className="w-40 bg-slate-800 border-slate-700 text-slate-100"
        />
        <Badge variant="success" className="hidden sm:flex">
          Live
        </Badge>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Time */}
        <div className="hidden md:flex items-center gap-2 text-sm text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            {currentTime.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </span>
        </div>

        {/* Connection Status */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full" />
          <span className="text-xs text-slate-400 hidden sm:block">Connected</span>
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-slate-400 hover:text-slate-200">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Profile */}
        <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-white">T</span>
          </div>
        </button>
      </div>
    </header>
  );
}