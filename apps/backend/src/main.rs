use std::sync::RwLock;

use actix_cors::Cors;
use actix_web::{App, HttpServer, web, middleware};

use crate::{
    orderbook::Orderbook,
    routes::{create_order, delete_order, get_depth, health_check},
    websocket::{websocket_handler, DepthBroadcaster},
};

pub mod inputs;
pub mod orderbook;
pub mod output;
pub mod routes;
pub mod websocket;

// Shared state accessible from routes
pub struct AppState {
    pub orderbook: RwLock<Orderbook>,
    pub broadcaster: DepthBroadcaster,
}

#[actix_web::main]
async fn main() -> Result<(), std::io::Error> {
    println!("🚀 Starting Superdevs Orderbook API");
    println!("   REST API: http://127.0.0.1:8080");
    println!("   WebSocket: ws://127.0.0.1:8080/ws");

    // Create shared state with broadcaster
    let broadcaster = DepthBroadcaster::new();
    let app_state = web::Data::new(AppState {
        orderbook: RwLock::new(Orderbook::new()),
        broadcaster: broadcaster.clone(),
    });

    // Also share broadcaster separately for WebSocket handler
    let broadcaster_data = web::Data::new(broadcaster);

    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .max_age(3600);

        App::new()
            .wrap(cors)
            .wrap(middleware::Logger::default())
            .app_data(app_state.clone())
            .app_data(broadcaster_data.clone())
            // REST endpoints
            .service(health_check)
            .service(create_order)
            .service(delete_order)
            .service(get_depth)
            // WebSocket endpoint
            .route("/ws", web::get().to(websocket_handler))
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
