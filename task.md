# Orderbook API - Learning Tasks

## Current State
You have a basic Actix-web server with:
- Orderbook struct with bids/asks HashMaps
- Routes defined but **not connected** to the orderbook
- Input/Output types defined

---

## Phase 1: Connect Routes to Orderbook (Core Functionality)

### [ ] 1.1 Fix State Injection in Routes
**Problem**: Routes don't have access to the orderbook singleton  
**What to learn**: Actix-web's `web::Data` extractor pattern  
**Hint**: Look at how you're passing `orderbook.clone()` in `main.rs` vs how routes receive it

### [ ] 1.2 Implement `create_order` Route
**Problem**: Route prints the order but doesn't add it to the orderbook  
**What to do**: Extract orderbook from app state, lock mutex, call `orderbook.create_order()`  
**Return**: Actual order_id (not hardcoded "hello")

### [ ] 1.3 Implement `get_depth` Route  
**Problem**: `get_depth()` in orderbook returns `self` but route expects `Depth` struct  
**What to do**: Transform HashMap data into `Vec<[u32; 2]>` format (price, total_qty)  
**Binance format**: `[[price, qty], [price, qty], ...]` sorted by price

### [ ] 1.4 Implement `delete_order` Route
**Problem**: Currently returns hardcoded values  
**What to do**: Find and remove order from bids/asks by order_id  
**Challenge**: order_id is String in input but u32 in orderbook - pick one

---

## Phase 2: Fix Data Model Issues

### [ ] 2.1 Order ID Type Consistency
**Problem**: `DeleteOrder.order_id` is `String`, but `UserOrder.order_id` is `u32`  
**Decision**: Pick one and be consistent throughout

### [ ] 2.2 Add Order Lookup Index
**Problem**: Finding an order to delete requires scanning all prices in both bids and asks  
**What to learn**: Secondary indexes - `HashMap<order_id, (price, side)>`

### [ ] 2.3 Return Order ID from Create
**Problem**: `create_order()` doesn't return the generated order_id  
**What to do**: Modify function signature to return `u32`

---

## Phase 3: Order Matching Engine (The Real Challenge)

### [ ] 3.1 Basic Matching Logic
**What happens now**: Orders just sit in the book  
**What should happen**: Buy order at 100 should match with sell orders ≤ 100  
**Concepts**: Price-time priority, partial fills

### [ ] 3.2 Fill or Kill / Immediate or Cancel
**Different order types**:
- `Limit`: Sit in book until matched
- `IOC`: Match what you can, cancel the rest  
- `FOK`: Match entirely or cancel entirely

### [ ] 3.3 Track Filled Quantity
**For `delete_order`**: Return how much was filled before cancellation

---

## Phase 4: Production Readiness

### [ ] 4.1 Proper Error Handling
**Current state**: Everything returns `HttpResponse::Ok()`  
**What to learn**: Custom error types, `Result` in handlers, proper HTTP status codes

### [ ] 4.2 Input Validation
- Price must be > 0
- Quantity must be > 0  
- User ID validation

### [ ] 4.3 Concurrency Considerations
**Current**: `Arc<Mutex<Orderbook>>` blocks entire orderbook on any operation  
**Better options**:
- `RwLock` for read-heavy workloads (get_depth)
- Lock-free data structures
- Sharding by price range

### [ ] 4.4 WebSocket Price Feed
**Why**: REST polling for depth is inefficient  
**What to learn**: `actix-web-actors` for WebSocket, broadcast channels

---

## Comparison to Anubis (Your Previous Project)

| Anubis (HTTP Server) | Superdevs (Orderbook API) |
|---------------------|---------------------------|
| Raw TCP, manual parsing | Actix-web framework |
| Stateless requests | Stateful (orderbook in memory) |
| `Arc<Mutex<>>` for shutdown | `Arc<Mutex<>>` for shared state |
| Request → Response | Request → Mutate State → Response |

**New concepts to learn**:
- Web framework patterns (extractors, middleware)
- Shared mutable state across requests
- Domain modeling (orderbook is a complex data structure)
- Real-time updates (WebSockets)

---

## Suggested Order
1. Start with **1.1** (state injection) - this unblocks everything else
2. Then **1.2** (create_order) - verify orders get added
3. Then **1.3** (get_depth) - see your orders in the book
4. Fix **2.3** first if create_order is annoying without return value

---

## Phase 5: Frontend Trading UI

> **Prerequisite**: Complete Phases 1-4 first. The frontend needs a working API.

### Overview

Build a real-time trading interface that visualizes the orderbook and allows placing/canceling orders.

