use std::sync::{Arc, Mutex};

use actix_web::{
    App, HttpResponse, HttpServer, Responder, get,
    web::{self},
};

use crate::{
    orderbook::Orderbook,
    routes::{create_order, delete_order, get_depth},
};

pub mod inputs;
pub mod orderbook;
pub mod output;
pub mod routes;

#[actix_web::main]
async fn main() -> Result<(), std::io::Error> {
    let orderbook = Arc::new(Mutex::new(Orderbook::new())); // this is how we specify a singleton it could be anything a db instance in our case its a in memory instance 

    HttpServer::new(move || {
        App::new()
            .app_data(orderbook.clone())
            .service(create_order)
            .service(delete_order)
            .service(get_depth)
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
