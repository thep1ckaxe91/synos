# 🛍️ Tính năng của Người mua (Buyer) - Ví dụ API

Tài liệu này cung cấp các ví dụ cho các điểm cuối API dành cho người dùng có vai trò "Buyer".

## 📋 Tính năng của Người mua

Người dùng có vai trò "Buyer" kế thừa tất cả các tính năng cơ bản của "Member" và có thêm các khả năng sau:

### ✅ 1. Đặt hàng (Place an Order)
- **Mô tả:** Tạo một đơn hàng mới cho một tác phẩm nghệ thuật cụ thể đang được bán với giá cố định.
- **Đường dẫn:** `POST /api/buyer/orders`
- **Ủy quyền:** `[JwtAuthorize]` (Yêu cầu token hợp lệ cho bất kỳ vai trò nào, nhưng logic dịch vụ sẽ đảm bảo người dùng không phải là Seller).
- **Dữ liệu gửi đi:**
```json
{
  "artworkId": "long"
}
```
- **Phản hồi thành công (200 OK):**
```json
{
  "id": "long",
  "userId": "long",
  "orderNumber": "string",
  "totalAmount": "decimal",
  "status": "Pending", // Đơn hàng được tạo với trạng thái Chờ xử lý
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
- **Phản hồi lỗi (400 Bad Request):**
  - Nếu tác phẩm không có sẵn, không phải để bán giá cố định, hoặc người dùng là Seller.
```json
{
  "message": "Could not place order. The artwork may not be available or your account is not authorized."
}
```

### ✅ 2. Xem lịch sử mua hàng (Get Purchase History)
- **Mô tả:** Lấy danh sách tất cả các đơn hàng đã đặt bởi người mua đang đăng nhập.
- **Đường dẫn:** `GET /api/buyer/orders`
- **Ủy quyền:** `[JwtAuthorize]`
- **Dữ liệu gửi đi:** Không có
- **Phản hồi thành công (200 OK):**
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

### ✅ 3. Bắt đầu thanh toán cho đơn hàng (Initiate Payment for an Order)
- **Mô tả:** Tạo URL thanh toán VNPAY cho một đơn hàng cụ thể có trạng thái `Pending`. Áp dụng cho cả đơn hàng giá cố định và đơn hàng được tạo tự động sau khi thắng đấu giá.
- **Đường dẫn:** `POST /api/buyer/orders/{orderId}/pay`
- **Ủy quyền:** `[JwtAuthorize]`
- **Dữ liệu gửi đi:** Không có
- **Phản hồi thành công (200 OK):**
```json
{
  "paymentUrl": "string" // URL để chuyển hướng người dùng đến để thanh toán
}
```
- **Phản hồi lỗi (404 Not Found):**
  - Nếu đơn hàng không tồn tại, không thuộc về người dùng, hoặc không ở trạng thái `Pending`.
```json
{
  "message": "Order not found, you do not have permission, or the order cannot be paid for."
}
```

## 🏆 Tính năng Đấu giá (Auction Features)

### ✅ 1. Xem các phiên đấu giá đang hoạt động (Get Active Auctions)
- **Mô tả:** Lấy danh sách tất cả các phiên đấu giá đang hoạt động.
- **Đường dẫn:** `GET /api/buyer/auctions`
- **Ủy quyền:** `[JwtAuthorize]`
- **Dữ liệu gửi đi:** Không có
- **Phản hồi thành công (200 OK):**
```json
[
  {
    "auctionId": "long",
    "artworkId": "long",
    "artworkName": "string",
    "startTime": "datetime",
    "endTime": "datetime",
    "startingPrice": "decimal",
    "bids": [
      {
        "memberId": "long",
        "memberName": "string",
        "amount": "decimal",
        "timestamp": "datetime"
      }
    ]
  }
]
```

### ✅ 2. Xem chi tiết phiên đấu giá (Get Auction Details)
- **Mô tả:** Lấy chi tiết của một phiên đấu giá đang hoạt động, bao gồm lịch sử đặt giá.
- **Đường dẫn:** `GET /api/buyer/auctions/{id}`
- **Ủy quyền:** `[JwtAuthorize]`
- **Dữ liệu gửi đi:** Không có
- **Phản hồi thành công (200 OK):**
```json
{
  "auctionId": "long",
  "artworkId": "long",
  "artworkName": "string",
  "startTime": "datetime",
  "endTime": "datetime",
  "startingPrice": "decimal",
  "bids": [
    {
      "memberId": "long",
      "memberName": "string",
      "amount": "decimal",
      "timestamp": "datetime"
    }
  ]
}
```

### ✅ 3. Đặt giá (Place a Bid)
- **Mô tả:** Đặt giá cho một phiên đấu giá đang hoạt động. Số tiền đặt giá phải cao hơn giá thầu cao nhất hiện tại.
- **Đường dẫn:** `POST /api/buyer/auctions/{id}/bids`
- **Ủy quyền:** `[JwtAuthorize]`
- **Dữ liệu gửi đi:**
```json
{
  "amount": "decimal"
}
```
- **Phản hồi thành công (200 OK):**
```json
{
  "message": "Bid placed successfully."
}
```
- **Phản hồi lỗi (400 Bad Request):**
  - Nếu phiên đấu giá đã kết thúc hoặc số tiền đặt giá không đủ cao.
```json
{
  "message": "Could not place bid. The auction may have ended or your bid is not high enough."
}
```

## 🧪 Thử nghiệm với curl

### Đăng ký một Người mua mới:
Đầu tiên, bạn cần một tài khoản có vai trò "Buyer".
```bash
curl -X POST http://localhost:5000/api/members/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "buyer@synos.com",
    "password": "buyer123",
    "fullName": "Ten Nguoi Mua",
    "phone": "+0987654321",
    "role": "Buyer"
  }'
