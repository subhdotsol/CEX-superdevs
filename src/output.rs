use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct CreateOrderResponse {
    pub order_id: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct DeleteOrderResponse {
    pub filled_qty: u32,
    pub average_price: u32,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Depth {
    pub last_update_id: String,
    pub bids: Vec<[u32; 2]>,
    pub asks: Vec<[u32; 2]>,
}
