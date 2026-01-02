'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time, CandlestickSeries } from 'lightweight-charts';

type TimeInterval = '1m' | '5m' | '15m' | '1h' | '4h' | '1D';

interface CandlestickChartProps {
    bids: [number, number][];
    asks: [number, number][];
    candleIntervalMs?: number;
}

interface CandleData {
    time: Time;
    open: number;
    high: number;
    low: number;
    close: number;
}

export function CandlestickChart({ bids, asks, candleIntervalMs = 5000 }: CandlestickChartProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
    const candlesRef = useRef<CandleData[]>([]);
    const currentCandleRef = useRef<CandleData | null>(null);
    const lastCandleTimeRef = useRef<number>(0);

    const [selectedInterval, setSelectedInterval] = useState<TimeInterval>('1m');
    const intervals: TimeInterval[] = ['1m', '5m', '15m', '1h', '4h', '1D'];

    // Initialize chart
    useEffect(() => {
        if (!containerRef.current) return;

        const chart = createChart(containerRef.current, {
            layout: {
                background: { color: '#0a0a0f' },
                textColor: '#64748b',
            },
            grid: {
                vertLines: { color: '#1e293b' },
                horzLines: { color: '#1e293b' },
            },
            crosshair: {
                mode: 1,
                vertLine: {
                    color: '#22d3ee',
                    width: 1,
                    style: 2,
                    labelBackgroundColor: '#22d3ee',
                },
                horzLine: {
                    color: '#22d3ee',
                    width: 1,
                    style: 2,
                    labelBackgroundColor: '#22d3ee',
                },
            },
            rightPriceScale: {
                borderColor: '#1e293b',
            },
            timeScale: {
                borderColor: '#1e293b',
                timeVisible: true,
                secondsVisible: false,
            },
            handleScroll: {
                mouseWheel: true,
                pressedMouseMove: true,
                horzTouchDrag: true,
                vertTouchDrag: true,
            },
            handleScale: {
                axisPressedMouseMove: true,
                mouseWheel: true,
                pinch: true,
            },
        });

        // v4+ API uses addSeries with type parameter
        const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#22c55e',
            downColor: '#ef4444',
            borderUpColor: '#22c55e',
            borderDownColor: '#ef4444',
            wickUpColor: '#22c55e',
            wickDownColor: '#ef4444',
        });

        chartRef.current = chart;
        seriesRef.current = candlestickSeries;

        // Handle resize
        const handleResize = () => {
            if (containerRef.current && chartRef.current) {
                chartRef.current.applyOptions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight,
                });
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
            chartRef.current = null;
            seriesRef.current = null;
        };
    }, []);

    // Get mid-price from orderbook
    const getMidPrice = useCallback(() => {
        if (bids.length === 0 || asks.length === 0) return null;
        const bestBid = Math.max(...bids.map(([p]) => p));
        const bestAsk = Math.min(...asks.map(([p]) => p));
        return (bestBid + bestAsk) / 2;
    }, [bids, asks]);

    // Update candles from depth data
    useEffect(() => {
        const midPrice = getMidPrice();
        if (midPrice === null || !seriesRef.current) return;

        const candleTime = (Math.floor(Date.now() / candleIntervalMs) * Math.floor(candleIntervalMs / 1000)) as Time;

        // Initialize first candle
        if (!currentCandleRef.current || lastCandleTimeRef.current !== candleTime) {
            // Save previous candle
            if (currentCandleRef.current && lastCandleTimeRef.current !== candleTime) {
                candlesRef.current = [...candlesRef.current, currentCandleRef.current].slice(-500);
            }

            // Start new candle
            currentCandleRef.current = {
                time: candleTime,
                open: midPrice,
                high: midPrice,
                low: midPrice,
                close: midPrice,
            };
            lastCandleTimeRef.current = candleTime;
        } else {
            // Update current candle
            currentCandleRef.current = {
                ...currentCandleRef.current,
                high: Math.max(currentCandleRef.current.high, midPrice),
                low: Math.min(currentCandleRef.current.low, midPrice),
                close: midPrice,
            };
        }

        // Update chart
        const allCandles = [...candlesRef.current, currentCandleRef.current];
        seriesRef.current.setData(allCandles as CandlestickData<Time>[]);

    }, [bids, asks, getMidPrice, candleIntervalMs]);

    return (
        <div className="panel flex flex-col h-full">
            <div className="flex flex-col gap-2 mb-2">
                <div className="flex items-center justify-between">
                    <h2 className="panel-title">Candlestick Chart</h2>
                    <div className="flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-zinc-500">Live</span>
                        <span className="text-zinc-600">|</span>
                        <span className="text-zinc-500">{candleIntervalMs / 1000}s candles</span>
                    </div>
                </div>

                {/* Time Interval Selector */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                        {intervals.map((interval) => (
                            <button
                                key={interval}
                                onClick={() => setSelectedInterval(interval)}
                                className={`px-2.5 py-0.5 text-[11px] rounded transition-colors ${selectedInterval === interval
                                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                        : 'bg-zinc-800/50 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                                    }`}
                            >
                                {interval}
                            </button>
                        ))}
                    </div>
                    <span className="text-[10px] text-zinc-600">
                        Pinch/scroll to zoom • Drag to pan
                    </span>
                </div>
            </div>
            <div ref={containerRef} className="flex-1 min-h-[300px]" />
        </div>
    );
}
