import { ChartEngine } from '../chart/ChartEngine';
import { RendererEngine } from '../renderer/RendererEngine';
import { Drawing, DrawingType, DrawingPoint, Point } from '@/types';

export interface InteractionCallbacks {
  onCrosshairMove?: (point: Point | null, price: number | null, time: number | null) => void;
  onCandleHover?: (candleIndex: number | null) => void;
  onDrawingCreate?: (drawing: Drawing) => void;
  onDrawingSelect?: (drawingId: string | null) => void;
  onZoomChange?: (zoom: number) => void;
  onPanChange?: (offset: Point) => void;
}

export type InteractionMode = 'pan' | 'zoom' | 'crosshair' | 'drawing' | 'select';

export class InteractionHandler {
  private chartEngine: ChartEngine;
  private renderer: RendererEngine;
  private canvas: HTMLCanvasElement;
  private callbacks: InteractionCallbacks;
  
  // State
  private mode: InteractionMode = 'crosshair';
  private isDragging: boolean = false;
  private isDrawing: boolean = false;
  private lastMousePos: Point = { x: 0, y: 0 };
  private dragStartPos: Point = { x: 0, y: 0 };
  
  // Drawing state
  private activeDrawingType: DrawingType | null = null;
  private drawingStartPoint: DrawingPoint | null = null;
  private drawingEndPoint: DrawingPoint | null = null;
  private tempDrawing: Partial<Drawing> | null = null;
  
  // Selection state
  private selectedDrawingId: string | null = null;
  private hoveredDrawingId: string | null = null;
  
  // Touch support
  private lastTouchDist: number = 0;
  private lastTouchCenter: Point = { x: 0, y: 0 };
  
  constructor(
    canvas: HTMLCanvasElement,
    chartEngine: ChartEngine,
    renderer: RendererEngine,
    callbacks: InteractionCallbacks = {}
  ) {
    this.canvas = canvas;
    this.chartEngine = chartEngine;
    this.renderer = renderer;
    this.callbacks = callbacks;
    
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Mouse events
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('mouseup', this.handleMouseUp);
    this.canvas.addEventListener('mouseleave', this.handleMouseLeave);
    this.canvas.addEventListener('wheel', this.handleWheel, { passive: false });
    this.canvas.addEventListener('dblclick', this.handleDoubleClick);
    
    // Touch events
    this.canvas.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    this.canvas.addEventListener('touchend', this.handleTouchEnd);
    
    // Context menu
    this.canvas.addEventListener('contextmenu', this.handleContextMenu);
    
    // Prevent default text selection during drag
    this.canvas.addEventListener('selectstart', (e) => {
      if (this.isDragging) e.preventDefault();
    });
  }

  destroy(): void {
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('mouseup', this.handleMouseUp);
    this.canvas.removeEventListener('mouseleave', this.handleMouseLeave);
    this.canvas.removeEventListener('wheel', this.handleWheel);
    this.canvas.removeEventListener('dblclick', this.handleDoubleClick);
    this.canvas.removeEventListener('touchstart', this.handleTouchStart);
    this.canvas.removeEventListener('touchmove', this.handleTouchMove);
    this.canvas.removeEventListener('touchend', this.handleTouchEnd);
    this.canvas.removeEventListener('contextmenu', this.handleContextMenu);
  }

  setMode(mode: InteractionMode): void {
    this.mode = mode;
    if (mode !== 'drawing') {
      this.cancelDrawing();
    }
  }

  getMode(): InteractionMode {
    return this.mode;
  }

  setDrawingType(type: DrawingType | null): void {
    this.activeDrawingType = type;
    if (type) {
      this.mode = 'drawing';
    }
  }

  getDrawingType(): DrawingType | null {
    return this.activeDrawingType;
  }

  setSelectedDrawing(id: string | null): void {
    this.selectedDrawingId = id;
    this.renderer.setSelectedDrawing(id);
  }

  getSelectedDrawing(): string | null {
    return this.selectedDrawingId;
  }

  private handleMouseDown = (e: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    this.lastMousePos = { x, y };
    this.dragStartPos = { x, y };
    
    if (this.mode === 'drawing' && this.activeDrawingType) {
      this.startDrawing(x, y);
    } else if (this.mode === 'pan' || e.button === 1) { // Middle click or pan mode
      this.isDragging = true;
      this.canvas.style.cursor = 'grabbing';
    } else if (this.mode === 'select') {
      // Try to select a drawing at this position
      const drawing = this.hitTestDrawings(x, y);
      this.setSelectedDrawing(drawing?.id || null);
    } else {
      this.isDragging = true;
    }
  };

