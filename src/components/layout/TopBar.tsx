'use client';

import React, { useState, useCallback } from 'react';
import { chartStore, chartActions } from '@/store/chartStore';
import { Timeframe, TIMEFRAME_LABELS, DrawingType } from '@/types';

const TIMEFRAMES: Timeframe[] = ['1m', '3m', '5m', '15m', '30m', '1h', '4h', '1d'];

const DRAWING_TOOLS: Array<{ id: DrawingType; name: string; icon: string }> = [
  { id: 'trendline', name: 'Trend Line', icon: '/' },
  { id: 'horizontal_line', name: 'Horizontal Line', icon: '—' },
  { id: 'vertical_line', name: 'Vertical Line', icon: '|' },
  { id: 'rectangle', name: 'Rectangle', icon: '□' },
  { id: 'fibonacci', name: 'Fibonacci', icon: 'F' },
  { id: 'text', name: 'Text', icon: 'T' },
  { id: 'arrow', name: 'Arrow', icon: '→' },
];

const INDICATOR_PRESETS = [
  { id: 'ema20', name: 'EMA 20', color: '#10b981' },
  { id: 'ema50', name: 'EMA 50', color: '#3b82f6' },
  { id: 'vwap', name: 'VWAP', color: '#8b5cf6' },
];

