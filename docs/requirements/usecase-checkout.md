# UC-01: Đặt và thanh toán đơn hàng

## 1. Thông tin chung

| Mục | Nội dung |
|---|---|
| Mã | UC-01 |
| Tên | Đặt và thanh toán đơn hàng |
| Actor chính | Khách hàng |
| Actor phụ | Cổng thanh toán (mô phỏng) |
| Trigger | Khách bấm "Thanh toán" trên màn hình giỏ hàng |
| Yêu cầu liên quan | FR-05, FR-08, FR-09, FR-10, FR-11, FR-12, FR-13, FR-14, FR-16, FR-18, NFR-03, NFR-04, NFR-09 |

## 2. Tiền điều kiện

- Giỏ hàng có ít nhất một sản phẩm.
- Khách đã đăng nhập (nếu chưa, xem luồng thay thế A1).
- Hệ thống và cơ sở dữ liệu đang hoạt động.

## 3. Hậu điều kiện

- **Thành công:** đơn ở trạng thái PAID, tồn kho đã trừ, điểm thưởng đã cộng, giỏ hàng được làm rỗng, khách thấy mã đơn và trạng thái.
- **Thất bại:** đơn ở trạng thái PAYMENT_FAILED (hoặc không có đơn nếu lỗi xảy ra trước khi tạo đơn), giỏ hàng được giữ nguyên, khách thấy thông báo lỗi.

## 4. Luồng chính

1. Khách bấm "Thanh toán" trên màn hình giỏ hàng.
2. Hệ thống hiển thị tổng tiền và các phương thức thanh toán (Ví, Thẻ).
3. Khách nhập mã khuyến mãi (không bắt buộc), hệ thống kiểm tra và cập nhật tổng tiền.
4. Khách chọn phương thức thanh toán và bấm xác nhận.
5. Giao diện gửi yêu cầu tạo đơn kèm token đăng nhập.
6. Hệ thống xác thực token và kiểm tra dữ liệu đầu vào.
7. Hệ thống mở transaction: kiểm tra tồn kho, trừ tồn kho, lưu đơn hàng và các dòng đơn ở trạng thái PENDING, rồi đóng transaction.
8. Giao diện gửi yêu cầu thanh toán kèm `Idempotency-Key`.
9. Hệ thống gọi cổng thanh toán mô phỏng.
10. Cổng thanh toán báo thành công.
11. Hệ thống chuyển đơn sang PAID, cộng điểm thưởng cho khách.
12. Giao diện làm rỗng giỏ hàng và hiển thị màn hình xác nhận gồm mã đơn và trạng thái PAID.

## 5. Luồng thay thế

| Mã | Điều kiện rẽ nhánh | Xử lý |
|---|---|---|
| A1 | Khách chưa đăng nhập ở bước 1 | Hệ thống chuyển tới trang đăng nhập; đăng nhập xong quay lại giỏ hàng với giỏ còn nguyên, rồi tiếp tục từ bước 1 |
| A2 | Mã khuyến mãi không hợp lệ hoặc hết hạn ở bước 3 | Hệ thống báo lỗi, giữ nguyên tổng tiền, khách có thể nhập mã khác hoặc bỏ qua |
| A3 | Khách bấm hủy trước bước 4 | Quay lại giỏ hàng, không tạo đơn |
| A4 | Khách thanh toán xong rồi muốn hủy đơn (đơn còn PAID) | Hệ thống chuyển đơn sang CANCELLED nếu máy trạng thái cho phép (FR-19) |

## 6. Luồng ngoại lệ

| Mã | Điều kiện | Xử lý |
|---|---|---|
| E1 | Dữ liệu đầu vào sai định dạng hoặc giỏ rỗng (bước 6) | Hệ thống trả về 400, giao diện hiển thị lỗi, không tạo đơn |
| E2 | Token thiếu, sai hoặc hết hạn (bước 6) | Hệ thống trả về 401, giao diện chuyển tới trang đăng nhập |
| E3 | Một sản phẩm hết hàng hoặc không đủ số lượng (bước 7) | Transaction bị hủy, không trừ tồn kho, không tạo đơn; giao diện báo sản phẩm nào hết và giữ nguyên giỏ |
| E4 | Cổng thanh toán báo lỗi hoặc quá thời gian chờ (bước 10) | Hệ thống chuyển đơn sang PAYMENT_FAILED, giữ nguyên giỏ; khách có thể thử lại thanh toán |
| E5 | Khách hoặc mạng gửi lại yêu cầu thanh toán với cùng `Idempotency-Key` (bước 8) | Hệ thống trả lại kết quả của lần đầu, không tạo thanh toán mới và không trừ tiền lần hai |
| E6 | Lỗi hệ thống khi đang ghi cơ sở dữ liệu (bước 7 hoặc 11) | Transaction được hoàn tác, giao diện hiển thị thông báo lỗi chung, dữ liệu không bị dở dang |

## 7. Hệ thống làm gì và không làm gì

- **Làm:** xác thực khách, kiểm tra dữ liệu và tồn kho, lưu đơn, gọi cổng thanh toán mô phỏng, quản lý trạng thái đơn, cộng điểm thưởng.
- **Không làm:** thanh toán thật với ngân hàng hay ví điện tử, giao hàng tận nơi, hoàn tiền (xem phạm vi trong `context-and-scope.md`).

## 8. Tiêu chí chấp nhận dùng để viết test

- Giỏ có sản phẩm, khách đã đăng nhập, cổng thanh toán thành công thì đơn thành PAID và khách thấy mã đơn.
- Gọi tạo đơn không có token thì nhận 401.
- Đặt số lượng vượt tồn kho thì bị từ chối, tồn kho không đổi.
- Cổng thanh toán lỗi thì đơn là PAYMENT_FAILED và giỏ hàng còn nguyên.
- Gửi hai lần cùng `Idempotency-Key` thì chỉ có một thanh toán.
- Đơn PAID làm điểm thưởng của khách tăng đúng một lần.
