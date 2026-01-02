// WebSocket handler for real-time orderbook updates
//
// Key Concepts:
// 1. Actor - An isolated unit that handles messages (like a mini-thread)
// 2. WebSocket - Persistent connection for real-time data
// 3. Broadcast - Send updates to ALL connected clients

use actix::{Actor, StreamHandler, AsyncContext, Handler, Message, ActorContext};
use actix_web::{web, HttpRequest, HttpResponse, Error};
use actix_web_actors::ws;
use tokio::sync::broadcast;

use crate::output::Depth;

// ============================================================
// MESSAGES
// ============================================================

/// Message sent to WebSocket actors when orderbook changes
#[derive(Message, Clone)]
#[rtype(result = "()")]
pub struct DepthUpdate(pub Depth);

// ============================================================
// WEBSOCKET ACTOR
// ============================================================

/// Each WebSocket connection gets its own actor instance
pub struct OrderbookWs {
    /// Receiver for broadcast updates
    broadcast_rx: broadcast::Receiver<Depth>,
}

impl OrderbookWs {
    pub fn new(broadcast_rx: broadcast::Receiver<Depth>) -> Self {
        Self { broadcast_rx }
    }
}

/// Actor trait implementation - lifecycle methods
impl Actor for OrderbookWs {
    type Context = ws::WebsocketContext<Self>;

    /// Called when actor starts (client connects)
    fn started(&mut self, ctx: &mut Self::Context) {
        println!("🔌 WebSocket client connected");

        // Clone the receiver for the async task
        let mut rx = self.broadcast_rx.resubscribe();
        let addr = ctx.address();

        // Spawn a task to listen for broadcast updates
        // When orderbook changes, this receives the update and sends to client
        actix::spawn(async move {
            while let Ok(depth) = rx.recv().await {
                // Send to WebSocket actor
                addr.do_send(DepthUpdate(depth));
            }
        });
    }

    fn stopped(&mut self, _ctx: &mut Self::Context) {
        println!("🔌 WebSocket client disconnected");
    }
}

/// Handle incoming WebSocket messages from client
impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for OrderbookWs {
    fn handle(&mut self, msg: Result<ws::Message, ws::ProtocolError>, ctx: &mut Self::Context) {
        match msg {
            Ok(ws::Message::Ping(msg)) => ctx.pong(&msg),
            Ok(ws::Message::Text(text)) => {
                println!("📥 Received: {}", text);
                // For now, just echo back
                // Could add commands like "subscribe:depth"
                ctx.text(format!("Echo: {}", text));
            }
            Ok(ws::Message::Close(reason)) => {
                ctx.close(reason);
                ctx.stop();
            }
            _ => (),
        }
    }
}

/// Handle depth updates from broadcast channel
impl Handler<DepthUpdate> for OrderbookWs {
    type Result = ();

    fn handle(&mut self, msg: DepthUpdate, ctx: &mut Self::Context) {
        // Serialize depth and send to client
        let json = serde_json::json!({
            "type": "depth",
            "data": msg.0
        });
        ctx.text(json.to_string());
    }
}

// ============================================================
// BROADCAST MANAGER
// ============================================================

/// Shared broadcast sender for all WebSocket connections
#[derive(Clone)]
pub struct DepthBroadcaster {
    tx: broadcast::Sender<Depth>,
}

impl DepthBroadcaster {
    pub fn new() -> Self {
        // Create broadcast channel with capacity of 100 messages
        let (tx, _rx) = broadcast::channel(100);
        Self { tx }
    }

    /// Broadcast depth update to all connected WebSocket clients
    pub fn broadcast(&self, depth: Depth) {
        // Ignore error if no receivers (no clients connected)
        let _ = self.tx.send(depth);
    }

    /// Get a new receiver for a WebSocket connection
    pub fn subscribe(&self) -> broadcast::Receiver<Depth> {
        self.tx.subscribe()
    }
}

// ============================================================
// ROUTE HANDLER
// ============================================================

/// HTTP upgrade handler for WebSocket connections
pub async fn websocket_handler(
    req: HttpRequest,
    stream: web::Payload,
    broadcaster: web::Data<DepthBroadcaster>,
) -> Result<HttpResponse, Error> {
    println!("🔌 WebSocket upgrade request");
    
    // Create new actor with a broadcast receiver
    let ws = OrderbookWs::new(broadcaster.subscribe());
    
    // Upgrade HTTP connection to WebSocket
    ws::start(ws, &req, stream)
}
