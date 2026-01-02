'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

export interface Position {
    orderId: number;
    side: 'Buy' | 'Sell';
    price: number;
    quantity: number;
    filledQty: number;
    remainingQty: number;
    timestamp: Date;
}

interface OpenPositionsProps {
    positions: Position[];
    onPositionClosed?: (orderId: number) => void;
}

export function OpenPositions({ positions, onPositionClosed }: OpenPositionsProps) {
    const [closingId, setClosingId] = useState<number | null>(null);

    const handleClose = async (orderId: number) => {
        setClosingId(orderId);
        try {
            await api.deleteOrder(String(orderId));
            if (onPositionClosed) {
                onPositionClosed(orderId);
            }
        } catch (err) {
            console.error('Failed to close position:', err);
        } finally {
            setClosingId(null);
        }
    };

    const totalBuyQty = positions
        .filter(p => p.side === 'Buy')
        .reduce((sum, p) => sum + p.remainingQty, 0);
    const totalSellQty = positions
        .filter(p => p.side === 'Sell')
        .reduce((sum, p) => sum + p.remainingQty, 0);

    return (
        <div className="panel h-full flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-2">
                <h2 className="panel-title">Open Positions</h2>
                <div className="flex items-center gap-3 text-xs">
                    <span className="text-green-400">Buy: {totalBuyQty}</span>
                    <span className="text-red-400">Sell: {totalSellQty}</span>
                </div>
            </div>

            {/* Table Header - Full Width */}
            <div className="grid grid-cols-6 gap-2 text-xs text-zinc-500 pb-2 border-b border-zinc-800/50 font-medium px-1">
                <span>Side</span>
                <span>Order ID</span>
                <span className="text-right">Price</span>
                <span className="text-right">Qty</span>
                <span className="text-right">Time</span>
                <span className="text-right">Action</span>
            </div>

            {/* Positions List - Full Width */}
            <div className="flex-1 overflow-y-auto">
                {positions.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-zinc-600 text-xs">No open positions</p>
                    </div>
                ) : (
                    <div className="divide-y divide-zinc-800/30">
                        {positions.map((position) => (
                            <div
                                key={position.orderId}
                                className="grid grid-cols-6 gap-2 text-sm py-2 px-1 hover:bg-zinc-800/20 transition-colors items-center"
                            >
                                {/* Side */}
                                <span className={`font-bold text-xs ${position.side === 'Buy' ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                    {position.side.toUpperCase()}
                                </span>

                                {/* Order ID */}
                                <span className="text-zinc-400 font-mono text-xs">
                                    #{position.orderId}
                                </span>

                                {/* Price */}
                                <span className="text-right font-mono text-cyan-400">
                                    ${position.price.toFixed(2)}
                                </span>

                                {/* Quantity */}
                                <span className="text-right font-mono text-zinc-300">
                                    {position.remainingQty}
                                </span>

                                {/* Time */}
                                <span className="text-right text-zinc-500 text-xs">
                                    {position.timestamp.toLocaleTimeString('en-US', {
                                        hour12: false,
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit'
                                    })}
                                </span>

                                {/* Close Button */}
                                <div className="text-right">
                                    <button
                                        onClick={() => handleClose(position.orderId)}
                                        disabled={closingId === position.orderId}
                                        className="text-zinc-500 hover:text-red-400 text-xs transition-colors disabled:opacity-50 px-2 py-0.5 rounded hover:bg-red-500/10"
                                    >
                                        {closingId === position.orderId ? '...' : '✕'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
