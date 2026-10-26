import { Injectable } from '@nestjs/common';

// Cổng thanh toán giả lập (thay cho Momo, VNPay, Stripe...).
// Trả về true khi thanh toán thành công, false khi thất bại.
@Injectable()
export class MockPaymentGateway {
  async charge(amount: number, simulateFail: boolean) {
    await new Promise((resolve) => setTimeout(resolve, 200)); // mô phỏng độ trễ
    return amount > 0 && simulateFail === false;
  }
}
