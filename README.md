# Multi-Vendor E-Commerce 

A scalable RESTful backend application for a Multi-Vendor E-Commerce Platform built using **FastAPI**, **PostgreSQL**, **SQLAlchemy**, and **JWT Authentication**.

This application allows multiple vendors to sell products on a single platform while customers can browse products, manage their shopping cart, place orders, and make payments. The system automatically splits orders by vendor during checkout and maintains separate order records for each vendor.

The project follows a clean layered architecture using Repository-Service pattern to ensure maintainability, scalability, and separation of concerns.

---

## Features

### Authentication & Authorization

- User Registration
- User Login
- JWT Authentication
- Password Hashing
- Role-Based Access Control (RBAC)

Supported Roles:

- Admin
- Vendor
- Customer

---

### User Management

- Create User
- Get All Users
- Get User by ID
- Update User
- Delete User

(Admin access only)

---

### Vendor Management

- Vendor Registration
- View Vendor Details
- Update Vendor Information
- Delete Vendor

---

### Category Management

- Create Category
- View Categories
- Update Category
- Delete Category

(Admin only)

---

### Product Management

- Create Product
- Update Product
- Delete Product
- View Products
- View Vendor Products
- Product Image Upload
- Stock Management
- Active/Inactive Products

---

### Shopping Cart

- Add Product to Cart
- Update Cart Quantity
- Remove Cart Item
- View Shopping Cart
- Clear Cart

---

### Order Management

- Checkout
- Automatic Order Splitting
- Customer Order History
- Vendor Order Management
- Admin Order Management
- Update Order Status
- Cancel Order

---

### Payment Management

- Create Payment
- Process Payment
- View Customer Payments
- View Payment Details
- Admin Payment Monitoring

---

## Technology Stack

| Category | Technology |
|----------|------------|
| Language | Python 3.12 |
| Framework | FastAPI |
| Database | PostgreSQL |
| ORM | SQLAlchemy 2.0 |
| Migration | Alembic |
| Authentication | JWT |
| Password Hashing | Passlib + BCrypt |
| Validation | Pydantic v2 |
| API Testing | Swagger UI |
| File Upload | FastAPI UploadFile |
| Image Storage | Local File Storage |

---

# Project Structure

```
multi_vendor_ecommerce/
│
├── alembic/
│   ├── versions/
│   └── env.py
│
├── app/
│   ├── constants/
│   │   └── enums.py
│   │
│   ├── core/
│   │   ├── config.py
│   │   ├── database.py
│   │   └── security.py
│   │
│   ├── dependencies/
│   │   └── roles.py
│   │
│   ├── models/
│   │   ├── user.py
│   │   ├── vendor.py
│   │   ├── category.py
│   │   ├── product.py
│   │   ├── cart.py
│   │   ├── cart_item.py
│   │   ├── order.py
│   │   ├── order_item.py
│   │   └── payment.py
│   │
│   ├── repositories/
│   │   ├── base_repository.py
│   │   ├── user_repository.py
│   │   ├── vendor_repository.py
│   │   ├── category_repository.py
│   │   ├── product_repository.py
│   │   ├── cart_repository.py
│   │   ├── cart_item_repository.py
│   │   ├── order_repository.py
│   │   ├── order_item_repository.py
│   │   └── payment_repository.py
│   │
│   ├── schemas/
│   │
│   ├── services/
│   │
│   ├── routers/
│   │
│   ├── uploads/
│   │
│   └── main.py
│
├── tests/
│
├── .env
├── .env.example
├── requirements.txt
├── alembic.ini
└── README.md
```

---

# Architecture Overview

The project follows a layered architecture based on the **Repository-Service Pattern**, which separates business logic from database operations.

```
                Client
                   │
                   ▼
             FastAPI Router
                   │
                   ▼
             Service Layer
                   │
                   ▼
          Repository Layer
                   │
                   ▼
          SQLAlchemy ORM
                   │
                   ▼
              PostgreSQL
```

Each layer has a dedicated responsibility, making the application easier to maintain, test, and extend.

---

# Layer Responsibilities

## Router Layer

The Router layer exposes REST API endpoints.

Responsibilities:

- Receive HTTP requests
- Validate request data
- Call the appropriate service
- Return API responses

Example:

```
POST /products
GET /orders
PUT /cart/{item_id}
```

No business logic is implemented in routers.

---

## Service Layer

The Service layer contains all business logic.

Responsibilities:

- Validate business rules
- Coordinate multiple repositories
- Handle authorization checks
- Raise HTTP exceptions
- Execute transactions

Examples:

- Verify product stock before checkout
- Split orders by vendor
- Validate payment status
- Prevent unauthorized access
- Update inventory after successful order

---

## Repository Layer

The Repository layer is responsible for all database interactions.

Responsibilities:

- CRUD operations
- SQLAlchemy queries
- Joins
- Filtering
- Data retrieval

Repositories never contain business logic.

Example:

```
ProductRepository
OrderRepository
PaymentRepository
VendorRepository
```

---

## Model Layer

