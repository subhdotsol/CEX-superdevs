'use client';

import { Fill } from '@/lib/api';

export interface Trade {
    price: number;
    qty: number;
    side: 'buy' | 'sell';
    time: Date;
}

interface TradesPanelProps {
    trades: Trade[];
}

export function TradesPanel({ trades }: TradesPanelProps) {
    return (
        <div className="panel flex flex-col h-full">
            <h2 className="panel-title mb-3">Trades</h2>

            {/* Header */}
            <div className="grid grid-cols-3 gap-2 text-xs text-zinc-500 pb-2 border-b border-zinc-800/50">
                <span>Price</span>
                <span className="text-right">Qty</span>
                <span className="text-right">Time</span>
            </div>

            {/* Trades List */}
            <div className="flex-1 overflow-y-auto space-y-0.5 mt-2">
                {trades.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-zinc-600 text-sm">No trades yet</p>
                    </div>
                ) : (
                    trades.map((trade, i) => (
                        <div
                            key={i}
                            className="grid grid-cols-3 gap-2 text-sm py-1 hover:bg-zinc-800/30 rounded transition-colors"
                        >
                            <span className={`font-mono ${trade.side === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                                {trade.price.toFixed(2)}
                            </span>
                            <span className="text-right font-mono text-zinc-300">
                                {trade.qty}
                            </span>
                            <span className="text-right text-zinc-500 text-xs">
                                {trade.time.toLocaleTimeString('en-US', {
                                    hour12: false,
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit'
                                })}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
