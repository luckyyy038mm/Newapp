import { Candle, IndicatorConfig, IndicatorType, IndicatorValue } from '@/types';

export interface Indicator {
  id: string;
  type: IndicatorType;
  params: Record<string, number>;
  color: string;
  values: IndicatorValue[];
}

export class IndicatorEngine {
  private indicators: Map<string, Indicator> = new Map();

  calculate(type: IndicatorType, candles: Candle[], params: Record<string, number> = {}): IndicatorValue[] {
    switch (type) {
      case 'ema':
        return this.calculateEMA(candles, params.period || 20);
      case 'sma':
        return this.calculateSMA(candles, params.period || 20);
      case 'vwap':
        return this.calculateVWAP(candles);
      case 'rsi':
        return this.calculateRSI(candles, params.period || 14);
      case 'macd':
        return this.calculateMACD(candles, params);
      default:
        return [];
    }
  }

  private calculateEMA(candles: Candle[], period: number): IndicatorValue[] {
    if (candles.length < period) return [];

    const values: IndicatorValue[] = [];
    const multiplier = 2 / (period + 1);
    
    // Calculate initial SMA
    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += candles[i].close;
    }
    let ema = sum / period;
    values.push({ time: candles[period - 1].time, value: ema });

    // Calculate EMA for remaining candles
    for (let i = period; i < candles.length; i++) {
      ema = (candles[i].close - ema) * multiplier + ema;
      values.push({ time: candles[i].time, value: ema });
    }

