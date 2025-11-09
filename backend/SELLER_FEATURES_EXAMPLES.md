# 🎨 Synos Seller Features - API Examples

## 📋 Tính năng Seller đã implement (kế thừa từ Member) 

Seller kế thừa tất cả các tính năng của Member và có thêm các tính năng sau:

### ✅ 1. Tải lên Artwork (Upload Artwork) 
- **Đường dẫn:** `POST /api/seller/artworks`
- **Authorization:** `[JwtAuthorize("Seller")]`
- **Dữ liệu gửi đi:**
```json
{
  "title": "string",
  "description": "string",
  "price": "decimal",
  "saleType": "enum(FixedPrice, Auction)",
  "categoryId": "long",
  "imageUrls": [
    "string"
  ]
}
```
- **Dữ liệu nhận về:**
```json
{
  "id": "long",
  "title": "string",
  "description": "string",
  "price": "decimal",
  "saleType": "string",
  "status": "string",
  "primaryImage": "string",
  "createdAt": "datetime",
  "categoryName": "string"
}
```
- **Lưu ý:** Artwork sẽ có trạng thái `Pending` và cần được Admin duyệt.

### ✅ 2. Xem các Artwork của tôi (View My Artworks)
- **Đường dẫn:** `GET /api/seller/artworks`
- **Authorization:** `[JwtAuthorize("Seller")]`
- **Dữ liệu gửi đi:** Không có
- **Dữ liệu nhận về:**
```json
[
  {
    "id": "long",
    "title": "string",
    "description": "string",
    "price": "decimal",
    "saleType": "string",
    "status": "string",
    "primaryImage": "string",
    "createdAt": "datetime",
    "categoryName": "string"
  }
]
```

### ✅ 3. Xem lịch sử bán hàng (View Sales History)
- **Đường dẫn:** `GET /api/seller/sales-history`
- **Authorization:** `[JwtAuthorize("Seller")]`
- **Dữ liệu gửi đi:** Không có
- **Dữ liệu nhận về:**
```json
[
  {
    "orderId": "long",
    "artworkTitle": "string",
    "primaryImage": "string",
    "soldAt": "datetime",
    "salePrice": "decimal",
    "commissionAmount": "decimal",
    "payoutAmount": "decimal",
    "buyerName": "string"
  }
]
```

## 🧪 Testing với curl/Postman

### Đăng ký Seller mới:
```bash
curl -X POST http://localhost:5000/api/members/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seller@synos.com",
    "password": "seller123",
    "fullName": "Seller Name",
    "phone": "+1234567890",
    "role": "Seller"
  }'
```
(Sau khi đăng ký, bạn cần đăng nhập để lấy JWT token)

### Tải lên Artwork:
```bash
curl -X POST http://localhost:5000/api/seller/artworks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "My First Artwork",
    "description": "A beautiful piece of art.",
    "price": 1500.00,
    "saleType": "FixedPrice",
    "categoryId": 1,
    "imageUrls": ["http://example.com/image1.jpg", "http://example.com/image2.jpg"]
  }'
```

### Xem các Artwork của tôi:
```bash
curl -X GET http://localhost:5000/api/seller/artworks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Xem lịch sử bán hàng:
```bash
curl -X GET http://localhost:5000/api/seller/sales-history \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## ⚠️ Lưu ý quan trọng:
- **Database Connection:** Các tính năng này yêu cầu cơ sở dữ liệu MySQL đang chạy và có kết nối hợp lệ.
- **VNPay Configuration:** Đảm bảo bạn đã cập nhật `VnpaySettings` trong `appsettings.json` với `TmnCode` và `HashSecret` từ tài khoản sandbox VNPay của bạn.
- **Authorization:** Các endpoint của Seller yêu cầu JWT token hợp lệ với vai trò "Seller".
