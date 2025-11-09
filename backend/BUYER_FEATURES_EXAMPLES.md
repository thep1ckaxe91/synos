# 🛍️ Synos Buyer Features - API Examples

This document provides examples for the API endpoints available to users with the "Buyer" role.

## 📋 Buyer Features

A user with the "Buyer" role inherits all the basic features of a "Member" and has the following additional capabilities:

### ✅ 1. Place an Order
- **Description:** Creates a new order for a specific artwork that is for sale at a fixed price.
- **Endpoint:** `POST /api/buyer/orders`
- **Authorization:** `[JwtAuthorize]` (Requires a valid token for any role, but the service logic will ensure the user is not a Seller).
- **Request Body:**
```json
{
  "artworkId": "long"
}
```
- **Success Response (200 OK):**
```json
{
  "id": "long",
  "userId": "long",
  "orderNumber": "string",
  "totalAmount": "decimal",
  "status": "Pending", // Orders are created with Pending status
  "createdAt": "datetime",
  "updatedAt": "datetime",
  "orderItems": [
    {
      "id": "long",
      "orderId": "long",
      "artworkId": "long",
      "total": "decimal"
    }
  ]
}
```
- **Error Response (400 Bad Request):**
  - If the artwork is not available, not for fixed sale, or the user is a Seller.
```json
{
  "message": "Could not place order. The artwork may not be available or your account is not authorized."
}
```

### ✅ 2. Get Purchase History
- **Description:** Retrieves a list of all orders placed by the currently logged-in buyer.
- **Endpoint:** `GET /api/buyer/orders`
- **Authorization:** `[JwtAuthorize]`
- **Request Body:** None
- **Success Response (200 OK):**
```json
[
  {
    "id": "long",
    "userId": "long",
    "orderNumber": "string",
    "totalAmount": "decimal",
    "status": "string (e.g., Pending, Paid, Cancelled)",
    "createdAt": "datetime",
    "updatedAt": "datetime",
    "orderItems": [
      {
        "id": "long",
        "orderId": "long",
        "artworkId": "long",
        "total": "decimal"
      }
    ]
  }
]
```

### ✅ 3. Initiate Payment for an Order
- **Description:** Generates a VNPAY payment URL for a specific `Pending` order.
- **Endpoint:** `POST /api/buyer/orders/{orderId}/pay`
- **Authorization:** `[JwtAuthorize]`
- **Request Body:** None
- **Success Response (200 OK):**
```json
{
  "paymentUrl": "string" // The URL to redirect the user to for payment
}
```
- **Error Response (404 Not Found):**
  - If the order does not exist, does not belong to the user, or is not in `Pending` status.
```json
{
  "message": "Order not found, you do not have permission, or the order cannot be paid for."
}
```

## 🧪 Testing with curl

### Register a new Buyer:
First, you need an account with the "Buyer" role.
```bash
curl -X POST http://localhost:5000/api/members/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "buyer@synos.com",
    "password": "buyer123",
    "fullName": "Buyer Name",
    "phone": "+0987654321",
    "role": "Buyer"
  }'
```
After registering, log in with these credentials to get a JWT token.

### Place an Order:
(Assuming an artwork with `id=1` exists and is available for sale)
```bash
curl -X POST http://localhost:5000/api/buyer/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "artworkId": 1
  }'
```
**Note:** Take note of the `id` from the response body, as you will need it to initiate payment.

### Get Purchase History:
```bash
curl -X GET http://localhost:5000/api/buyer/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Initiate Payment:
(Using the order `id` from the "Place an Order" step, e.g., `orderId=1`)
```bash
curl -X POST http://localhost:5000/api/buyer/orders/1/pay \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
The response will contain a `paymentUrl`. Copy and paste this URL into your browser to proceed with the VNPAY payment process.

## ⚠️ Important Notes:
- **VNPay Configuration:** Ensure you have correctly configured your `VnpaySettings` in `appsettings.json` with a valid `TmnCode` and `HashSecret`.
- **Authorization:** All buyer endpoints require a valid JWT token.
- **Artwork Availability:** To place an order, an artwork must exist in the database with `Status = Available` and `IsFor = Fixed`.
