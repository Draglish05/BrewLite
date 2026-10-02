import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  orderId: number;

  // Khóa chống thanh toán trùng, Task 10 sẽ dùng
  @Column('varchar', { nullable: true })
  idempotencyKey: string | null;

  @Column('int')
  amount: number;

  // WALLET (Ví) hoặc CARD (Thẻ)
  @Column()
  method: string;

  // SUCCESS hoặc FAILED
  @Column()
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}
