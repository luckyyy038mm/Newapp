'use client';

import { Card, CardHeader, Button, Input, Select } from '@/components/ui';
import { useState } from 'react';

export default function SettingsPage() {
  const [theme, setTheme] = useState('dark');
  const [notifications, setNotifications] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(false);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Settings</h1>
        <p className="text-slate-400 mt-1">Configure your trading platform</p>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader
          title="General"
          subtitle="Basic platform settings"
        />
        <div className="space-y-4">
          <Select
            label="Theme"
            options={[
              { value: 'dark', label: 'Dark (Default)' },
              { value: 'light', label: 'Light' },
              { value: 'system', label: 'System' },
            ]}
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          />
          <Select
            label="Default Symbol"
            options={[
              { value: 'BTCUSDT', label: 'BTC/USDT' },
              { value: 'ETHUSDT', label: 'ETH/USDT' },
              { value: 'SOLUSDT', label: 'SOL/USDT' },
            ]}
          />
          <Select
            label="Default Timeframe"
            options={[
              { value: '1m', label: '1 Minute' },
              { value: '5m', label: '5 Minutes' },
              { value: '15m', label: '15 Minutes' },
              { value: '1h', label: '1 Hour' },
              { value: '4h', label: '4 Hours' },
              { value: '1d', label: '1 Day' },
            ]}
          />
        </div>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader
          title="Notifications"
          subtitle="Configure alerts and notifications"
        />
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-slate-200">Push Notifications</div>
              <div className="text-sm text-slate-400">Receive alerts for price changes and signals</div>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                notifications ? 'bg-blue-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  notifications ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-slate-200">Sound Alerts</div>
              <div className="text-sm text-slate-400">Play sounds for important events</div>
            </div>
            <button
              onClick={() => setSoundAlerts(!soundAlerts)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                soundAlerts ? 'bg-blue-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  soundAlerts ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>
          <Input
            label="Email for Alerts"
            type="email"
            placeholder="your@email.com"
          />
        </div>
      </Card>

      {/* Data & API */}
      <Card>
        <CardHeader
          title="Data & API"
          subtitle="Configure data sources and API connections"
        />
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Binance API Key
            </label>
            <Input
              type="password"
              placeholder="Enter your API key"
            />
            <p className="text-xs text-slate-500 mt-1">
              Optional: Add your API key for real-time data
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Data Refresh Rate
            </label>
            <Select
              options={[
                { value: '1000', label: '1 second' },
                { value: '2000', label: '2 seconds' },
                { value: '5000', label: '5 seconds' },
                { value: '10000', label: '10 seconds' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader
          title="Appearance"
          subtitle="Customize the look and feel"
        />
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-800 border-2 border-blue-500 rounded-lg p-3 cursor-pointer">
              <div className="h-8 bg-slate-700 rounded mb-2" />
              <div className="h-2 bg-slate-600 rounded w-3/4" />
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 cursor-pointer hover:border-slate-600">
              <div className="h-8 bg-slate-700 rounded mb-2" />
              <div className="h-2 bg-slate-600 rounded w-3/4" />
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 cursor-pointer hover:border-slate-600">
              <div className="h-8 bg-slate-700 rounded mb-2" />
              <div className="h-2 bg-slate-600 rounded w-3/4" />
            </div>
          </div>
          <Input
            label="Chart Color Primary"
            type="color"
            defaultValue="#3B82F6"
          />
        </div>
      </Card>

      {/* About */}
      <Card>
        <CardHeader
          title="About"
          subtitle="Platform information"
        />
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-slate-400">Version</span>
            <span className="text-slate-200">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Build</span>
            <span className="text-slate-200">2024.01.01</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Stack</span>
            <span className="text-slate-200">Next.js + React + TypeScript</span>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="secondary">Reset to Defaults</Button>
        <Button variant="primary">Save Changes</Button>
      </div>
    </div>
  );
}