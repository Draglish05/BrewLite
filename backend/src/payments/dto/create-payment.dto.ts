import { IsBoolean, IsIn, IsInt, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsInt()
  @Min(1)
  orderId: number;

  @IsIn(['WALLET', 'CARD'], { message: 'Phương thức chỉ được là WALLET hoặc CARD' })
  method: string;

  // Thanh toán giả lập: true thì cố tình báo lỗi để demo PAYMENT_FAILED
  @IsBoolean()
  simulateFail: boolean;
}
