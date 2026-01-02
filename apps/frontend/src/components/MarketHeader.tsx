'use client';

interface MarketHeaderProps {
    isConnected: boolean;
    lastPrice?: number;
}

export function MarketHeader({ isConnected, lastPrice = 0 }: MarketHeaderProps) {
    return (
        <div className="panel h-full flex items-center justify-between py-2">
            <div className="flex items-center gap-6">
                {/* Market Pair */}
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-sm font-bold">
                        ₿
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white">BTC / USDT</h1>
                        <span className="text-xs text-zinc-500">Bitcoin</span>
                    </div>
                </div>

                {/* Divider */}
                <div className="w-px h-8 bg-zinc-800" />

                {/* Last Price - REAL from orderbook */}
                <div>
                    <p className="text-xs text-zinc-500">Last Price</p>
                    <p className={`text-lg font-mono font-bold ${lastPrice > 0 ? 'text-cyan-400' : 'text-zinc-500'}`}>
                        {lastPrice > 0 ? `$${lastPrice.toFixed(2)}` : '--'}
                    </p>
                </div>

                {/* Spread indicator */}
                <div>
                    <p className="text-xs text-zinc-500">Status</p>
                    <p className="font-mono text-sm text-zinc-400">
                        {lastPrice > 0 ? 'Active' : 'Awaiting Orders'}
                    </p>
                </div>
            </div>

            {/* Connection Status - REAL from WebSocket */}
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-xs text-zinc-500">
                    {isConnected ? 'Live' : 'Disconnected'}
                </span>
            </div>
        </div>
    );
}
