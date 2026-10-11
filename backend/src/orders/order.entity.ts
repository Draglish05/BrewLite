import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { OrderItem } from './order-item.entity';
import { OrderStatus } from './order-status';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number; // cũng chính là mã đơn (#1, #2, ...)

  // Ai đặt đơn – Task 7 (đăng nhập) sẽ điền vào
  @Column('int', { nullable: true })
  userId: number | null;

  @Column({ default: OrderStatus.PENDING })
  status: string;

  // Số tiền khách phải trả = tiền hàng - discount
  @Column('int')
  total: number;

  // Mã giảm giá đã dùng (rỗng = không dùng) và số tiền được giảm
  @Column({ default: '' })
  promoCode: string;

  @Column('int', { default: 0 })
  discount: number;

  @CreateDateColumn()
  createdAt: Date;

  // 1 đơn có nhiều dòng món; cascade: lưu đơn thì lưu luôn các dòng
  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];
}