  private handleMouseMove = (e: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (this.isDragging) {
      if (this.mode === 'pan' || this.isDrawing) {
        const deltaX = x - this.lastMousePos.x;
        const deltaY = y - this.lastMousePos.y;
        this.chartEngine.pan(deltaX, deltaY);
        this.renderer.markDirty();
        
        this.callbacks.onPanChange?.(this.chartEngine.getPan());
      }
    } else {
      // Update crosshair
      this.renderer.setCrosshair(x, y);
      
      // Hit test for candles
      const hit = this.chartEngine.hitTest(x, y);
      if (hit.type === 'candle' && hit.index !== undefined) {
        this.chartEngine.setHoveredCandleIndex(hit.index);
        this.renderer.setHoveredCandleIndex(hit.index);
        this.callbacks.onCandleHover?.(hit.index);
      } else {
        this.chartEngine.setHoveredCandleIndex(null);
        this.renderer.setHoveredCandleIndex(null);
        this.callbacks.onCandleHover?.(null);
      }
      
      // Update drawing preview
      if (this.isDrawing) {
        this.updateDrawing(x, y);
      }
      
      // Test for drawing hover
      if (this.mode === 'select') {
        const drawing = this.hitTestDrawings(x, y);
        this.hoveredDrawingId = drawing?.id || null;
        this.canvas.style.cursor = this.hoveredDrawingId ? 'pointer' : 'crosshair';
      }
    }
    
    this.lastMousePos = { x, y };
  };

  private handleMouseUp = (e: MouseEvent): void => {
    if (this.isDrawing && this.activeDrawingType) {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.finishDrawing(x, y);
    }
    
    this.isDragging = false;
    this.canvas.style.cursor = this.mode === 'pan' ? 'grab' : 'crosshair';
  };

  private handleMouseLeave = (e: MouseEvent): void => {
    this.isDragging = false;
    this.renderer.setCrosshair(null, null);
    this.chartEngine.setHoveredCandleIndex(null);
    this.renderer.setHoveredCandleIndex(null);
    this.callbacks.onCandleHover?.(null);
  };

  private handleWheel = (e: WheelEvent): void => {
    e.preventDefault();
    
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (e.ctrlKey || e.metaKey) {
      // Zoom
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const currentZoom = this.chartEngine.getZoom();
      this.chartEngine.setZoom(currentZoom * zoomFactor);
      this.renderer.markDirty();
      this.callbacks.onZoomChange?.(this.chartEngine.getZoom());
    } else if (e.shiftKey) {
      // Horizontal pan
      this.chartEngine.pan(-e.deltaY, 0);
      this.renderer.markDirty();
      this.callbacks.onPanChange?.(this.chartEngine.getPan());
    } else {
      // Vertical pan
      this.chartEngine.pan(-e.deltaX, -e.deltaY);
      this.renderer.markDirty();
      this.callbacks.onPanChange?.(this.chartEngine.getPan());
    }
  };

  private handleDoubleClick = (e: MouseEvent): void => {
    if (this.selectedDrawingId) {
      // Edit the selected drawing (e.g., edit text)
      // This could open a dialog or inline editor
    }
  };

