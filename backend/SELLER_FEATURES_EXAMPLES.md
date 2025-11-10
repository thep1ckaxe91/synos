# 🎨 Synos Seller Features - API Examples

## 📋 Tính năng Seller đã implement (kế thừa từ Member) 

Seller kế thừa tất cả các tính năng của Member và có thêm các tính năng sau:

### ✅ 1. Tải lên ảnh Artwork (Upload Artwork Images)
- **Đường dẫn:** `POST /api/seller/artworks/upload`
- **Authorization:** `[JwtAuthorize("Seller")]`
- **Dữ liệu gửi đi:** `multipart/form-data` với một hoặc nhiều file ảnh.
- **Dữ liệu nhận về:**
```json
{
  "urls": [
    "string", // URL của ảnh đã upload
    "string"
  ]
}
```
- **Lưu ý:** Endpoint này chỉ dùng để tải file ảnh lên và trả về URL. Bạn cần sử dụng các URL này để tạo Artwork.

### ✅ 2. Tạo Artwork (Create Artwork)
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
    "string" // Các URL nhận được từ bước Tải lên ảnh Artwork
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

### ✅ 3. Xem các Artwork của tôi (View My Artworks)
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

### ✅ 4. Xem lịch sử bán hàng (View Sales History)
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

### ✅ 5. Tạo phiên đấu giá (Create an Auction)
- **Đường dẫn:** `POST /api/seller/auctions`
- **Authorization:** `[JwtAuthorize("Seller")]`
- **Dữ liệu gửi đi:**
```json
{
  "artworkId": "long",
  "startingPrice": "decimal",
  "startTime": "datetime",
  "endTime": "datetime"
}
```
- **Dữ liệu nhận về (201 Created):**
```json
{
  "auctionId": "long",
  "artworkId": "long",
  "artworkName": "string",
  "startTime": "datetime",
  "endTime": "datetime",
  "startingPrice": "decimal",
  "bids": []
}
```
- **Lưu ý:**
  - Chỉ có thể tạo phiên đấu giá cho các artwork có `saleType` là `Auction` và `status` là `Available`.
  - `startTime` phải ở tương lai và trước `endTime`.

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

### Tải lên ảnh Artwork:
```bash
curl -X POST http://localhost:5000/api/seller/artworks/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "files=@/path/to/your/image1.jpg" \
  -F "files=@/path/to/your/image2.png"
# Kết quả trả về sẽ là một JSON chứa các URL của ảnh đã upload.
# Ví dụ: {"urls": ["http://localhost:5000/uploads/artworks/unique-id_image1.jpg", "http://localhost:5000/uploads/artworks/unique-id_image2.png"]}
```

### Tạo Artwork (sử dụng URL từ bước trên):
```bash
# Tạo artwork để bán đấu giá
curl -X POST http://localhost:5000/api/seller/artworks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Artwork for Auction",
    "description": "This artwork will be auctioned.",
    "price": 0, # Price is not needed for auction type
    "saleType": "Auction",
    "categoryId": 1,
    "imageUrls": ["http://localhost:5000/uploads/artworks/unique-id_image1.jpg"]
  }'
```
**Lưu ý:** Ghi lại `id` của artwork được tạo (ví dụ: `id=5`). Bạn sẽ cần nó để tạo phiên đấu giá. Artwork này cần được Admin duyệt để có status `Available`.

### Tạo phiên đấu giá:
(Giả sử artwork có `id=5` đã được duyệt và có status `Available`)
```bash
curl -X POST http://localhost:5000/api/seller/auctions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "artworkId": 5,
    "startingPrice": 500.00,
    "startTime": "2025-12-01T10:00:00Z",
    "endTime": "2025-12-10T10:00:00Z"
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
