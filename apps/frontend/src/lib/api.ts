// API Client for Superdevs Orderbook

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface Order {
  price: number;
  qty: number;
  user_id: number;
  side: 'Buy' | 'Sell';
}

export interface Fill {
  price: number;
  qty: number;
  maker_order_id: number;
}

export interface FillResponse {
  order_id: number | null;
  fills: Fill[];
  filled_qty: number;
  remaining_qty: number;
}

export interface Depth {
  bids: [number, number][];
  asks: [number, number][];
  lastUpdateId: string;
}

export interface DeleteOrderResponse {
  filled_qty: number;
  average_price: number;
}

export interface ApiError {
  error: string;
}

class OrderbookAPI {
  async getDepth(): Promise<Depth> {
    const res = await fetch(`${API_BASE}/depth`);
    if (!res.ok) throw new Error('Failed to fetch depth');
    return res.json();
  }

  async createOrder(order: Order): Promise<FillResponse> {
    const res = await fetch(`${API_BASE}/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    
    if (!res.ok) {
      const error: ApiError = await res.json();
      throw new Error(error.error);
    }
    
    return res.json();
  }

  async deleteOrder(orderId: string): Promise<DeleteOrderResponse> {
    const res = await fetch(`${API_BASE}/order`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderId }),
    });
    
    if (!res.ok) {
      const error: ApiError = await res.json();
      throw new Error(error.error);
    }
    
    return res.json();
  }

  async healthCheck(): Promise<{ status: string; service: string }> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('API is down');
    return res.json();
  }
}

export const api = new OrderbookAPI();
