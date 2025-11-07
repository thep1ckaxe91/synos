# 🎨 Synos Member Features - API Examples

## 📋 Tính năng Member đã implement

### ✅ 1. Đăng nhập (Login)
- **Đường dẫn:** `POST /api/members/login`
- **Dữ liệu gửi đi:**
```json
{
  "email": "string",
  "password": "string"
}
```
- **Dữ liệu nhận về:**
```json
{
  "success": "boolean",
  "message": "string",
  "member": {
    "id": "int",
    "email": "string",
    "fullName": "string",
    "role": "enum(Artist, Customer)",
    "phone": "string",
    "isActive": "boolean",
    "createdAt": "datetime"
  },
  "token": "string"
}
```

### ✅ 2. Đăng ký (Registration)
- **Đường dẫn:** `POST /api/members/register`
- **Dữ liệu gửi đi:**
```json
{
  "email": "string",
  "password": "string",
  "fullName": "string",
  "phone": "string",
  "role": "enum(Artist, Customer)"
}
```
- **Dữ liệu nhận về:**
```json
{
  "success": "boolean",
  "message": "string",
  "member": {
    "id": "int",
    "email": "string",
    "fullName": "string",
    "role": "enum(Artist, Customer)",
    "phone": "string",
    "isActive": "boolean",
    "createdAt": "datetime"
  },
  "token": "string"
}
```

### ✅ 3. Xem thông tin cá nhân (View Profile)
- **Đường dẫn:** `GET /api/members/profile/{id}`
- **Dữ liệu gửi đi:** Không có (chỉ cần ID trong URL)
- **Dữ liệu nhận về:**
```json
{
  "id": "int",
  "email": "string",
  "fullName": "string",
  "role": "enum(Artist, Customer, Admin)",
  "phone": "string",
  "isActive": "boolean",
  "createdAt": "datetime"
}
```

### ✅ 4. Cập nhật thông tin (Update Profile)
- **Đường dẫn:** `PUT /api/members/profile/{id}`
- **Dữ liệu gửi đi:**
```json
{
  "fullName": "string (optional)",
  "phone": "string (optional)"
}
```
- **Dữ liệu nhận về:**
```json
{
  "id": "int",
  "email": "string",
  "fullName": "string",
  "role": "enum(Artist, Customer)",
  "phone": "string",
  "isActive": "boolean",
  "createdAt": "datetime"
}
```

### ✅ 5. Đổi mật khẩu (Change Password)
- **Đường dẫn:** `POST /api/members/change-password/{id}`
- **Dữ liệu gửi đi:**
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```
- **Dữ liệu nhận về:**
```json
{
  "message": "string"
}
```

### ✅ 6. Xem bộ sưu tập cá nhân (View Personal Gallery)
- **Đường dẫn:** `GET /api/members/gallery/{id}`
- **Dữ liệu gửi đi:** Không có (chỉ cần ID trong URL)
- **Dữ liệu nhận về:**
```json
[
  {
    "artworkId": "int",
    "artworkTitle": "string",
    "artworkDescription": "string",
    "price": "decimal",
    "primaryImage": "string",
    "artistName": "string",
    "addedAt": "datetime"
  }
]
```

### ✅ 7. Thêm artwork vào bộ sưu tập (Add to Gallery)
- **Đường dẫn:** `POST /api/members/gallery/{id}/add`
- **Dữ liệu gửi đi:**
```json
{
  "ArtworkId": "int"
}
```
- **Dữ liệu nhận về:**
```json
{
  "message": "string"
}
```

### ✅ 8. Xóa artwork khỏi bộ sưu tập (Remove from Gallery)
- **Đường dẫn:** `DELETE /api/members/gallery/{id}/remove/{artworkId}`
- **Dữ liệu gửi đi:** Không có (chỉ cần ID trong URL)
- **Dữ liệu nhận về:**
```json
{
  "message": "string"
}
```

### ✅ 9. Đăng xuất (Logout)
- **Đường dẫn:** `POST /api/members/logout/{id}`
- **Dữ liệu gửi đi:** Không có (chỉ cần ID trong URL)
- **Dữ liệu nhận về:**
```json
{
  "message": "string"
}
```

### ✅ 10. Xem thông tin tài khoản hiện tại (Get My Profile)
- **Đường dẫn:** `GET /api/members/me`
- **Dữ liệu gửi đi:** Không có (sử dụng JWT token)
- **Dữ liệu nhận về:**
```json
{
  "id": "int",
  "email": "string",
  "fullName": "string",
  "role": "enum(Artist, Customer)",
  "phone": "string",
  "isActive": "boolean",
  "createdAt": "datetime"
}
```

### ✅ 11. Xem bộ sưu tập của tôi (Get My Gallery)
- **Đường dẫn:** `GET /api/members/me/gallery`
- **Dữ liệu gửi đi:** Không có (sử dụng JWT token)
- **Dữ liệu nhận về:**
```json
[
  {
    "artworkId": "int",
    "artworkTitle": "string",
    "artworkDescription": "string",
    "price": "decimal",
    "primaryImage": "string",
    "artistName": "string",
    "addedAt": "datetime"
  }
]
```

## 🧪 Testing với curl/Postman

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
  -d '{"ArtworkId": 1}'
```

