import { IsIn } from 'class-validator';
import { OrderStatus } from '../order-status';

// Khách chỉ được đổi đơn sang CANCELLED (hủy đơn).
// PAID / PAYMENT_FAILED chỉ được đổi qua POST /payments, để không ai "thanh toán" mà không trả tiền.
// PREPARING / READY / COMPLETED là việc của Barista – nằm ngoài MVP.
export class UpdateStatusDto {
  @IsIn([OrderStatus.CANCELLED], { message: 'Bạn chỉ được hủy đơn' })
  status: string;
}
