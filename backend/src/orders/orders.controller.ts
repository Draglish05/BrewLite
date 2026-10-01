import { Body, Controller, Post } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // POST /orders – tạo đơn từ giỏ hàng
  // @Body(): lấy dữ liệu JSON khách gửi lên, ValidationPipe tự kiểm tra theo CreateOrderDto
  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto, null); // Task 7 sẽ thay null bằng id người đăng nhập
  }
}
