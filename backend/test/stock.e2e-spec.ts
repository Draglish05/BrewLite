import { DataSource } from 'typeorm';
import { OrderItem } from '../src/orders/order-item.entity';
import { Order } from '../src/orders/order.entity';
import { OrdersService } from '../src/orders/orders.service';
import { Product } from '../src/products/product.entity';

// Test (c): nhiều người đặt CÙNG LÚC cũng không bán quá tồn kho.
// Test này chạy với database PostgreSQL THẬT (cần bật: docker compose up -d db)
// vì transaction và optimistic locking là việc của database, không giả lập bằng mảng được.

// Thông tin kết nối: lấy từ biến môi trường, không có thì dùng giống backend/.env
function getEnv(name: string, defaultValue: string) {
  const value = process.env[name];
  if (value) {
    return value;
  }
  return defaultValue;
}

describe('Tồn kho khi đặt đồng thời (transaction + optimistic locking)', () => {
  let dataSource: DataSource;
  let service: OrdersService;
  let product: Product;
  const createdOrderIds: number[] = []; // đơn tạo ra trong test, cuối test sẽ xóa

  // Tạo đơn 1 món (của user id 999 – user giả chỉ dùng trong test)
  async function orderOne(qty: number) {
    const result = await service.create(
      { items: [{ productId: product.id, size: 'S', toppings: [], qty: qty }] },
      999,
    );
    createdOrderIds.push(result.orderId);
    return result;
  }

  // Đọc lại tồn kho mới nhất trong database
  async function readStock() {
    const fresh = await dataSource.getRepository(Product).findOneBy({ id: product.id });
    if (!fresh) {
      return -1;
    }
    return fresh.stock;
  }

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'postgres',
      host: getEnv('DB_HOST', 'localhost'),
      port: Number(getEnv('DB_PORT', '5433')),
      username: getEnv('DB_USER', 'brewlite'),
      password: getEnv('DB_PASSWORD', 'brewlite'),
      database: getEnv('DB_NAME', 'brewlite'),
      entities: [Product, Order, OrderItem],
      synchronize: true,
    });
    await dataSource.initialize();

    service = new OrdersService(dataSource.getRepository(Order), dataSource);
  });

  // Mỗi test dùng 1 món riêng, tồn kho ban đầu = 5
  beforeEach(async () => {
    const newProduct = new Product();
    newProduct.name = 'TEST tồn kho ' + Date.now();
    newProduct.price = 10000;
    newProduct.stock = 5;
    product = await dataSource.getRepository(Product).save(newProduct);
  });

  afterEach(async () => {
    // Xóa đơn đã tạo (order_items tự xóa theo) và món test
    for (const orderId of createdOrderIds) {
      await dataSource.getRepository(Order).delete(orderId);
    }
    createdOrderIds.length = 0;
    await dataSource.getRepository(Product).delete(product.id);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('10 người đặt cùng lúc, kho chỉ có 5 ly: đúng 5 đơn thành công, kho còn 0', async () => {
    // Tạo 10 request chạy song song
    const requests = [];
    for (let index = 0; index < 10; index++) {
      requests.push(orderOne(1));
    }
    const results = await Promise.allSettled(requests);

    // Đếm số đơn thành công / thất bại
    let successCount = 0;
    let failCount = 0;
    for (const result of results) {
      if (result.status === 'fulfilled') {
        successCount = successCount + 1;
      } else {
        failCount = failCount + 1;
      }
    }

    expect(successCount).toBe(5);
    expect(failCount).toBe(5);
    expect(await readStock()).toBe(0); // không bị âm, không bán quá
  }, 30000);

  it('đặt nhiều hơn số còn lại: bị từ chối, kho giữ nguyên', async () => {
    await expect(orderOne(6)).rejects.toThrow('chỉ còn 5 ly');
    expect(await readStock()).toBe(5);
  });

  it('hủy đơn: kho được cộng lại', async () => {
    const order = await orderOne(2);
    expect(await readStock()).toBe(3);

    await service.changeStatus(order.orderId, 999, 'CANCELLED');
    expect(await readStock()).toBe(5);
  });

  it('2 request hủy cùng 1 đơn cùng lúc: chỉ hoàn kho 1 lần', async () => {
    const order = await orderOne(2);

    await Promise.allSettled([
      service.changeStatus(order.orderId, 999, 'CANCELLED'),
      service.changeStatus(order.orderId, 999, 'CANCELLED'),
    ]);

    expect(await readStock()).toBe(5); // 3 + 2, không phải 3 + 2 + 2
  });
});
