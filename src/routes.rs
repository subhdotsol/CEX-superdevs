use std::sync::Mutex;

use actix_web::{HttpResponse, Responder, delete, get, post, web};

use crate::{
    inputs::{CreateOrderInput, DeleteOrder},
    orderbook::Orderbook,
    output::{CreateOrderResponse, DeleteOrderResponse},
};

// Type alias for cleaner code
type OrderbookData = web::Data<Mutex<Orderbook>>;

#[post("/order")]
pub async fn create_order(
    orderbook: OrderbookData,
    web::Json(body): web::Json<CreateOrderInput>,
) -> impl Responder {
    println!("Create order: {:?}", body);

    // Lock the orderbook and create the order
    let mut book = orderbook.lock().unwrap();
    let order_id = book.create_order(body.price, body.qty, body.user_id, body.side);

    HttpResponse::Ok().json(CreateOrderResponse {
        order_id: order_id.to_string(),
    })
}

#[delete("/order")]
pub async fn delete_order(
    orderbook: OrderbookData,
    web::Json(body): web::Json<DeleteOrder>,
) -> impl Responder {
    // Parse order_id from string to u32
    let order_id: u32 = match body.order_id.parse() {
        Ok(id) => id,
        Err(_) => {
            return HttpResponse::BadRequest().json(serde_json::json!({
                "error": "Invalid order_id format"
            }))
        }
    };

    let mut book = orderbook.lock().unwrap();
    match book.delete_order(order_id) {
        Some(order) => HttpResponse::Ok().json(DeleteOrderResponse {
            filled_qty: 0, // No matching yet, so nothing filled
            average_price: 0,
        }),
        None => HttpResponse::NotFound().json(serde_json::json!({
            "error": "Order not found"
        })),
    }
}

#[get("/depth")]
pub async fn get_depth(orderbook: OrderbookData) -> impl Responder {
    let book = orderbook.lock().unwrap();
    HttpResponse::Ok().json(book.get_depth())
}