Models define the database tables using SQLAlchemy ORM.

Examples:

- User
- Vendor
- Product
- Cart
- Order
- Payment

Each model maps directly to a PostgreSQL table.

---

## Schema Layer

Schemas use Pydantic for request validation and response serialization.

Responsibilities:

- Validate incoming requests
- Format API responses
- Prevent invalid data from entering the application

Examples:

- ProductCreate
- ProductUpdate
- OrderResponse
- PaymentCreate

---

# Design Patterns Used

## Repository Pattern

The Repository Pattern isolates database operations from business logic.

Benefits:

- Easier maintenance
- Better code organization
- Reusable queries
- Cleaner services

---

## Service Layer Pattern

Business logic is centralized inside services.

Benefits:

- Reusable logic
- Thin routers
- Easier testing
- Better scalability

---

## Dependency Injection

FastAPI's dependency injection is used for:

- Database sessions
- JWT authentication
- Role-based authorization

Example:

```python
db: Session = Depends(get_db)
current_user = Depends(require_customer)
```

---

# Authentication Flow

1. User registers.
2. Password is hashed before storing.
3. User logs in.
4. JWT Access Token is generated.
5. Token is included in the Authorization header.
6. Protected endpoints validate the token.
7. Role-based authorization determines endpoint access.

```
User
   │
Login
   │
   ▼
JWT Token
   │
Authorization Header
   │
   ▼
Protected API
```

---

# Role-Based Access Control (RBAC)

The application supports three user roles.

### Admin

- Manage users
- Manage categories
- View all orders
- View all payments

---

### Vendor

- Manage own products
- Upload product images
- View vendor orders
- Update order status

---

### Customer

- Browse products
- Manage shopping cart
- Checkout
- Make payments
- Cancel orders
- View order history

---

# Setup Instructions

## Prerequisites

Before running the project, ensure the following software is installed:

- Python 3.12+
- PostgreSQL
- Git
- pip
- Virtual Environment (venv)

---

## Clone the Repository

```bash
git clone https://github.com/<your-username>/multi_vendor_ecommerce.git

cd multi_vendor_ecommerce
```

---

## Create Virtual Environment

### Windows

```bash
python -m venv venv
```

Activate:

```bash
venv\Scripts\activate
```

---

### Linux / macOS

```bash
python3 -m venv venv

source venv/bin/activate
```

---

## Install Dependencies

```bash
pip install -r requirements.txt
```

---

## Configure Environment Variables

Create a `.env` file in the project root.

Example:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/multi_vendor_ecommerce

SECRET_KEY=your_secret_key

ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=30

UPLOAD_FOLDER=app/uploads
```

---

## Database Setup

Create a PostgreSQL database.

Example:

```sql
CREATE DATABASE multi_vendor_ecommerce;
```

---

## Run Database Migrations

```bash
alembic upgrade head
```

This creates all required tables.

---

## Start the Application

```bash
uvicorn app.main:app --reload
```

Application:

```
http://127.0.0.1:8000
```

Swagger Documentation:

```
http://127.0.0.1:8000/docs
```

ReDoc Documentation:

```
http://127.0.0.1:8000/redoc
```

---

# Environment Variables

| Variable | Description |
|-----------|-------------|
| DATABASE_URL | PostgreSQL connection string |
| SECRET_KEY | JWT Secret Key |
| ALGORITHM | JWT Algorithm |
| ACCESS_TOKEN_EXPIRE_MINUTES | Token Expiration Time |
| UPLOAD_FOLDER | Product image storage path |

---

# Database Schema Explanation

The application uses PostgreSQL as the primary relational database.

The database is normalized to reduce redundancy and maintain relationships between users, vendors, products, orders, carts, and payments.

---

## Users

Stores registered users.

Fields include:

- id
- full_name
- email
- password_hash
- role
- created_at
- updated_at

Relationship:

```
User
 │
 ├── Vendor (One-to-One)
 ├── Cart (One-to-One)
 ├── Orders (One-to-Many)
 └── Payments (Through Orders)
```

---

## Vendors

Represents sellers on the platform.

Each vendor belongs to exactly one user.

Fields include:

- id
- user_id
- business_name
- business_address
- phone_number

Relationship:

```
Vendor
   │
   ├── Products
   └── Orders
```

---

## Categories

Stores product categories.

Examples:

- Electronics
- Clothing
- Grocery

One category contains many products.

---

## Products

Stores product information.

Fields include:

- id
- vendor_id
- category_id
- name
- description
- price
- stock
- image_url
- is_active

Relationship:

```
Vendor
    │
    └── Products
            │
            └── Order Items
```

---

## Cart

Each customer owns one shopping cart.

```
Customer
      │
      └── Cart
```

---

## Cart Items

Stores products added to the shopping cart.

Fields:

- cart_id
- product_id
- quantity

Relationship:

```
Cart
   │
   └── Cart Items
            │
            └── Product
```

---

## Orders

Stores customer orders.

Fields include:

- customer_id
- vendor_id
- status
- payment_status
- total_amount

Relationship:

```
Customer
      │
      └── Orders
               │
               └── Order Items
