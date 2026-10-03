import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderItem } from './order-item.entity';
import { Order } from './order.entity';
import { OrderStatus } from './order-status';
import { calcUnitPrice } from './pricing';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async create(dto: CreateOrderDto, userId: number | null) {
    const items: OrderItem[] = [];
    let total = 0;

    // Duyệt từng món trong giỏ
    for (const itemDto of dto.items) {
      const product = await this.productRepo.findOneBy({ id: itemDto.productId });
      if (!product) {
        throw new NotFoundException(`Không tìm thấy sản phẩm id=${itemDto.productId}`);
      }
      if (itemDto.qty > product.stock) {
        throw new BadRequestException(`${product.name} chỉ còn ${product.stock} ly`);
      }

      // Backend tự tính giá
      const unitPrice = calcUnitPrice(product.price, itemDto.size, itemDto.toppings);

      const item = new OrderItem();
      item.productId = product.id;
      item.productName = product.name;
      item.size = itemDto.size;
      item.toppings = itemDto.toppings;
      item.qty = itemDto.qty;
      item.unitPrice = unitPrice;
      item.lineTotal = unitPrice * itemDto.qty;

      items.push(item);
      total = total + item.lineTotal;
    }

    // Tạo đơn ở trạng thái PENDING (chờ thanh toán)
    const order = new Order();
    order.userId = userId;
    order.status = OrderStatus.PENDING;
    order.total = total;
    order.items = items;

    const saved = await this.orderRepo.save(order);

    // Trả về mã đơn cho khách
    return {
      orderId: saved.id,
      status: saved.status,
      total: saved.total,
    };
  }

  // Lịch sử đơn của 1 người, đơn mới nhất ở trên cùng
  findMine(userId: number) {
    return this.orderRepo.find({
      where: { userId: userId },
      relations: { items: true },
      order: { id: 'DESC' },
    });
  }

  // Chi tiết 1 đơn (màn hình xác nhận), chỉ chủ đơn mới xem được
  async findOne(id: number, userId: number) {
    const order = await this.orderRepo.findOne({
      where: { id: id },
      relations: { items: true },
    });
    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn #${id}`);
    }
    if (order.userId !== userId) {
      throw new ForbiddenException('Đơn này không phải của bạn');
    }
    return order;
  }
}
