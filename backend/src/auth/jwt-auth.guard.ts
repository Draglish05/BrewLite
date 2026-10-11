import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

// Guard: chặn người chưa đăng nhập. Gắn lên route nào thì route đó cần JWT.
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Header có dạng: Authorization: Bearer <token>
    const header = request.headers['authorization'];
    if (!header) {
      throw new UnauthorizedException('Bạn cần đăng nhập');
    }

    const parts = String(header).split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedException('Token không hợp lệ');
    }

    try {
      const payload = await this.jwtService.verifyAsync(parts[1]);
      // Lưu người dùng vào request để controller dùng
      request.user = { id: payload.sub, email: payload.email };
    } catch {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }

    return true;
  }
}
