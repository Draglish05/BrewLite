import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Product } from '../products/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderItem } from './order-item.entity';
import { Order } from './order.entity';
import { assertTransition, OrderStatus } from './order-status';
import { calcUnitPrice } from './pricing';

// Số lần thử lại khi có người khác vừa sửa tồn kho cùng món
const MAX_STOCK_RETRY = 5;

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    // DataSource dùng để mở transaction (nhiều lệnh database: thành công hết hoặc hủy hết)
    private readonly dataSource: DataSource,
  ) {}

  // Đổi tồn kho của 1 món bằng optimistic locking.
  // amount âm = trừ kho (đặt món), amount dương = cộng lại kho (hủy đơn).
  // Cách làm: đọc món (kèm version) -> chỉ cập nhật nếu version vẫn y như lúc đọc.
  // Nếu có người khác vừa sửa (version đã đổi) thì đọc lại và thử lại.
  private async changeStock(manager: EntityManager, productId: number, amount: number) {
    for (let attempt = 1; attempt <= MAX_STOCK_RETRY; attempt++) {
      const product = await manager.findOneBy(Product, { id: productId });
      if (!product) {
        throw new NotFoundException('Không tìm thấy sản phẩm id=' + productId);
      }

      const newStock = product.stock + amount;
      if (newStock < 0) {
        throw new BadRequestException(product.name + ' chỉ còn ' + product.stock + ' ly');
      }

      // UPDATE products SET stock = ..., version = version + 1 WHERE id = ... AND version = (version lúc đọc)
      const result = await manager
        .createQueryBuilder()
        .update(Product)
        .set({ stock: newStock, version: product.version + 1 })
        .where('id = :id', { id: product.id })
        .andWhere('version = :version', { version: product.version })
        .execute();

      // Cập nhật được đúng 1 dòng = không ai chen ngang -> xong
      if (result.affected === 1) {
        product.stock = newStock;
        return product;
      }
      // Không cập nhật được dòng nào = version đã bị người khác đổi -> vòng lặp đọc lại và thử lại
    }

    throw new ConflictException('Có nhiều người đặt cùng lúc, vui lòng thử lại');
  }

  async create(dto: CreateOrderDto, userId: number | null) {
    // Transaction: trừ kho + lưu đơn là 1 khối.
    // Có lỗi ở bất kỳ món nào (ví dụ món thứ 2 hết hàng) thì hủy hết, kho của món thứ 1 cũng được trả lại
    return this.dataSource.transaction(async (manager) => {
      const items: OrderItem[] = [];
      let total = 0;

      // Duyệt từng món trong giỏ: trừ kho trước, đủ hàng mới tính tiền
      for (const itemDto of dto.items) {
        const product = await this.changeStock(manager, itemDto.productId, -itemDto.qty);

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

      const saved = await manager.save(order);

      // Trả về mã đơn cho khách
      return {
        orderId: saved.id,
        status: saved.status,
        total: saved.total,
      };
    });
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
      throw new NotFoundException('Không tìm thấy đơn #' + id);
    }
    if (order.userId !== userId) {
      throw new ForbiddenException('Đơn này không phải của bạn');
    }
    return order;
  }

  // Đổi trạng thái đơn. Mọi chuyển trạng thái đều phải đi qua assertTransition
  async changeStatus(id: number, userId: number, newStatus: string) {
    const order = await this.findOne(id, userId);
    assertTransition(order.status, newStatus); // chuyển sai thì ném lỗi 400
    const oldStatus = order.status;

    await this.dataSource.transaction(async (manager) => {
      // Chỉ đổi nếu đơn vẫn đang ở trạng thái cũ (tránh 2 request hủy cùng lúc -> hoàn kho 2 lần)
      const result = await manager
        .createQueryBuilder()
        .update(Order)
        .set({ status: newStatus })
        .where('id = :id', { id: order.id })
        .andWhere('status = :oldStatus', { oldStatus: oldStatus })
        .execute();
      if (result.affected !== 1) {
        throw new ConflictException('Đơn vừa được cập nhật, vui lòng tải lại trang');
      }

      // Hủy đơn: trả lại kho các món trong đơn
      if (newStatus === OrderStatus.CANCELLED) {
        for (const item of order.items) {
          await this.changeStock(manager, item.productId, item.qty);
        }
      }
    });

    return { orderId: order.id, status: newStatus };
  }
}
