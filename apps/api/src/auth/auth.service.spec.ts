import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  const prisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };
  const jwtService = { signAsync: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();
    service = module.get(AuthService);
  });

  it('register lưu mật khẩu đã băm, không lưu mật khẩu thô', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({ id: 1, email: 'a@b.com' });

    await service.register({ email: 'a@b.com', password: 'matkhau123' });

    const saved = prisma.user.create.mock.calls[0][0].data;
    expect(saved.passwordHash).not.toBe('matkhau123');
    expect(await bcrypt.compare('matkhau123', saved.passwordHash)).toBe(true);
  });

  it('register báo lỗi khi email đã tồn tại', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 1 });

    await expect(
      service.register({ email: 'a@b.com', password: 'matkhau123' }),
    ).rejects.toThrow(ConflictException);
  });

  it('login đúng mật khẩu thì trả về token', async () => {
    const passwordHash = await bcrypt.hash('matkhau123', 4);
    prisma.user.findUnique.mockResolvedValue({ id: 1, email: 'a@b.com', passwordHash });
    jwtService.signAsync.mockResolvedValue('token-gia');

    const result = await service.login({ email: 'a@b.com', password: 'matkhau123' });

    expect(result).toEqual({ accessToken: 'token-gia' });
  });

  it('login sai mật khẩu thì báo lỗi 401', async () => {
    const passwordHash = await bcrypt.hash('matkhau123', 4);
    prisma.user.findUnique.mockResolvedValue({ id: 1, email: 'a@b.com', passwordHash });

    await expect(
      service.login({ email: 'a@b.com', password: 'sai-mat-khau' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('login với email không tồn tại thì báo lỗi 401', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      service.login({ email: 'khong@co.com', password: 'matkhau123' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