```
┌─────────────────────────────────────────────────────────────────┐
│  SUPERDEVS EXCHANGE                              SOL-USD        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   📊 ORDER BOOK          │  📝 PLACE ORDER    │  📋 MY ORDERS   │
│  ─────────────────       │  ──────────────    │  ─────────────  │
│  🔴 105.00 |████  50     │  ○ Buy  ● Sell     │  #123 Buy 10    │
│  🔴 104.00 |██    25     │                    │  #122 Sell 5    │
│  🔴 103.00 |██████ 100   │  Price: [____]     │                 │
│  ─── spread: 3.00 ───    │  Qty:   [____]     │  [ Cancel All ] │
│  🟢 100.00 |███   30     │                    │                 │
│  🟢 99.00  |█████ 45     │  [Place Order]     │                 │
│  🟢 98.00  |██    20     │                    │                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### [ ] 5.1 Project Setup
**Tech Stack**: React + Vite + TypeScript  
**Why**: Fast dev server, type safety, you'll learn modern frontend tooling

```bash
# In project root
npx create-vite@latest frontend --template react-ts
cd frontend && npm install
```

**Folder Structure**:
```
frontend/
├── src/
│   ├── components/
│   │   ├── OrderBook.tsx       # Bids/asks visualization
│   │   ├── OrderForm.tsx       # Place order form
│   │   ├── MyOrders.tsx        # User's active orders
│   │   └── Header.tsx          # Nav, symbol display
│   ├── hooks/
│   │   ├── useOrderBook.ts     # Fetch/subscribe to depth
│   │   └── useWebSocket.ts     # WS connection (Phase 5.5)
│   ├── api/
│   │   └── client.ts           # REST API calls
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces
│   └── App.tsx
└── package.json
```

---

### [ ] 5.2 API Client & Types
**What to build**: Type-safe API client matching your Rust types

```typescript
// types/index.ts
interface Order {
  price: number;
  qty: number;
  user_id: number;
  side: 'Buy' | 'Sell';
}

interface Depth {
  bids: [number, number][];  // [price, qty][]
  asks: [number, number][];
  lastUpdateId: string;
}

// api/client.ts
const API_BASE = 'http://localhost:8080';

export const api = {
  getDepth: () => fetch(`${API_BASE}/depth`).then(r => r.json()),
  createOrder: (order: Order) => fetch(`${API_BASE}/order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  }).then(r => r.json()),
  deleteOrder: (orderId: string) => fetch(`${API_BASE}/order`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order_id: orderId }),
  }).then(r => r.json()),
};
```

**Backend change needed**: Add CORS headers in Actix-web

---

### [ ] 5.3 OrderBook Component
**The visual heart of the app**

**Features**:
- Display asks (red) sorted descending by price
- Display bids (green) sorted descending by price
- Show depth bars (visual representation of quantity)
- Highlight spread between best bid and best ask

**Learning points**:
- Sorting and transforming data for display
- CSS for color-coded rows
- Responsive bar widths based on max quantity

---

### [ ] 5.4 Order Form Component
**Place buy/sell orders**

**Features**:
- Toggle between Buy/Sell (changes submit button color)
- Price input (numeric)
- Quantity input (numeric)
- Submit calls `api.createOrder()`
- Success/error feedback

**UX considerations**:
- Disable button while request pending
- Clear form on success
- Show toast notification

---

### [ ] 5.5 Real-time Updates (WebSocket)
**Prerequisite**: Complete task 4.4 (WebSocket backend)

**What to build**:
```typescript
// hooks/useWebSocket.ts
export function useOrderBook() {
  const [depth, setDepth] = useState<Depth | null>(null);
  
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080/ws');
    ws.onmessage = (event) => {
      setDepth(JSON.parse(event.data));
    };
    return () => ws.close();
  }, []);
  
  return depth;
}
```

**Backend broadcasts** orderbook changes after every trade/order

---

### [ ] 5.6 Styling & Polish
**Make it look like a real exchange**

**Design system**:
- Dark theme (easier on eyes for trading)
- Monospace font for numbers (alignment)
- Red/green color scheme for sell/buy
- Subtle animations on orderbook updates

**CSS approach**: CSS Modules or vanilla CSS (keep it simple)

---

### Frontend Implementation Order

1. **5.1** Setup project → get React running
2. **5.2** API client → test with curl replacement
3. **5.3** OrderBook → see the depth visually
4. **5.4** OrderForm → place orders from UI
5. **5.6** Styling → make it beautiful
6. **5.5** WebSocket → real-time updates (after backend supports it)

---

### Frontend vs Backend Comparison

| Backend (Rust) | Frontend (React) |
|----------------|------------------|
| `struct Depth` | `interface Depth` |
| `serde::Serialize` | `JSON.stringify()` |
| `HttpResponse::Ok().json()` | `fetch().then(r => r.json())` |
| `Arc<Mutex<>>` for state | `useState()` for state |
| actix-web-actors WebSocket | browser `WebSocket` API |
