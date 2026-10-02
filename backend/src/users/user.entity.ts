import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  // unique: không cho 2 người đăng ký cùng một email
  @Column({ unique: true })
  email: string;

  // Lưu mật khẩu đã băm (bcrypt), không bao giờ lưu mật khẩu thật
  @Column()
  passwordHash: string;

  // Điểm tích lũy, dùng ở Task 10
  @Column({ default: 0 })
  loyaltyPoints: number;
}
