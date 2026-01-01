use crate::{inputs::Side, output::Depth};
use ::std::collections::HashMap;

pub struct Orderbook {
    pub bids: HashMap<u32, Vec<UserOrder>>,
    pub asks: HashMap<u32, Vec<UserOrder>>,
    pub order_id_index: u32,
    // O(1) lookup: order_id -> (price, side)
    pub order_lookup: HashMap<u32, (u32, Side)>,
}

pub struct UserOrder {
    pub user_id: u32,
    pub qty: u32,
    pub order_id: u32,
}

impl Orderbook {
    pub fn new() -> Self {
        Self {
            bids: HashMap::new(),
            asks: HashMap::new(),
            order_id_index: 0,
            order_lookup: HashMap::new(),
        }
    }
}

impl Orderbook {
    pub fn create_order(&mut self, price: u32, quantity: u32, user_id: u32, side: Side) -> u32 {
        let order_id = self.order_id_index;
        self.order_id_index += 1;
        
        let order = UserOrder {
            user_id,
            qty: quantity,
            order_id,
        };

        // Register in index for O(1) lookup later
        self.order_lookup.insert(order_id, (price, side.clone()));

        match side {
            Side::Buy => {
                self.bids.entry(price).or_insert_with(Vec::new).push(order);
            }
            Side::Sell => {
                self.asks.entry(price).or_insert_with(Vec::new).push(order);
            }
        }

        order_id
    }

    pub fn delete_order(&mut self, order_id: u32) -> Option<UserOrder> {
        // O(1) lookup to find price and side
        let (price, side) = self.order_lookup.remove(&order_id)?;

        // Go directly to the right HashMap
        let orders = match side {
            Side::Buy => self.bids.get_mut(&price)?,
            Side::Sell => self.asks.get_mut(&price)?,
        };

        // Find and remove from Vec (still O(n) within the price level, but much smaller n)
        let pos = orders.iter().position(|o| o.order_id == order_id)?;
        Some(orders.remove(pos))
    }

    // convert into a more binance like struct
    pub fn get_depth(&self) -> Depth {
        let mut bids: Vec<[u32; 2]> = Vec::new();
        let mut asks: Vec<[u32; 2]> = Vec::new();

        for (price, orders) in &self.bids {
            let total_qty: u32 = orders.iter().map(|o| o.qty).sum();
            bids.push([*price, total_qty]);
        }

        for (price, orders) in &self.asks {
            let total_qty: u32 = orders.iter().map(|o| o.qty).sum();
            asks.push([*price, total_qty]);
        }

        // Sort: bids descending (highest price first), asks ascending (lowest price first)
        bids.sort_by(|a, b| b[0].cmp(&a[0]));
        asks.sort_by(|a, b| a[0].cmp(&b[0]));

        Depth {
            bids,
            asks,
            lastUpdateId: self.order_id_index.to_string(),
        }
    }
}
