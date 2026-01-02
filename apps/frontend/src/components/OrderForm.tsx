'use client';

import { useState } from 'react';
import { api, Order, FillResponse } from '@/lib/api';

interface OrderFormProps {
    onOrderCreated: (result: FillResponse, price: number, side: 'Buy' | 'Sell') => void;
}

export function OrderForm({ onOrderCreated }: OrderFormProps) {
    const [side, setSide] = useState<'Buy' | 'Sell'>('Buy');
    const [price, setPrice] = useState('');
    const [qty, setQty] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsSubmitting(true);

        const orderPrice = parseFloat(price);
        const orderSide = side;

        try {
            const order: Order = {
                price: orderPrice,
                qty: parseInt(qty, 10),
                user_id: 1,
                side: orderSide,
            };

            const result = await api.createOrder(order);
            onOrderCreated(result, orderPrice, orderSide);

            if (result.fills.length > 0) {
                const avgPrice = result.fills.reduce((sum, f) => sum + f.price * f.qty, 0) / result.filled_qty;
                setSuccess(`Filled ${result.filled_qty} @ $${avgPrice.toFixed(2)}`);
            } else if (result.order_id !== null) {
                setSuccess(`Order #${result.order_id} placed`);
            }

            setPrice('');
            setQty('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isBuy = side === 'Buy';
    const total = (parseFloat(price) || 0) * (parseInt(qty) || 0);

    return (
        <div className="panel h-full flex flex-col">
            <h2 className="panel-title mb-4">Place Order</h2>

            {/* Buy/Sell Toggle */}
            <div className="flex rounded-lg overflow-hidden border border-zinc-800 mb-4">
                <button
                    onClick={() => setSide('Buy')}
                    className={`flex-1 py-2.5 text-sm font-semibold transition-all ${isBuy
                        ? 'bg-green-500/20 text-green-400 border-b-2 border-green-500'
                        : 'bg-zinc-900/50 text-zinc-500 hover:text-zinc-300'
                        }`}
                >
                    Buy
                </button>
                <button
                    onClick={() => setSide('Sell')}
                    className={`flex-1 py-2.5 text-sm font-semibold transition-all ${!isBuy
                        ? 'bg-red-500/20 text-red-400 border-b-2 border-red-500'
                        : 'bg-zinc-900/50 text-zinc-500 hover:text-zinc-300'
                        }`}
                >
                    Sell
                </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
                {/* Price Input */}
                <div className="mb-3">
                    <label className="block text-zinc-500 text-xs mb-1.5">Price (USDT)</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">$</span>
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="0.00"
                            min="1"
                            step="1"
                            required
                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg pl-7 pr-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                        />
                    </div>
                </div>

                {/* Quantity Input */}
                <div className="mb-3">
                    <label className="block text-zinc-500 text-xs mb-1.5">Quantity (BTC)</label>
                    <input
                        type="number"
                        value={qty}
                        onChange={(e) => setQty(e.target.value)}
                        placeholder="0"
                        min="1"
                        step="1"
                        required
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                    />
                </div>

                {/* Quick Quantity Buttons */}
                <div className="flex gap-2 mb-4">
                    {[25, 50, 75, 100].map((pct) => (
                        <button
                            key={pct}
                            type="button"
                            onClick={() => setQty(String(Math.floor(pct / 10)))}
                            className="flex-1 py-1.5 text-xs text-zinc-500 bg-zinc-900/50 border border-zinc-800 rounded hover:text-cyan-400 hover:border-cyan-500/30 transition-all"
                        >
                            {pct}%
                        </button>
                    ))}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center py-3 border-t border-zinc-800/50 mb-4">
                    <span className="text-zinc-500 text-sm">Total</span>
                    <span className="font-mono text-white">${total.toFixed(2)}</span>
                </div>

                {/* Messages */}
                {error && (
                    <div className="mb-3 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-3 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-xs">
                        {success}
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting || !price || !qty}
                    className={`mt-auto w-full py-3 rounded-lg font-semibold text-sm transition-all ${isBuy
                        ? 'bg-green-500 hover:bg-green-400 text-black disabled:bg-green-500/30'
                        : 'bg-red-500 hover:bg-red-400 text-white disabled:bg-red-500/30'
                        } disabled:cursor-not-allowed`}
                >
                    {isSubmitting ? 'Placing...' : `${side} BTC`}
                </button>
            </form>
        </div>
    );
}
