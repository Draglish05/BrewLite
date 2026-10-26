import { IsBoolean, IsIn, IsInt, IsOptional } from 'class-validator';

export class CreatePaymentDto {
  @IsInt({ message: 'Mã đơn hàng không hợp lệ' })
  orderId: number;

  @IsIn(['WALLET', 'CARD'], { message: 'Phương thức thanh toán không hợp lệ' })
  method: 'WALLET' | 'CARD';

  // Chỉ dùng để thử nhánh thanh toán lỗi với cổng giả lập
  @IsOptional()
  @IsBoolean()
  simulateFail?: boolean;
}
