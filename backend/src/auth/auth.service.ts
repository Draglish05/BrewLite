import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // Email đã có người dùng thì báo lỗi 409
    const existing = await this.userRepo.findOneBy({ email: dto.email });
    if (existing) {
      throw new ConflictException('Email này đã được đăng ký');
    }

    // Băm mật khẩu trước khi lưu (10 là độ mạnh của việc băm)
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = new User();
    user.email = dto.email;
    user.passwordHash = passwordHash;
    const saved = await this.userRepo.save(user);

    // Không trả passwordHash về cho khách
    return { id: saved.id, email: saved.email };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOneBy({ email: dto.email });
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // So sánh mật khẩu khách gõ với bản đã băm
    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // Tạo JWT: sub là id người dùng
    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken: accessToken,
      user: { id: user.id, email: user.email, loyaltyPoints: user.loyaltyPoints },
    };
  }
}
