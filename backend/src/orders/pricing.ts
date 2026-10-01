// Bảng giá tùy chọn – PHẢI giống hệt bên frontend (trang chi tiết sản phẩm)
// Backend tự tính lại giá, không tin giá do frontend gửi lên (tránh khách sửa giá)

export const SIZES = [
  { name: 'S', extra: 0 },
  { name: 'M', extra: 5000 },
  { name: 'L', extra: 10000 },
];

export const TOPPINGS = [
  { name: 'Trân châu', price: 5000 },
  { name: 'Thạch đào', price: 6000 },
  { name: 'Pudding trứng', price: 7000 },
  { name: 'Kem', price: 7000 },
  { name: 'Kem muối', price: 8000 },
  { name: 'Kem cheese', price: 10000 },
];

export const SIZE_NAMES = ['S', 'M', 'L'];
export const TOPPING_NAMES = TOPPINGS.map((t) => t.name);

// Giá 1 ly = giá gốc + tiền size + tiền topping
export function calcUnitPrice(basePrice: number, size: string, toppings: string[]) {
  let total = basePrice;

  for (const s of SIZES) {
    if (s.name === size) {
      total = total + s.extra;
    }
  }

  for (const t of TOPPINGS) {
    if (toppings.includes(t.name)) {
      total = total + t.price;
    }
  }

  return total;
}