```

---

## Order Items

Stores individual products inside an order.

Fields:

- order_id
- product_id
- quantity
- price

Each order may contain multiple order items.

---

## Payments

Stores payment information.

Fields include:

- order_id
- amount
- payment_method
- transaction_id
- status

Relationship:

```
Order
   │
   └── Payment
```

---

# API Endpoints

## Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and generate JWT token |

---

## Users (Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users` | Create user |
| GET | `/users` | Get all users |
| GET | `/users/{user_id}` | Get user by ID |
| PUT | `/users/{user_id}` | Update user |
| DELETE | `/users/{user_id}` | Delete user |

---

## Vendors

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/vendors` | Register vendor |
| GET | `/vendors` | Get all vendors |
| GET | `/vendors/{vendor_id}` | Get vendor |
| PUT | `/vendors/{vendor_id}` | Update vendor |
| DELETE | `/vendors/{vendor_id}` | Delete vendor |

---

## Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/categories` | Create category |
| GET | `/categories` | Get all categories |
| GET | `/categories/{category_id}` | Get category |
| PUT | `/categories/{category_id}` | Update category |
| DELETE | `/categories/{category_id}` | Delete category |

---

## Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/products` | Create product |
| GET | `/products` | Get all products |
| GET | `/products/{product_id}` | Get product |
| PUT | `/products/{product_id}` | Update product |
| DELETE | `/products/{product_id}` | Delete product |
| POST | `/products/{product_id}/image` | Upload product image |

---

## Shopping Cart

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/cart/items` | Add product to cart |
| GET | `/cart` | View cart |
| PUT | `/cart/items/{item_id}` | Update quantity |
| DELETE | `/cart/items/{item_id}` | Remove cart item |
| DELETE | `/cart` | Clear cart |

---

## Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/orders/checkout` | Checkout cart |
| GET | `/orders/my-orders` | Customer order history |
| GET | `/orders/vendor` | Vendor orders |
| GET | `/orders` | Admin - View all orders |
| PUT | `/orders/{order_id}/status` | Vendor updates order status |
| PUT | `/orders/{order_id}/cancel` | Customer cancels order |

---

## Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payments/{order_id}` | Create payment |
| PUT | `/payments/{payment_id}` | Process payment |
| GET | `/payments/my-payments` | Customer payments |
| GET | `/payments/{payment_id}` | Payment details |
| GET | `/payments` | Admin - View all payments |

---

# Order Splitting Logic

One of the key features of this project is **Automatic Order Splitting**.

Unlike a traditional e-commerce platform where a checkout creates a single order, this system separates products by vendor during checkout.

## Example

Customer Cart

| Product | Vendor |
|---------|--------|
| Laptop | Vendor A |
| Mouse | Vendor A |
| Shoes | Vendor B |
| Watch | Vendor C |

Instead of creating one order, the backend creates:

```
Order 1
Vendor A

- Laptop
- Mouse
```

```
Order 2
Vendor B

- Shoes
```

```
Order 3
Vendor C

- Watch
```

This enables:

- Independent order processing
- Separate vendor dashboards
- Individual shipment tracking
- Vendor-specific payment management

---

# Order Checkout Flow

```
Customer
      │
      ▼
Shopping Cart
      │
      ▼
Validate Stock
      │
      ▼
Group Products by Vendor
      │
      ▼
Create Orders
      │
      ▼
Create Order Items
      │
      ▼
Reduce Product Stock
      │
      ▼
Clear Shopping Cart
      │
      ▼
Return Created Orders
```

---

# Payment Flow

The payment module simulates an online payment system.

## Flow

```
Customer

     │

Create Payment

     │

Payment Record Created

     │

Process Payment

     │

Generate Transaction ID

     │

Update Payment Status

     │

Update Order Payment Status
```

Supported payment statuses:

- PENDING
- SUCCESS
- FAILED

---

# Product Image Upload

Product images are uploaded using FastAPI's `UploadFile`.

Images are stored locally inside:

```
app/uploads/
```

The backend stores only the image filename/path in the database.

When requested, the API returns the image URL for frontend display.

---

# Security Features

The application includes multiple security mechanisms.

- JWT Authentication
- Password Hashing using BCrypt
- Role-Based Access Control
- Protected Endpoints
- Input Validation using Pydantic
- SQLAlchemy ORM (prevents SQL Injection)

---

# Future Enhancements

The current implementation provides the core backend functionality for a multi-vendor marketplace.

Possible future improvements include:

- Shipping Address Management
- Wishlist
- Product Reviews & Ratings
- Coupons & Discount System
- Search & Filtering
- Pagination
- Email Notifications
- Payment Gateway Integration (Stripe/Razorpay)
- Order Tracking
- Inventory Analytics
- Sales Dashboard
- Product Recommendations
- Docker Deployment
- CI/CD Pipeline

---

# Author

**Manikandan S**

Python Backend Developer

Tech Stack:

- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- JWT Authentication
- Alembic
- REST APIs

---