### 🔧 Postman Setup cho Authentication:
1. **Đăng nhập trước:** Gửi request đăng nhập để lấy token
2. **Copy token từ response:** Lấy giá trị "token" từ kết quả trả về
3. **Set Authorization:** Trong Postman, tab Authorization → Type: Bearer Token → paste token
4. **Set Content-Type:** Headers tab → Key: Content-Type, Value: application/json
5. **Gửi request:** Có thể test các endpoint cần authentication

**⚠️ Lưu ý Bảo mật:**
- Đảm bảo set đúng Content-Type: application/json
- Với endpoint Add to Gallery, dùng "ArtworkId" (viết hoa A) thay vì "artworkId"
- **Resource Owner Check**: User chỉ có thể truy cập resource của chính họ
  - Nếu đăng nhập với user ID 1, chỉ có thể call `/api/members/profile/1`, không thể call `/api/members/profile/2`
  - Nếu cố gắng truy cập resource của người khác → HTTP 403 Forbidden
  - Admin có thể truy cập tất cả resources

### 🔒 Authorization Rules:
- **GET/PUT /profile/{id}**: Chỉ owner hoặc admin
- **POST /change-password/{id}**: Chỉ owner hoặc admin  
- **GET/POST/DELETE /gallery/{id}**: Chỉ owner hoặc admin
- **POST /logout/{id}**: Chỉ owner hoặc admin

## 🏢 Admin System (Separate from Members)

### ✅ Admin Login
- **Đường dẫn:** `POST /api/admin/login`
- **Dữ liệu gửi đi:**
```json
{
  "email": "string",
  "password": "string"
}
```
- **Dữ liệu nhận về:**
```json
{
  "success": "boolean",
  "message": "string",
  "admin": {
    "id": "int",
    "email": "string",
    "fullName": "string",
    "phone": "string",
    "isActive": "boolean",
    "createdAt": "datetime"
  },
  "token": "string (với UserType=Admin, Role=Admin)"
}
```

### 🔧 JWT Token Structure:
**Member Token Claims:**
- UserType: "Member"
- Role: "Customer" | "Artist"
- NameIdentifier: member_id

**Admin Token Claims:**
- UserType: "Admin"  
- Role: "Admin"
- NameIdentifier: admin_id

### ⚡ Key Differences:
- **Members**: Stored in `members` table, roles: Customer/Artist
- **Admins**: Stored in `admin` table, separate authentication system
- **Authorization**: Admin tokens can access any member resource, member tokens restricted to own resources

## 🔐 Security Features

- **Password Hashing**: Mật khẩu được hash với SHA256 + salt
- **Email Validation**: Kiểm tra email unique
- **Soft Delete**: Member bị xóa mềm (deleted_at) thay vì xóa cứng
- **Active Status**: Kiểm tra tài khoản active khi login
- **JWT Authentication**: Token-based authentication với claims
- **Resource Owner Authorization**: User chỉ có thể truy cập/chỉnh sửa dữ liệu của chính họ
  - Member ID 1 chỉ có thể update profile ID 1
  - Member ID 2 chỉ có thể xem gallery ID 2
  - Admin có thể truy cập tất cả resources
- **Role-based Access Control**: Phân quyền theo vai trò (Customer, Artist, Admin)

### 🎯 User Types & Roles

### 👥 Member Roles (stored in `members` table):
- **Customer**: Khách hàng mua artwork
- **Artist**: Nghệ sĩ bán artwork  

### 🔐 Admin (stored in `admin` table):
- **Admin**: Quản trị hệ thống - tài khoản riêng biệt, không phải member role

### 📊 Member Status Logic:
- **Pending**: `is_active = false` AND `deleted_at = null` (chờ duyệt)
- **Approved**: `is_active = true` AND `deleted_at = null` (đã được duyệt)
- **Rejected**: `is_active = false` AND `deleted_at = rejection_time` (bị từ chối)

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