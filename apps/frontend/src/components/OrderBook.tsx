'use client';

import { Depth } from '@/lib/api';

interface OrderBookProps {
    depth: Depth | null;
    isLoading: boolean;
}

export function OrderBook({ depth, isLoading }: OrderBookProps) {
    if (isLoading) {
        return (
            <div className="bg-zinc-900 rounded-xl p-6 animate-pulse">
                <div className="h-6 bg-zinc-800 rounded w-1/3 mb-4"></div>
                <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-8 bg-zinc-800 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (!depth) {
        return (
            <div className="bg-zinc-900 rounded-xl p-6">
                <p className="text-zinc-500">No data available</p>
            </div>
        );
    }

    const maxQty = Math.max(
        ...depth.asks.map(([, qty]) => qty),
        ...depth.bids.map(([, qty]) => qty),
        1
    );

    return (
        <div className="bg-zinc-900 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 text-white">📊 Order Book</h2>

            {/* Asks (Sells) - Reversed so lowest price is at bottom */}
            <div className="space-y-1 mb-2">
                {[...depth.asks].reverse().slice(0, 8).map(([price, qty], i) => (
                    <div key={`ask-${i}`} className="relative flex justify-between items-center h-8 px-3 rounded">
                        {/* Background bar */}
                        <div
                            className="absolute right-0 top-0 bottom-0 bg-red-500/20 rounded"
                            style={{ width: `${(qty / maxQty) * 100}%` }}
                        />
                        <span className="relative text-red-400 font-mono">{price.toFixed(2)}</span>
                        <span className="relative text-zinc-300 font-mono">{qty}</span>
                    </div>
                ))}
            </div>

            {/* Spread */}
            {depth.asks.length > 0 && depth.bids.length > 0 && (
                <div className="text-center py-2 border-y border-zinc-800 my-2">
                    <span className="text-zinc-500 text-sm">
                        Spread: {(Math.min(...depth.asks.map(([p]) => p)) - Math.max(...depth.bids.map(([p]) => p))).toFixed(2)}
                    </span>
                </div>
            )}

            {/* Bids (Buys) */}
            <div className="space-y-1 mt-2">
                {depth.bids.slice(0, 8).map(([price, qty], i) => (
                    <div key={`bid-${i}`} className="relative flex justify-between items-center h-8 px-3 rounded">
                        <div
                            className="absolute left-0 top-0 bottom-0 bg-green-500/20 rounded"
                            style={{ width: `${(qty / maxQty) * 100}%` }}
                        />
                        <span className="relative text-green-400 font-mono">{price.toFixed(2)}</span>
                        <span className="relative text-zinc-300 font-mono">{qty}</span>
                    </div>
                ))}
            </div>

            {depth.asks.length === 0 && depth.bids.length === 0 && (
                <p className="text-zinc-500 text-center py-8">Order book is empty</p>
            )}

            <p className="text-zinc-600 text-xs mt-4 text-center">
                Last Update: #{depth.lastUpdateId}
            </p>
        </div>
    );
}
