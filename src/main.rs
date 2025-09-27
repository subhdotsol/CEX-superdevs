use actix_web::{
    App, HttpResponse, HttpServer, Responder, get,
    web::{self},
};

use crate::routes::{create_order, delete_order, get_depth};

pub mod inputs;
pub mod output;
pub mod routes;

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
