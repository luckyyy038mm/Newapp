import { Candle, TimeRange, PriceRange, Point, Timeframe, TIMEFRAME_MS } from '@/types';
import { ChartConfig, ChartDimensions, ChartCoordinateSystem, ViewState, CandleData } from './types';

export class ChartEngine {
  private candles: Candle[] = [];
  private config: ChartConfig;
  private zoom: number = 1;
  private panOffset: Point = { x: 0, y: 0 };
  private visibleTimeRange: TimeRange = { start: 0, end: 0 };
  private visiblePriceRange: PriceRange = { min: 0, max: 0 };
  private crosshairPosition: Point | null = null;
  private hoveredCandleIndex: number | null = null;
  private timeframe: Timeframe = '1h';

  constructor(config: Partial<ChartConfig> = {}) {
    this.config = {
      width: 1200,
      height: 800,
      padding: { top: 20, right: 80, bottom: 60, left: 10 },
      gridColor: '#1f2937',
      backgroundColor: '#0a0e17',
      candleWidth: 8,
      candleSpacing: 2,
      minCandleWidth: 2,
      maxCandleWidth: 40,
      ...config,
    };
  }

  getConfig(): ChartConfig {
    return { ...this.config };
  }

  setConfig(config: Partial<ChartConfig>): void {
    this.config = { ...this.config, ...config };
    this.updateVisibleRanges();
  }

  getDimensions(): ChartDimensions {
    const { width, height, padding } = this.config;
    const timeScaleHeight = 30;
    const volumePaneRatio = 0.2;
    
    const chartHeight = height - padding.top - padding.bottom - timeScaleHeight;
    const volumePaneHeight = chartHeight * volumePaneRatio;
    const indicatorPaneHeight = 0; // For future use
    
    return {
      chartWidth: width - padding.left - padding.right,
      chartHeight: height - padding.top - padding.bottom,
      priceScaleWidth: padding.right,
      timeScaleHeight,
      volumePaneHeight,
      indicatorPaneHeight,
    };
  }

  getCoordinateSystem(): ChartCoordinateSystem {
    const dims = this.getDimensions();
    const { padding } = this.config;
    
    const priceToY = (price: number): number => {
      const { min, max } = this.visiblePriceRange;
      const chartTop = padding.top;
      const chartBottom = padding.top + dims.chartHeight - dims.volumePaneHeight - dims.timeScaleHeight;
      const range = max - min;
      if (range === 0) return chartTop;
      return chartBottom - ((price - min) / range) * (chartBottom - chartTop);
    };

    const yToPrice = (y: number): number => {
      const { min, max } = this.visiblePriceRange;
      const chartTop = padding.top;
      const chartBottom = padding.top + dims.chartHeight - dims.volumePaneHeight - dims.timeScaleHeight;
      const range = max - min;
      return max - ((y - chartTop) / (chartBottom - chartTop)) * range;
    };

    const timeToX = (time: number): number => {
      const { start, end } = this.visibleTimeRange;
      const range = end - start;
      if (range === 0) return padding.left;
      return padding.left + ((time - start) / range) * dims.chartWidth;
    };

    const xToTime = (x: number): number => {
      const { start, end } = this.visibleTimeRange;
      const range = end - start;
      return start + ((x - padding.left) / dims.chartWidth) * range;
    };

    return {
      priceToY,
      yToPrice,
      timeToX,
      xToTime,
      getVisibleTimeRange: () => ({ ...this.visibleTimeRange }),
      getVisiblePriceRange: () => ({ ...this.visiblePriceRange }),
    };
  }

  getEffectiveCandleWidth(): number {
    const baseWidth = this.config.candleWidth * this.zoom;
    return Math.max(this.config.minCandleWidth, Math.min(this.config.maxCandleWidth, baseWidth));
  }

  getViewState(): ViewState {
    const dims = this.getDimensions();
    const candleWidth = this.getEffectiveCandleWidth();
    const totalCandleWidth = candleWidth + this.config.candleSpacing;
    
    const firstVisibleIndex = Math.floor(Math.max(0, -this.panOffset.x / totalCandleWidth));
    const lastVisibleIndex = Math.min(
      this.candles.length - 1,
      Math.ceil(firstVisibleIndex + dims.chartWidth / totalCandleWidth) + 1
    );
    
    const visibleCandles = this.candles.slice(firstVisibleIndex, lastVisibleIndex + 1);
    
    // Calculate visible time range
    if (visibleCandles.length > 0) {
      this.visibleTimeRange = {
        start: visibleCandles[0].time,
        end: visibleCandles[visibleCandles.length - 1].time + TIMEFRAME_MS[this.timeframe],
      };
    }
    
    return {
      visibleCandles,
      firstVisibleIndex,
      lastVisibleIndex,
      candleWidth,
      timeRange: { ...this.visibleTimeRange },
      priceRange: { ...this.visiblePriceRange },
    };
  }

  getCandleData(index: number): CandleData | null {
    if (index < 0 || index >= this.candles.length) return null;
    
    const candle = this.candles[index];
    const viewState = this.getViewState();
    const coords = this.getCoordinateSystem();
    
    const x = coords.timeToX(candle.time) + this.panOffset.x;
    const candleWidth = viewState.candleWidth;
    
    const isUp = candle.close >= candle.open;
    const openY = coords.priceToY(candle.open);
    const highY = coords.priceToY(candle.high);
    const lowY = coords.priceToY(candle.low);
    const closeY = coords.priceToY(candle.close);
    
    return {
      x,
      y: Math.min(openY, closeY),
      width: candleWidth,
      openY,
      highY,
      lowY,
      closeY,
      isUp,
      candle,
    };
  }

