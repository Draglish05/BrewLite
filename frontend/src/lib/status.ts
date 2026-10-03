// Tên tiếng Việt của từng trạng thái đơn
const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ thanh toán',
  PAID: 'Đã thanh toán',
  PAYMENT_FAILED: 'Thanh toán lỗi',
  PREPARING: 'Đang pha chế',
  READY: 'Sẵn sàng nhận',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

export function getStatusLabel(status: string) {
  const label = STATUS_LABELS[status];
  if (label) {
    return label;
  }
  return status;
}

// Màu nền của nhãn trạng thái
export function getStatusStyle(status: string) {
  if (status === 'PAID' || status === 'COMPLETED' || status === 'READY') {
    return 'bg-green-100 text-green-800';
  }
  if (status === 'PAYMENT_FAILED' || status === 'CANCELLED') {
    return 'bg-red-100 text-red-800';
  }
  return 'bg-yellow-100 text-yellow-800';
}

// Kiểu dữ liệu 1 đơn mà backend trả về
export type OrderItemData = {
  id: number;
  productName: string;
  size: string;
  toppings: string[];
  qty: number;
  unitPrice: number;
  lineTotal: number;
};

export type OrderData = {
  id: number;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItemData[];
};
