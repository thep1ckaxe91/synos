# 🔐 JWT Authentication & Authorization Guide

## 🎯 Overview
Synos API sử dụng JWT (JSON Web Token) để xác thực và phân quyền người dùng. JWT tokens được tạo khi login và phải được gửi kèm trong header của các API requests.

## 🔑 JWT Configuration
```json
{
  "Jwt": {
    "SecretKey": "SynosSecretKeyForJWT2025VietnamUTC+7ProductionKey!@#$%^&*()",
    "Issuer": "SynosApi",
    "Audience": "SynosClients", 
    "ExpirationMinutes": "1440"
  }
}
```

## 📋 Token Claims
JWT token chứa các thông tin sau:
- **NameIdentifier**: Member ID
- **Email**: Member email
- **Name**: Member full name
- **Role**: Member role (Customer, Artist, Admin)
- **IsActive**: Account status
- **Phone**: Phone number (nếu có)

## 🚀 Authentication Flow

### 1. **Login** (Get JWT Token)
```http
POST /api/members/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "member": {
    "id": 1,
    "email": "user@example.com", 
    "fullName": "John Doe",
    "role": "Customer"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. **Use Token in Requests**
```http
GET /api/members/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🛡️ Authorization Attributes

### Basic Authorization:
```csharp
[RequireAuth]           // Any authenticated user
[RequireCustomer]       // Customer role only
[RequireArtist]         // Artist role only  
[RequireAdmin]          // Admin role only
[RequireArtistOrAdmin]  // Artist OR Admin
[AllowAnonymous]        // No authentication required
```

### Custom Authorization:
```csharp
[JwtAuthorize("Customer", "Artist")]  // Multiple specific roles
```

## 📊 API Endpoints

### 🔓 **Public Endpoints** (No Auth Required):
```http
POST /api/members/login         # Login
POST /api/members/register      # Register
GET  /api/members/health        # Health check
POST /api/auth/validate         # Validate token
```

### 🔒 **Protected Endpoints** (Auth Required):
```http
GET  /api/members/me            # Current user profile
PUT  /api/members/me            # Update profile  
GET  /api/members/me/gallery    # My favorites
POST /api/auth/refresh          # Refresh token
GET  /api/auth/me              # Token info
```

### 👑 **Admin Only**:
```http
GET  /api/auth/admin-only       # Admin test endpoint
```

### 🎨 **Artist Only**:
```http
GET  /api/auth/artist-only      # Artist test endpoint
```

### 🎨👑 **Artist or Admin**:
```http
GET  /api/auth/artist-or-admin  # Artist/Admin endpoint
```

## 🧪 Testing JWT Auth

### 1. **Login to get token:**
```bash
curl -X POST http://localhost:5000/api/members/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@synos.com",
    "password": "admin123"
  }'
```

### 2. **Use token in protected requests:**
```bash
# Replace TOKEN with actual JWT token from login response
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:5000/api/members/me \
  -H "Authorization: Bearer $TOKEN"
```

### 3. **Test role-based access:**
```bash
# Admin only (will fail if not admin role)
curl -X GET http://localhost:5000/api/auth/admin-only \
  -H "Authorization: Bearer $TOKEN"

# Check current role
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

## 🔍 Token Validation

### **Validate Token:**
```http
POST /api/auth/validate
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "isValid": true,
  "isExpired": false,
  "memberId": 1,
  "email": "user@example.com",
  "role": "Customer",
  "expiresAt": "2025-11-05T10:30:00Z",
  "issuedAt": "2025-11-04T10:30:00Z"
}
```

## 🔄 Token Refresh

```http
POST /api/auth/refresh
Authorization: Bearer OLD_TOKEN
```

**Response:**
```json
{
  "message": "Token refreshed successfully",
  "token": "NEW_JWT_TOKEN",
  "member": { /* member info */ }
}
```

## ❌ Error Responses

### **401 Unauthorized:**
```json
{
  "message": "Access denied. Authentication required."
}
```

### **403 Forbidden:**
```json
{
  "message": "Insufficient permissions."
}
```

### **Token Expired:**
```json
{
  "isValid": false,
  "isExpired": true
}
```

## 💡 Best Practices

### 1. **Store Token Securely:**
- Frontend: Store in memory or httpOnly cookies
- Mobile: Use secure storage (Keychain/Keystore)

### 2. **Handle Token Expiry:**
```javascript
// Check if token is expired before requests
if (tokenExpired) {
  await refreshToken();
}
```

### 3. **Logout Process:**
```javascript
// Remove token from client storage
localStorage.removeItem('jwt_token');
// Call logout endpoint
await fetch('/api/auth/revoke', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` }
});
```

## 🛠️ Helper Methods

### **HttpContext Extensions:**
```csharp
var memberId = HttpContext.GetCurrentMemberId();
var email = HttpContext.GetCurrentMemberEmail();
var role = HttpContext.GetCurrentMemberRole();
var isActive = HttpContext.IsCurrentMemberActive();
var hasRole = HttpContext.IsCurrentMemberInRole("Admin");
```

## 🔐 Security Features

1. **Token Expiration**: 24 hours default
2. **Role-based Access Control**: Customer, Artist, Admin
3. **Account Status Check**: Only active accounts allowed
4. **Secure Key**: Strong secret key for signing
5. **Claims Validation**: Issuer, Audience, Lifetime validation

## 🚨 Production Considerations

1. **Use HTTPS**: Always use SSL in production
2. **Strong Secret Key**: Generate cryptographically secure key
3. **Token Blacklist**: Implement revoked token tracking
4. **Rate Limiting**: Add request rate limiting
5. **Logging**: Log authentication attempts
6. **Environment Variables**: Store secrets in env vars

## 🧪 Test Scenarios

### Create test users:
```bash
# Register Customer
curl -X POST http://localhost:5000/api/members/register \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@test.com","password":"test123","fullName":"Test Customer","role":"Customer"}'

# Register Artist  
curl -X POST http://localhost:5000/api/members/register \
  -H "Content-Type: application/json" \
  -d '{"email":"artist@test.com","password":"test123","fullName":"Test Artist","role":"Artist"}'

# Register Admin
curl -X POST http://localhost:5000/api/members/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"test123","fullName":"Test Admin","role":"Admin"}'
```

JWT Authentication is now ready! 🎉