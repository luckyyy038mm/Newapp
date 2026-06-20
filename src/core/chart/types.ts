import { Candle, TimeRange, PriceRange, Point, Timeframe, Drawing, IndicatorConfig } from '@/types';

export interface ChartConfig {
  width: number;
  height: number;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  gridColor: string;
  backgroundColor: string;
  candleWidth: number;
  candleSpacing: number;
  minCandleWidth: number;
  maxCandleWidth: number;
}

export interface ChartDimensions {
  chartWidth: number;
  chartHeight: number;
  priceScaleWidth: number;
  timeScaleHeight: number;
  volumePaneHeight: number;
  indicatorPaneHeight: number;
}

export interface ChartCoordinateSystem {
  priceToY: (price: number) => number;
  yToPrice: (y: number) => number;
  timeToX: (time: number) => number;
  xToTime: (x: number) => number;
  getVisibleTimeRange: () => TimeRange;
  getVisiblePriceRange: () => PriceRange;
}

export interface CandleData {
  x: number;
  y: number;
  width: number;
  openY: number;
  highY: number;
  lowY: number;
  closeY: number;
  isUp: boolean;
  candle: Candle;
}

export interface HitTestResult {
  type: 'candle' | 'drawing' | 'indicator' | 'grid' | 'empty';
  data?: Candle | Drawing | IndicatorConfig;
  index?: number;
}

export interface ZoomPanState {
  zoom: number;
  panOffset: Point;
  minZoom: number;
  maxZoom: number;
}

export interface ViewState {
  visibleCandles: Candle[];
  firstVisibleIndex: number;
  lastVisibleIndex: number;
  candleWidth: number;
  timeRange: TimeRange;
  priceRange: PriceRange;
}

export interface ChartCallbacks {
  onCrosshairMove?: (point: Point | null, price: number | null, time: number | null) => void;
  onCandleClick?: (candle: Candle, index: number) => void;
  onCandleHover?: (candle: Candle | null, index: number | null) => void;
  onDrawingSelect?: (drawing: Drawing | null) => void;
  onZoom?: (zoom: number) => void;
  onPan?: (offset: Point) => void;
  onTimeframeChange?: (timeframe: Timeframe) => void;
}
