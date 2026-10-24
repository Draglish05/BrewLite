# Đặc tả yêu cầu phần mềm (SRS) BrewLite

Ưu tiên theo MoSCoW: **Must** (bắt buộc), **Should** (nên có), **Could** (có thể có), **Won't** (không làm trong phiên bản này).

## 1. Yêu cầu chức năng

### 1.1. Menu và sản phẩm

| Mã | Yêu cầu | Ưu tiên | Tiêu chí chấp nhận |
|---|---|---|---|
| FR-01 | Hiển thị danh sách đồ uống gồm hình, tên, giá | Must | `GET /products` trả về danh sách có id, tên, giá, ảnh; trang menu hiển thị đủ các trường này; có trạng thái loading và empty |
| FR-02 | Xem chi tiết một sản phẩm | Must | `GET /products/:id` trả về đúng sản phẩm; id không tồn tại trả về 404 |
| FR-03 | Chọn size (S/M/L) và topping, giá thay đổi theo tùy chọn | Must | Đổi size hoặc topping thì giá hiển thị cập nhật ngay; giá cuối cùng khớp công thức giá cơ bản cộng phụ thu |

### 1.2. Giỏ hàng

| Mã | Yêu cầu | Ưu tiên | Tiêu chí chấp nhận |
|---|---|---|---|
| FR-04 | Thêm, sửa số lượng và xóa sản phẩm trong giỏ | Must | Thêm sản phẩm thì xuất hiện trong giỏ; đổi số lượng và xóa cập nhật ngay; tải lại trang vẫn giữ giỏ |
| FR-05 | Tự tính tổng tiền và hiển thị số lượng trên biểu tượng giỏ | Must | Tổng tiền bằng tổng (đơn giá nhân số lượng) của mọi dòng; số lượng trên biểu tượng khớp số món trong giỏ |

### 1.3. Xác thực

| Mã | Yêu cầu | Ưu tiên | Tiêu chí chấp nhận |
|---|---|---|---|
| FR-06 | Đăng ký tài khoản bằng email và mật khẩu | Must | `POST /auth/register` tạo tài khoản; email trùng hoặc dữ liệu sai định dạng trả về 400; mật khẩu không lưu dạng thô |
| FR-07 | Đăng nhập và nhận JWT | Must | `POST /auth/login` đúng thông tin trả về token; sai thông tin trả về 401 |
| FR-08 | Chặn đặt đơn khi chưa đăng nhập | Must | Gọi `POST /orders` không có token trả về 401; giao diện chuyển khách tới trang đăng nhập |

### 1.4. Đặt đơn

| Mã | Yêu cầu | Ưu tiên | Tiêu chí chấp nhận |
|---|---|---|---|
| FR-09 | Tạo đơn hàng từ giỏ hàng | Must | `POST /orders` lưu đơn trạng thái PENDING và trả về mã đơn; giỏ rỗng hoặc số lượng không hợp lệ trả về 400 |
| FR-10 | Kiểm soát tồn kho khi đặt | Must | Không cho đặt vượt số lượng còn lại; khi nhiều yêu cầu đặt cùng lúc, tổng số bán ra không vượt tồn kho |
| FR-11 | Áp mã khuyến mãi hợp lệ | Should | Mã hợp lệ làm giảm tổng tiền đúng mức; mã hết hạn hoặc không tồn tại bị từ chối kèm thông báo |

### 1.5. Thanh toán

| Mã | Yêu cầu | Ưu tiên | Tiêu chí chấp nhận |
|---|---|---|---|
| FR-12 | Thanh toán không tiền mặt bằng Ví hoặc Thẻ (mô phỏng) | Must | `POST /payments` thành công thì đơn chuyển PAID; thất bại thì đơn là PAYMENT_FAILED và giỏ hàng được giữ nguyên |
| FR-13 | Thanh toán không bị lặp khi gửi lại yêu cầu | Must | Gửi hai lần cùng `Idempotency-Key` chỉ tạo một thanh toán và một kết quả |
| FR-14 | Cộng điểm thưởng sau khi đơn PAID | Should | Đơn chuyển PAID thì điểm tích lũy của khách tăng theo tỷ lệ 1 điểm cho mỗi 10.000đ (làm tròn xuống), và chỉ cộng một lần |
| FR-15 | Thanh toán thật qua ngân hàng hoặc ví điện tử | Won't | Không thực hiện, chỉ dùng cổng mô phỏng |

