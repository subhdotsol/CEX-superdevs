'use client';

import { useEffect, useRef } from 'react';
import { Trade } from './TradesPanel';

interface PriceChartProps {
    trades: Trade[];
    lastPrice: number;
}

export function PriceChart({ trades, lastPrice }: PriceChartProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Get actual canvas dimensions
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const width = rect.width;
        const height = rect.height;
        const padding = { top: 30, right: 60, bottom: 30, left: 20 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        // Clear canvas with gradient background
        const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
        bgGradient.addColorStop(0, '#0a0a0f');
        bgGradient.addColorStop(1, '#0d0d14');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, width, height);

        // Draw grid lines
        ctx.strokeStyle = '#1a1a2e';
        ctx.lineWidth = 1;

        // Horizontal grid lines
        for (let i = 0; i <= 5; i++) {
            const y = padding.top + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();
        }

        // Generate price points from trades or simulate if empty
        let pricePoints: { price: number; time: number }[] = [];

        if (trades.length > 0) {
            pricePoints = trades.slice(0, 50).reverse().map((trade, i) => ({
                price: trade.price,
                time: i,
            }));
        } else if (lastPrice > 0) {
            // Simulate some price movement around last price
            for (let i = 0; i < 30; i++) {
                pricePoints.push({
                    price: lastPrice + (Math.random() - 0.5) * 5,
                    time: i,
                });
            }
        }

        if (pricePoints.length < 2) {
            // Show placeholder
            ctx.fillStyle = '#3f3f46';
            ctx.font = '14px system-ui';
            ctx.textAlign = 'center';
            ctx.fillText('Waiting for trades...', width / 2, height / 2);
            return;
        }

        // Find price range
        const prices = pricePoints.map(p => p.price);
        const minPrice = Math.min(...prices) * 0.998;
        const maxPrice = Math.max(...prices) * 1.002;
        const priceRange = maxPrice - minPrice || 1;

        // Map functions
        const xToCanvas = (i: number) => padding.left + (i / (pricePoints.length - 1)) * chartWidth;
        const priceToY = (price: number) =>
            padding.top + ((maxPrice - price) / priceRange) * chartHeight;

        // Determine if price is up or down
        const startPrice = pricePoints[0].price;
        const endPrice = pricePoints[pricePoints.length - 1].price;
        const isUp = endPrice >= startPrice;
        const lineColor = isUp ? '#22c55e' : '#ef4444';
        const fillColor = isUp ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)';

        // Draw filled area under line
        ctx.beginPath();
        ctx.moveTo(xToCanvas(0), height - padding.bottom);

        for (let i = 0; i < pricePoints.length; i++) {
            ctx.lineTo(xToCanvas(i), priceToY(pricePoints[i].price));
        }

        ctx.lineTo(xToCanvas(pricePoints.length - 1), height - padding.bottom);
        ctx.closePath();

        const areaGradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
        areaGradient.addColorStop(0, isUp ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)');
        areaGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = areaGradient;
        ctx.fill();

        // Draw the line
        ctx.beginPath();
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        for (let i = 0; i < pricePoints.length; i++) {
            const x = xToCanvas(i);
            const y = priceToY(pricePoints[i].price);

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();

        // Draw glow effect
        ctx.beginPath();
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 4;
        ctx.globalAlpha = 0.3;
        for (let i = 0; i < pricePoints.length; i++) {
            const x = xToCanvas(i);
            const y = priceToY(pricePoints[i].price);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Draw current price dot
        const lastX = xToCanvas(pricePoints.length - 1);
        const lastY = priceToY(pricePoints[pricePoints.length - 1].price);

        // Glow around dot
        ctx.beginPath();
        ctx.arc(lastX, lastY, 8, 0, Math.PI * 2);
        ctx.fillStyle = isUp ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)';
        ctx.fill();

        // Dot
        ctx.beginPath();
        ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
        ctx.fillStyle = lineColor;
        ctx.fill();

        // Price labels on right side
        ctx.fillStyle = '#64748b';
        ctx.font = '11px monospace';
        ctx.textAlign = 'right';

        for (let i = 0; i <= 4; i++) {
            const price = maxPrice - (priceRange / 4) * i;
            const y = padding.top + (chartHeight / 4) * i;
            ctx.fillText(`$${price.toFixed(2)}`, width - 10, y + 4);
        }

        // Current price label
        ctx.fillStyle = lineColor;
        ctx.font = 'bold 12px monospace';
        const currentPrice = pricePoints[pricePoints.length - 1].price;
        ctx.fillText(`$${currentPrice.toFixed(2)}`, width - 10, lastY + 4);

    }, [trades, lastPrice]);

    return (
        <div className="panel flex flex-col h-full">
            <div className="flex items-center justify-between mb-3">
                <h2 className="panel-title">Price Chart</h2>
                <div className="flex items-center gap-2 text-xs">
                    <span className="text-zinc-500">Last 50 trades</span>
                </div>
            </div>
            <div className="flex-1 relative min-h-[250px]">
                <canvas
                    ref={canvasRef}
                    className="w-full h-full rounded-lg"
                />
            </div>
        </div>
    );
}
