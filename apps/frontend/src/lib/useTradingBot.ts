'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { api, Order, FillResponse } from '@/lib/api';

interface BotConfig {
  minPrice: number;
  maxPrice: number;
  minQty: number;
  maxQty: number;
  intervalMs: number;
}

const DEFAULT_CONFIG: BotConfig = {
  minPrice: 90,
  maxPrice: 110,
  minQty: 1,
  maxQty: 20,
  intervalMs: 1000,
};

export function useTradingBot(onOrderPlaced?: (result: FillResponse, side: 'Buy' | 'Sell') => void) {
  const [isRunning, setIsRunning] = useState(false);
  const [orderCount, setOrderCount] = useState(0);
  const [config, setConfig] = useState<BotConfig>(DEFAULT_CONFIG);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const userIdRef = useRef(Math.floor(Math.random() * 1000) + 100); // Random bot user ID
  
  // Volatility state
  const momentumRef = useRef<number>(0); // Price momentum tracker
  const lastPriceRef = useRef<number>(100); // Last traded price
  const burstModeRef = useRef<boolean>(false); // Burst trading mode

  const placeRandomOrder = useCallback(async () => {
    try {
      // 20% chance to enter burst mode (multiple rapid orders)
      if (Math.random() < 0.2 && !burstModeRef.current) {
        burstModeRef.current = true;
        const burstCount = Math.floor(Math.random() * 3) + 2; // 2-4 orders
        for (let i = 0; i < burstCount; i++) {
          setTimeout(() => placeRandomOrder(), i * 100);
        }
        setTimeout(() => { burstModeRef.current = false; }, burstCount * 100 + 500);
      }

      // Random side with slight bias based on momentum
      const momentumBias = momentumRef.current > 0 ? 0.6 : 0.4;
      const side: 'Buy' | 'Sell' = Math.random() > momentumBias ? 'Buy' : 'Sell';
      
      // Calculate volatile price with momentum swings
      const midPrice = (config.minPrice + config.maxPrice) / 2;
      const priceRange = config.maxPrice - config.minPrice;
      
      // Add momentum-based price drift (±10% of range)
      const momentumDrift = momentumRef.current * priceRange * 0.1;
      
      // Random price with wider spread for volatility
      const spreadFactor = 0.3 + Math.random() * 0.7; // 30-100% of range
      const randomOffset = (Math.random() - 0.5) * priceRange * spreadFactor;
      
      let price = Math.floor(midPrice + randomOffset + momentumDrift);
      
      // Clamp to min/max
      price = Math.max(config.minPrice, Math.min(config.maxPrice, price));
      
      // Update momentum (random walk with mean reversion)
      momentumRef.current = momentumRef.current * 0.7 + (Math.random() - 0.5) * 0.5;
      momentumRef.current = Math.max(-1, Math.min(1, momentumRef.current));
      
      // Larger quantity variations for more volatility
      const qtyRange = config.maxQty - config.minQty;
      // Sometimes make very large or very small orders
      const qtyBias = Math.random() < 0.3 ? 2 : 1; // 30% chance of 2x qty
      const qty = Math.floor(
        config.minQty + Math.random() * qtyRange * qtyBias
      );

      const order: Order = {
        price,
        qty: Math.min(qty, config.maxQty), // Don't exceed max
        user_id: userIdRef.current,
        side,
      };

      console.log(`🤖 Bot placing ${side} order: ${order.qty} @ $${price} (momentum: ${momentumRef.current.toFixed(2)})`);
      
      const result = await api.createOrder(order);
      setOrderCount(prev => prev + 1);
      
      lastPriceRef.current = price;
      
      if (onOrderPlaced) {
        onOrderPlaced(result, side);
      }
    } catch (err) {
      console.error('Bot order failed:', err);
    }
  }, [config, onOrderPlaced]);

  const start = useCallback(() => {
    if (isRunning) return;
    
    setIsRunning(true);
    console.log('🤖 Trading bot started');
    
    // Place first order immediately
    placeRandomOrder();
    
    // Then continue at interval
    intervalRef.current = setInterval(placeRandomOrder, config.intervalMs);
  }, [isRunning, placeRandomOrder, config.intervalMs]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    console.log('🤖 Trading bot stopped');
  }, []);

  const reset = useCallback(() => {
    stop();
    setOrderCount(0);
  }, [stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isRunning,
    orderCount,
    config,
    setConfig,
    start,
    stop,
    reset,
  };
}
