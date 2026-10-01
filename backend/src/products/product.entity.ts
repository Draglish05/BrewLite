import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('int')
  price: number;

  // Giữ đúng theo đề (Product có imageUrl). Hiện frontend tự vẽ hình ly nên để trống.
  @Column({ default: '' })
  imageUrl: string;

  @Column('int')
  stock: number;

  // Loại đồ uống: Cà phê, Trà sữa, Trà, Matcha, Cacao
  @Column({ default: 'Cà phê' })
  category: string;

  // Màu nước trong hình ly (frontend dùng để vẽ)
  @Column({ default: '#6f4e37' })
  color: string;
}
