import { BadRequestException } from '@nestjs/common';

// Các trạng thái của 1 đơn hàng (theo sơ đồ mục 9.1 trong đề)
export const OrderStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PREPARING: 'PREPARING',
  READY: 'READY',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

// Bảng các chuyển trạng thái HỢP LỆ: từ trạng thái nào được đi tới trạng thái nào.
// Tổng cộng đúng 9 chuyển tiếp. Cái nào không có trong bảng là không hợp lệ.
export const TRANSITIONS: Record<string, string[]> = {
  PENDING: ['PAID', 'PAYMENT_FAILED', 'CANCELLED'], // thanh toán OK, thanh toán lỗi, hủy
  PAID: ['PREPARING', 'CANCELLED'], // barista nhận đơn, hủy
  PREPARING: ['READY'], // pha xong (không được hủy)
  READY: ['COMPLETED'], // giao khách (không được hủy)
  PAYMENT_FAILED: ['PENDING', 'CANCELLED'], // thử lại, hủy
  COMPLETED: [], // trạng thái kết thúc
  CANCELLED: [], // trạng thái kết thúc
};

// Kiểm tra có được chuyển từ trạng thái "from" sang "to" không
export function canTransition(from: string, to: string) {
  const allowed = TRANSITIONS[from];
  if (!allowed) {
    return false;
  }
  return allowed.includes(to);
}

// Nếu chuyển không hợp lệ thì ném lỗi 400
export function assertTransition(from: string, to: string) {
  if (!canTransition(from, to)) {
    throw new BadRequestException('Không thể chuyển đơn từ ' + from + ' sang ' + to);
  }
}
