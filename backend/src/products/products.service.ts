import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';

// Dữ liệu mẫu của menu (category = loại, color = màu nước trong hình ly)
// imageUrl: ảnh của món, nằm trong frontend/public/images
const SAMPLE_PRODUCTS = [
  // Cà phê
  { category: 'Cà phê', name: 'Cà phê sữa', price: 35000, stock: 50, color: '#a9764f', imageUrl: '/images/ca-phe-sua.svg' },
  { category: 'Cà phê', name: 'Americano', price: 40000, stock: 50, color: '#3b2318', imageUrl: '/images/americano.svg' },
  { category: 'Cà phê', name: 'Cappuccino', price: 45000, stock: 30, color: '#c79a73', imageUrl: '/images/cappuccino.svg' },
  { category: 'Cà phê', name: 'Espresso', price: 40000, stock: 20, color: '#2a160d', imageUrl: '/images/espresso.svg' },
  // Trà sữa
  { category: 'Trà sữa', name: 'Trà sữa truyền thống', price: 35000, stock: 50, color: '#c8a27c', imageUrl: '/images/tra-sua-truyen-thong.svg' },
  { category: 'Trà sữa', name: 'Trà sữa đường đen', price: 42000, stock: 40, color: '#8a5a3c', imageUrl: '/images/tra-sua-duong-den.svg' },
  { category: 'Trà sữa', name: 'Trà sữa Thái xanh', price: 39000, stock: 40, color: '#9cc9a1', imageUrl: '/images/tra-sua-thai-xanh.svg' },
  // Trà
  { category: 'Trà', name: 'Trà đào cam sả', price: 39000, stock: 40, color: '#f2a65a', imageUrl: '/images/tra-dao-cam-sa.svg' },
  { category: 'Trà', name: 'Trà vải', price: 37000, stock: 40, color: '#f3c6c8', imageUrl: '/images/tra-vai.svg' },
  { category: 'Trà', name: 'Trà chanh mật ong', price: 32000, stock: 50, color: '#e8c547', imageUrl: '/images/tra-chanh-mat-ong.svg' },
  // Matcha
  { category: 'Matcha', name: 'Matcha latte', price: 45000, stock: 30, color: '#8fb36a', imageUrl: '/images/matcha-latte.svg' },
  { category: 'Matcha', name: 'Matcha đá xay', price: 49000, stock: 30, color: '#6e9a4f', imageUrl: '/images/matcha-da-xay.svg' },
  // Cacao
  { category: 'Cacao', name: 'Cacao nóng', price: 35000, stock: 40, color: '#6b3f2a', imageUrl: '/images/cacao-nong.svg' },
  { category: 'Cacao', name: 'Cacao sữa đá', price: 38000, stock: 40, color: '#94604a', imageUrl: '/images/cacao-sua-da.svg' },
];

@Injectable()
export class ProductsService implements OnModuleInit {
  constructor(
    // NestJS đưa "thủ kho" của bảng products vào đây
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  // Tự chạy 1 lần khi server khởi động:
  // món nào chưa có trong DB thì thêm, món đã có thì cập nhật loại, màu và ảnh
  async onModuleInit() {
    for (const sample of SAMPLE_PRODUCTS) {
      const existing = await this.productRepo.findOneBy({ name: sample.name });
      if (existing) {
        existing.category = sample.category;
        existing.color = sample.color;
        existing.imageUrl = sample.imageUrl;
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

  // SELECT * FROM products WHERE id = (id cần tìm)
  async findOne(id: number): Promise<Product> {
    const product = await this.productRepo.findOneBy({ id });
    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm id=' + id);
    }
    return product;
  }
}
