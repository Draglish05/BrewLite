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

// Danh sách tên topping (dùng để kiểm tra topping khách gửi lên có hợp lệ không)
export const TOPPING_NAMES: string[] = [];
for (const topping of TOPPINGS) {
  TOPPING_NAMES.push(topping.name);
}

// Giá 1 ly = giá gốc + tiền size + tiền topping
export function calcUnitPrice(basePrice: number, size: string, toppings: string[]) {
  let total = basePrice;

  for (const sizeOption of SIZES) {
    if (sizeOption.name === size) {
      total = total + sizeOption.extra;
    }
  }

  for (const topping of TOPPINGS) {
    if (toppings.includes(topping.name)) {
      total = total + topping.price;
    }
  }

  return total;
}
