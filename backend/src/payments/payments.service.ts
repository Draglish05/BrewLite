import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/order.entity';
import { assertTransition, OrderStatus } from '../orders/order-status';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Payment } from './payment.entity';

// Tạo kết quả trả về cho khách từ 1 lần thanh toán đã lưu
function buildResult(payment: Payment) {
  let orderStatus = OrderStatus.PAID;
  let message = 'Thanh toán thành công';
  if (payment.status === 'FAILED') {
    orderStatus = OrderStatus.PAYMENT_FAILED;
    message = 'Thanh toán thất bại, giỏ hàng của bạn vẫn được giữ nguyên';
  }

  return {
    paymentId: payment.id,
    orderId: payment.orderId,
    status: orderStatus,
    method: payment.method,
    amount: payment.amount,
    message: message,
  };
}

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  async create(dto: CreatePaymentDto, userId: number, idempotencyKey: string) {
    const order = await this.orderRepo.findOneBy({ id: dto.orderId });
    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn #' + dto.orderId);
    }

    // Chỉ chủ đơn mới được thanh toán
    if (order.userId !== userId) {
      throw new ForbiddenException('Đơn này không phải của bạn');
    }

    // Idempotency: mã này đã thanh toán rồi thì KHÔNG thanh toán lại,
    // chỉ trả về đúng kết quả của lần trước (không trừ tiền lần 2)
    const oldPayment = await this.paymentRepo.findOneBy({ idempotencyKey: idempotencyKey });
    if (oldPayment) {
      if (oldPayment.orderId !== order.id) {
        throw new BadRequestException('Idempotency-Key này đã được dùng cho đơn khác');
      }
      return buildResult(oldPayment);
    }

    // Chỉ đơn đang chờ (hoặc vừa lỗi, cho thử lại) mới thanh toán được
    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.PAYMENT_FAILED) {
      throw new BadRequestException('Đơn #' + order.id + ' đang ở trạng thái ' + order.status + ', không thể thanh toán');
    }

    // Thử lại sau khi lỗi: PAYMENT_FAILED -> PENDING (đúng sơ đồ state machine)
    if (order.status === OrderStatus.PAYMENT_FAILED) {
      assertTransition(order.status, OrderStatus.PENDING);
      order.status = OrderStatus.PENDING;
    }

    // Thanh toán giả lập: thành công trừ khi khách chọn giả lập lỗi
    let paymentStatus = 'SUCCESS';
    let orderStatus = OrderStatus.PAID;
    if (dto.simulateFail) {
      paymentStatus = 'FAILED';
      orderStatus = OrderStatus.PAYMENT_FAILED;
    }

    // Số tiền lấy từ đơn trong database, không tin số tiền từ frontend
    const payment = new Payment();
    payment.orderId = order.id;
    payment.idempotencyKey = idempotencyKey;
    payment.amount = order.total;
    payment.method = dto.method;
    payment.status = paymentStatus;

    let savedPayment: Payment;
    try {
      savedPayment = await this.paymentRepo.save(payment);
    } catch (error) {
      // 2 request cùng mã tới cùng lúc: database (cột unique) chỉ cho 1 cái lưu được.
      // Request lưu sau sẽ lỗi ở đây -> trả về kết quả của request đã lưu trước
      const firstPayment = await this.paymentRepo.findOneBy({ idempotencyKey: idempotencyKey });
      if (firstPayment) {
        return buildResult(firstPayment);
      }
      throw error;
    }

    // PENDING -> PAID hoặc PENDING -> PAYMENT_FAILED
    assertTransition(order.status, orderStatus);
    order.status = orderStatus;
    await this.orderRepo.save(order);

    return buildResult(savedPayment);
  }
}
