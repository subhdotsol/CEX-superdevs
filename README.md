# Superdevs 📈

A high-performance **in-memory orderbook** built in Rust with Actix-web.

## What is an Orderbook?

An orderbook is the core of any exchange (stocks, crypto, etc.). It's a data structure that:
- Stores **buy orders (bids)** and **sell orders (asks)**
- Groups orders by **price level**
- Matches buyers with sellers when prices cross

```
       ASKS (Sellers)              BIDS (Buyers)
┌─────────────────────────┐  ┌─────────────────────────┐
│ Price: 105  Qty: 50     │  │ Price: 100  Qty: 30     │
│ Price: 104  Qty: 25     │  │ Price: 99   Qty: 45     │
│ Price: 103  Qty: 100    │  │ Price: 98   Qty: 20     │
└─────────────────────────┘  └─────────────────────────┘
         ▲ Spread ▲
```

## Scope: What This Project IS and ISN'T

This is a **standalone matching engine** — the core algorithmic component of an exchange, built for learning purposes.

```
┌─────────────────────────────────────────────────────────────┐
│                      FULL EXCHANGE                          │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────┐   ┌──────────────────┐   ┌───────────────┐  │
│  │  WALLETS   │──▶│  MATCHING ENGINE │──▶│  SETTLEMENT   │  │
│  │            │   │   ⭐ THIS IS US   │   │               │  │
│  │ Real SOL,  │   │                  │   │ Move tokens   │  │
│  │ USDC, BTC  │   │ • Stores orders  │   │ on-chain      │  │
│  │            │   │ • Matches trades │   │               │  │
│  └────────────┘   └──────────────────┘   └───────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

| What we build | What we DON'T build |
|---------------|---------------------|
| Order storage & matching logic | Wallet/deposit system |
| Price-time priority algorithm | Blockchain integration |
| REST API for order management | Real asset settlement |
| In-memory orderbook state | Authentication/KYC |

**No real assets are involved.** Prices and quantities are abstract numbers — this could represent SOL-USDC, BTC-USD, or AAPL stock. The focus is purely on learning how matching engines work.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/order` | Place a new buy/sell order |
| `DELETE` | `/order` | Cancel an existing order |
| `GET` | `/depth` | Get current orderbook depth |

### Create Order
```bash
curl -X POST http://localhost:8080/order \
  -H "Content-Type: application/json" \
  -d '{"price": 100, "qty": 10, "user_id": 1, "side": "Buy"}'
```

### Get Depth
```bash
curl http://localhost:8080/depth
```

### Delete Order
```bash
curl -X DELETE http://localhost:8080/order \
  -H "Content-Type: application/json" \
  -d '{"order_id": "123"}'
```

## Running

```bash
cargo run
# Server starts at http://127.0.0.1:8080
```

## Tech Stack

- **Rust** - Systems programming language
- **Actix-web** - High-performance async web framework
- **Serde** - Serialization/deserialization

## Architecture

```
src/
├── main.rs        # Server setup, orderbook singleton
├── orderbook.rs   # Core orderbook data structure
├── routes.rs      # HTTP route handlers
├── inputs.rs      # Request types (CreateOrder, DeleteOrder)
└── output.rs      # Response types (Depth, OrderResponse)
```

## Learning Goals

This project teaches:
1. **Shared mutable state** across async requests (`Arc<Mutex<T>>`)
2. **Web framework patterns** (extractors, JSON handling)
3. **Domain modeling** (orderbook as a complex data structure)
4. **Order matching algorithms** (price-time priority)

## Status

🚧 **Work in Progress** - See [task.md](./task.md) for current progress

## License

MIT