    return values;
  }

  private calculateSMA(candles: Candle[], period: number): IndicatorValue[] {
    if (candles.length < period) return [];

    const values: IndicatorValue[] = [];

    for (let i = period - 1; i < candles.length; i++) {
      let sum = 0;
      for (let j = i - period + 1; j <= i; j++) {
        sum += candles[j].close;
      }
      values.push({ time: candles[i].time, value: sum / period });
    }

    return values;
  }

  private calculateVWAP(candles: Candle[]): IndicatorValue[] {
    if (candles.length === 0) return [];

    const values: IndicatorValue[] = [];
    let cumulativeTPV = 0; // Typical Price * Volume
    let cumulativeVolume = 0;

    for (const candle of candles) {
      const typicalPrice = (candle.high + candle.low + candle.close) / 3;
      cumulativeTPV += typicalPrice * candle.volume;
      cumulativeVolume += candle.volume;
      
      const vwap = cumulativeVolume > 0 ? cumulativeTPV / cumulativeVolume : typicalPrice;
      values.push({ time: candle.time, value: vwap });
    }

    return values;
  }

  private calculateRSI(candles: Candle[], period: number): IndicatorValue[] {
    if (candles.length < period + 1) return [];

    const values: IndicatorValue[] = [];
    const gains: number[] = [];
    const losses: number[] = [];

    // Calculate price changes
    for (let i = 1; i < candles.length; i++) {
      const change = candles[i].close - candles[i - 1].close;
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }

    // Calculate initial average gain and loss
    let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

    // Calculate RSI for remaining candles
    for (let i = period; i < gains.length; i++) {
      avgGain = (avgGain * (period - 1) + gains[i]) / period;
      avgLoss = (avgLoss * (period - 1) + losses[i]) / period;

      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      const rsi = 100 - (100 / (1 + rs));
      values.push({ time: candles[i + 1].time, value: rsi });
    }

    return values;
  }

  private calculateMACD(
    candles: Candle[],
    params: { fastPeriod?: number; slowPeriod?: number; signalPeriod?: number }
  ): IndicatorValue[] {
    const fastPeriod = params.fastPeriod || 12;
    const slowPeriod = params.slowPeriod || 26;
    const signalPeriod = params.signalPeriod || 9;

    // Calculate EMAs
    const fastEMA = this.calculateEMA(candles, fastPeriod);
    const slowEMA = this.calculateEMA(candles, slowPeriod);

    // Calculate MACD line (fast EMA - slow EMA)
    const macdLine: IndicatorValue[] = [];
    const startIndex = slowPeriod - fastPeriod;
    
    for (let i = 0; i < slowEMA.length; i++) {
      const fastIndex = i + startIndex;
      if (fastIndex < fastEMA.length) {
        macdLine.push({
          time: slowEMA[i].time,
          value: fastEMA[fastIndex].value - slowEMA[i].value,
        });
      }
    }

    // Calculate signal line (EMA of MACD)
    const signalLine = this.calculateEMAFromValues(macdLine, signalPeriod);

    // Calculate histogram (MACD - Signal)
    const histogram: IndicatorValue[] = [];
    for (let i = 0; i < signalLine.length; i++) {
      histogram.push({
        time: signalLine[i].time,
        value: macdLine[i + macdLine.length - signalLine.length]?.value - signalLine[i].value || 0,
      });
    }

    return histogram; // Return histogram as the main MACD value
  }

  private calculateEMAFromValues(values: IndicatorValue[], period: number): IndicatorValue[] {
    if (values.length < period) return [];

    const result: IndicatorValue[] = [];
    const multiplier = 2 / (period + 1);

    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += values[i].value;
    }
    let ema = sum / period;
    result.push({ time: values[period - 1].time, value: ema });

    for (let i = period; i < values.length; i++) {
      ema = (values[i].value - ema) * multiplier + ema;
      result.push({ time: values[i].time, value: ema });
    }

    return result;
  }

  addIndicator(config: IndicatorConfig, candles: Candle[]): Indicator | null {
    const values = this.calculate(config.type, candles, config.params);
    
    if (values.length === 0) return null;

    const indicator: Indicator = {
      id: config.id,
      type: config.type,
      params: config.params,
      color: config.color,
      values,
    };

    this.indicators.set(config.id, indicator);
    return indicator;
  }

  updateIndicator(id: string, candles: Candle[]): Indicator | null {
    const indicator = this.indicators.get(id);
    if (!indicator) return null;

    const values = this.calculate(indicator.type, candles, indicator.params);
    indicator.values = values;
    return indicator;
  }

  removeIndicator(id: string): void {
    this.indicators.delete(id);
  }

  getIndicator(id: string): Indicator | undefined {
    return this.indicators.get(id);
  }

  getAllIndicators(): Indicator[] {
    return Array.from(this.indicators.values());
  }

  clear(): void {
    this.indicators.clear();
  }

  recalculateAll(candles: Candle[]): void {
    for (const [id, indicator] of this.indicators) {
      indicator.values = this.calculate(indicator.type, candles, indicator.params);
    }
  }
}

// Default indicator colors
export const INDICATOR_COLORS: Record<IndicatorType, string> = {
  ema: '#10b981',
  sma: '#f59e0b',
  vwap: '#8b5cf6',
  rsi: '#06b6d4',
  macd: '#ec4899',
  volume: '#6366f1',
};

// Predefined indicator presets
export const INDICATOR_PRESETS: Array<{ type: IndicatorType; name: string; params: Record<string, number>; color: string }> = [
  { type: 'ema', name: 'EMA 20', params: { period: 20 }, color: INDICATOR_COLORS.ema },
  { type: 'ema', name: 'EMA 50', params: { period: 50 }, color: '#3b82f6' },
  { type: 'ema', name: 'EMA 200', params: { period: 200 }, color: '#f97316' },
  { type: 'sma', name: 'SMA 20', params: { period: 20 }, color: INDICATOR_COLORS.sma },
  { type: 'sma', name: 'SMA 50', params: { period: 50 }, color: '#84cc16' },
  { type: 'vwap', name: 'VWAP', params: {}, color: INDICATOR_COLORS.vwap },
  { type: 'rsi', name: 'RSI 14', params: { period: 14 }, color: INDICATOR_COLORS.rsi },
  { type: 'macd', name: 'MACD', params: {}, color: INDICATOR_COLORS.macd },
];
