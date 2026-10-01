import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  // Mỗi dòng thuộc về 1 đơn (tạo cột orderId trong bảng)
  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  order: Order;

  @Column('int')
  productId: number;

  @Column()
  productName: string;

  @Column()
  size: string;

  // Lưu dạng chữ "Trân châu,Kem"
  @Column('simple-array', { nullable: true })
  toppings: string[];

  @Column('int')
  qty: number;

  @Column('int')
  unitPrice: number;

  @Column('int')
  lineTotal: number; // = unitPrice x qty
}
