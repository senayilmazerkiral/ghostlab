# E-Commerce REST API

Java ve Spring Boot kullanılarak geliştirilmiş bir e-ticaret REST API projesidir.

## Technologies

- Java
- Spring Boot
- Spring Data JPA
- Spring Security
- JWT
- PostgreSQL
- Hibernate
- Maven

## Features

### Authentication

- JWT ile kullanıcı girişi
- BCrypt ile şifrelerin güvenli şekilde saklanması
- USER ve ADMIN rolleri
- Role-based authorization

### User Management

- Kullanıcı oluşturma
- Kullanıcı listeleme
- Kullanıcı bilgisi görüntüleme
- Kullanıcı güncelleme
- Kullanıcı silme

### Category Management

- Kategori oluşturma
- Kategori listeleme
- Kategori görüntüleme
- Kategori güncelleme
- Kategori silme

### Product Management

- Ürün oluşturma
- Ürün listeleme
- Ürün görüntüleme
- Ürün güncelleme
- Ürün silme
- Ürün adına göre arama
- Kategoriye göre filtreleme
- Fiyat aralığına göre filtreleme
- Pagination
- Sorting

### Order Management

- Sipariş oluşturma
- Sipariş listeleme
- Sipariş detaylarını görüntüleme
- Sipariş toplam fiyatı hesaplama
- Sipariş oluşturulduğunda stok düşürme
- Sipariş onaylama
- Sipariş iptal etme
- Sipariş iptal edildiğinde stoğu geri yükleme

## API Endpoints

### Authentication

POST /auth/login

### Users

GET /users

GET /users/{id}

POST /users

PUT /users/{id}

DELETE /users/{id}

### Categories

GET /categories

GET /categories/{id}

POST /categories

PUT /categories/{id}

DELETE /categories/{id}

### Products

GET /products

GET /products/{id}

POST /products

PUT /products/{id}

DELETE /products/{id}

### Orders

GET /orders

GET /orders/{id}

POST /orders

PUT /orders/{id}/status

## Database

PostgreSQL kullanılmaktadır.

Database:

ecommerce

## Running the Application

Projeyi çalıştırmak için PostgreSQL'in çalışıyor olması gerekir.

Daha sonra IntelliJ üzerinden Spring Boot uygulaması çalıştırılabilir.

API:

http://localhost:8080

## Security

API üzerinde JWT authentication kullanılmaktadır.

Korumalı endpointlere erişmek için:

Authorization: Bearer <JWT_TOKEN>

formatında token gönderilmelidir.

ADMIN işlemleri yalnızca ADMIN rolüne sahip kullanıcılar tarafından gerçekleştirilebilir.