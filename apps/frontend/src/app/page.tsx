'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, Depth, FillResponse } from '@/lib/api';
import { OrderBook } from '@/components/OrderBook';
import { OrderForm } from '@/components/OrderForm';
import { RecentTrades } from '@/components/RecentTrades';

export default function Home() {
  const [depth, setDepth] = useState<Depth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [trades, setTrades] = useState<FillResponse[]>([]);

  const fetchDepth = useCallback(async () => {
    try {
      const data = await api.getDepth();
      setDepth(data);
      setIsConnected(true);
    } catch {
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepth();

    // Poll every 2 seconds
    const interval = setInterval(fetchDepth, 2000);
    return () => clearInterval(interval);
  }, [fetchDepth]);

  const handleOrderCreated = (result: FillResponse) => {
    setTrades(prev => [result, ...prev].slice(0, 20));
    fetchDepth(); // Refresh orderbook
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📈</span>
            <h1 className="text-xl font-bold">Superdevs Exchange</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-zinc-400">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Book */}
          <div className="lg:col-span-1">
            <OrderBook depth={depth} isLoading={isLoading} />
          </div>

          {/* Order Form */}
          <div className="lg:col-span-1">
            <OrderForm onOrderCreated={handleOrderCreated} />
          </div>

          {/* Recent Trades */}
          <div className="lg:col-span-1">
            <RecentTrades trades={trades} />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-zinc-900 rounded-xl p-6">
          <h3 className="font-bold text-lg mb-2">🚀 Getting Started</h3>
          <ol className="list-decimal list-inside space-y-1 text-zinc-400">
            <li>Start the backend: <code className="bg-zinc-800 px-2 py-0.5 rounded">cd apps/backend && cargo run</code></li>
            <li>Create a sell order at price 100</li>
            <li>Create a buy order at price 100 or higher</li>
            <li>Watch the matching engine work!</li>
          </ol>
        </div>
      </main>
    </div>
  );
}
