use actix_web::{App, HttpResponse, HttpServer, Responder, delete, get, post, web};

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

#[post("/order")]
async fn create_order() -> impl Responder {
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
