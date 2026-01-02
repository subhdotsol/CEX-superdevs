# Superdevs CEX 📈

A **full-stack cryptocurrency exchange platform** featuring a high-performance in-memory orderbook matching engine (Rust/Actix) and a real-time trading interface (React/Next.js).

![Trading Platform](https://img.shields.io/badge/Status-Live-success?style=for-the-badge)
![Rust](https://img.shields.io/badge/Rust-1.70+-orange?style=for-the-badge&logo=rust)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)

---

## 🎯 What is This?

A **complete centralized exchange (CEX)** simulation with:
- ⚡ **Real-time orderbook matching** in Rust
- 📊 **Professional trading UI** with live charts
- 🤖 **Automated trading bot** with volatility controls
- 🔄 **WebSocket streaming** for instant updates
- 📈 **Candlestick charts** with zoom & pan
- 💱 **Order management** (limit orders, market orders)

---

## 🚀 Quick Start

### Prerequisites
- [Rust](https://rustup.rs/) (1.70+)
- [Node.js](https://nodejs.org/) (18+)
- [Cargo](https://doc.rust-lang.org/cargo/)

### Backend (Rust Orderbook)
```bash
cd apps/backend
cargo run
# Server runs at http://127.0.0.1:8080
```

### Frontend (Next.js UI)
```bash
cd apps/frontend
npm install
npm run dev
# UI runs at http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) to start trading! 🎉

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     TRADING PLATFORM                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐    WebSocket     ┌──────────────────┐    │
│  │   Frontend   │◀────────────────▶│   Backend        │    │
│  │   (Next.js)  │                  │   (Rust/Actix)   │    │
│  │              │    REST API      │                  │    │
│  │ • Charts     │◀────────────────▶│ • Orderbook      │    │
│  │ • Order Form │                  │ • Matching Logic │    │
│  │ • Trading Bot│                  │ • WebSocket      │    │
│  └──────────────┘                  └──────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Project Structure
```
superdevs/
├── apps/
│   ├── backend/          # Rust orderbook matching engine
│   │   ├── src/
│   │   │   ├── main.rs         # Server & WebSocket setup
│   │   │   ├── orderbook.rs    # Core matching logic
│   │   │   ├── routes.rs       # REST API handlers
│   │   │   ├── inputs.rs       # Request types
│   │   │   └── output.rs       # Response types
│   │   └── Cargo.toml
│   │
│   └── frontend/         # Next.js trading interface
│       ├── src/
│       │   ├── app/
│       │   │   └── page.tsx           # Main trading page
│       │   ├── components/
│       │   │   ├── CandlestickChart.tsx  # Live price chart
│       │   │   ├── TradingChart.tsx      # Depth visualization
│       │   │   ├── OrderBook.tsx         # Bid/ask display
│       │   │   ├── OrderForm.tsx         # Place orders
│       │   │   ├── TradesPanel.tsx       # Recent fills
│       │   │   ├── OpenPositions.tsx     # Active orders
│       │   │   ├── TradingBotPanel.tsx   # Automated trading
│       │   │   └── MarketHeader.tsx      # Price ticker
│       │   └── lib/
│       │       ├── api.ts                # REST client
│       │       ├── useWebSocket.ts       # Real-time data
│       │       └── useTradingBot.ts      # Bot logic
│       └── package.json
```

---

## 🎨 Features

### 📊 **Real-Time Trading Interface**

#### **1. Candlestick Chart**
- **Live price data** updating every 5 seconds
- **Interactive controls**: Zoom (scroll/pinch) and pan (drag)
- **Time interval selection**: 1m, 5m, 15m, 1h, 4h, 1D
- **Visual styling**: Green (up) / Red (down) candlesticks
- Built with [lightweight-charts](https://tradingview.github.io/lightweight-charts/)

#### **2. Order Book**
- **Real-time bid/ask levels** streamed via WebSocket
- **Color-coded depth bars**: Green (bids) / Red (asks)
- **Best bid/ask highlighting**
- **Price aggregation** by level

#### **3. Recent Trades Panel**
- **Live trade feed** with price, quantity, and side
- **Color-coded orders**: Green (buy) / Red (sell)
- **Timestamps** for all fills
- **Auto-scrolling** with newest trades on top

#### **4. Open Positions**
- **Active order tracking** with real-time status
- **Filled/Remaining quantities** display
- **One-click cancellation**
- **Full-width table layout** for readability

#### **5. Order Form**
- **Buy/Sell toggle** with visual feedback
- **Price and quantity inputs**
- **Real-time order placement**
- **Fill notifications** with matched trades

---

### 🤖 **Automated Trading Bot**

The trading bot creates realistic market activity with multiple volatility-inducing strategies:

#### **Features:**
- 🔥 **Volatile Mode**: Ultra-fast 100ms order intervals
- ⚡ **Speed Presets**: Slow (2s) → Normal (1s) → Fast (500ms) → Turbo (200ms) → Volatile (100ms)
- 📈 **Momentum Trading**: Prices drift based on accumulated momentum (±10%)
- 💥 **Burst Mode**: 20% chance of rapid 2-4 order sequences
- 📊 **Dynamic Spreads**: Variable price dispersion (30-100% of range)
- 💰 **Quantity Spikes**: 30% chance of 2x sized orders

#### **Configuration:**
- **Price Range**: 90-110 (default)
- **Quantity Range**: 1-20 units
- **Order Interval**: 100ms - 2000ms
- **Side Bias**: Momentum-driven buy/sell weighting

#### **Usage:**
```typescript
// In the UI:
1. Click "⚙️ Settings" to configure ranges
2. Select speed preset (🔥 Volatile recommended)
3. Click "▶ Start Bot"
4. Watch the market become dynamic!
```

---

### 🔌 **Backend API**

#### **REST Endpoints**

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `POST` | `/order` | Place buy/sell order | `{"price": 100, "qty": 10, "user_id": 1, "side": "Buy"}` |
| `DELETE` | `/order` | Cancel order | `{"order_id": "abc123"}` |
| `GET` | `/depth` | Get orderbook snapshot | N/A |

#### **WebSocket Stream**
- **Endpoint**: `ws://localhost:8080/ws`
- **Updates**: Real-time depth changes on every order match/cancel
- **Format**: JSON with `bids` and `asks` arrays

**Example Response:**
```json
{
  "bids": [[100, 30], [99, 45], [98, 20]],
  "asks": [[105, 50], [104, 25], [103, 100]]
}
```

---

## 🧪 API Examples

### Place Buy Order
```bash
curl -X POST http://localhost:8080/order \
  -H "Content-Type: application/json" \
  -d '{"price": 100, "qty": 10, "user_id": 1, "side": "Buy"}'
```

**Response:**
```json
{
  "order_id": "abc123",
  "filled_qty": 5,
  "remaining_qty": 5,
  "fills": [
    {"price": 100, "qty": 5}
  ]
}
```

### Get Orderbook Depth
```bash
curl http://localhost:8080/depth
```

### Cancel Order
```bash
curl -X DELETE http://localhost:8080/order \
  -H "Content-Type: application/json" \
  -d '{"order_id": "abc123"}'
```

---

## 💻 Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Rust** | Systems programming for performance |
| **Actix-web** | Async web framework |
| **Actix-ws** | WebSocket support |
| **Serde** | JSON serialization |
| **UUID** | Order ID generation |

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework with App Router |
| **TypeScript** | Type-safe development |
| **TailwindCSS** | Utility-first styling |
| **lightweight-charts** | TradingView-quality charts |
| **WebSocket API** | Real-time data streaming |

---

## 🎓 Learning Objectives

This project demonstrates:

### **Backend (Rust)**
1. ✅ **Shared mutable state** with `Arc<Mutex<T>>` for concurrent access
2. ✅ **Order matching algorithms** (price-time priority)
3. ✅ **WebSocket broadcasting** to multiple clients
4. ✅ **RESTful API design** with Actix extractors
5. ✅ **CORS handling** for cross-origin requests

### **Frontend (React/Next.js)**
1. ✅ **Real-time data synchronization** via WebSocket hooks
2. ✅ **Complex state management** across multiple components
3. ✅ **Chart interactivity** (zoom, pan, time intervals)
4. ✅ **Automated trading strategies** (momentum, burst mode)
5. ✅ **Responsive trading UI** with TailwindCSS

---

## 🎮 How to Use

### **Manual Trading**
1. **View the orderbook** (center panel) to see current bids/asks
2. **Enter price and quantity** in the order form (right sidebar)
3. **Click Buy or Sell** to place your order
4. **Watch fills appear** in the Recent Trades panel
5. **Cancel unfilled orders** from the Open Positions table

### **Automated Trading**
1. **Open Trading Bot** settings (⚙️ button)
2. **Configure price range** (e.g., 90-110)
3. **Select speed preset**: 🔥 Volatile for maximum action
4. **Click ▶ Start Bot** and watch the market come alive!
5. **Monitor momentum** in console logs

### **Chart Analysis**
- **Scroll/pinch** to zoom in/out on price action
- **Click and drag** to pan through historical data
- **Switch time intervals** (1m, 5m, 15m, 1h, 4h, 1D)
- **Watch live candles** update every 5 seconds

---

## 🔍 What This Project IS and ISN'T

| ✅ What We Build | ❌ What We DON'T Build |
|-----------------|----------------------|
| In-memory orderbook matching | Real cryptocurrency wallets |
| Real-time price discovery | Blockchain integration |
| Order placement & cancellation | Actual asset settlement |
| Live trading charts | User authentication/KYC |
| WebSocket data streaming | Regulatory compliance |
| Automated trading strategies | Real money handling |

**This is a simulation** — prices and quantities are abstract numbers for learning purposes.

---

## 📚 Core Algorithms

### **Order Matching (Price-Time Priority)**
```
1. New Buy order arrives at price P
2. Check if any Sell orders exist at price ≤ P
3. If yes: Match with best (lowest) ask, FIFO within price level
4. If partial fill: Remaining quantity enters orderbook
5. Repeat until order fully filled or no matches
```

### **Candlestick Generation**
```
1. Aggregate depth updates into 5-second intervals
2. Calculate mid-price: (best_bid + best_ask) / 2
3. Track OHLC (Open, High, Low, Close) per interval
4. Render as candlestick with color based on open vs close
```

### **Bot Volatility Strategy**
```
1. Track momentum (-1 to +1) with random walk
2. Apply momentum drift (±10% of price range)
3. Randomly trigger burst mode (20% chance)
4. Vary quantities with 30% chance of 2x multiplier
5. Bias buy/sell based on current momentum direction
```

---

## 🐛 Status

✅ **Fully Functional** - All core features implemented and tested

**Implemented:**
- [x] Rust orderbook matching engine
- [x] REST API (create, cancel, depth)
- [x] WebSocket real-time updates
- [x] Candlestick chart with zoom/pan
- [x] Time interval selector (1m-1D)
- [x] Order form with buy/sell
- [x] Open positions management
- [x] Recent trades panel
- [x] Trading bot with volatility modes
- [x] Momentum-based price swings
- [x] Burst mode rapid trading

---

## 📝 License

MIT

---

## 🙏 Acknowledgments

Built as a learning project to explore:
- High-performance Rust backend development
- Real-time WebSocket communication
- Professional trading UI/UX patterns
- Orderbook matching algorithms

**Not for production trading.**
