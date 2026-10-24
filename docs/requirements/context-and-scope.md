# Bối cảnh và phạm vi của BrewLite

## 1. Bối cảnh và vấn đề

Tại các quán cà phê hiện nay, khách hàng thường phải xếp hàng để gọi món, trả tiền tại quầy, sau đó mới có được ly cà phê mình yêu thích. Nhưng vào giờ cao điểm, quán có thể bị quá tải do số lượng khách đến quá đông, làm ảnh hưởng đến trải nghiệm của khách hàng cũng như khiến nhân viên bị dồn quá nhiều việc cùng một lúc.

BrewLite là ứng dụng web cho phép khách xem menu, lựa chọn đồ uống, chọn size và topping, đặt đồ uống và thanh toán không dùng tiền mặt chỉ trong một vài chạm trên điện thoại. Sau khi đặt, khách theo dõi được trạng thái đơn và chỉ cần tới quầy nhận đồ. Qua đó có thể tiết kiệm được thời gian khách hàng đứng lựa món và thanh toán.

## 2. Stakeholder

| Stakeholder | Mục tiêu | Kỳ vọng |
|---|---|---|
| Khách hàng | Đặt và thanh toán đồ uống nhanh, không xếp hàng | Giao diện dễ dùng trên điện thoại, thấy rõ tổng tiền, biết trạng thái đơn của mình |
| Nhân viên quầy / Barista | Nhận đơn và pha chế đúng thứ tự | Thấy đơn mới ngay, không phải hỏi lại khách (thuộc phần mở rộng, ngoài MVP) |
| Quản lý cửa hàng / Product Owner | Giảm thời gian xếp hàng, tăng số đơn phục vụ | Sản phẩm bám sát yêu cầu, được nghiệm thu sau mỗi Sprint |
| Giảng viên / khách hàng nghiệm thu | Đánh giá quy trình và sản phẩm | Có đủ tài liệu, mã nguồn chạy được, demo luồng đặt đơn đến thanh toán |
| Nhóm phát triển | Phân tích, thiết kế, lập trình, kiểm thử và bàn giao | Yêu cầu rõ ràng, phạm vi vừa sức, công nghệ thống nhất |
| Đơn vị thanh toán | Xử lý giao dịch không tiền mặt | Yêu cầu thanh toán đúng định dạng, không bị trừ tiền hai lần (trong bài dùng cổng mô phỏng) |

## 3. Phạm vi

### 3.1. Trong MVP (in-scope)

- Xem menu đồ uống (hình, tên, giá).
- Xem chi tiết sản phẩm, chọn size và topping.
- Giỏ hàng: thêm, sửa số lượng, xóa, tự tính tổng tiền.
- Đăng ký và đăng nhập (JWT).
- Tạo đơn hàng.
- Thanh toán không tiền mặt bằng Ví hoặc Thẻ (mô phỏng).
- Xác nhận đơn và xem lịch sử đơn.
- Nghiệp vụ backend: quản lý trạng thái đơn, thanh toán không bị lặp, kiểm soát tồn kho khi đặt đồng thời, khuyến mãi và điểm thưởng.

### 3.2. Phạm vi mở rộng

- Màn hình cho barista nhận đơn và cập nhật trạng thái pha chế.
- Thông báo khi đơn sẵn sàng.

### 3.3. Không thực hiện (out-of-scope)

- Thanh toán thật với ngân hàng hoặc ví điện tử.
- Giao hàng tận nơi.
- Trang quản trị menu, tồn kho và báo cáo doanh thu.
- Ứng dụng di động native (chỉ làm web).
- Hỗ trợ nhiều chi nhánh và nhiều ngôn ngữ.

## 4. Giả định và ràng buộc

### 4.1. Giả định

- Thanh toán chỉ là mô phỏng, không có giao dịch tiền thật.
- Dữ liệu menu là dữ liệu mẫu, được nạp sẵn vào cơ sở dữ liệu.
- Khách hàng có điện thoại hoặc máy tính kết nối Internet và dùng trình duyệt hiện đại.
- Mỗi cửa hàng chỉ có một quầy nhận đồ.

### 4.2. Ràng buộc

- Bắt buộc dùng NestJS cho backend, Next.js cho frontend và PostgreSQL cho cơ sở dữ liệu.
- Ứng dụng phải hiển thị tốt trên điện thoại (mobile-first) và chạy được trên các trình duyệt web phổ biến.
- Hệ thống phải triển khai được lên một địa chỉ truy cập qua HTTPS.
- Thời gian phản hồi API dưới 500ms với dữ liệu mẫu.

## 5. Rủi ro ban đầu

| Rủi ro | Mức độ | Cách giảm thiểu |
|---|---|---|
| Nghiệp vụ backend phức tạp (thanh toán không lặp, tồn kho đồng thời) | Cao | Làm sau khi luồng cơ bản chạy ổn, viết test sớm |
| Triển khai production gặp lỗi muộn | Cao | Thử triển khai bản đơn giản từ sớm |
| Cổng thanh toán mô phỏng phản hồi lỗi hoặc chậm | Trung bình | Xử lý trạng thái PAYMENT_FAILED, giữ nguyên giỏ hàng để khách thử lại |
| Đặt đồng thời làm bán vượt số lượng tồn | Trung bình | Dùng transaction và optimistic locking khi trừ tồn kho |

