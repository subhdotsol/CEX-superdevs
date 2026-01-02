'use client';

import { FillResponse } from '@/lib/api';

interface ActivityPanelProps {
    activities: FillResponse[];
}

export function ActivityPanel({ activities }: ActivityPanelProps) {
    return (
        <div className="panel h-full">
            <h2 className="panel-title mb-3">Recent Activity</h2>

            {activities.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                    <p className="text-zinc-600 text-sm">No activity yet. Place an order to get started!</p>
                </div>
            ) : (
                <div className="flex gap-3 overflow-x-auto pb-2">
                    {activities.map((activity, i) => (
                        <div
                            key={i}
                            className="flex-shrink-0 bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-3 min-w-[200px]"
                        >
                            {activity.fills.length > 0 ? (
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                        <span className="text-green-400 text-sm font-semibold">Filled</span>
                                    </div>
                                    <div className="space-y-1">
                                        {activity.fills.slice(0, 3).map((fill, j) => (
                                            <div key={j} className="text-xs text-zinc-400">
                                                <span className="font-mono text-zinc-300">{fill.qty}</span>
                                                <span className="mx-1">@</span>
                                                <span className="font-mono text-cyan-400">${fill.price}</span>
                                            </div>
                                        ))}
                                        {activity.fills.length > 3 && (
                                            <span className="text-xs text-zinc-600">+{activity.fills.length - 3} more</span>
                                        )}
                                    </div>
                                    {activity.remaining_qty > 0 && (
                                        <div className="mt-2 text-xs text-zinc-500">
                                            Remaining: {activity.remaining_qty}
                                        </div>
                                    )}
                                </div>
                            ) : activity.order_id !== null ? (
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                        <span className="text-blue-400 text-sm font-semibold">Order #{activity.order_id}</span>
                                    </div>
                                    <div className="text-xs text-zinc-400">
                                        <span className="font-mono text-zinc-300">{activity.remaining_qty}</span>
                                        <span className="ml-1">units resting</span>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
