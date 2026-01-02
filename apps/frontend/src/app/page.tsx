'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, FillResponse } from '@/lib/api';
import { useOrderbookWebSocket } from '@/lib/useWebSocket';
import { MarketHeader } from '@/components/MarketHeader';
import { CandlestickChart } from '@/components/CandlestickChart';
import { OrderBook } from '@/components/OrderBook';
import { OrderForm } from '@/components/OrderForm';
import { TradesPanel, Trade } from '@/components/TradesPanel';
import { OpenPositions, Position } from '@/components/OpenPositions';
import { TradingBotPanel } from '@/components/TradingBotPanel';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { depth, isConnected } = useOrderbookWebSocket();
  const [isLoading, setIsLoading] = useState(true);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkBackend = async () => {
      try { await api.getDepth(); }
      catch { /* WebSocket handles state */ }
      finally { setIsLoading(false); }
    };
    checkBackend();
  }, []);

  useEffect(() => {
    if (depth) setIsLoading(false);
  }, [depth]);

  const handleOrderCreated = useCallback((result: FillResponse, price: number, side: 'Buy' | 'Sell') => {
    if (result.fills.length > 0) {
      const newTrades: Trade[] = result.fills.map(fill => ({
        price: fill.price,
        qty: fill.qty,
        side: side.toLowerCase() as 'buy' | 'sell',
        time: new Date(),
      }));
      setTrades(prev => [...newTrades, ...prev].slice(0, 100));
    }

    if (result.order_id !== null && result.remaining_qty > 0) {
      setPositions(prev => [{
        orderId: result.order_id!,
        side,
        price,
        quantity: result.remaining_qty + result.filled_qty,
        filledQty: result.filled_qty,
        remainingQty: result.remaining_qty,
        timestamp: new Date(),
      }, ...prev]);
    }
  }, []);

  const handleBotOrder = useCallback((result: FillResponse, side: 'Buy' | 'Sell') => {
    if (result.fills.length > 0) {
      const newTrades: Trade[] = result.fills.map(fill => ({
        price: fill.price,
        qty: fill.qty,
        side: side.toLowerCase() as 'buy' | 'sell',
        time: new Date(),
      }));
      setTrades(prev => [...newTrades, ...prev].slice(0, 100));
    }
  }, []);

  const handlePositionClosed = useCallback((orderId: number) => {
    setPositions(prev => prev.filter(p => p.orderId !== orderId));
  }, []);

  const lastPrice = depth && depth.bids.length > 0 && depth.asks.length > 0
    ? (Math.max(...depth.bids.map(([p]) => p)) + Math.min(...depth.asks.map(([p]) => p))) / 2
    : 0;

  if (!mounted) {
    return (
      <div className="h-screen bg-zinc-950 flex items-center justify-center" suppressHydrationWarning>
        <div className="text-zinc-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-zinc-950 grid-pattern p-3 overflow-hidden" suppressHydrationWarning>
      <div className="h-full grid grid-cols-[1fr_300px] gap-3">

        {/* LEFT SIDE */}
        <div className="h-full grid grid-rows-[56px_1fr_200px] gap-3 overflow-hidden">

          {/* Market Header - Fixed small height */}
          <MarketHeader isConnected={isConnected} lastPrice={lastPrice} />

          {/* Main Trading Area - Takes most space */}
          <div className="grid grid-cols-[1fr_240px_240px] gap-3 overflow-hidden">
            <CandlestickChart
              bids={depth?.bids || []}
              asks={depth?.asks || []}
              candleIntervalMs={5000}
            />
            <OrderBook depth={depth} isLoading={isLoading} />
            <TradesPanel trades={trades} />
          </div>

          {/* Open Positions - Fixed small height at bottom */}
          <OpenPositions
            positions={positions}
            onPositionClosed={handlePositionClosed}
          />
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="h-full grid grid-rows-[1fr_auto] gap-3 overflow-hidden">
          {/* Place Order - Takes available space */}
          <OrderForm onOrderCreated={handleOrderCreated} />

          {/* Trading Bot - Auto height */}
          <TradingBotPanel onOrderPlaced={handleBotOrder} />
        </div>

      </div>
    </div>
  );
}
