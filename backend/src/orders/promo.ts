import { BadRequestException } from '@nestjs/common';

// Bảng mã giảm giá – PHẢI giống bên frontend (frontend/src/lib/promo.ts)
// percent: giảm theo %, amount: giảm số tiền cố định, minTotal: đơn tối thiểu để dùng mã
export const PROMO_CODES = [
  { code: 'BREW10', percent: 10, amount: 0, minTotal: 0 },
  { code: 'GIAM20K', percent: 0, amount: 20000, minTotal: 100000 },
];

// Tính số tiền được giảm cho 1 đơn có tổng tiền hàng là subtotal.
// Không nhập mã -> giảm 0đ. Mã sai hoặc chưa đủ điều kiện -> lỗi 400
export function calcDiscount(promoCode: string, subtotal: number) {
  if (!promoCode) {
    return 0;
  }

  const code = promoCode.trim().toUpperCase();

  for (const promo of PROMO_CODES) {
    if (promo.code === code) {
      if (subtotal < promo.minTotal) {
        throw new BadRequestException('Mã ' + promo.code + ' chỉ áp dụng cho đơn từ ' + promo.minTotal + 'đ');
      }

      let discount = promo.amount;
      if (promo.percent > 0) {
        discount = Math.floor((subtotal * promo.percent) / 100);
      }

      // Không giảm quá số tiền của đơn
      if (discount > subtotal) {
        discount = subtotal;
      }
      return discount;
    }
  }

  throw new BadRequestException('Mã giảm giá không hợp lệ');
}
