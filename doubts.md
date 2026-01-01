# Learnings & Doubts - Superdevs Orderbook

## 1. Why No Tokio?

**Question**: Why aren't we using Tokio for async runtime?

**Answer**: Actix-web uses `actix-rt` which is built on top of Tokio. You don't need to add Tokio as a direct dependency because:
- `actix-rt` is a thin wrapper around Tokio
- `#[actix_web::main]` sets up the runtime automatically
- Actix handles the async configuration for you

You'd add Tokio explicitly if you need:
- `tokio::fs`, `tokio::time`, `tokio::sync` utilities
- More control over runtime configuration
- Background tasks with `tokio::spawn`

---

## 2. Iterator Chain: `iter().map().sum()`

**Question**: What does this line do?
```rust
let total_qty: u32 = orders.iter().map(|o| o.qty).sum();
```

**Answer**: It's a chain of iterator methods:

```rust
orders              // Vec<UserOrder> = [{qty: 10}, {qty: 5}, {qty: 3}]
    .iter()         // → Iterator over &UserOrder
    .map(|o| o.qty) // → Transform each to qty: [10, 5, 3]
    .sum()          // → Add them up: 18
```

| Step | What it does | Output |
|------|--------------|--------|
| `iter()` | Creates an iterator | `[&UserOrder, &UserOrder, ...]` |
| `map(\|o\| o.qty)` | Transform each element | `[10, 5, 3]` |
| `sum()` | Add them all up | `18` |

**Equivalent for-loop**:
```rust
let mut total_qty: u32 = 0;
for order in orders {
    total_qty = total_qty + order.qty;
}
```

The closure `|o|` is an anonymous function - `o` is the input parameter.

---

## 3. Why `web::Data` Instead of `Arc<Mutex<>>`?

**Question**: Why this change?
```rust
// Before
let orderbook = Arc::new(Mutex::new(Orderbook::new()));

// After
let orderbook = web::Data::new(Mutex::new(Orderbook::new()));
```

**Answer**: `web::Data` is Actix-web's wrapper around `Arc`. It enables the **Extractor pattern**:

```rust
// With web::Data - Actix automatically injects this
async fn create_order(orderbook: web::Data<Mutex<Orderbook>>) -> ...

// With Arc - You'd need manual extraction
async fn create_order(req: HttpRequest) -> ... {
    let orderbook = req.app_data::<Arc<Mutex<Orderbook>>>().unwrap();
}
```

| `Arc<Mutex<T>>` | `web::Data<Mutex<T>>` |
|-----------------|----------------------|
| General Rust | Actix-web specific |
| Manual extraction | Automatic injection |
| You manage it | Actix manages it |

Both use `Arc` under the hood. `web::Data` just makes it ergonomic within Actix-web.

---

## 4. O(1) vs O(n) Delete Order

**Question**: Why add an order_index?

**Answer**: Without an index, deleting an order requires scanning ALL orders:

```rust
// O(n) - scan everything
for (price, orders) in self.bids.iter_mut() {
    if let Some(pos) = orders.iter().position(|o| o.order_id == order_id) {
        return Some(orders.remove(pos));
    }
}
```

With an index, we jump directly to the right price level:

```rust
// O(1) lookup + O(m) where m = orders at that price
pub order_lookup: HashMap<u32, (u32, Side)>  // order_id -> (price, side)

let (price, side) = self.order_lookup.remove(&order_id)?;
let orders = match side {
    Side::Buy => self.bids.get_mut(&price)?,
    Side::Sell => self.asks.get_mut(&price)?,
};
```

---

## 5. What is `*price` (Dereference)?

**Question**: Why do we need the `*`?

**Answer**:
```rust
for (price, orders) in &self.bids {
    //  ^ price is &u32 (a reference)
    
    bids.push([*price, total_qty]);
    //         ^ *price dereferences to get u32
}
```

| Expression | Type | Explanation |
|------------|------|-------------|
| `&self.bids` | `&HashMap` | We're borrowing the HashMap |
| `price` | `&u32` | Reference to the key |
| `*price` | `u32` | Dereference to get the actual value |

---

## 6. Sorting Comparators

**Question**: How does `sort_by` work?

**Answer**:
```rust
// Ascending: a comes before b if a < b
asks.sort_by(|a, b| a[0].cmp(&b[0]));  // [100, 101, 102]

// Descending: swap the comparison order
bids.sort_by(|a, b| b[0].cmp(&a[0]));  // [102, 101, 100]
```

| Part | Meaning |
|------|---------|
| `\|a, b\|` | Closure taking two elements |
| `a[0]` | First element (price) |
| `.cmp(&b[0])` | Compare, returns `Less`, `Equal`, or `Greater` |

---

## 7. Array vs Tuple

**Question**: Why `[u32; 2]` instead of `(u32, u32)`?

**Answer**:
```rust
[u32; 2]      // Array: fixed size, used in Binance API format
(u32, u32)    // Tuple: also fixed, but different syntax

// Both serialize to JSON as: [100, 18]
```

Binance API uses arrays for depth data, so we match that format.

---

## 8. What is a Matching Engine?

**Answer**: This project is a **standalone matching engine** — the core algorithmic component of an exchange. It handles:
- Storing buy/sell orders
- Matching trades when prices cross
- Price-time priority

It does NOT handle:
- Real cryptocurrency/money
- Wallets or deposits
- Blockchain settlement
- Authentication

Prices and quantities are abstract numbers for learning purposes.
