import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  orderId: number;

  // Mã chống thanh toán trùng (Idempotency-Key do frontend gửi lên).
  // unique: database không cho 2 lần thanh toán cùng 1 mã, kể cả khi 2 request tới cùng lúc
  @Column('varchar', { nullable: true, unique: true })
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
