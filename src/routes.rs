use actix_web::{HttpResponse, Responder, delete, get, post, web::Json};

use crate::{inputs::CreateOrderInput, output::CreateOrderResponse};

#[post("/order")]
async fn create_order(body: Json<CreateOrderInput>) -> impl Responder {
    println!("Create order: {:?}", body);

    // get the data
    let price = body.0.price;
    let qty = body.0.qty;
    let user_id = body.0.user_id;
    let side = &body.0.side;

    // do whatever the fuck you want i don't care

    // maintain orderbook logic
    HttpResponse::Ok().json(CreateOrderResponse {
        order_id: String::from("hello"),
    })
}

#[delete("/order")]
async fn delete_order() -> impl Responder {
    "delete order"
}

#[get("/depth")]
async fn get_depth() -> impl Responder {
    "get depth"
}
