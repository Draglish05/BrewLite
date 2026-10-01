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

  @Column('int')
  total: number;

  @CreateDateColumn()
  createdAt: Date;

  // 1 đơn có nhiều dòng món; cascade: lưu đơn thì lưu luôn các dòng
  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];
}
