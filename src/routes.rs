use std::sync::RwLock;

use actix_web::{HttpResponse, Responder, delete, get, post, web};

use crate::{
    inputs::{CreateOrderInput, DeleteOrder},
    orderbook::Orderbook,
    output::DeleteOrderResponse,
};

// Type alias - now using RwLock for better read performance
type OrderbookData = web::Data<RwLock<Orderbook>>;

// ============================================================
// ERROR RESPONSE HELPER
// ============================================================

fn error_response(status: actix_web::http::StatusCode, message: &str) -> HttpResponse {
    HttpResponse::build(status).json(serde_json::json!({
        "error": message
    }))
}

fn bad_request(message: &str) -> HttpResponse {
    error_response(actix_web::http::StatusCode::BAD_REQUEST, message)
}

fn not_found(message: &str) -> HttpResponse {
    error_response(actix_web::http::StatusCode::NOT_FOUND, message)
}

// ============================================================
// INPUT VALIDATION
// ============================================================

fn validate_create_order(input: &CreateOrderInput) -> Result<(), String> {
    if input.price == 0 {
        return Err("Price must be greater than 0".to_string());
    }
    if input.qty == 0 {
        return Err("Quantity must be greater than 0".to_string());
    }
    if input.user_id == 0 {
        return Err("User ID must be greater than 0".to_string());
    }
    Ok(())
}

// ============================================================
// ROUTES
// ============================================================

#[post("/order")]
pub async fn create_order(
    orderbook: OrderbookData,
    web::Json(body): web::Json<CreateOrderInput>,
) -> impl Responder {
    println!("Create order: {:?}", body);

    // Validate input
    if let Err(msg) = validate_create_order(&body) {
        return bad_request(&msg);
    }

    // Lock the orderbook (write lock) and create the order
    let mut book = orderbook.write().unwrap();
    let result = book.create_order(body.price, body.qty, body.user_id, body.side);

    HttpResponse::Created().json(result)  // 201 Created for new orders
}

#[delete("/order")]
pub async fn delete_order(
    orderbook: OrderbookData,
    web::Json(body): web::Json<DeleteOrder>,
) -> impl Responder {
    // Validate and parse order_id
    if body.order_id.is_empty() {
        return bad_request("Order ID is required");
    }

    let order_id: u32 = match body.order_id.parse() {
        Ok(id) => id,
        Err(_) => return bad_request("Invalid order_id format - must be a number"),
    };

    // Write lock for deletion
    let mut book = orderbook.write().unwrap();
    match book.delete_order(order_id) {
        Some(_order) => HttpResponse::Ok().json(DeleteOrderResponse {
            filled_qty: 0,
            average_price: 0,
        }),
        None => not_found("Order not found"),
    }
}

#[get("/depth")]
pub async fn get_depth(orderbook: OrderbookData) -> impl Responder {
    // Read lock only - multiple readers can access simultaneously
    let book = orderbook.read().unwrap();
    HttpResponse::Ok().json(book.get_depth())
}

// ============================================================
// HEALTH CHECK
// ============================================================

#[get("/health")]
pub async fn health_check() -> impl Responder {
    HttpResponse::Ok().json(serde_json::json!({
        "status": "ok",
        "service": "superdevs-orderbook"
    }))
}
