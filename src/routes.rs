use std::vec;

use actix_web::{HttpResponse, Responder, delete, get, post, web::Json};

use crate::{
    inputs::{CreateOrderInput, DeleteOrder},
    output::{CreateOrderResponse, DeleteOrderResponse, Depth},
};

#[post("/order")]
async fn create_order(Json(body): Json<CreateOrderInput>) -> impl Responder {
    println!("Create order: {:?}", body);

    // get the data
    let price = body.price;
    let qty = body.qty;
    let user_id = body.user_id;
    let side = &body.side;

    // do whatever the fuck you want i don't care

    // maintain orderbook logic
    HttpResponse::Ok().json(CreateOrderResponse {
        order_id: String::from("hello"),
    })
}

#[delete("/order")]
async fn delete_order(Json(body): Json<DeleteOrder>) -> impl Responder {
    let order_id = body.order_id;
    HttpResponse::Ok().json(DeleteOrderResponse {
        filled_qty: 0,
        average_price: 100,
    })
}

#[get("/depth")]
async fn get_depth() -> impl Responder {
    HttpResponse::Ok().json(Depth {
        asks: vec![],
        bids: vec![],
        lastUpdateId: String::from("depth"),
    })
}

// destructuring logic

// body: Json<CreateOrderInput> NOTE : if you have the this the way of getting the data from body is
// let user_id : body.0.user_id   --> Due to a un named struct

// Json(body): Json<CreateOrderInput> NOTE : if you have done this you don't have to do the ) logic
// let user_id : body.user_id
