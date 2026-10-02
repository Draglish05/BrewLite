import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/order.entity';
import { OrderStatus } from '../orders/order-status';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Payment } from './payment.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  async create(dto: CreatePaymentDto, userId: number) {
    const order = await this.orderRepo.findOneBy({ id: dto.orderId });
    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn #${dto.orderId}`);
    }

    // Chỉ chủ đơn mới được thanh toán
    if (order.userId !== userId) {
      throw new ForbiddenException('Đơn này không phải của bạn');
    }

    // Chỉ đơn đang chờ (hoặc vừa lỗi, cho thử lại) mới thanh toán được
    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.PAYMENT_FAILED) {
      throw new BadRequestException(`Đơn #${order.id} đang ở trạng thái ${order.status}, không thể thanh toán`);
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
    payment.idempotencyKey = null;
    payment.amount = order.total;
    payment.method = dto.method;
    payment.status = paymentStatus;
    const savedPayment = await this.paymentRepo.save(payment);

    order.status = orderStatus;
    await this.orderRepo.save(order);

    let message = 'Thanh toán thành công';
    if (dto.simulateFail) {
      message = 'Thanh toán thất bại, giỏ hàng của bạn vẫn được giữ nguyên';
    }

    return {
      paymentId: savedPayment.id,
      orderId: order.id,
      status: order.status,
      method: savedPayment.method,
      amount: savedPayment.amount,
      message: message,
    };
  }
}