  private handleTouchStart = (e: TouchEvent): void => {
    e.preventDefault();
    
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      this.lastMousePos = { x, y };
      this.dragStartPos = { x, y };
      
      if (this.mode === 'drawing' && this.activeDrawingType) {
        this.startDrawing(x, y);
      } else {
        this.isDragging = true;
      }
    } else if (e.touches.length === 2) {
      // Pinch zoom start
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      
      this.lastTouchDist = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      this.lastTouchCenter = {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2,
      };
    }
  };

  private handleTouchMove = (e: TouchEvent): void => {
    e.preventDefault();
    
    if (e.touches.length === 1 && this.isDragging) {
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      const deltaX = x - this.lastMousePos.x;
      const deltaY = y - this.lastMousePos.y;
      
      if (this.isDrawing) {
        this.updateDrawing(x, y);
      } else {
        this.chartEngine.pan(deltaX, deltaY);
        this.renderer.markDirty();
      }
      
      this.lastMousePos = { x, y };
    } else if (e.touches.length === 2) {
      // Pinch zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      
      const dist = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      const zoomFactor = dist / this.lastTouchDist;
      const currentZoom = this.chartEngine.getZoom();
      this.chartEngine.setZoom(currentZoom * zoomFactor);
      this.renderer.markDirty();
      
      this.lastTouchDist = dist;
      
      // Also pan based on center movement
      const center = {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2,
      };
      
      const deltaX = center.x - this.lastTouchCenter.x;
      const deltaY = center.y - this.lastTouchCenter.y;
      this.chartEngine.pan(deltaX, deltaY);
      this.renderer.markDirty();
      
      this.lastTouchCenter = center;
    }
  };

  private handleTouchEnd = (e: TouchEvent): void => {
    if (e.touches.length === 0) {
      if (this.isDrawing && this.activeDrawingType) {
        // Finish drawing at last position
        this.finishDrawing(this.lastMousePos.x, this.lastMousePos.y);
      }
      this.isDragging = false;
    }
  };

  private handleContextMenu = (e: MouseEvent): void => {
    e.preventDefault();
    // Could show context menu for drawings, etc.
  };

  private startDrawing(x: number, y: number): void {
    this.isDrawing = true;
    this.canvas.style.cursor = 'crosshair';
    
    const time = this.chartEngine.getTimeAtX(x);
    const price = this.chartEngine.getPriceAtY(y);
    
    this.drawingStartPoint = { time, price };
    this.drawingEndPoint = { time, price };
    
    // Create temp drawing for preview
    this.tempDrawing = this.createDrawingObject(this.activeDrawingType!, time, price, time, price);
  }

  private updateDrawing(x: number, y: number): void {
    if (!this.isDrawing || !this.drawingStartPoint) return;
    
    const time = this.chartEngine.getTimeAtX(x);
    const price = this.chartEngine.getPriceAtY(y);
    
    this.drawingEndPoint = { time, price };
    
    // Update temp drawing
    if (this.tempDrawing) {
      this.tempDrawing = this.updateTempDrawing(this.tempDrawing, this.drawingStartPoint, { time, price });
      // The renderer will pick up this change
    }
  }

  private finishDrawing(x: number, y: number): void {
    if (!this.isDrawing || !this.activeDrawingType || !this.drawingStartPoint) return;
    
    const time = this.chartEngine.getTimeAtX(x);
    const price = this.chartEngine.getPriceAtY(y);
    
    // Only create if start and end are different enough
    const timeDiff = Math.abs(time - this.drawingStartPoint.time);
    const priceDiff = Math.abs(price - this.drawingStartPoint.price);
    
    if (timeDiff > 0 && priceDiff > 0) {
      const drawing = this.createDrawingObject(
        this.activeDrawingType,
        this.drawingStartPoint.time,
        this.drawingStartPoint.price,
        time,
        price
      );
      
      if (drawing) {
        this.callbacks.onDrawingCreate?.(drawing);
      }
    }
    
    this.cancelDrawing();
  }

  private cancelDrawing(): void {
    this.isDrawing = false;
    this.drawingStartPoint = null;
    this.drawingEndPoint = null;
    this.tempDrawing = null;
    this.canvas.style.cursor = this.mode === 'pan' ? 'grab' : 'crosshair';
  }

  private createDrawingObject(
    type: DrawingType,
    startTime: number,
    startPrice: number,
    endTime: number,
    endPrice: number
  ): Drawing | null {
    const id = `drawing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const baseDrawing = {
      id,
      visible: true,
      locked: false,
      color: '#6366f1',
      lineWidth: 1,
    };
    
    switch (type) {
      case 'trendline':
        return {
          ...baseDrawing,
          type: 'trendline',
          points: [{ time: startTime, price: startPrice }, { time: endTime, price: endPrice }],
        } as Drawing;
      
      case 'horizontal_line':
        return {
          ...baseDrawing,
          type: 'horizontal_line',
          price: startPrice,
        } as Drawing;
      
      case 'vertical_line':
        return {
          ...baseDrawing,
          type: 'vertical_line',
          time: startTime,
        } as Drawing;
      
      case 'rectangle':
        return {
          ...baseDrawing,
          type: 'rectangle',
          points: [{ time: startTime, price: startPrice }, { time: endTime, price: endPrice }],
        } as Drawing;
      
      case 'fibonacci':
        return {
          ...baseDrawing,
          type: 'fibonacci',
          points: [{ time: startTime, price: startPrice }, { time: endTime, price: endPrice }],
          levels: [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1],
        } as Drawing;
      
      case 'text':
        return {
          ...baseDrawing,
          type: 'text',
          point: { time: startTime, price: startPrice },
          text: 'Text',
          fontSize: 12,
        } as Drawing;
      
      case 'arrow':
        return {
          ...baseDrawing,
          type: 'arrow',
          points: [{ time: startTime, price: startPrice }, { time: endTime, price: endPrice }],
          arrowType: 'forward',
        } as Drawing;
      
      default:
        return null;
    }
  }

  private updateTempDrawing(
    temp: Partial<Drawing>,
    start: DrawingPoint,
    end: DrawingPoint
  ): Partial<Drawing> {
    const updated = { ...temp };
    
    switch (updated.type) {
      case 'trendline':
      case 'rectangle':
      case 'arrow':
        (updated as any).points = [start, end];
        break;
      case 'fibonacci':
        (updated as any).points = [start, end];
        break;
      case 'horizontal_line':
        (updated as any).price = start.price;
        break;
      case 'vertical_line':
        (updated as any).time = start.time;
        break;
      case 'text':
        (updated as any).point = start;
        break;
    }
    
    return updated;
  }

  private hitTestDrawings(x: number, y: number): Drawing | null {
    // This would check if x,y is close to any drawing
    // For simplicity, returning null - implementation depends on drawing types
    return null;
  }

  zoomIn(): void {
    this.chartEngine.zoomIn();
    this.renderer.markDirty();
    this.callbacks.onZoomChange?.(this.chartEngine.getZoom());
  }

  zoomOut(): void {
    this.chartEngine.zoomOut();
    this.renderer.markDirty();
    this.callbacks.onZoomChange?.(this.chartEngine.getZoom());
  }

  resetView(): void {
    this.chartEngine.resetPan();
    this.chartEngine.setZoom(1);
    this.renderer.markDirty();
    this.callbacks.onPanChange?.(this.chartEngine.getPan());
    this.callbacks.onZoomChange?.(this.chartEngine.getZoom());
  }

  scrollToLatest(): void {
    this.chartEngine.scrollToLatest();
    this.renderer.markDirty();
  }
}
