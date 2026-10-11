import { BadRequestException, Body, Controller, Headers, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // POST /payments – thanh toán đơn, cần đăng nhập
  // Bắt buộc gửi header "Idempotency-Key": cùng 1 mã gửi lại nhiều lần chỉ thanh toán 1 lần
  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() dto: CreatePaymentDto,
    @Headers('idempotency-key') idempotencyKey: string,
    @Req() req: any,
  ) {
    if (!idempotencyKey) {
      throw new BadRequestException('Thiếu header Idempotency-Key');
    }
    return this.paymentsService.create(dto, req.user.id, idempotencyKey);
  }
}
