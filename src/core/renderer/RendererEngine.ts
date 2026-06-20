import { Candle, Drawing, ThemeColors, DARK_THEME, TIMEFRAME_MS, Timeframe } from '@/types';
import { ChartEngine } from '../chart/ChartEngine';
import { CandleData } from '../chart/types';

export type RenderLayer = 'background' | 'grid' | 'volume' | 'candles' | 'indicators' | 'drawings' | 'crosshair' | 'overlay';

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  theme: ThemeColors;
  devicePixelRatio: number;
}

export class RendererEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private offscreenCanvas: HTMLCanvasElement;
  private offscreenCtx: CanvasRenderingContext2D;
  private chartEngine: ChartEngine;
  private theme: ThemeColors;
  private devicePixelRatio: number = 1;
  private animationFrameId: number | null = null;
  private isDirty: boolean = true;
  private candleDataMap: Map<number, CandleData> = new Map();
  
  // Layer visibility
  private layerVisibility: Record<RenderLayer, boolean> = {
    background: true,
    grid: true,
    volume: true,
    candles: true,
    indicators: true,
    drawings: true,
    crosshair: true,
    overlay: true,
  };

  // Indicator data
  private indicatorData: Map<string, Array<{ time: number; value: number }>> = new Map();
  private indicatorColors: Map<string, string> = new Map();
  
  // Drawing data
  private drawings: Drawing[] = [];
  
  // Volume data
  private showVolume: boolean = true;
  
  // Crosshair
  private crosshairPosition: { x: number; y: number } | null = null;
  private crosshairPrice: number | null = null;
  private crosshairTime: number | null = null;

  // Selection
  private selectedDrawingId: string | null = null;
  private hoveredCandleIndex: number | null = null;

  constructor(canvas: HTMLCanvasElement, chartEngine: ChartEngine, theme: ThemeColors = DARK_THEME) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false })!;
    this.chartEngine = chartEngine;
    this.theme = theme;
    
    // Create offscreen canvas for double buffering
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCtx = this.offscreenCanvas.getContext('2d', { alpha: false })!;
    
    this.setupCanvas();
    this.startRenderLoop();
  }

  private setupCanvas(): void {
    this.devicePixelRatio = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    
    // Set minimum dimensions if canvas is too small
    const width = Math.max(rect.width, 100);
    const height = Math.max(rect.height, 100);
    
    this.canvas.width = width * this.devicePixelRatio;
    this.canvas.height = height * this.devicePixelRatio;
    
    this.offscreenCanvas.width = this.canvas.width;
    this.offscreenCanvas.height = this.canvas.height;
    
    this.ctx.scale(this.devicePixelRatio, this.devicePixelRatio);
    this.offscreenCtx.scale(this.devicePixelRatio, this.devicePixelRatio);
    
    this.chartEngine.resize(width, height);
    
    // Force immediate render after setup
    this.markDirty();
  }

  resize(): void {
    this.setupCanvas();
    this.markDirty();
  }

  setTheme(theme: ThemeColors): void {
    this.theme = theme;
    this.markDirty();
  }

  setDrawings(drawings: Drawing[]): void {
    this.drawings = drawings;
    this.markDirty();
  }

  setIndicatorData(id: string, data: Array<{ time: number; value: number }>, color: string): void {
    this.indicatorData.set(id, data);
    this.indicatorColors.set(id, color);
    this.markDirty();
  }

  setShowVolume(show: boolean): void {
    this.showVolume = show;
    this.markDirty();
  }

  setCrosshair(x: number | null, y: number | null): void {
    if (x !== null && y !== null) {
      this.crosshairPosition = { x, y };
      this.crosshairPrice = this.chartEngine.getPriceAtY(y);
      this.crosshairTime = this.chartEngine.getTimeAtX(x);
    } else {
      this.crosshairPosition = null;
      this.crosshairPrice = null;
      this.crosshairTime = null;
    }
    this.markDirty();
  }

  setSelectedDrawing(id: string | null): void {
    this.selectedDrawingId = id;
    this.markDirty();
  }

  setHoveredCandleIndex(index: number | null): void {
    this.hoveredCandleIndex = index;
    this.markDirty();
  }

  setLayerVisibility(layer: RenderLayer, visible: boolean): void {
    this.layerVisibility[layer] = visible;
    this.markDirty();
  }

  markDirty(): void {
    this.isDirty = true;
  }

  private startRenderLoop(): void {
    const render = () => {
      if (this.isDirty) {
        this.render();
        this.isDirty = false;
      }
      this.animationFrameId = requestAnimationFrame(render);
    };
    render();
  }

  stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private render(): void {
    const width = this.canvas.width / this.devicePixelRatio;
    const height = this.canvas.height / this.devicePixelRatio;
    
    // Clear offscreen canvas
    this.offscreenCtx.fillStyle = this.theme.background;
    this.offscreenCtx.fillRect(0, 0, width, height);
    
    const renderContext: RenderContext = {
      ctx: this.offscreenCtx,
      width,
      height,
      theme: this.theme,
      devicePixelRatio: this.devicePixelRatio,
    };

    // Render layers in order
    if (this.layerVisibility.background) {
      this.renderBackground(renderContext);
    }
    if (this.layerVisibility.grid) {
      this.renderGrid(renderContext);
    }
    if (this.layerVisibility.volume && this.showVolume) {
      this.renderVolume(renderContext);
    }
    if (this.layerVisibility.candles) {
      this.renderCandles(renderContext);
    }
    if (this.layerVisibility.indicators) {
      this.renderIndicators(renderContext);
    }
    if (this.layerVisibility.drawings) {
      this.renderDrawings(renderContext);
    }
    if (this.layerVisibility.crosshair) {
      this.renderCrosshair(renderContext);
    }
    if (this.layerVisibility.overlay) {
      this.renderOverlay(renderContext);
    }

    // Copy to main canvas
    this.ctx.drawImage(this.offscreenCanvas, 0, 0, width, height, 0, 0, width, height);
  }

  private renderBackground(ctx: RenderContext): void {
    const { width, height } = ctx;
    const config = this.chartEngine.getConfig();
    
    // Main chart area background
    ctx.ctx.fillStyle = this.theme.background;
    ctx.ctx.fillRect(0, 0, width, height);
    
    // Price pane background (slightly different shade)
    const dims = this.chartEngine.getDimensions();
    const pricePaneHeight = dims.chartHeight - dims.volumePaneHeight - dims.timeScaleHeight;
    
    ctx.ctx.fillStyle = '#0d1117';
    ctx.ctx.fillRect(
      config.padding.left,
      config.padding.top,
      dims.chartWidth,
      pricePaneHeight
    );
    
    // Volume pane background
    ctx.ctx.fillStyle = '#0a0e17';
    ctx.ctx.fillRect(
      config.padding.left,
      config.padding.top + pricePaneHeight,
      dims.chartWidth,
      dims.volumePaneHeight
    );
  }

  private renderGrid(ctx: RenderContext): void {
    const { width, height } = ctx;
    const config = this.chartEngine.getConfig();
    const dims = this.chartEngine.getDimensions();
    const coords = this.chartEngine.getCoordinateSystem();
    
    ctx.ctx.strokeStyle = this.theme.grid;
    ctx.ctx.lineWidth = 0.5;
    ctx.ctx.setLineDash([2, 4]);
    
    const priceRange = coords.getVisiblePriceRange();
    const timeRange = coords.getVisibleTimeRange();
    
    // Horizontal grid lines (price levels)
    const priceStep = this.calculatePriceStep(priceRange);
    const startPrice = Math.ceil(priceRange.min / priceStep) * priceStep;
    
    for (let price = startPrice; price <= priceRange.max; price += priceStep) {
      const y = coords.priceToY(price);
      if (y >= config.padding.top && y <= height - config.padding.bottom - dims.timeScaleHeight) {
        ctx.ctx.beginPath();
        ctx.ctx.moveTo(config.padding.left, y);
        ctx.ctx.lineTo(width - config.padding.right, y);
        ctx.ctx.stroke();
      }
    }
    
    // Vertical grid lines (time)
    const timeframe = this.chartEngine.getTimeframe();
    const tfMs = TIMEFRAME_MS[timeframe];
    const timeStep = this.calculateTimeStep(tfMs);
    
    const startTime = Math.ceil(timeRange.start / timeStep) * timeStep;
    
    for (let time = startTime; time <= timeRange.end; time += timeStep) {
      const x = coords.timeToX(time);
      if (x >= config.padding.left && x <= width - config.padding.right) {
        ctx.ctx.beginPath();
        ctx.ctx.moveTo(x, config.padding.top);
        ctx.ctx.lineTo(x, height - config.padding.bottom - dims.timeScaleHeight);
        ctx.ctx.stroke();
      }
    }
    
    ctx.ctx.setLineDash([]);
    
    // Price scale
    this.renderPriceScale(ctx, coords, priceRange, priceStep);
    
    // Time scale
    this.renderTimeScale(ctx, coords, timeRange, timeStep);
  }

  private renderPriceScale(
    ctx: RenderContext,
    coords: ReturnType<typeof this.chartEngine.getCoordinateSystem>,
    priceRange: { min: number; max: number },
    priceStep: number
  ): void {
    const { width, height } = ctx;
    const config = this.chartEngine.getConfig();
    const dims = this.chartEngine.getDimensions();
    
    ctx.ctx.fillStyle = this.theme.textSecondary;
    ctx.ctx.font = '11px JetBrains Mono, monospace';
    ctx.ctx.textAlign = 'left';
    ctx.ctx.textBaseline = 'middle';
    
    const startPrice = Math.ceil(priceRange.min / priceStep) * priceStep;
    
    for (let price = startPrice; price <= priceRange.max; price += priceStep) {
      const y = coords.priceToY(price);
      if (y >= config.padding.top && y <= height - config.padding.bottom - dims.timeScaleHeight) {
        const label = this.formatPrice(price);
        ctx.ctx.fillText(label, width - config.padding.right + 5, y);
      }
    }
  }

  private renderTimeScale(
    ctx: RenderContext,
    coords: ReturnType<typeof this.chartEngine.getCoordinateSystem>,
    timeRange: { start: number; end: number },
    timeStep: number
  ): void {
    const { width, height } = ctx;
    const config = this.chartEngine.getConfig();
    const dims = this.chartEngine.getDimensions();
    const timeframe = this.chartEngine.getTimeframe();
    
    ctx.ctx.fillStyle = this.theme.textSecondary;
    ctx.ctx.font = '11px JetBrains Mono, monospace';
    ctx.ctx.textAlign = 'center';
    ctx.ctx.textBaseline = 'top';
    
    const startTime = Math.ceil(timeRange.start / timeStep) * timeStep;
    const y = height - config.padding.bottom - dims.timeScaleHeight + 5;
    
    for (let time = startTime; time <= timeRange.end; time += timeStep) {
      const x = coords.timeToX(time);
      if (x >= config.padding.left && x <= width - config.padding.right) {
        const label = this.formatTime(time, timeframe);
        ctx.ctx.fillText(label, x, y);
      }
    }
  }

  private renderVolume(ctx: RenderContext): void {
    const viewState = this.chartEngine.getViewState();
    const config = this.chartEngine.getConfig();
    const dims = this.chartEngine.getDimensions();
    const coords = this.chartEngine.getCoordinateSystem();
    
    const volumePaneY = config.padding.top + dims.chartHeight - dims.volumePaneHeight - dims.timeScaleHeight;
    const volumePaneBottom = volumePaneY + dims.volumePaneHeight;
    
    // Find max volume for scaling
    let maxVolume = 0;
    for (const candle of viewState.visibleCandles) {
      maxVolume = Math.max(maxVolume, candle.volume);
    }
    
    const volumeHeight = dims.volumePaneHeight * 0.9;
    
    ctx.ctx.globalAlpha = 0.6;
    
    for (let i = 0; i < viewState.visibleCandles.length; i++) {
      const candle = viewState.visibleCandles[i];
      const candleData = this.chartEngine.getCandleData(viewState.firstVisibleIndex + i);
      if (!candleData) continue;
      
      const barHeight = (candle.volume / maxVolume) * volumeHeight;
      const isUp = candle.close >= candle.open;
      
      ctx.ctx.fillStyle = isUp ? this.theme.volume.up : this.theme.volume.down;
      
      const x = candleData.x;
      ctx.ctx.fillRect(
        x,
        volumePaneBottom - barHeight,
        candleData.width,
        barHeight
      );
    }
    
    ctx.ctx.globalAlpha = 1;
  }

  private renderCandles(ctx: RenderContext): void {
    const viewState = this.chartEngine.getViewState();
    const config = this.chartEngine.getConfig();
    
    // Cache candle data
    this.candleDataMap.clear();
    
    for (let i = 0; i < viewState.visibleCandles.length; i++) {
      const candleData = this.chartEngine.getCandleData(viewState.firstVisibleIndex + i);
      if (candleData) {
        this.candleDataMap.set(viewState.firstVisibleIndex + i, candleData);
        
        const isHovered = this.hoveredCandleIndex === viewState.firstVisibleIndex + i;
        
        // Draw wick
        ctx.ctx.strokeStyle = candleData.isUp ? this.theme.candle.upWick : this.theme.candle.downWick;
        ctx.ctx.lineWidth = 1;
        ctx.ctx.beginPath();
        ctx.ctx.moveTo(candleData.x + candleData.width / 2, candleData.highY);
        ctx.ctx.lineTo(candleData.x + candleData.width / 2, candleData.lowY);
        ctx.ctx.stroke();
        
        // Draw body
        ctx.ctx.fillStyle = candleData.isUp ? this.theme.candle.up : this.theme.candle.down;
        const bodyHeight = Math.max(1, Math.abs(candleData.closeY - candleData.openY));
        const bodyY = Math.min(candleData.openY, candleData.closeY);
        
        // Rounded corners for premium look
        const radius = Math.min(2, candleData.width / 4);
        this.roundRect(
          ctx.ctx,
          candleData.x,
          bodyY,
          candleData.width,
          bodyHeight,
          radius
        );
        ctx.ctx.fill();
        
        // Hover highlight
        if (isHovered) {
          ctx.ctx.strokeStyle = this.theme.crosshair;
          ctx.ctx.lineWidth = 1;
          ctx.ctx.strokeRect(candleData.x - 1, bodyY - 1, candleData.width + 2, bodyHeight + 2);
        }
      }
    }
  }

  private renderIndicators(ctx: RenderContext): void {
    const viewState = this.chartEngine.getViewState();
    const coords = this.chartEngine.getCoordinateSystem();
    
    for (const [id, data] of this.indicatorData) {
      const color = this.indicatorColors.get(id) || '#6366f1';
      
      ctx.ctx.strokeStyle = color;
      ctx.ctx.lineWidth = 1.5;
      ctx.ctx.beginPath();
      
      let started = false;
      
      for (let i = 0; i < data.length; i++) {
        const point = data[i];
        
        // Find if this point is in visible range
        const index = viewState.visibleCandles.findIndex(c => c.time === point.time);
        if (index === -1) continue;
        
        const candleData = this.chartEngine.getCandleData(viewState.firstVisibleIndex + index);
        if (!candleData) continue;
        
        const x = candleData.x + candleData.width / 2;
        const y = coords.priceToY(point.value);
        
        if (!started) {
          ctx.ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.ctx.lineTo(x, y);
        }
      }
      
      ctx.ctx.stroke();
    }
  }

  private renderDrawings(ctx: RenderContext): void {
    const coords = this.chartEngine.getCoordinateSystem();
    
    for (const drawing of this.drawings) {
      if (!drawing.visible) continue;
      
      ctx.ctx.strokeStyle = drawing.color;
      ctx.ctx.lineWidth = drawing.lineWidth;
      ctx.ctx.setLineDash([]);
      
      switch (drawing.type) {
        case 'horizontal_line':
          this.renderHorizontalLine(ctx, drawing);
          break;
        case 'vertical_line':
          this.renderVerticalLine(ctx, drawing);
          break;
        case 'trendline':
          this.renderTrendline(ctx, drawing);
          break;
        case 'rectangle':
          this.renderRectangle(ctx, drawing);
          break;
        case 'fibonacci':
          this.renderFibonacci(ctx, drawing);
          break;
        case 'text':
          this.renderTextDrawing(ctx, drawing);
          break;
        case 'arrow':
          this.renderArrow(ctx, drawing);
          break;
      }
      
      // Selection highlight
      if (drawing.id === this.selectedDrawingId) {
        ctx.ctx.strokeStyle = '#fff';
        ctx.ctx.lineWidth = 1;
        ctx.ctx.setLineDash([4, 4]);
        // Re-render to show selection
      }
    }
  }

  private renderHorizontalLine(ctx: RenderContext, drawing: Drawing & { type: 'horizontal_line' }): void {
    const coords = this.chartEngine.getCoordinateSystem();
    const config = this.chartEngine.getConfig();
    const dims = this.chartEngine.getCoordinateSystem().getVisiblePriceRange();
    
    const y = coords.priceToY(drawing.price);
    
    ctx.ctx.beginPath();
    ctx.ctx.moveTo(config.padding.left, y);
    ctx.ctx.lineTo(ctx.width - config.padding.right, y);
    ctx.ctx.stroke();
    
    // Label
    ctx.ctx.fillStyle = drawing.color;
    ctx.ctx.font = '11px JetBrains Mono, monospace';
    ctx.ctx.textAlign = 'right';
    ctx.ctx.fillText(this.formatPrice(drawing.price), ctx.width - 5, y - 3);
  }

  private renderVerticalLine(ctx: RenderContext, drawing: Drawing & { type: 'vertical_line' }): void {
    const coords = this.chartEngine.getCoordinateSystem();
    const config = this.chartEngine.getConfig();
    
    const x = coords.timeToX(drawing.time);
    
    ctx.ctx.beginPath();
    ctx.ctx.moveTo(x, config.padding.top);
    ctx.ctx.lineTo(x, ctx.height - config.padding.bottom);
    ctx.ctx.stroke();
  }

  private renderTrendline(ctx: RenderContext, drawing: Drawing & { type: 'trendline' }): void {
    const coords = this.chartEngine.getCoordinateSystem();
    const config = this.chartEngine.getConfig();
    
    const x1 = coords.timeToX(drawing.points[0].time);
    const y1 = coords.priceToY(drawing.points[0].price);
    const x2 = coords.timeToX(drawing.points[1].time);
    const y2 = coords.priceToY(drawing.points[1].price);
    
    ctx.ctx.beginPath();
    ctx.ctx.moveTo(x1, y1);
    ctx.ctx.lineTo(x2, y2);
    ctx.ctx.stroke();
    
    // Draw points
    ctx.ctx.fillStyle = drawing.color;
    ctx.ctx.beginPath();
    ctx.ctx.arc(x1, y1, 4, 0, Math.PI * 2);
    ctx.ctx.fill();
    ctx.ctx.beginPath();
    ctx.ctx.arc(x2, y2, 4, 0, Math.PI * 2);
    ctx.ctx.fill();
  }

  private renderRectangle(ctx: RenderContext, drawing: Drawing & { type: 'rectangle' }): void {
    const coords = this.chartEngine.getCoordinateSystem();
    const config = this.chartEngine.getConfig();
    
    const x1 = coords.timeToX(drawing.points[0].time);
    const y1 = coords.priceToY(drawing.points[0].price);
    const x2 = coords.timeToX(drawing.points[1].time);
    const y2 = coords.priceToY(drawing.points[1].price);
    
    const x = Math.min(x1, x2);
    const y = Math.min(y1, y2);
    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);
    
    ctx.ctx.globalAlpha = 0.2;
    ctx.ctx.fillStyle = drawing.color;
    ctx.ctx.fillRect(x, y, width, height);
    ctx.ctx.globalAlpha = 1;
    
    ctx.ctx.strokeStyle = drawing.color;
    ctx.ctx.strokeRect(x, y, width, height);
  }

  private renderFibonacci(ctx: RenderContext, drawing: Drawing & { type: 'fibonacci' }): void {
    const coords = this.chartEngine.getCoordinateSystem();
    const config = this.chartEngine.getConfig();
    
    const x1 = coords.timeToX(drawing.points[0].time);
    const y1 = coords.priceToY(drawing.points[0].price);
    const x2 = coords.timeToX(drawing.points[1].time);
    const y2 = coords.priceToY(drawing.points[1].price);
    
    const startPrice = Math.min(drawing.points[0].price, drawing.points[1].price);
    const endPrice = Math.max(drawing.points[0].price, drawing.points[1].price);
    const range = endPrice - startPrice;
    
    for (const level of drawing.levels) {
      const price = startPrice + range * level;
      const y = coords.priceToY(price);
      
      ctx.ctx.globalAlpha = 0.5;
      ctx.ctx.beginPath();
      ctx.ctx.moveTo(x1, y);
      ctx.ctx.lineTo(x2, y);
      ctx.ctx.stroke();
      ctx.ctx.globalAlpha = 1;
      
      ctx.ctx.fillStyle = drawing.color;
      ctx.ctx.font = '10px JetBrains Mono, monospace';
      ctx.ctx.textAlign = 'left';
      ctx.ctx.fillText(`${(level * 100).toFixed(1)}%`, x2 + 5, y + 3);
    }
  }

  private renderTextDrawing(ctx: RenderContext, drawing: Drawing & { type: 'text' }): void {
    const coords = this.chartEngine.getCoordinateSystem();
    
    const x = coords.timeToX(drawing.point.time);
    const y = coords.priceToY(drawing.point.price);
    
    ctx.ctx.fillStyle = drawing.color;
    ctx.ctx.font = `${drawing.fontSize}px JetBrains Mono, monospace`;
    ctx.ctx.textAlign = 'center';
    ctx.ctx.textBaseline = 'middle';
    ctx.ctx.fillText(drawing.text, x, y);
  }

  private renderArrow(ctx: RenderContext, drawing: Drawing & { type: 'arrow' }): void {
    const coords = this.chartEngine.getCoordinateSystem();
    
    const x1 = coords.timeToX(drawing.points[0].time);
    const y1 = coords.priceToY(drawing.points[0].price);
    const x2 = coords.timeToX(drawing.points[1].time);
    const y2 = coords.priceToY(drawing.points[1].price);
    
    // Draw line
    ctx.ctx.beginPath();
    ctx.ctx.moveTo(x1, y1);
    ctx.ctx.lineTo(x2, y2);
    ctx.ctx.stroke();
    
    // Draw arrowhead
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const headLength = 12;
    
    ctx.ctx.beginPath();
    ctx.ctx.moveTo(x2, y2);
    ctx.ctx.lineTo(
      x2 - headLength * Math.cos(angle - Math.PI / 6),
      y2 - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.ctx.lineTo(
      x2 - headLength * Math.cos(angle + Math.PI / 6),
      y2 - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.ctx.closePath();
    ctx.ctx.fill();
  }

  private renderCrosshair(ctx: RenderContext): void {
    if (!this.crosshairPosition) return;
    
    const { x, y } = this.crosshairPosition;
    const config = this.chartEngine.getConfig();
    const dims = this.chartEngine.getDimensions();
    
    ctx.ctx.strokeStyle = this.theme.crosshair;
    ctx.ctx.lineWidth = 1;
    ctx.ctx.setLineDash([4, 4]);
    
    // Vertical line
    ctx.ctx.beginPath();
    ctx.ctx.moveTo(x, config.padding.top);
    ctx.ctx.lineTo(x, ctx.height - config.padding.bottom);
    ctx.ctx.stroke();
    
    // Horizontal line
    ctx.ctx.beginPath();
    ctx.ctx.moveTo(config.padding.left, y);
    ctx.ctx.lineTo(ctx.width - config.padding.right, y);
    ctx.ctx.stroke();
    
    ctx.ctx.setLineDash([]);
    
    // Price label
    if (this.crosshairPrice !== null) {
      const priceLabel = this.formatPrice(this.crosshairPrice);
      
      ctx.ctx.fillStyle = this.theme.crosshair;
      ctx.ctx.fillRect(
        ctx.width - config.padding.right,
        y - 10,
        config.padding.right,
        20
      );
      
      ctx.ctx.fillStyle = '#fff';
      ctx.ctx.font = '11px JetBrains Mono, monospace';
      ctx.ctx.textAlign = 'left';
      ctx.ctx.textBaseline = 'middle';
      ctx.ctx.fillText(priceLabel, ctx.width - config.padding.right + 5, y);
    }
    
    // Time label
    if (this.crosshairTime !== null && this.hoveredCandleIndex !== null) {
      const candles = this.chartEngine.getCandles();
      if (candles[this.hoveredCandleIndex]) {
        const candle = candles[this.hoveredCandleIndex];
        const timeLabel = this.formatDateTime(candle.time);
        
        ctx.ctx.fillStyle = this.theme.crosshair;
        ctx.ctx.fillRect(
          x - 40,
          ctx.height - config.padding.bottom - dims.timeScaleHeight,
          80,
          20
        );
        
        ctx.ctx.fillStyle = '#fff';
        ctx.ctx.textAlign = 'center';
        ctx.ctx.fillText(timeLabel, x, ctx.height - config.padding.bottom - dims.timeScaleHeight + 10);
      }
    }
  }

  private renderOverlay(ctx: RenderContext): void {
    // This is where future overlay content would go (footprint, etc.)
  }

  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  private calculatePriceStep(priceRange: { min: number; max: number }): number {
    const range = priceRange.max - priceRange.min;
    const targetLines = 8;
    const roughStep = range / targetLines;
    
    const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
    const normalized = roughStep / magnitude;
    
    let niceStep: number;
    if (normalized <= 1) niceStep = 1;
    else if (normalized <= 2) niceStep = 2;
    else if (normalized <= 5) niceStep = 5;
    else niceStep = 10;
    
    return niceStep * magnitude;
  }

  private calculateTimeStep(tfMs: number): number {
    const baseSteps = [1, 2, 5, 10, 15, 30];
    
    for (const step of baseSteps) {
      if (tfMs * step >= 30 * 60 * 1000) { // At least 30 minutes
        return tfMs * step;
      }
    }
    
    return tfMs * 10;
  }

  private formatPrice(price: number): string {
    if (price >= 1000) return price.toFixed(2);
    if (price >= 1) return price.toFixed(4);
    return price.toFixed(6);
  }

  private formatTime(time: number, timeframe: Timeframe): string {
    const date = new Date(time);
    
    switch (timeframe) {
      case '1d':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case '4h':
      case '1h':
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      default:
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
  }

  private formatDateTime(time: number): string {
    const date = new Date(time);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }
}
