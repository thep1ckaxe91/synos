# 🎨 Synos Member Features - API Examples

## 📋 Tính năng Member đã implement

### ✅ 1. **Login** - Đăng nhập
```http
POST /api/members/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response Success:**
```json
{
  "success": true,
  "message": "Login successful",
  "member": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "Customer",
    "phone": "+1234567890",
    "isActive": true,
    "createdAt": "2025-11-04T10:00:00Z"
  },
  "token": "bWVtYmVyXzFfMTM4NzA5ODc2NTQzMjEwMA=="
}
```

### ✅ 2. **Registration** - Đăng ký
```http
POST /api/members/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "securepassword",
  "fullName": "Jane Smith",
  "phone": "+1987654321",
  "role": "Artist"
}
```

### ✅ 3. **View Profile** - Xem thông tin cá nhân
```http
GET /api/members/profile/1
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "fullName": "John Doe",
  "role": "Customer",
  "phone": "+1234567890",
  "isActive": true,
  "createdAt": "2025-11-04T10:00:00Z"
}
```

### ✅ 4. **Update Profile** - Cập nhật thông tin
```http
PUT /api/members/profile/1
Content-Type: application/json

{
  "fullName": "John Smith Updated",
  "phone": "+1555666777"
}
```

### ✅ 5. **Change Password** - Đổi mật khẩu
```http
POST /api/members/change-password/1
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

### ✅ 6. **View Personal Gallery** - Xem bộ sưu tập yêu thích
```http
GET /api/members/gallery/1
```

**Response:**
```json
[
  {
    "artworkId": 101,
    "artworkTitle": "Sunset Over Mountains",
    "artworkDescription": "Beautiful landscape painting",
    "price": 1500.00,
    "primaryImage": "/images/artworks/101/main.jpg",
    "artistName": "Van Gogh Jr",
    "addedAt": "2025-11-04T15:30:00Z"
  },
  {
    "artworkId": 102,
    "artworkTitle": "Abstract Dreams",
    "artworkDescription": "Modern abstract art piece",
    "price": 2200.00,
    "primaryImage": "/images/artworks/102/main.jpg",
    "artistName": "Picasso Modern",
    "addedAt": "2025-11-03T12:15:00Z"
  }
]
```

### ✅ 7. **Add Artwork to Personal Gallery** - Thêm vào yêu thích
```http
POST /api/members/gallery/1/add
Content-Type: application/json

{
  "artworkId": 103
}
```

**Response:**
```json
{
  "message": "Artwork added to your personal gallery successfully"
}
```

### ✅ 8. **Remove Artwork from Personal Gallery** - Xóa khỏi yêu thích
```http
DELETE /api/members/gallery/1/remove/103
```

**Response:**
```json
{
  "message": "Artwork removed from your personal gallery successfully"
}
```

### ✅ 9. **Logout** - Đăng xuất
```http
POST /api/members/logout/1
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

## 🧪 Testing với curl

### Đăng ký Member mới:
```bash
curl -X POST http://localhost:5000/api/members/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "artist@synos.com",
    "password": "artist123",
    "fullName": "Vincent Artist",
    "phone": "+1234567890",
    "role": "Artist"
  }'
```

### Đăng nhập:
```bash
curl -X POST http://localhost:5000/api/members/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "artist@synos.com",
    "password": "artist123"
  }'
```

### Xem Gallery:
```bash
curl -X GET http://localhost:5000/api/members/gallery/1
```

### Thêm artwork vào favorites:
```bash
curl -X POST http://localhost:5000/api/members/gallery/1/add \
  -H "Content-Type: application/json" \
  -d '{"artworkId": 101}'
```

## 🔐 Security Features

- **Password Hashing**: Mật khẩu được hash với SHA256 + salt
- **Email Validation**: Kiểm tra email unique
- **Soft Delete**: Member bị xóa mềm (deleted_at) thay vì xóa cứng
- **Active Status**: Kiểm tra tài khoản active khi login
- **Token-based Auth**: Simple token cho demo (production nên dùng JWT)

## 🎯 Member Roles

- **Customer**: Khách hàng mua artwork
- **Artist**: Nghệ sĩ bán artwork  
- **Admin**: Quản trị hệ thống

## 📊 Database Relations

- `members` 1-1 `sellers` (Artist role)
- `members` 1-N `orders` (Purchase history)
- `members` M-N `artworks` (Favorites via `favorite` table)
- `members` 1-N `auctions` (Won auctions)

## 🚀 Next Steps

1. Implement JWT authentication
2. Add role-based authorization
3. Add artwork browsing endpoints  
4. Add order management
5. Add auction bidding features
6. Add email verification
7. Add password reset functionality

## 📝 Health Check

```http
GET /api/members/health
```

Kiểm tra xem API có hoạt động và có những tính năng nào available.