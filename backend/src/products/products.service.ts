import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';

// Dữ liệu mẫu của menu (category = loại, color = màu nước trong hình ly)
const SAMPLE_PRODUCTS = [
  // Cà phê
  { category: 'Cà phê', name: 'Cà phê sữa', price: 35000, stock: 50, color: '#a9764f' },
  { category: 'Cà phê', name: 'Americano', price: 40000, stock: 50, color: '#3b2318' },
  { category: 'Cà phê', name: 'Cappuccino', price: 45000, stock: 30, color: '#c79a73' },
  { category: 'Cà phê', name: 'Espresso', price: 40000, stock: 20, color: '#2a160d' },
  // Trà sữa
  { category: 'Trà sữa', name: 'Trà sữa truyền thống', price: 35000, stock: 50, color: '#c8a27c' },
  { category: 'Trà sữa', name: 'Trà sữa đường đen', price: 42000, stock: 40, color: '#8a5a3c' },
  { category: 'Trà sữa', name: 'Trà sữa Thái xanh', price: 39000, stock: 40, color: '#9cc9a1' },
  // Trà
  { category: 'Trà', name: 'Trà đào cam sả', price: 39000, stock: 40, color: '#f2a65a' },
  { category: 'Trà', name: 'Trà vải', price: 37000, stock: 40, color: '#f3c6c8' },
  { category: 'Trà', name: 'Trà chanh mật ong', price: 32000, stock: 50, color: '#e8c547' },
  // Matcha
  { category: 'Matcha', name: 'Matcha latte', price: 45000, stock: 30, color: '#8fb36a' },
  { category: 'Matcha', name: 'Matcha đá xay', price: 49000, stock: 30, color: '#6e9a4f' },
  // Cacao
  { category: 'Cacao', name: 'Cacao nóng', price: 35000, stock: 40, color: '#6b3f2a' },
  { category: 'Cacao', name: 'Cacao sữa đá', price: 38000, stock: 40, color: '#94604a' },
];

@Injectable()
export class ProductsService implements OnModuleInit {
  constructor(
    // NestJS đưa "thủ kho" của bảng products vào đây
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  // Tự chạy 1 lần khi server khởi động:
  // món nào chưa có trong DB thì thêm, món đã có thì cập nhật loại và màu
  async onModuleInit() {
    for (const sample of SAMPLE_PRODUCTS) {
      const existing = await this.productRepo.findOneBy({ name: sample.name });
      if (existing) {
        existing.category = sample.category;
        existing.color = sample.color;
        existing.imageUrl = '';
        await this.productRepo.save(existing);
      } else {
        await this.productRepo.save(sample);
      }
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
