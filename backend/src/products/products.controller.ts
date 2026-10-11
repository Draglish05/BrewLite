import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products') // Mọi URL bắt đầu bằng /products
export class ProductsController {
  // NestJS tự đưa ProductsService vào đây (Dependency Injection)
  constructor(private readonly productsService: ProductsService) {}

  @Get() // GET /products
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id') // GET /products/2
  findOne(@Param('id', ParseIntPipe) id: number) {
    // ParseIntPipe: đổi "2" (chữ) thành 2 (số); nếu là "abc" thì trả lỗi 400
    return this.productsService.findOne(id);
  }
}
