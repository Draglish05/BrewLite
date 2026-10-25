import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from './products.service';

const cappuccino = {
  id: 1,
  name: 'Cappuccino',
  price: 45000,
  imageUrl: 'cappuccino.jpg',
  stock: 10,
  version: 0,
};

describe('ProductsService', () => {
  let service: ProductsService;
  const prisma = {
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module = await Test.createTestingModule({
      providers: [ProductsService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(ProductsService);
  });

  it('findAll trả về danh sách sản phẩm', async () => {
    prisma.product.findMany.mockResolvedValue([cappuccino]);

    expect(await service.findAll()).toEqual([cappuccino]);
  });

  it('findOne trả về đúng sản phẩm theo id', async () => {
    prisma.product.findUnique.mockResolvedValue(cappuccino);

    expect(await service.findOne(1)).toEqual(cappuccino);
  });

  it('findOne báo lỗi 404 khi không có sản phẩm', async () => {
    prisma.product.findUnique.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });
});
