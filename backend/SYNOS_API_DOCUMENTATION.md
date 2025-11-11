# Synos Backend API Documentation

## Overview
Synos is an art marketplace system that allows sellers to list artworks and buyers to browse and purchase them. The API provides endpoints for authentication, user management, artwork management, and administrative functions.

**Base URL:** `http://localhost:8080/api`
**Docker URL:** `http://localhost:8080/api` (when using docker-compose)

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication Controller (`/api/auth`)

### Validate Token
**POST** `/auth/validate`

Validates a JWT token and returns user information if valid.

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "isValid": true,
  "userId": 123,
  "role": "Member",
  "fullName": "John Doe",
  "email": "john.doe@example.com"
}
```

### Refresh Token
**POST** `/auth/refresh`

Refreshes an expired or soon-to-expire JWT token.

**Request Body:**
```json
{
  "token": "current_jwt_token"
}
```

**Response (200):**
```json
{
  "token": "new_jwt_token",
  "expiresAt": "2025-11-10T12:00:00Z"
}
```

### Get Current User
**GET** `/auth/me`

Returns information about the currently authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": 123,
  "email": "john.doe@example.com",
  "fullName": "John Doe",
  "role": "Member",
  "isActive": true
}
```

### Logout (Revoke Token)
**POST** `/auth/revoke`

Revokes the current JWT token (logout).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Token revoked successfully"
}
```

### Check Role
**GET** `/auth/role`

Returns the role of the current user.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "role": "Member"
}
```

### Admin Test Endpoint
**GET** `/auth/admin-only`

Test endpoint that requires Admin role.

**Headers:** `Authorization: Bearer <admin_token>`

### Artist Test Endpoint
**GET** `/auth/artist-only`

Test endpoint that requires Seller/Artist role.

**Headers:** `Authorization: Bearer <seller_token>`

### Multi-Role Test Endpoint
**GET** `/auth/artist-or-admin`

Test endpoint that requires either Artist or Admin role.

---

## 👥 Members Controller (`/api/members`)

### Member Registration
**POST** `/members/register`

Register a new member account.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "fullName": "John Doe",
  "phoneNumber": "+1234567890",
  "address": "123 Main St, City, Country"
}
```

**Response (201):**
```json
{
  "id": 123,
  "email": "john.doe@example.com",
  "fullName": "John Doe",
  "role": "Member",
  "isActive": true,
  "createdAt": "2025-11-09T10:30:00Z"
}
```

### Member Login
**POST** `/members/login`

Authenticate a member and receive a JWT token.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 123,
    "email": "john.doe@example.com",
    "fullName": "John Doe",
    "role": "Member",
    "isActive": true
  },
  "expiresAt": "2025-11-10T10:30:00Z"
}
```

### Get Member Profile
**GET** `/members/{id}`

Get a specific member's profile (public information only).

**Response (200):**
```json
{
  "id": 123,
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "joinedAt": "2025-11-01T00:00:00Z",
  "isActive": true
}
```

### Update Member Profile
**PUT** `/members/{id}`

Update member profile information.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "fullName": "John Smith",
  "phoneNumber": "+1234567891",
  "address": "456 Oak St, New City, Country"
}
```

**Response (200):**
```json
{
  "id": 123,
  "email": "john.doe@example.com",
  "fullName": "John Smith",
  "phoneNumber": "+1234567891",
  "address": "456 Oak St, New City, Country",
  "updatedAt": "2025-11-09T10:35:00Z"
}
```

### Change Password
**POST** `/members/{id}/change-password`

Change member password.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword456!"
}
```

**Response (200):**
```json
{
  "message": "Password changed successfully"
}
```

### Get Personal Gallery
**GET** `/members/{id}/gallery`

Get member's favorite artworks gallery.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "id": 1,
    "title": "Beautiful Sunset",
    "description": "A stunning sunset painting",
    "price": 500.00,
    "primaryImageUrl": "http://localhost:8080/uploads/ArtworkImg/sunset_123.jpg",
    "images": [
      {
        "id": 1,
        "imageUrl": "http://localhost:8080/uploads/ArtworkImg/sunset_123.jpg",
        "isPrimary": true,
        "uploadedAt": "2025-11-09T08:00:00Z"
      }
    ],
    "sellerName": "Jane Artist",
    "addedToGalleryAt": "2025-11-09T09:00:00Z"
  }
]
```

### Add Artwork to Gallery
**POST** `/members/{id}/gallery/{artworkId}`

Add an artwork to member's personal gallery (favorites).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Artwork added to gallery successfully"
}
```

### Remove Artwork from Gallery
**DELETE** `/members/{id}/gallery/{artworkId}`