### 1.6. Xác nhận, lịch sử và trạng thái đơn

| Mã | Yêu cầu | Ưu tiên | Tiêu chí chấp nhận |
|---|---|---|---|
| FR-16 | Hiển thị màn hình xác nhận đơn | Must | Sau khi thanh toán xong hiển thị mã đơn và trạng thái |
| FR-17 | Xem lịch sử đơn của chính mình | Must | `GET /orders/me` chỉ trả về đơn của người dùng đang đăng nhập, mới nhất trước |
| FR-18 | Quản lý trạng thái đơn theo máy trạng thái | Must | Chỉ cho phép các chuyển tiếp hợp lệ (PENDING, PAID, PREPARING, READY, COMPLETED, PAYMENT_FAILED, CANCELLED); chuyển tiếp sai bị từ chối |
| FR-19 | Hủy đơn khi còn ở trạng thái cho phép | Should | Đơn PENDING, PAYMENT_FAILED hoặc PAID chuyển được sang CANCELLED; đơn COMPLETED không hủy được |
| FR-20 | Barista cập nhật trạng thái pha chế | Could | Barista đổi được trạng thái PAID sang PREPARING sang READY sang COMPLETED qua giao diện riêng |

## 2. Yêu cầu phi chức năng

| Mã | Nhóm | Yêu cầu | Ưu tiên | Tiêu chí chấp nhận |
|---|---|---|---|---|
| NFR-01 | Hiệu năng | Thời gian phản hồi API ngắn | Must | Các API chính phản hồi dưới 500ms với dữ liệu mẫu |
| NFR-02 | Bảo mật | Mật khẩu được băm | Must | Cơ sở dữ liệu chỉ lưu mật khẩu đã băm bằng bcrypt |
| NFR-03 | Bảo mật | Dùng JWT để xác thực | Must | API đặt đơn, thanh toán và lịch sử đơn yêu cầu token hợp lệ, token sai hoặc hết hạn trả về 401 |
| NFR-04 | Bảo mật | Validate dữ liệu đầu vào ở backend | Must | Dữ liệu sai định dạng bị từ chối với mã 400 và thông báo lỗi rõ ràng |
| NFR-05 | Bảo mật | Không để lộ bí mật | Must | Khóa, mật khẩu cơ sở dữ liệu và JWT secret không nằm trong repository hay log CI; chỉ có `.env.example` |
| NFR-06 | Tính khả dụng | Giao diện mobile-first | Must | Hiển thị đúng trên màn hình rộng từ 360px; không bị cuộn ngang |
| NFR-07 | Tính khả dụng | Tương thích trình duyệt | Must | Chạy được trên bản mới của Chrome, Firefox, Edge và Safari |
| NFR-08 | Tính khả dụng | Xử lý trạng thái chờ và lỗi | Must | Mỗi màn hình tải dữ liệu có loading và thông báo lỗi; menu có trạng thái trống |
| NFR-09 | Độ tin cậy | Dữ liệu đơn và tồn kho nhất quán | Must | Tạo đơn và trừ tồn kho nằm trong một transaction; lỗi giữa chừng thì không để lại dữ liệu dở dang |
| NFR-10 | Khả năng triển khai | Chạy toàn bộ hệ thống bằng Docker | Must | `docker compose up` chạy được web, API và cơ sở dữ liệu ở máy local |
| NFR-11 | Khả năng triển khai | Có health check | Must | `GET /health` trả về 200 khi API và cơ sở dữ liệu hoạt động |
| NFR-12 | Khả năng triển khai | Triển khai production qua HTTPS và có tự động hóa | Must | Có URL production dùng HTTPS; pipeline CI/CD chạy lint, test, build, triển khai và smoke test; cơ sở dữ liệu không công khai trực tiếp |
| NFR-13 | Khả năng kiểm thử | Có kiểm thử tự động | Must | Có unit test cho nghiệp vụ quan trọng, integration test cho tạo đơn và thanh toán, và một end-to-end test cho luồng từ menu đến xác nhận đơn |
| NFR-14 | Khả năng bảo trì | Tài liệu hướng dẫn đầy đủ | Should | README hướng dẫn chạy local, test, build, deploy và rollback; người ngoài làm theo được |
