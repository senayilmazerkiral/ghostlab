# E-Commerce REST API

A RESTful e-commerce backend application developed with Java and Spring Boot.

The project provides product, category, user, authentication, authorization, and order management features with PostgreSQL database integration.

## Technologies

* Java
* Spring Boot
* Spring Data JPA
* Hibernate
* Spring Security
* JWT
* PostgreSQL
* Maven
* REST API

## Features

### Authentication & Authorization

* JWT-based authentication
* BCrypt password encryption
* USER and ADMIN roles
* Role-based endpoint authorization
* Protected API endpoints
* ADMIN-only product, category, and order management operations

### User Management

* Create user
* Get all users
* Get user by ID
* Update user
* Delete user
* Password encryption with BCrypt

### Category Management

* Create category
* Get all categories
* Get category by ID
* Update category
* Delete category

### Product Management

* Create product
* Get all products
* Get product by ID
* Update product
* Delete product
* Search products by name
* Filter by category
* Filter by minimum price
* Filter by maximum price
* Pagination
* Sorting

### Order Management

* Create orders
* Get all orders
* Get order by ID
* Calculate order total
* Decrease product stock when an order is created
* Confirm orders
* Cancel orders
* Restore product stock when an order is cancelled

### Error Handling

* Global exception handling
* Custom `ResourceNotFoundException`
* Proper HTTP status codes
* Structured error responses

## API Endpoints

### Authentication

| Method | Endpoint      | Access |
| ------ | ------------- | ------ |
| POST   | `/auth/login` | Public |

### Users

| Method | Endpoint      | Access |
| ------ | ------------- | ------ |
| GET    | `/users`      | Public |
| GET    | `/users/{id}` | Public |
| POST   | `/users`      | Public |
| PUT    | `/users/{id}` | Public |
| DELETE | `/users/{id}` | Public |

### Categories

| Method | Endpoint           | Access       |
| ------ | ------------------ | ------------ |
| GET    | `/categories`      | USER / ADMIN |
| GET    | `/categories/{id}` | USER / ADMIN |
| POST   | `/categories`      | ADMIN        |
| PUT    | `/categories/{id}` | ADMIN        |
| DELETE | `/categories/{id}` | ADMIN        |

### Products

| Method | Endpoint         | Access       |
| ------ | ---------------- | ------------ |
| GET    | `/products`      | USER / ADMIN |
| GET    | `/products/{id}` | USER / ADMIN |
| POST   | `/products`      | ADMIN        |
| PUT    | `/products/{id}` | ADMIN        |
| DELETE | `/products/{id}` | ADMIN        |

### Product Filtering

Products can be filtered using query parameters.

Example:

```text
GET /products?name=iPhone&categoryId=1&minPrice=50000&maxPrice=70000
```

Pagination and sorting example:

```text
GET /products?page=0&size=10&sortBy=price&direction=desc
```

### Orders

| Method | Endpoint              | Access       |
| ------ | --------------------- | ------------ |
| GET    | `/orders`             | USER / ADMIN |
| GET    | `/orders/{id}`        | USER / ADMIN |
| POST   | `/orders`             | USER / ADMIN |
| PUT    | `/orders/{id}/status` | ADMIN        |

Order status can be changed by an ADMIN.

Example:

```text
PUT /orders/4/status?status=CONFIRMED
```

To cancel a pending order:

```text
PUT /orders/1/status?status=CANCELLED
```

When an order is cancelled, the ordered product quantity is automatically returned to stock.

## Authentication

After successful login, the API returns a JWT token.

Example:

```http
POST /auth/login
Content-Type: application/json
```

```json
{
  "email": "senay@gmail.com",
  "password": "your-password"
}
```

The returned token must be sent to protected endpoints:

```http
Authorization: Bearer <JWT_TOKEN>
```

## Database

PostgreSQL is used as the relational database.

Database configuration:

```text
Database: ecommerce
Host: localhost
Port: 5433
```

The application uses Spring Data JPA and Hibernate for database operations.

## Project Structure

```text
src/main/java/com/sena/ecommerce
│
├── auth
│   ├── AuthController
│   ├── LoginRequest
│   └── LoginResponse
│
├── config
│   └── SecurityConfig
│
├── controller
│   ├── CategoryController
│   ├── OrderController
│   ├── ProductController
│   └── UserController
│
├── dto
│   ├── OrderItemRequest
│   ├── OrderRequest
│   ├── ProductRequest
│   └── UserRequest
│
├── entity
│   ├── Category
│   ├── Order
│   ├── OrderItem
│   ├── OrderStatus
│   ├── Product
│   └── User
│
├── exception
│   ├── GlobalExceptionHandler
│   └── ResourceNotFoundException
│
├── repository
│   ├── CategoryRepository
│   ├── OrderItemRepository
│   ├── OrderRepository
│   ├── ProductRepository
│   └── UserRepository
│
├── security
│   ├── JwtAuthenticationFilter
│   └── JwtService
│
└── specification
    └── ProductSpecification
```

## Running the Application

### 1. Clone the repository

```bash
git clone https://github.com/senayilmazerkiral/ecommerce-api.git
```

### 2. Navigate to the project

```bash
cd ecommerce-api
```

### 3. Configure PostgreSQL

Create a PostgreSQL database named:

```text
ecommerce
```

Configure the database connection in:

```text
src/main/resources/application.properties
```

### 4. Run the application

Using Maven:

```bash
./mvnw spring-boot:run
```

The API will be available at:

```text
http://localhost:8080
```

## Example Product Response

```json
{
  "id": 1,
  "category": {
    "id": 1,
    "name": "Elektronik"
  },
  "name": "MacBook Pro",
  "price": 70000.0,
  "stock": 15
}
```

## Example Order Response

```json
{
  "id": 4,
  "totalPrice": 90000.0,
  "status": "CONFIRMED",
  "user": {
    "id": 7,
    "name": "Test User",
    "email": "test@gmail.com",
    "role": "USER"
  },
  "items": [
    {
      "id": 4,
      "quantity": 2,
      "price": 45000.0
    }
  ]
}
```

## Security Notes

Passwords are stored using BCrypt hashing.

JWT is used to authenticate requests to protected endpoints.

Sensitive configuration values should not be committed to the repository.

## Author

Sena Yılmaz

Java / Spring Boot Backend Developer