```
Sau khi đăng ký, đăng nhập bằng thông tin này để nhận token JWT.

### Đặt hàng:
(Giả sử một tác phẩm nghệ thuật có `id=1` tồn tại và có sẵn để bán)
```bash
curl -X POST http://localhost:5000/api/buyer/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "artworkId": 1
  }'
```
**Lưu ý:** Ghi lại `id` từ phản hồi, bạn sẽ cần nó để bắt đầu thanh toán.

### Xem lịch sử mua hàng:
```bash
curl -X GET http://localhost:5000/api/buyer/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Bắt đầu thanh toán:
(Sử dụng `id` đơn hàng từ bước "Đặt hàng", ví dụ: `orderId=1`)
```bash
curl -X POST http://localhost:5000/api/buyer/orders/1/pay \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
Phản hồi sẽ chứa một `paymentUrl`. Sao chép và dán URL này vào trình duyệt của bạn để tiếp tục quá trình thanh toán VNPAY.

### Đặt giá cho một phiên đấu giá:
(Giả sử một phiên đấu giá có `id=1` đang hoạt động)
```bash
curl -X POST http://localhost:5000/api/buyer/auctions/1/bids \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "amount": 550.00
  }'
```

## ⚠️ Lưu ý quan trọng:
- **Cấu hình VNPay:** Đảm bảo bạn đã cấu hình đúng `VnpaySettings` trong `appsettings.json` với `TmnCode` và `HashSecret` hợp lệ.
- **Ủy quyền:** Tất cả các điểm cuối của người mua đều yêu cầu token JWT hợp lệ.
- **Tình trạng tác phẩm:** Để đặt hàng, một tác phẩm nghệ thuật phải tồn tại trong cơ sở dữ liệu với `Status = Available` và `IsFor = Fixed`.
- **Thắng đấu giá:** Nếu bạn thắng một phiên đấu giá, một đơn hàng sẽ được tạo tự động cho bạn. Sau đó, bạn có thể tìm thấy đơn hàng này trong lịch sử mua hàng của mình và sử dụng điểm cuối "Bắt đầu thanh toán" để thanh toán.
