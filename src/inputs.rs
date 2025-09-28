use serde::{Deserialize, Serialize};

// For taking inputs
#[derive(Serialize, Deserialize, Debug)]
pub struct CreateOrderInput {
    pub price: u32,
    pub qty: u32,
    pub user_id: u32,
    pub side: Side,
}

#[derive(Serialize, Deserialize, Debug)]
pub enum Side {
    Buy,
    Sell,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct DeleteOrder {
    pub order_id: String,
}