export default function TopBar() {
  const state = chartStore.getState();
  const [showSymbolSearch, setShowSymbolSearch] = useState(false);
  const [showIndicatorMenu, setShowIndicatorMenu] = useState(false);
  const [showDrawingMenu, setShowDrawingMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSymbolChange = useCallback((symbol: string) => {
    chartActions.setSymbol(symbol);
    setShowSymbolSearch(false);
    setSearchQuery('');
  }, []);

  const handleTimeframeChange = useCallback((tf: Timeframe) => {
    chartActions.setTimeframe(tf);
  }, []);

  const handleDrawingSelect = useCallback((tool: DrawingType | null) => {
    chartActions.setActiveTool(tool);
    setShowDrawingMenu(false);
  }, []);

  const handleIndicatorToggle = useCallback((id: string) => {
    chartActions.toggleIndicator(id);
  }, []);

  const handleFullscreen = useCallback(() => {
    chartActions.toggleFullscreen();
  }, []);

  return (
    <div
      className="topbar"
      style={{
        height: 48,
        backgroundColor: '#111827',
        borderBottom: '1px solid #1f2937',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        gap: 8,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 12,
      }}
    >
      {/* Logo / Brand */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          paddingRight: 16,
          borderRight: '1px solid #1f2937',
          marginRight: 4,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 14,
            color: '#fff',
          }}
        >
          T
        </div>
        <span style={{ color: '#f3f4f6', fontWeight: 600, fontSize: 14 }}>
          Terminal
        </span>
      </div>

      {/* Symbol Selector */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowSymbolSearch(!showSymbolSearch)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            backgroundColor: '#1f2937',
            border: 'none',
            borderRadius: 6,
            color: '#f3f4f6',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          {state.symbol}
          <span style={{ fontSize: 10, color: '#9ca3af' }}>▾</span>
        </button>

        {showSymbolSearch && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: 4,
              width: 240,
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: 8,
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
              zIndex: 100,
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: 8 }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search symbol..."
                autoFocus
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: '#0f172a',
                  border: '1px solid #374151',
                  borderRadius: 6,
                  color: '#f3f4f6',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
            </div>
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 'DOGEUSDT', 'ADAUSDT']
                .filter((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((symbol) => (
                  <button
                    key={symbol}
                    onClick={() => handleSymbolChange(symbol)}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '10px 16px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#f3f4f6',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: 13,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#374151')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {symbol}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Current Price */}
      {state.currentTicker && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '0 12px',
            borderLeft: '1px solid #1f2937',
          }}
        >
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: state.currentTicker.priceChange >= 0 ? '#10b981' : '#ef4444',
            }}
          >
            {state.currentTicker.lastPrice.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
          <span
            style={{
              fontSize: 12,
              color: state.currentTicker.priceChangePercent >= 0 ? '#10b981' : '#ef4444',
            }}
          >
            {state.currentTicker.priceChangePercent >= 0 ? '+' : ''}
            {state.currentTicker.priceChangePercent.toFixed(2)}%
          </span>
        </div>
      )}

      {/* Timeframe Selector */}
      <div
        style={{
          display: 'flex',
          gap: 2,
          padding: '0 12px',
          borderLeft: '1px solid #1f2937',
        }}
      >
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf}
            onClick={() => handleTimeframeChange(tf)}
            style={{
              padding: '6px 10px',
              backgroundColor: state.timeframe === tf ? '#6366f1' : 'transparent',
              border: 'none',
              borderRadius: 4,
              color: state.timeframe === tf ? '#fff' : '#9ca3af',
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: state.timeframe === tf ? 600 : 400,
              transition: 'all 0.15s ease',
            }}
          >
            {TIMEFRAME_LABELS[tf]}
          </button>
        ))}
      </div>

      {/* Indicator Button */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => {
            setShowIndicatorMenu(!showIndicatorMenu);
            setShowDrawingMenu(false);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            backgroundColor: state.indicators.some((i) => i.visible) ? '#6366f1' : '#1f2937',
            border: 'none',
            borderRadius: 6,
            color: state.indicators.some((i) => i.visible) ? '#fff' : '#9ca3af',
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          <span style={{ fontSize: 14 }}>∑</span>
          Indicators
        </button>

        {showIndicatorMenu && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: 4,
              width: 200,
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: 8,
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
              zIndex: 100,
              padding: 8,
            }}
          >
            <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 8, textTransform: 'uppercase' }}>
              Active Indicators
            </div>
            {state.indicators.map((indicator) => (
              <label
                key={indicator.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px',
                  cursor: 'pointer',
                  borderRadius: 4,
                }}
              >
                <input
                  type="checkbox"
                  checked={indicator.visible}
                  onChange={() => handleIndicatorToggle(indicator.id)}
                  style={{ accentColor: '#6366f1' }}
                />
                <span
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 2,
                    backgroundColor: indicator.color,
                  }}
                />
                <span style={{ color: '#f3f4f6', fontSize: 12 }}>
                  {indicator.type.toUpperCase()} {indicator.params.period || ''}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Drawing Tools */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => {
            setShowDrawingMenu(!showDrawingMenu);
            setShowIndicatorMenu(false);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            backgroundColor: state.activeTool ? '#6366f1' : '#1f2937',
            border: 'none',
            borderRadius: 6,
            color: state.activeTool ? '#fff' : '#9ca3af',
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          <span style={{ fontSize: 14 }}>✏</span>
          {state.activeTool ? 'Drawing' : 'Draw'}
        </button>

        {showDrawingMenu && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: 4,
              width: 180,
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: 8,
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
              zIndex: 100,
              padding: 8,
            }}
          >
            <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 8, textTransform: 'uppercase' }}>
              Drawing Tools
            </div>
            <button
              onClick={() => handleDrawingSelect(null)}
              style={{
                display: 'block',
                width: '100%',
                padding: '8px',
                backgroundColor: !state.activeTool ? '#374151' : 'transparent',
                border: 'none',
                borderRadius: 4,
                color: '#f3f4f6',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: 12,
                marginBottom: 4,
              }}
            >
              Crosshair (Escape)
            </button>
            {DRAWING_TOOLS.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleDrawingSelect(tool.id)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px',
                  backgroundColor: state.activeTool === tool.id ? '#374151' : 'transparent',
                  border: 'none',
                  borderRadius: 4,
                  color: '#f3f4f6',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                <span style={{ marginRight: 8 }}>{tool.icon}</span>
                {tool.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Right side controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Clear Drawings */}
        <button
          onClick={() => {
            state.drawings.forEach((d) => chartActions.deleteDrawing(d.id));
          }}
          style={{
            padding: '6px 12px',
            backgroundColor: 'transparent',
            border: '1px solid #374151',
            borderRadius: 6,
            color: '#9ca3af',
            cursor: 'pointer',
            fontSize: 11,
          }}
        >
          Clear All
        </button>

        {/* Fullscreen */}
        <button
          onClick={handleFullscreen}
          style={{
            padding: '6px 10px',
            backgroundColor: 'transparent',
            border: '1px solid #374151',
            borderRadius: 6,
            color: '#9ca3af',
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          {state.isFullscreen ? '⤓' : '⤢'}
        </button>
      </div>
    </div>
  );
}
