import { BadRequestException } from '@nestjs/common';
import { Order } from '../orders/order.entity';
import { Payment } from './payment.entity';
import { PaymentsService } from './payments.service';

// Bảng payments giả lập: lưu trong mảng, không cần database thật
class FakePaymentRepo {
  rows: Payment[] = [];

  async findOneBy(where: { idempotencyKey: string }) {
    for (const row of this.rows) {
      if (row.idempotencyKey === where.idempotencyKey) {
        return row;
      }
    }
    return null;
  }

  async save(payment: Payment) {
    // Giống cột unique trong database: trùng mã thì báo lỗi
    for (const row of this.rows) {
      if (row.idempotencyKey === payment.idempotencyKey) {
        throw new Error('duplicate key value violates unique constraint');
      }
    }
    payment.id = this.rows.length + 1;
    this.rows.push(payment);
    return payment;
  }
}

// Bảng orders giả lập: chỉ có 1 đơn
class FakeOrderRepo {
  order: Order;
  saveCount = 0; // số lần đơn được lưu (đổi trạng thái)

  constructor(order: Order) {
    this.order = order;
  }

  async findOneBy(where: { id: number }) {
    if (where.id === this.order.id) {
      return this.order;
    }
    return null;
  }

  async save(order: Order) {
    this.saveCount = this.saveCount + 1;
    this.order = order;
    return order;
  }
}

// Tạo 1 đơn mẫu đang chờ thanh toán, của user id = 7
function createPendingOrder() {
  const order = new Order();
  order.id = 1;
  order.userId = 7;
  order.status = 'PENDING';
  order.total = 45000;
  return order;
}

// Test (b): gửi nhiều lần cùng Idempotency-Key chỉ thanh toán 1 lần
describe('Thanh toán idempotent (Idempotency-Key)', () => {
  let paymentRepo: FakePaymentRepo;
  let orderRepo: FakeOrderRepo;
  let service: PaymentsService;

  beforeEach(() => {
    paymentRepo = new FakePaymentRepo();
    orderRepo = new FakeOrderRepo(createPendingOrder());
    service = new PaymentsService(paymentRepo as any, orderRepo as any);
  });

  it('gửi 2 lần liên tiếp cùng mã: chỉ tạo 1 lần thanh toán, lần 2 trả lại đúng kết quả cũ', async () => {
    const dto = { orderId: 1, method: 'CARD', simulateFail: false };

    const first = await service.create(dto, 7, 'key-abc');
    const second = await service.create(dto, 7, 'key-abc');

    expect(paymentRepo.rows.length).toBe(1); // chỉ 1 dòng trong bảng payments
    expect(orderRepo.saveCount).toBe(1); // đơn chỉ được chuyển trạng thái 1 lần
    expect(first.status).toBe('PAID');
    expect(second.paymentId).toBe(first.paymentId); // cùng 1 lần thanh toán
    expect(second.status).toBe('PAID');
  });

  it('gửi 2 lần CÙNG LÚC cùng mã: vẫn chỉ tạo 1 lần thanh toán', async () => {
    const dto = { orderId: 1, method: 'WALLET', simulateFail: false };

    // Promise.all: chạy 2 request song song, giống bấm 2 lần thật nhanh
    const results = await Promise.all([
      service.create(dto, 7, 'key-xyz'),
      service.create(dto, 7, 'key-xyz'),
    ]);

    expect(paymentRepo.rows.length).toBe(1);
    expect(orderRepo.saveCount).toBe(1);
    expect(results[0].paymentId).toBe(results[1].paymentId);
  });

  it('mã khác nhưng đơn đã PAID: bị chặn, không thanh toán lần 2', async () => {
    const dto = { orderId: 1, method: 'CARD', simulateFail: false };

    await service.create(dto, 7, 'key-1');

    await expect(service.create(dto, 7, 'key-2')).rejects.toThrow(BadRequestException);
    expect(paymentRepo.rows.length).toBe(1);
  });

  it('thanh toán lỗi rồi gửi lại cùng mã: trả lại kết quả lỗi cũ, không tự thanh toán thêm', async () => {
    const failDto = { orderId: 1, method: 'CARD', simulateFail: true };

    const first = await service.create(failDto, 7, 'key-fail');
    const second = await service.create(failDto, 7, 'key-fail');

    expect(first.status).toBe('PAYMENT_FAILED');
    expect(second.status).toBe('PAYMENT_FAILED');
    expect(paymentRepo.rows.length).toBe(1);
  });
});
