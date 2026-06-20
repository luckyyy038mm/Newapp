'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { ChartEngine } from '@/core/chart/ChartEngine';
import { RendererEngine } from '@/core/renderer/RendererEngine';
import { InteractionHandler } from '@/core/interactions/InteractionHandler';
import { IndicatorEngine, INDICATOR_PRESETS } from '@/core/indicators/IndicatorEngine';
import { BinanceMarketDataService, BinanceRESTAPI } from '@/services/binance';
import { chartStore, chartActions } from '@/store/chartStore';
import { Candle, Drawing, IndicatorConfig, Timeframe, IndicatorValue } from '@/types';

interface TradingChartProps {
  symbol?: string;
  timeframe?: Timeframe;
  onCandleHover?: (candle: Candle | null) => void;
}

export default function TradingChart({ 
  symbol: propSymbol, 
  timeframe: propTimeframe,
  onCandleHover 
}: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartEngineRef = useRef<ChartEngine | null>(null);
  const rendererRef = useRef<RendererEngine | null>(null);
  const interactionRef = useRef<InteractionHandler | null>(null);
  const indicatorEngineRef = useRef<IndicatorEngine>(new IndicatorEngine());
  const marketDataRef = useRef<BinanceMarketDataService | null>(null);
  const restApiRef = useRef<BinanceRESTAPI>(new BinanceRESTAPI());
  
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // Get current state from store
  const state = chartStore.getState();
  
  // Use props or store values
  const symbol = propSymbol || state.symbol;
  const timeframe = propTimeframe || state.timeframe;
  
  // Initialize chart engine
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    
    // Create chart engine
    const chartEngine = new ChartEngine({
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
    });
    chartEngineRef.current = chartEngine;
    
    // Create renderer
    const renderer = new RendererEngine(canvasRef.current, chartEngine, state.theme);
    rendererRef.current = renderer;
    
    // Set initial indicators
    state.indicators.forEach(indicator => {
      const values = indicatorEngineRef.current.calculate(indicator.type, state.candles, indicator.params);
      renderer.setIndicatorData(indicator.id, values, indicator.color);
    });
    
    // Create interaction handler
    const interaction = new InteractionHandler(
      canvasRef.current,
      chartEngine,
      renderer,
      {
        onCandleHover: (index) => {
          if (index !== null && chartEngineRef.current) {
            const candles = chartEngineRef.current.getCandles();
            const candle = candles[index];
            setHoveredCandle(candle || null);
            onCandleHover?.(candle || null);
          } else {
            setHoveredCandle(null);
            onCandleHover?.(null);
          }
        },
        onDrawingCreate: (drawing) => {
          chartActions.addDrawing(drawing);
        },
        onZoomChange: (zoom) => {
          // Could store zoom in state
        },
        onPanChange: (offset) => {
          // Could store pan in state
        },
      }
    );
    interactionRef.current = interaction;
    
    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current || !renderer) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      setDimensions({ width: rect.width, height: rect.height });
      
      renderer.resize();
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      interaction.destroy();
      renderer.stop();
    };
  }, []);
  
  // Subscribe to store changes
  useEffect(() => {
    const unsubscribe = chartStore.subscribe(() => {
      const newState = chartStore.getState();
      
      // Update renderer drawings
      if (rendererRef.current) {
        rendererRef.current.setDrawings(newState.drawings);
      }
      
      // Update indicator data
      if (newState.candles.length > 0) {
        newState.indicators.forEach(indicator => {
          if (indicator.visible && rendererRef.current) {
            const values = indicatorEngineRef.current.calculate(
              indicator.type, 
              newState.candles, 
              indicator.params
            );
            rendererRef.current.setIndicatorData(indicator.id, values, indicator.color);
          }
        });
      }
    });
    
    return () => unsubscribe();
  }, []);
  
  // Load historical data when symbol/timeframe changes
  useEffect(() => {
    const loadData = async () => {
      if (!chartEngineRef.current) return;
      
      chartActions.setLoading(true);
      
      try {
        // Try to fetch from Binance API first
        let candles: import('@/types').Candle[] = [];
        try {
          candles = await restApiRef.current.getKlines(symbol, timeframe, 500);
        } catch {
          // Will use mock data
        }
        
        // If API fails or returns empty, use mock data
        if (candles.length === 0) {
          const { generateMockCandles } = await import('@/utils/mockData');
          candles = generateMockCandles(symbol, timeframe, 300);
        }
        
        if (candles.length > 0) {
          chartEngineRef.current.setCandles(candles);
          chartEngineRef.current.setTimeframe(timeframe);
          chartActions.setCandles(candles);
          
          // Get fresh indicators from store
          const currentState = chartStore.getState();
          currentState.indicators.forEach(indicator => {
            const values = indicatorEngineRef.current.calculate(
              indicator.type,
              candles,
              indicator.params
            );
            rendererRef.current?.setIndicatorData(indicator.id, values, indicator.color);
          });
          
          // Scroll to latest
          chartEngineRef.current.scrollToLatest();
          rendererRef.current?.markDirty();
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      }
      
      chartActions.setLoading(false);
    };
    
    loadData();
  }, [symbol, timeframe]);
  
  // Setup WebSocket for live updates
  useEffect(() => {
    // Create market data service
    const marketData = new BinanceMarketDataService({
      onCandle: (candle) => {
        chartActions.addCandle(candle);
        chartEngineRef.current?.addCandle(candle);
        rendererRef.current?.markDirty();
      },
      onCandleUpdate: (candle) => {
        chartActions.updateLastCandle(candle);
        chartEngineRef.current?.updateLastCandle(candle);
        rendererRef.current?.markDirty();
      },
      onTicker: (ticker) => {
        chartActions.setTicker(ticker);
      },
      onConnect: () => {
        chartActions.setConnected(true);
      },
      onDisconnect: () => {
        chartActions.setConnected(false);
      },
    });
    
    marketDataRef.current = marketData;
    marketData.connect();
    marketData.subscribeToKline(symbol, timeframe);
    marketData.subscribeToTicker(symbol);
    
    return () => {
      marketData.unsubscribeFromKline(symbol, timeframe);
      marketData.disconnect();
    };
  }, [symbol, timeframe]);
  
  // Handle indicator toggle
  const toggleIndicator = useCallback((indicatorId: string) => {
    chartActions.toggleIndicator(indicatorId);
    const newState = chartStore.getState();
    const indicator = newState.indicators.find(i => i.id === indicatorId);
    
    if (indicator) {
      if (indicator.visible) {
        // Remove indicator from renderer
        rendererRef.current?.setIndicatorData(indicatorId, [], indicator.color);
      } else {
        // Add indicator to renderer
        const values = indicatorEngineRef.current.calculate(
          indicator.type,
          newState.candles,
          indicator.params
        );
        rendererRef.current?.setIndicatorData(indicatorId, values, indicator.color);
      }
      rendererRef.current?.markDirty();
    }
  }, []);
  
  // Handle drawing tool selection
  const selectDrawingTool = useCallback((toolType: string | null) => {
    if (interactionRef.current) {
      interactionRef.current.setDrawingType(toolType as any);
    }
    chartActions.setActiveTool(toolType);
  }, []);
  
  return (
    <div className="trading-chart" style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      />
      
      {/* Loading overlay */}
      {state.isLoading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(10, 14, 23, 0.8)',
            zIndex: 10,
          }}
        >
          <div className="loading-spinner" />
        </div>
      )}
      
      {/* Hover info tooltip */}
      {hoveredCandle && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            backgroundColor: state.theme.surface,
            border: `1px solid ${state.theme.border}`,
            borderRadius: 6,
            padding: '8px 12px',
            fontSize: 12,
            fontFamily: 'JetBrains Mono, monospace',
            color: state.theme.text,
            zIndex: 5,
            pointerEvents: 'none',
          }}
        >
          <div style={{ marginBottom: 4 }}>
            <span style={{ color: state.theme.textSecondary }}>O: </span>
            <span>{hoveredCandle.open.toFixed(2)}</span>
          </div>
          <div style={{ marginBottom: 4 }}>
            <span style={{ color: state.theme.textSecondary }}>H: </span>
            <span>{hoveredCandle.high.toFixed(2)}</span>
          </div>
          <div style={{ marginBottom: 4 }}>
            <span style={{ color: state.theme.textSecondary }}>L: </span>
            <span>{hoveredCandle.low.toFixed(2)}</span>
          </div>
          <div>
            <span style={{ color: state.theme.textSecondary }}>C: </span>
            <span style={{ color: hoveredCandle.close >= hoveredCandle.open ? '#10b981' : '#ef4444' }}>
              {hoveredCandle.close.toFixed(2)}
            </span>
          </div>
          <div style={{ marginTop: 4 }}>
            <span style={{ color: state.theme.textSecondary }}>V: </span>
            <span>{hoveredCandle.volume.toFixed(2)}</span>
          </div>
        </div>
      )}
      
      {/* Live indicator */}
      {state.isLive && state.isConnected && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: 90,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 8px',
            backgroundColor: state.theme.surface,
            borderRadius: 4,
            fontSize: 11,
            color: '#10b981',
            zIndex: 5,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: '#10b981',
              animation: 'pulse 2s infinite',
            }}
          />
          LIVE
        </div>
      )}
    </div>
  );
}
