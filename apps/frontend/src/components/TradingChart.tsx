'use client';

import { useEffect, useRef, useState } from 'react';

interface TradingChartProps {
    bids: [number, number][];
    asks: [number, number][];
}

type TimeInterval = '1m' | '5m' | '15m' | '1h' | '4h' | '1D';

export function TradingChart({ bids, asks }: TradingChartProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [selectedInterval, setSelectedInterval] = useState<TimeInterval>('1m');
    const [isPanning, setIsPanning] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
    const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(null);

    const intervals: TimeInterval[] = ['1m', '5m', '15m', '1h', '4h', '1D'];

    // Handle wheel zoom
    const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setZoomLevel(prev => Math.max(0.5, Math.min(5, prev * delta)));
    };

    // Handle touch pinch zoom
    const handleTouchMove = (e: TouchEvent) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const distance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );

            if (lastTouchDistance !== null) {
                const delta = distance / lastTouchDistance;
                setZoomLevel(prev => Math.max(0.5, Math.min(5, prev * delta)));
            }
            setLastTouchDistance(distance);
        } else if (e.touches.length === 1 && isPanning) {
            const touch = e.touches[0];
            const dx = touch.clientX - lastMousePos.x;
            const dy = touch.clientY - lastMousePos.y;
            setPanOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
            setLastMousePos({ x: touch.clientX, y: touch.clientY });
        }
    };

    const handleTouchEnd = () => {
        setLastTouchDistance(null);
        setIsPanning(false);
    };

    const handleTouchStart = (e: TouchEvent) => {
        if (e.touches.length === 1) {
            setIsPanning(true);
            setLastMousePos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
        }
    };

    // Handle mouse pan
    const handleMouseDown = (e: MouseEvent) => {
        setIsPanning(true);
        setLastMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isPanning) return;
        const dx = e.clientX - lastMousePos.x;
        const dy = e.clientY - lastMousePos.y;
        setPanOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        setLastMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
        setIsPanning(false);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Add event listeners
        canvas.addEventListener('wheel', handleWheel, { passive: false });
        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        canvas.addEventListener('touchend', handleTouchEnd);
        canvas.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            canvas.removeEventListener('wheel', handleWheel);
            canvas.removeEventListener('touchstart', handleTouchStart);
            canvas.removeEventListener('touchmove', handleTouchMove);
            canvas.removeEventListener('touchend', handleTouchEnd);
            canvas.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isPanning, lastMousePos, lastTouchDistance]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Get actual canvas dimensions
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * 2;
        canvas.height = rect.height * 2;
        ctx.scale(2, 2);

        const width = rect.width;
        const height = rect.height;

        // Clear canvas
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, width, height);

        // Apply transformations
        ctx.save();
        ctx.translate(panOffset.x, panOffset.y);
        ctx.scale(zoomLevel, zoomLevel);

        // Draw grid
        ctx.strokeStyle = '#1a1a2e';
        ctx.lineWidth = 1 / zoomLevel;

        // Vertical grid lines
        for (let i = 0; i <= 10; i++) {
            const x = (width / 10) * i;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        // Horizontal grid lines
        for (let i = 0; i <= 6; i++) {
            const y = (height / 6) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // If no data, show placeholder
        if (bids.length === 0 && asks.length === 0) {
            ctx.fillStyle = '#3f3f46';
            ctx.font = `${14 / zoomLevel}px system-ui`;
            ctx.textAlign = 'center';
            ctx.fillText('Waiting for market data...', width / 2, height / 2);
            ctx.restore();
            return;
        }

        // Combine and find price range
        const allPrices = [...bids.map(([p]) => p), ...asks.map(([p]) => p)];
        const minPrice = Math.min(...allPrices) * 0.98;
        const maxPrice = Math.max(...allPrices) * 1.02;
        const priceRange = maxPrice - minPrice;

        // Calculate cumulative quantities for depth
        let bidCumulative: [number, number][] = [];
        let askCumulative: [number, number][] = [];

        // Sort bids descending, asks ascending
        const sortedBids = [...bids].sort((a, b) => b[0] - a[0]);
        const sortedAsks = [...asks].sort((a, b) => a[0] - b[0]);

        let cumQty = 0;
        for (const [price, qty] of sortedBids) {
            cumQty += qty;
            bidCumulative.push([price, cumQty]);
        }

        cumQty = 0;
        for (const [price, qty] of sortedAsks) {
            cumQty += qty;
            askCumulative.push([price, cumQty]);
        }

        const maxCumQty = Math.max(
            ...bidCumulative.map(([, q]) => q),
            ...askCumulative.map(([, q]) => q),
            1
        );

        // Map price to X coordinate
        const priceToX = (price: number) => ((price - minPrice) / priceRange) * width;
        const qtyToY = (qty: number) => height - (qty / maxCumQty) * (height * 0.8) - 20;

        // Draw bid depth (green area)
        if (bidCumulative.length > 0) {
            ctx.beginPath();
            ctx.moveTo(priceToX(bidCumulative[0][0]), height);

            for (const [price, cumQty] of bidCumulative) {
                ctx.lineTo(priceToX(price), qtyToY(cumQty));
            }

            ctx.lineTo(priceToX(bidCumulative[bidCumulative.length - 1][0]), height);
            ctx.closePath();

            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, 'rgba(34, 197, 94, 0.4)');
            gradient.addColorStop(1, 'rgba(34, 197, 94, 0.05)');
            ctx.fillStyle = gradient;
            ctx.fill();

            // Draw bid line
            ctx.beginPath();
            ctx.strokeStyle = '#22c55e';
            ctx.lineWidth = 2 / zoomLevel;
            for (let i = 0; i < bidCumulative.length; i++) {
                const [price, cumQty] = bidCumulative[i];
                if (i === 0) {
                    ctx.moveTo(priceToX(price), qtyToY(cumQty));
                } else {
                    ctx.lineTo(priceToX(price), qtyToY(cumQty));
                }
            }
            ctx.stroke();
        }

        // Draw ask depth (red area)
        if (askCumulative.length > 0) {
            ctx.beginPath();
            ctx.moveTo(priceToX(askCumulative[0][0]), height);

            for (const [price, cumQty] of askCumulative) {
                ctx.lineTo(priceToX(price), qtyToY(cumQty));
            }

            ctx.lineTo(priceToX(askCumulative[askCumulative.length - 1][0]), height);
            ctx.closePath();

            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
            gradient.addColorStop(1, 'rgba(239, 68, 68, 0.05)');
            ctx.fillStyle = gradient;
            ctx.fill();

            // Draw ask line
            ctx.beginPath();
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 2 / zoomLevel;
            for (let i = 0; i < askCumulative.length; i++) {
                const [price, cumQty] = askCumulative[i];
                if (i === 0) {
                    ctx.moveTo(priceToX(price), qtyToY(cumQty));
                } else {
                    ctx.lineTo(priceToX(price), qtyToY(cumQty));
                }
            }
            ctx.stroke();
        }

        // Draw mid-price line
        const midPrice = (Math.max(...bids.map(([p]) => p)) + Math.min(...asks.map(([p]) => p))) / 2;
        const midX = priceToX(midPrice);

        ctx.setLineDash([5 / zoomLevel, 5 / zoomLevel]);
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 1 / zoomLevel;
        ctx.beginPath();
        ctx.moveTo(midX, 0);
        ctx.lineTo(midX, height);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw price label
        ctx.fillStyle = '#60a5fa';
        ctx.font = `bold ${12 / zoomLevel}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(`$${midPrice.toFixed(2)}`, midX, 20);

        ctx.restore();

    }, [bids, asks, zoomLevel, panOffset]);

    return (
        <div className="panel flex flex-col h-full">
            <div className="flex flex-col gap-3 mb-4">
                <div className="flex items-center justify-between">
                    <h2 className="panel-title">Depth Chart</h2>
                    <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-green-500/50" />
                            <span className="text-zinc-500">Bids</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-red-500/50" />
                            <span className="text-zinc-500">Asks</span>
                        </div>
                    </div>
                </div>

                {/* Time Interval Selector */}
                <div className="flex items-center gap-1">
                    {intervals.map((interval) => (
                        <button
                            key={interval}
                            onClick={() => setSelectedInterval(interval)}
                            className={`px-3 py-1 text-xs rounded transition-colors ${selectedInterval === interval
                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                    : 'bg-zinc-800/50 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                                }`}
                        >
                            {interval}
                        </button>
                    ))}
                </div>

                {/* Zoom indicator */}
                <div className="flex items-center justify-between text-[10px] text-zinc-600">
                    <span>Zoom: {(zoomLevel * 100).toFixed(0)}%</span>
                    <button
                        onClick={() => {
                            setZoomLevel(1);
                            setPanOffset({ x: 0, y: 0 });
                        }}
                        className="text-blue-500 hover:text-blue-400"
                    >
                        Reset View
                    </button>
                </div>
            </div>

            <div className="flex-1 relative">
                <canvas
                    ref={canvasRef}
                    className="w-full h-full rounded-lg cursor-grab active:cursor-grabbing"
                    style={{ minHeight: '200px', touchAction: 'none' }}
                />
            </div>
        </div>
    );
}
