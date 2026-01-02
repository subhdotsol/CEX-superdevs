'use client';

import { Depth } from '@/lib/api';

interface OrderBookProps {
    depth: Depth | null;
    isLoading: boolean;
}

export function OrderBook({ depth, isLoading }: OrderBookProps) {
    if (isLoading) {
        return (
            <div className="panel h-full animate-pulse">
                <div className="h-5 bg-zinc-800 rounded w-1/3 mb-4"></div>
                <div className="space-y-2">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="h-8 bg-zinc-800/50 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (!depth) {
        return (
            <div className="panel h-full flex items-center justify-center">
                <p className="text-zinc-600 text-sm">Connecting...</p>
            </div>
        );
    }

    const maxQty = Math.max(
        ...depth.asks.map(([, qty]) => qty),
        ...depth.bids.map(([, qty]) => qty),
        1
    );

    const asks = [...depth.asks].reverse().slice(0, 12);
    const bids = depth.bids.slice(0, 12);

    // Calculate spread
    const bestAsk = depth.asks.length > 0 ? Math.min(...depth.asks.map(([p]) => p)) : 0;
    const bestBid = depth.bids.length > 0 ? Math.max(...depth.bids.map(([p]) => p)) : 0;
    const spread = bestAsk > 0 && bestBid > 0 ? bestAsk - bestBid : 0;
    const spreadPercent = bestBid > 0 ? (spread / bestBid) * 100 : 0;

    return (
        <div className="panel flex flex-col h-full">
            <h2 className="panel-title mb-3">Order Book</h2>

            {/* Header */}
            <div className="grid grid-cols-3 gap-3 text-xs text-zinc-500 pb-2 border-b border-zinc-800/50 font-medium">
                <span>Price (USDT)</span>
                <span className="text-right">Size</span>
                <span className="text-right">Total</span>
            </div>

            {/* Asks (Sells) */}
            <div className="flex-1 flex flex-col justify-end overflow-hidden py-1">
                <div className="space-y-0.5">
                    {asks.map(([price, qty], i) => {
                        const total = asks.slice(i).reduce((sum, [, q]) => sum + q, 0);
                        const barWidth = (qty / maxQty) * 100;
                        return (
                            <div
                                key={`ask-${i}`}
                                className="relative grid grid-cols-3 gap-3 text-sm py-1.5 px-2 rounded hover:bg-zinc-800/30 transition-colors group"
                            >
                                <div
                                    className="absolute right-0 top-0 bottom-0 bg-red-500/15 rounded-r transition-all"
                                    style={{ width: `${barWidth}%` }}
                                />
                                <span className="relative font-mono text-red-400 font-medium">${price.toFixed(2)}</span>
                                <span className="relative font-mono text-zinc-300 text-right">{qty.toLocaleString()}</span>
                                <span className="relative font-mono text-zinc-500 text-right">{total.toLocaleString()}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Spread */}
            <div className="py-3 border-y border-zinc-800/50 my-1 bg-zinc-900/30 rounded-lg px-3">
                <div className="flex items-center justify-between">
                    <span className="text-cyan-400 font-mono font-bold text-lg">
                        ${bestAsk > 0 ? bestAsk.toFixed(2) : '--'}
                    </span>
                    <div className="text-right">
                        <span className="text-zinc-500 text-xs block">Spread</span>
                        <span className="text-zinc-400 font-mono text-sm">
                            ${spread.toFixed(2)} ({spreadPercent.toFixed(2)}%)
                        </span>
                    </div>
                </div>
            </div>

            {/* Bids (Buys) */}
            <div className="flex-1 overflow-hidden py-1">
                <div className="space-y-0.5">
                    {bids.map(([price, qty], i) => {
                        const total = bids.slice(0, i + 1).reduce((sum, [, q]) => sum + q, 0);
                        const barWidth = (qty / maxQty) * 100;
                        return (
                            <div
                                key={`bid-${i}`}
                                className="relative grid grid-cols-3 gap-3 text-sm py-1.5 px-2 rounded hover:bg-zinc-800/30 transition-colors group"
                            >
                                <div
                                    className="absolute left-0 top-0 bottom-0 bg-green-500/15 rounded-l transition-all"
                                    style={{ width: `${barWidth}%` }}
                                />
                                <span className="relative font-mono text-green-400 font-medium">${price.toFixed(2)}</span>
                                <span className="relative font-mono text-zinc-300 text-right">{qty.toLocaleString()}</span>
                                <span className="relative font-mono text-zinc-500 text-right">{total.toLocaleString()}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {depth.asks.length === 0 && depth.bids.length === 0 && (
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-zinc-600 text-sm">Empty order book</p>
                </div>
            )}
        </div>
    );
}
