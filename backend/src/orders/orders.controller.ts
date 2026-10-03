import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // POST /orders – tạo đơn từ giỏ hàng, cần đăng nhập (JwtAuthGuard)
  // @Body(): lấy dữ liệu JSON khách gửi lên, ValidationPipe tự kiểm tra theo CreateOrderDto
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateOrderDto, @Req() req: any) {
    // req.user do guard gắn vào sau khi kiểm tra token
    return this.ordersService.create(dto, req.user.id);
  }

  // GET /orders/me – lịch sử đơn của tôi
  // (phải đặt trước ':id', nếu không chữ "me" bị hiểu nhầm là mã đơn)
  @UseGuards(JwtAuthGuard)
  @Get('me')
  findMine(@Req() req: any) {
    return this.ordersService.findMine(req.user.id);
  }

  // GET /orders/5 – chi tiết đơn #5 (màn hình xác nhận)
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.ordersService.findOne(id, req.user.id);
  }
}
