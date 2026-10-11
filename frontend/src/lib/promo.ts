// Bảng mã giảm giá – PHẢI giống bên backend (backend/src/orders/promo.ts)
// Frontend chỉ tính để HIỂN THỊ trước cho khách; backend mới là nơi tính thật khi tạo đơn
const PROMO_CODES = [
  { code: 'BREW10', percent: 10, amount: 0, minTotal: 0 },
  { code: 'GIAM20K', percent: 0, amount: 20000, minTotal: 100000 },
];

// Kết quả: discount = số tiền được giảm, message = câu báo lỗi (rỗng = mã dùng được)
export function getDiscount(promoCode: string, subtotal: number) {
  if (promoCode === '') {
    return { discount: 0, message: '' };
  }

  for (const promo of PROMO_CODES) {
    if (promo.code === promoCode) {
      if (subtotal < promo.minTotal) {
        const minText = promo.minTotal.toLocaleString('vi-VN') + 'đ';
        return { discount: 0, message: 'Mã ' + promo.code + ' chỉ áp dụng cho đơn từ ' + minText };
      }

      let discount = promo.amount;
      if (promo.percent > 0) {
        discount = Math.floor((subtotal * promo.percent) / 100);
      }
      if (discount > subtotal) {
        discount = subtotal;
      }
      return { discount: discount, message: '' };
    }
  }

  return { discount: 0, message: 'Mã giảm giá không hợp lệ' };
}