Remove an artwork from member's personal gallery.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Artwork removed from gallery successfully"
}
```

### Member Logout
**POST** `/members/logout`

Logout current member (revoke token).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

### Get My Profile
**GET** `/members/me`

Get current member's full profile information.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": 123,
  "email": "john.doe@example.com",
  "fullName": "John Doe",
  "phoneNumber": "+1234567890",
  "address": "123 Main St, City, Country",
  "role": "Member",
  "isActive": true,
  "createdAt": "2025-11-01T00:00:00Z",
  "updatedAt": "2025-11-09T10:35:00Z"
}
```

---

## 🎨 Seller Controller (`/api/seller`)

**Note:** All seller endpoints require Seller role authentication.

### Create Artwork with Images
**POST** `/seller/artworks`

Create a new artwork listing with image uploads.

**Headers:** 
- `Authorization: Bearer <seller_token>`
- `Content-Type: multipart/form-data`

**Request Body (Form Data):**
```
title: "Beautiful Sunset Painting"
description: "A stunning oil painting of a sunset over mountains"
price: 750.50
saleType: "FixedPrice" // or "Auction"
categoryId: 1
creationYear: 2023
dimensions: "24x36 inches"
condition: "Excellent"
currency: "USD"
images: [file1.jpg, file2.jpg, file3.jpg] // Multiple image files
```

**Response (201):**
```json
{
  "id": 15,
  "title": "Beautiful Sunset Painting",
  "description": "A stunning oil painting of a sunset over mountains",
  "price": 750.50,
  "saleType": "FixedPrice",
  "status": "PendingApproval",
  "primaryImage": "http://localhost:8080/uploads/ArtworkImg/sunset_20251109_123456.jpg",
  "images": [
    {
      "id": 45,
      "imageUrl": "http://localhost:8080/uploads/ArtworkImg/sunset_20251109_123456.jpg",
      "isPrimary": true,
      "uploadedAt": "2025-11-09T10:30:00Z"
    },
    {
      "id": 46,
      "imageUrl": "http://localhost:8080/uploads/ArtworkImg/sunset_detail_20251109_123457.jpg",
      "isPrimary": false,
      "uploadedAt": "2025-11-09T10:30:00Z"
    }
  ],
  "createdAt": "2025-11-09T10:30:00Z",
  "categoryName": "Paintings"
}
```

### Get My Artworks
**GET** `/seller/artworks`

Get all artworks created by the current seller.

**Headers:** `Authorization: Bearer <seller_token>`

**Response (200):**
```json
[
  {
    "id": 15,
    "title": "Beautiful Sunset Painting",
    "description": "A stunning oil painting of a sunset over mountains",
    "price": 750.50,
    "saleType": "FixedPrice",
    "status": "Approved",
    "primaryImage": "http://localhost:8080/uploads/ArtworkImg/sunset_20251109_123456.jpg",
    "images": [
      {
        "id": 45,
        "imageUrl": "http://localhost:8080/uploads/ArtworkImg/sunset_20251109_123456.jpg",
        "isPrimary": true,
        "uploadedAt": "2025-11-09T10:30:00Z"
      },
      {
        "id": 46,
        "imageUrl": "http://localhost:8080/uploads/ArtworkImg/sunset_detail_20251109_123457.jpg",
        "isPrimary": false,
        "uploadedAt": "2025-11-09T10:30:00Z"
      }
    ],
    "createdAt": "2025-11-09T10:30:00Z",
    "categoryName": "Paintings"
  }
]
```

### Get Sales History
**GET** `/seller/sales-history`

Get sales history for the current seller.

**Headers:** `Authorization: Bearer <seller_token>`

**Response (200):**
```json
[
  {
    "orderId": 5,
    "artworkTitle": "Mountain Landscape",
    "primaryImage": "http://localhost:8080/uploads/ArtworkImg/mountain_123.jpg",
    "soldAt": "2025-11-08T15:30:00Z",
    "salePrice": 500.00,
    "commissionAmount": 50.00,
    "payoutAmount": 450.00,
    "buyerName": "John Collector"
  }
]
```

---

## 👑 Admin Controller (`/api/admin`)

**Note:** All admin endpoints require Admin role authentication.

### Admin Login
**POST** `/admin/login`

Authenticate an admin user.

**Request Body:**
```json
{
  "email": "admin@synos.com",
  "password": "Admin@123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": 1,
    "email": "admin@synos.com",
    "fullName": "System Administrator",
    "role": "Admin"
  },
  "expiresAt": "2025-11-10T10:30:00Z"
}
```

### Get Dashboard Stats
**GET** `/admin/dashboard/stats`

Get comprehensive dashboard statistics.

**Headers:** `Authorization: Bearer <admin_token>`

