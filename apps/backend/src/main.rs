use std::sync::RwLock;

use actix_cors::Cors;
use actix_web::{App, HttpServer, web, middleware};

use crate::{
    orderbook::Orderbook,
    routes::{create_order, delete_order, get_depth, health_check},
};

pub mod inputs;
pub mod orderbook;
pub mod output;
pub mod routes;

#[actix_web::main]
async fn main() -> Result<(), std::io::Error> {
    println!("🚀 Starting Superdevs Orderbook API on http://127.0.0.1:8080");

    // Using RwLock for better read performance (multiple readers, single writer)
    let orderbook = web::Data::new(RwLock::new(Orderbook::new()));

    HttpServer::new(move || {
        // CORS configuration - allow frontend to call backend
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .max_age(3600);

        App::new()
            .wrap(cors)  // Enable CORS
            .wrap(middleware::Logger::default())  // Request logging
            .app_data(orderbook.clone())
            .service(health_check)
            .service(create_order)
            .service(delete_order)
            .service(get_depth)
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
