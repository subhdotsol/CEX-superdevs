'use client';

import { useState } from 'react';
import { FillResponse } from '@/lib/api';
import { useTradingBot } from '@/lib/useTradingBot';

interface TradingBotPanelProps {
    onOrderPlaced?: (result: FillResponse, side: 'Buy' | 'Sell') => void;
}

export function TradingBotPanel({ onOrderPlaced }: TradingBotPanelProps) {
    const {
        isRunning,
        orderCount,
        config,
        setConfig,
        start,
        stop,
        reset,
    } = useTradingBot(onOrderPlaced);

    const [showSettings, setShowSettings] = useState(false);

    return (
        <div className="panel border-2 border-cyan-500/20 bg-gradient-to-br from-cyan-950/20 to-zinc-900/50">
            {/* Header with prominent styling */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                        <span className="text-lg">🤖</span>
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white">Trading Bot</h2>
                        <span className="text-xs text-zinc-500">Auto Market Maker</span>
                    </div>
                </div>
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="px-2 py-1 rounded bg-zinc-800/50 text-zinc-400 hover:text-cyan-400 transition-colors text-xs border border-zinc-700/50"
                >
                    ⚙️ {showSettings ? 'Hide' : 'Settings'}
                </button>
            </div>

            {/* Status Bar */}
            <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-500 animate-pulse shadow-lg shadow-green-500/50' : 'bg-zinc-600'}`} />
                <div className="flex-1">
                    <span className={`text-sm font-semibold ${isRunning ? 'text-green-400' : 'text-zinc-400'}`}>
                        {isRunning ? 'Running' : 'Stopped'}
                    </span>
                </div>
                <div className="text-right">
                    <span className="text-xl font-mono font-bold text-cyan-400">{orderCount}</span>
                    <span className="text-xs text-zinc-500 ml-1">orders</span>
                </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div className="space-y-3 mb-4 p-3 bg-zinc-900/70 rounded-lg border border-zinc-800/50">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Min Price</label>
                            <input
                                type="number"
                                value={config.minPrice}
                                onChange={(e) => setConfig({ ...config, minPrice: parseInt(e.target.value) || 0 })}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:border-cyan-500/50 focus:outline-none transition-colors"
                                disabled={isRunning}
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Max Price</label>
                            <input
                                type="number"
                                value={config.maxPrice}
                                onChange={(e) => setConfig({ ...config, maxPrice: parseInt(e.target.value) || 0 })}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:border-cyan-500/50 focus:outline-none transition-colors"
                                disabled={isRunning}
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Min Qty</label>
                            <input
                                type="number"
                                value={config.minQty}
                                onChange={(e) => setConfig({ ...config, minQty: parseInt(e.target.value) || 1 })}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:border-cyan-500/50 focus:outline-none transition-colors"
                                disabled={isRunning}
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Max Qty</label>
                            <input
                                type="number"
                                value={config.maxQty}
                                onChange={(e) => setConfig({ ...config, maxQty: parseInt(e.target.value) || 1 })}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:border-cyan-500/50 focus:outline-none transition-colors"
                                disabled={isRunning}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Interval (ms)</label>
                        <input
                            type="number"
                            value={config.intervalMs}
                            onChange={(e) => setConfig({ ...config, intervalMs: parseInt(e.target.value) || 500 })}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:border-cyan-500/50 focus:outline-none transition-colors"
                            min={100}
                            step={100}
                            disabled={isRunning}
                        />
                    </div>
                </div>
            )}

            {/* Speed Presets */}
            <div className="flex gap-2 mb-4">
                {[
                    { label: 'Slow', ms: 2000, icon: '🐢' },
                    { label: 'Normal', ms: 1000, icon: '🚶' },
                    { label: 'Fast', ms: 500, icon: '🏃' },
                    { label: 'Turbo', ms: 200, icon: '⚡' },
                    { label: 'Volatile', ms: 100, icon: '🔥' },
                ].map((preset) => (
                    <button
                        key={preset.label}
                        onClick={() => setConfig({ ...config, intervalMs: preset.ms })}
                        disabled={isRunning}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${config.intervalMs === preset.ms
                            ? 'bg-cyan-500/20 text-cyan-400 border-2 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                            : 'bg-zinc-800/50 text-zinc-500 border border-zinc-700/50 hover:text-zinc-300 disabled:opacity-50'
                            }`}
                    >
                        <span className="block text-base mb-0.5">{preset.icon}</span>
                        {preset.label}
                    </button>
                ))}
            </div>

            {/* Controls */}
            <div className="flex gap-2">
                {!isRunning ? (
                    <button
                        onClick={start}
                        className="flex-1 py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-sm hover:from-green-400 hover:to-emerald-500 transition-all shadow-lg shadow-green-500/20"
                    >
                        ▶ Start Bot
                    </button>
                ) : (
                    <button
                        onClick={stop}
                        className="flex-1 py-3 rounded-lg bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold text-sm hover:from-red-400 hover:to-rose-500 transition-all shadow-lg shadow-red-500/20"
                    >
                        ⏹ Stop Bot
                    </button>
                )}
                <button
                    onClick={reset}
                    className="px-4 py-3 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 transition-all text-sm font-medium"
                >
                    ↻
                </button>
            </div>
        </div>
    );
}
