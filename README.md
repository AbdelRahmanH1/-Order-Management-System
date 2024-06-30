# Order Management System

This project implements an Order Management System (OMS) for an e-commerce mobile app using NestJS and Prisma.

## Features

- **Create User**:

  - **Endpoint**: `POST /api/users/signup`
  - **Functionality**: Create User

- **Login**:

  - **Endpoint**: `POST /api/users/login`
  - **Functionality**: Login User and retrive token

- **Order History**:

  - **Endpoint**: `GET /api/users/:userId/orders`
  - **Functionality**: Retrieves the user's order history

- **Add to Cart**:

  - **Endpoint**: `POST /api/cart/add`
  - **Functionality**: Adds a product to the user's cart or updates the quantity if the product is already in the cart.

- **View Cart**:

  - **Endpoint**: `GET /api/cart/:userId`
  - **Functionality**: Retrieves the user's cart.

- **Update Cart**:

  - **Endpoint**: `PUT /api/cart/update`
  - **Functionality**: Updates the quantity of a product in the cart.

- **Remove From Cart**:

  - **Endpoint**: `DELETE /api/cart/remove`
  - **Functionality**: Removes a product from the cart.

- **Create Order**:

  - **Endpoint**: `POST /api/orders`
  - **Functionality**: Creates a new order for the specified user with the products in their cart.

- **Get Order by ID**:

  - **Endpoint**: `GET /api/orders/:orderId`
  - **Functionality**: Retrieves the order details by order ID.

- **Update Order Status**:

  - **Endpoint**: `PUT /api/orders/:orderId/status`
  - **Functionality**: Updates the status of an order.

- **Apply Coupon**: -**Endpoint**: `POST /api/orders/apply-coupon`

## Environment Setup

Ensure you have the following tools installed:

- Node.js
- PostgreSQL
- Prisma

Clone the repository and install dependencies:

```bash
git clone https://github.com/AbdelRahmanH1/-Order-Management-System.git
```

install dependencies

```bash
npm install
```

## Running Application

Run the project (development mode)

```bash
npm run start:dev
```

Build The project

```bash
npm run build
```

Run the Project (Production Mode)

```bash
npm run start:prod
```

## API Documentation

he API documentation is available at `http://localhost:3000/api/docs`.

## Testing

### Unit Test

Run the unit test:

```bash
npm run test
```

### End-to-End (e2e) tests

Run the e2e tests:

```bash
npm run test:e2e
```
