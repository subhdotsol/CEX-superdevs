'use client';

import { useState } from 'react';
import { api, Order, FillResponse } from '@/lib/api';

interface OrderFormProps {
    onOrderCreated: (result: FillResponse) => void;
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

        try {
            const order: Order = {
                price: parseFloat(price),
                qty: parseInt(qty, 10),
                user_id: 1, // Hardcoded for demo
                side,
            };

            const result = await api.createOrder(order);
            onOrderCreated(result);

            // Show success message
            if (result.fills.length > 0) {
                setSuccess(`Filled ${result.filled_qty} @ avg ${(result.fills.reduce((sum, f) => sum + f.price * f.qty, 0) / result.filled_qty).toFixed(2)}`);
            } else if (result.order_id !== null) {
                setSuccess(`Order #${result.order_id} placed`);
            }

            // Clear form
            setPrice('');
            setQty('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create order');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-zinc-900 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 text-white">📝 Place Order</h2>

            {/* Buy/Sell Toggle */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => setSide('Buy')}
                    className={`flex-1 py-2 rounded-lg font-semibold transition-all ${side === 'Buy'
                            ? 'bg-green-500 text-white'
                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                        }`}
                >
                    Buy
                </button>
                <button
                    onClick={() => setSide('Sell')}
                    className={`flex-1 py-2 rounded-lg font-semibold transition-all ${side === 'Sell'
                            ? 'bg-red-500 text-white'
                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                        }`}
                >
                    Sell
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Price Input */}
                <div>
                    <label className="block text-zinc-400 text-sm mb-1">Price</label>
                    <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0.00"
                        min="1"
                        step="1"
                        required
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>

                {/* Quantity Input */}
                <div>
                    <label className="block text-zinc-400 text-sm mb-1">Quantity</label>
                    <input
                        type="number"
                        value={qty}
                        onChange={(e) => setQty(e.target.value)}
                        placeholder="0"
                        min="1"
                        step="1"
                        required
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 rounded-lg px-4 py-2 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div className="bg-green-500/20 border border-green-500/50 rounded-lg px-4 py-2 text-green-400 text-sm">
                        {success}
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 rounded-lg font-bold text-white transition-all ${side === 'Buy'
                            ? 'bg-green-600 hover:bg-green-500 disabled:bg-green-800'
                            : 'bg-red-600 hover:bg-red-500 disabled:bg-red-800'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {isSubmitting ? 'Placing...' : `${side} ${qty || '0'} @ ${price || '0'}`}
                </button>
            </form>
        </div>
    );
}