**Response (200):**
```json
{
  "totalMembers": 150,
  "activeSellers": 45,
  "totalArtworks": 320,
  "pendingApprovals": 12,
  "approvedArtworks": 280,
  "rejectedArtworks": 28,
  "totalSales": 85,
  "totalRevenue": 42500.00,
  "totalCommissions": 4250.00
}
```

### Get All Members
**GET** `/admin/members`

Get paginated list of all members.

**Headers:** `Authorization: Bearer <admin_token>`

**Query Parameters:**
- `skip` (optional): Number of records to skip (default: 0)
- `take` (optional): Number of records to take (default: 50)

**Response (200):**
```json
[
  {
    "id": 123,
    "email": "john.doe@example.com",
    "fullName": "John Doe",
    "phoneNumber": "+1234567890",
    "role": "Member",
    "isActive": true,
    "createdAt": "2025-11-01T00:00:00Z",
    "lastLoginAt": "2025-11-09T09:00:00Z"
  }
]
```

### Get All Artworks for Admin
**GET** `/admin/artworks`

Get paginated list of all artworks with admin details.

**Headers:** `Authorization: Bearer <admin_token>`

**Query Parameters:**
- `skip` (optional): Number of records to skip (default: 0)
- `take` (optional): Number of records to take (default: 50)

**Response (200):**
```json
[
  {
    "id": 15,
    "sellerId": 123,
    "title": "Beautiful Sunset Painting",
    "description": "A stunning oil painting of a sunset over mountains",
    "categoryId": 1,
    "categoryName": "Paintings",
    "creationYear": 2023,
    "dimensions": "24x36 inches",
    "condition": "Excellent",
    "isFor": "FixedPrice",
    "fixedPrice": 750.50,
    "currency": "USD",
    "status": "PendingApproval",
    "createdAt": "2025-11-09T10:30:00Z",
    "updatedAt": "2025-11-09T10:30:00Z",
    "deletedAt": null,
    "sellerName": "Jane Artist",
    "sellerEmail": "jane.artist@example.com",
    "primaryImageUrl": "http://localhost:8080/uploads/ArtworkImg/sunset_20251109_123456.jpg",
    "images": [
      {
        "id": 45,
        "imageUrl": "http://localhost:8080/uploads/ArtworkImg/sunset_20251109_123456.jpg",
        "isPrimary": true,
        "uploadedAt": "2025-11-09T10:30:00Z"
      },
      {
        "id": 46,
        "imageUrl": "http://localhost:8080/uploads/ArtworkImg/sunset_detail_20251109_123457.jpg",
        "isPrimary": false,
        "uploadedAt": "2025-11-09T10:30:00Z"
      }
    ],
    "totalImages": 2,
    "totalFavorites": 5,
    "totalOrders": 0
  }
]
```

### Get Artwork Details
**GET** `/admin/artworks/{id}`

Get detailed information about a specific artwork.

**Headers:** `Authorization: Bearer <admin_token>`

**Response (200):**
```json
{
  "id": 15,
  "sellerId": 123,
  "title": "Beautiful Sunset Painting",
  "description": "A stunning oil painting of a sunset over mountains",
  "categoryId": 1,
  "categoryName": "Paintings",
  "creationYear": 2023,
  "dimensions": "24x36 inches",
  "condition": "Excellent",
  "isFor": "FixedPrice",
  "fixedPrice": 750.50,
  "currency": "USD",
  "status": "PendingApproval",
  "createdAt": "2025-11-09T10:30:00Z",
  "updatedAt": "2025-11-09T10:30:00Z",
  "deletedAt": null,
  "sellerName": "Jane Artist",
  "sellerEmail": "jane.artist@example.com",
  "primaryImageUrl": "http://localhost:8080/uploads/ArtworkImg/sunset_20251109_123456.jpg",
  "images": [
    {
      "id": 45,
      "imageUrl": "http://localhost:8080/uploads/ArtworkImg/sunset_20251109_123456.jpg",
      "isPrimary": true,
      "uploadedAt": "2025-11-09T10:30:00Z"
    },
    {
      "id": 46,
      "imageUrl": "http://localhost:8080/uploads/ArtworkImg/sunset_detail_20251109_123457.jpg",
      "isPrimary": false,
      "uploadedAt": "2025-11-09T10:30:00Z"
    }
  ],
  "totalImages": 2,
  "totalFavorites": 5,
  "totalOrders": 0
}
```

### Approve Artwork
**POST** `/admin/artworks/{id}/approve`

Approve a pending artwork for display.

**Headers:** `Authorization: Bearer <admin_token>`

**Response (200):**
```json
{
  "message": "Artwork approved successfully",
  "artworkId": 15,
  "newStatus": "Approved"
}
```

