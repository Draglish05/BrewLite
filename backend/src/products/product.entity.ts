import { Column, Entity, PrimaryGeneratedColumn, VersionColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('int')
  price: number;

  // Đường dẫn ảnh của món, ví dụ '/images/ca-phe-sua.svg' (file nằm trong frontend/public/images)
  @Column({ default: '' })
  imageUrl: string;

  @Column('int')
  stock: number;

  // Số phiên bản của dòng (optimistic locking – Task 10.3).
  // Mỗi lần đổi tồn kho thì tăng 1. Ai sửa dựa trên phiên bản cũ thì bị từ chối và phải đọc lại.
  @VersionColumn({ default: 1 })
  version: number;

  // Loại đồ uống: Cà phê, Trà sữa, Trà, Matcha, Cacao
  @Column({ default: 'Cà phê' })
  category: string;

  // Màu nước trong hình ly (frontend dùng để vẽ)
  @Column({ default: '#6f4e37' })
  color: string;
}
