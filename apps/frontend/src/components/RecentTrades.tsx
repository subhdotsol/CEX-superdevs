'use client';

import { FillResponse } from '@/lib/api';

interface RecentTradesProps {
    trades: FillResponse[];
}

export function RecentTrades({ trades }: RecentTradesProps) {
    return (
        <div className="bg-zinc-900 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 text-white">📋 Recent Activity</h2>

            {trades.length === 0 ? (
                <p className="text-zinc-500 text-center py-4">No trades yet</p>
            ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {trades.map((trade, i) => (
                        <div
                            key={i}
                            className="bg-zinc-800 rounded-lg p-3 text-sm"
                        >
                            {trade.fills.length > 0 ? (
                                <div>
                                    <span className="text-green-400">Filled:</span>
                                    {trade.fills.map((fill, j) => (
                                        <span key={j} className="ml-2 text-zinc-300">
                                            {fill.qty} @ {fill.price}
                                        </span>
                                    ))}
                                </div>
                            ) : trade.order_id !== null ? (
                                <div>
                                    <span className="text-blue-400">Order #{trade.order_id}</span>
                                    <span className="text-zinc-400 ml-2">
                                        Qty: {trade.remaining_qty} (resting)
                                    </span>
                                </div>
                            ) : null}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
