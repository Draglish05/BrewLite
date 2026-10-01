import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';

// Dữ liệu mẫu: chỉ được thêm vào DB khi bảng products còn trống
const SAMPLE_PRODUCTS = [
  { name: 'Cà phê sữa', price: 35000, imageUrl: '/images/ca-phe-sua.svg', stock: 50 },
  { name: 'Americano', price: 40000, imageUrl: '/images/americano.svg', stock: 50 },
  { name: 'Cappuccino', price: 45000, imageUrl: '/images/cappuccino.svg', stock: 30 },
  { name: 'Espresso', price: 40000, imageUrl: '/images/espresso.svg', stock: 20 },
];

@Injectable()
export class ProductsService implements OnModuleInit {
  constructor(
    // NestJS đưa "thủ kho" của bảng products vào đây
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  // Tự chạy 1 lần khi server khởi động
  async onModuleInit() {
    const count = await this.productRepo.count();
    if (count === 0) {
      await this.productRepo.save(SAMPLE_PRODUCTS);
    }
  }

  // SELECT * FROM products ORDER BY id
  findAll(): Promise<Product[]> {
    return this.productRepo.find({ order: { id: 'ASC' } });
  }

  // SELECT * FROM products WHERE id = ?
  async findOne(id: number): Promise<Product> {
    const product = await this.productRepo.findOneBy({ id });
    if (!product) {
      throw new NotFoundException(`Không tìm thấy sản phẩm id=${id}`);
    }
    return product;
  }
}
