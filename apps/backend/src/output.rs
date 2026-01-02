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

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Depth {
    pub bids: Vec<[u32; 2]>,
    pub asks: Vec<[u32; 2]>,
    #[serde(rename = "lastUpdateId")]
    pub last_update_id: String,
}


#[derive(Serialize, Deserialize, Debug)]
pub struct Fill {
    pub price: u32,
    pub qty: u32,
    pub maker_order_id: u32,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct FillResponse {
    pub order_id : Option<u32>, // None if fully filled
    pub fills : Vec<Fill>,
    pub filled_qty : u32,
    pub remaining_qty : u32,
}