  setCandles(candles: Candle[]): void {
    this.candles = candles;
    this.updateVisibleRanges();
  }

  addCandle(candle: Candle): void {
    if (this.candles.length === 0) {
      this.candles.push(candle);
    } else {
      const lastCandle = this.candles[this.candles.length - 1];
      if (candle.time === lastCandle.time) {
        this.candles[this.candles.length - 1] = candle;
      } else if (candle.time > lastCandle.time) {
        this.candles.push(candle);
      }
    }
    this.updateVisibleRanges();
  }

  updateLastCandle(candle: Candle): void {
    if (this.candles.length > 0 && candle.time === this.candles[this.candles.length - 1].time) {
      this.candles[this.candles.length - 1] = candle;
    }
  }

  getCandles(): Candle[] {
    return [...this.candles];
  }

  setTimeframe(timeframe: Timeframe): void {
    this.timeframe = timeframe;
    this.updateVisibleRanges();
  }

  getTimeframe(): Timeframe {
    return this.timeframe;
  }

  private updateVisibleRanges(): void {
    if (this.candles.length === 0) {
      this.visiblePriceRange = { min: 0, max: 100 };
      return;
    }

    // Find visible candles based on current pan offset
    const viewState = this.getViewState();
    const visibleCandles = viewState.visibleCandles;

    if (visibleCandles.length === 0) {
      this.visiblePriceRange = { min: 0, max: 100 };
      return;
    }

    // Calculate price range with padding
    let minPrice = Infinity;
    let maxPrice = -Infinity;

    for (const candle of visibleCandles) {
      minPrice = Math.min(minPrice, candle.low);
      maxPrice = Math.max(maxPrice, candle.high);
    }

    const padding = (maxPrice - minPrice) * 0.1;
    this.visiblePriceRange = {
      min: minPrice - padding,
      max: maxPrice + padding,
    };
  }

  setZoom(zoom: number): void {
    this.zoom = Math.max(0.1, Math.min(10, zoom));
    this.updateVisibleRanges();
  }

  getZoom(): number {
    return this.zoom;
  }

  zoomIn(): void {
    this.setZoom(this.zoom * 1.2);
  }

  zoomOut(): void {
    this.setZoom(this.zoom / 1.2);
  }

  setPan(offset: Point): void {
    this.panOffset = { ...offset };
    this.updateVisibleRanges();
  }

  pan(deltaX: number, deltaY: number): void {
    this.panOffset = {
      x: this.panOffset.x + deltaX,
      y: this.panOffset.y + deltaY,
    };
    this.updateVisibleRanges();
  }

  getPan(): Point {
    return { ...this.panOffset };
  }

  resetPan(): void {
    this.panOffset = { x: 0, y: 0 };
    this.updateVisibleRanges();
  }

  setCrosshair(point: Point | null): void {
    this.crosshairPosition = point;
  }

  getCrosshair(): Point | null {
    return this.crosshairPosition ? { ...this.crosshairPosition } : null;
  }

  hitTest(x: number, y: number): { type: 'candle' | 'drawing' | 'empty'; index?: number; data?: Candle } {
    const viewState = this.getViewState();
    const totalCandleWidth = viewState.candleWidth + this.config.candleSpacing;
    
    // Check if clicking on a candle
    for (let i = viewState.firstVisibleIndex; i <= viewState.lastVisibleIndex; i++) {
      const candleData = this.getCandleData(i);
      if (!candleData) continue;

      const candleLeft = candleData.x - this.config.candleSpacing / 2;
      const candleRight = candleLeft + totalCandleWidth;

      if (x >= candleLeft && x <= candleRight) {
        this.hoveredCandleIndex = i;
        return { type: 'candle', index: i, data: this.candles[i] };
      }
    }

    this.hoveredCandleIndex = null;
    return { type: 'empty' };
  }

  getHoveredCandleIndex(): number | null {
    return this.hoveredCandleIndex;
  }

  setHoveredCandleIndex(index: number | null): void {
    this.hoveredCandleIndex = index;
  }

  getPriceAtY(y: number): number {
    const coords = this.getCoordinateSystem();
    return coords.yToPrice(y);
  }

  getTimeAtX(x: number): number {
    const coords = this.getCoordinateSystem();
    return coords.xToTime(x);
  }

  centerOnCandle(index: number): void {
    if (index < 0 || index >= this.candles.length) return;

    const dims = this.getDimensions();
    const candleWidth = this.getEffectiveCandleWidth();
    const totalCandleWidth = candleWidth + this.config.candleSpacing;

    const candleX = index * totalCandleWidth + candleWidth / 2;
    const centerX = dims.chartWidth / 2;

    this.panOffset.x = centerX - candleX;
    this.updateVisibleRanges();
  }

  scrollToLatest(): void {
    if (this.candles.length === 0) return;
    this.centerOnCandle(this.candles.length - 1);
  }

  resize(width: number, height: number): void {
    this.config.width = width;
    this.config.height = height;
    this.updateVisibleRanges();
  }
}