### Reject Artwork
**POST** `/admin/artworks/{id}/reject`

Reject a pending artwork.

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body (optional):**
```json
{
  "reason": "Image quality does not meet our standards"
}
```

**Response (200):**
```json
{
  "message": "Artwork rejected successfully",
  "artworkId": 15,
  "newStatus": "Rejected"
}
```

### Get Most Viewed Artworks
**GET** `/admin/analytics/most-viewed`

Get analytics for most viewed/popular artworks.

**Headers:** `Authorization: Bearer <admin_token>`

**Query Parameters:**
- `count` (optional): Number of artworks to return (default: 10)

**Response (200):**
```json
[
  {
    "id": 10,
    "title": "Famous Portrait",
    "sellerName": "Master Artist",
    "totalFavorites": 25,
    "totalOrders": 3,
    "primaryImageUrl": "http://localhost:8080/uploads/ArtworkImg/portrait_123.jpg"
  }
]
```

---

## 📁 Static File Serving

### Access Uploaded Images
**GET** `/uploads/{path}`

Direct access to uploaded artwork images.

**Example:**
```
GET http://localhost:8080/uploads/ArtworkImg/sunset_20251109_123456.jpg
```

**Response:** Returns the image file directly.

---

## Error Responses

### Common Error Formats

**400 Bad Request:**
```json
{
  "message": "Validation error message",
  "errors": {
    "field1": ["Field is required"],
    "field2": ["Field must be a valid email"]
  }
}
```

**401 Unauthorized:**
```json
{
  "message": "Invalid token or not authorized"
}
```

**403 Forbidden:**
```json
{
  "message": "Insufficient permissions"
}
```

**404 Not Found:**
```json
{
  "message": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "message": "An error occurred while processing the request"
}
```

---

## Data Models

### Artwork Statuses
- `PendingApproval`: Newly submitted, awaiting admin review
- `Approved`: Approved by admin, visible to buyers
- `Rejected`: Rejected by admin, not visible
- `Sold`: Successfully sold

### Sale Types
- `FixedPrice`: Fixed price sale
- `Auction`: Auction-based sale (future feature)

### User Roles
- `Member`: Regular user who can browse and buy
- `Seller`: Member who can also sell artworks
- `Admin`: Administrator with full system access

---

## Integration Notes

### Image Upload Guidelines
- **Supported formats:** JPG, JPEG, PNG, GIF, WebP
- **Maximum file size:** 5MB per image
- **Multiple images:** Up to multiple images per artwork
- **Automatic processing:** First image becomes primary image
- **Storage:** Files stored in `/uploads/ArtworkImg/` directory
- **URL format:** `http://localhost:8080/uploads/ArtworkImg/{filename}`

### JWT Token Management
- **Token expiration:** Configurable (typically 24 hours)
- **Refresh mechanism:** Use `/auth/refresh` endpoint before expiration
- **Storage:** Store securely on client side (HttpOnly cookies recommended)
- **Revocation:** Tokens can be revoked via logout endpoints

### Pagination
- Most list endpoints support pagination via `skip` and `take` parameters
- Default page size is typically 50 items
- Use `skip=0&take=20` for first 20 items
- Use `skip=20&take=20` for next 20 items (page 2)

### Docker Deployment
When running via Docker Compose:
- Backend runs on port 8080
- Frontend runs on port 3000  
- MySQL runs on port 3306
- All containers communicate via Docker network
- Static files served directly by backend

### Development vs Production
- **Development:** `http://localhost:8080`
- **Production:** Update base URLs in configuration
- **Environment variables:** Configure database, JWT secrets, etc.
- **File storage:** Consider cloud storage for production

---

## Quick Start Examples

### 1. Register and Login Flow
```bash
# Register a new member
curl -X POST http://localhost:8080/api/members/register \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Pass123!","fullName":"John Doe"}'

# Login to get token
curl -X POST http://localhost:8080/api/members/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Pass123!"}'
```

### 2. Seller Artwork Creation
```bash
# Create artwork with images (requires form-data)
curl -X POST http://localhost:8080/api/seller/artworks \
  -H "Authorization: Bearer YOUR_SELLER_TOKEN" \
  -F "title=My Artwork" \
  -F "description=Beautiful painting" \
  -F "price=500" \
  -F "saleType=FixedPrice" \
  -F "categoryId=1" \
  -F "images=@image1.jpg" \
  -F "images=@image2.jpg"
```

### 3. Admin Approval Flow
```bash
# Get pending artworks
curl -X GET http://localhost:8080/api/admin/artworks \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Approve artwork
curl -X POST http://localhost:8080/api/admin/artworks/123/approve \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

This documentation covers all current API endpoints with complete request/response examples. Update base URLs and authentication tokens as needed for your specific deployment.