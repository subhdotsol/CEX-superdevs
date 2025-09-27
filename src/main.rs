use actix_web::{
    App, HttpResponse, HttpServer, Responder, delete, get, post,
    web::{self, Json},
};
use serde::{Deserialize, Serialize};

#[get("/")]
async fn hello() -> impl Responder {
    HttpResponse::Ok().body("Hello, world!")
}

async fn manual_hello() -> impl Responder {
    HttpResponse::Ok().body("Hey there!")
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .service(create_order)
            .service(delete_order)
            .service(get_depth)
            .route("/hey", web::get().to(manual_hello))
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}

// For taking inputs
#[derive(Serialize, Deserialize, Debug)]
struct CreateOrderInput {
    price: u32,
    qty: u32,
    user_id: u32,
    side: Side,
}

#[derive(Serialize, Deserialize, Debug)]
enum Side {
    Buy,
    Sell,
}

#[post("/order")]
async fn create_order(body: Json<CreateOrderInput>) -> impl Responder {
    println!("Create order: {:?}", body);
    "create order"
}

#[delete("/order")]
async fn delete_order() -> impl Responder {
    "delete order"
}

#[get("/depth")]
async fn get_depth() -> impl Responder {
    "get depth"
}
