import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 1 dòng trong giỏ hàng
export type CartItem = {
  key: string; // mã riêng của dòng, ví dụ "3-L-Kem"
  productId: number;
  name: string;
  color: string; // màu nước để vẽ hình ly
  size: string;
  toppings: string[];
  unitPrice: number; // giá 1 ly (đã cộng size + topping)
  qty: number; // số lượng
};

// Những gì cái "bảng ghi nhớ chung" có
type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'key' | 'qty'>) => void;
  increase: (key: string) => void;
  decrease: (key: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
};

// Tạo danh sách mới, trong đó dòng có mã "key" được cộng thêm "amount" ly
// (amount = 1 là tăng, amount = -1 là giảm)
function changeQty(items: CartItem[], key: string, amount: number) {
  const newItems: CartItem[] = [];
  for (const i of items) {
    if (i.key === key) {
      newItems.push({ ...i, qty: i.qty + amount });
    } else {
      newItems.push(i);
    }
  }
  return newItems;
}

export const useCartStore = create<CartState>()(
  // persist: lưu giỏ vào trình duyệt, tải lại trang không bị mất
  persist(
    (set, get) => ({
      items: [],

      // Thêm món: nếu đã có đúng món + size + topping đó thì chỉ tăng số lượng
      addItem: (item) => {
        const key = item.productId + '-' + item.size + '-' + item.toppings.join(',');
        const items = get().items;
        const found = items.find((i) => i.key === key);

        if (found) {
          set({ items: changeQty(items, key, 1) });
        } else {
          set({ items: [...items, { ...item, key: key, qty: 1 }] });
        }
      },

      // Tăng số lượng 1 dòng
      increase: (key) => {
        set({ items: changeQty(get().items, key, 1) });
      },

      // Giảm số lượng; còn 1 mà bấm giảm thì xóa luôn dòng đó
      decrease: (key) => {
        const items = get().items;
        const found = items.find((i) => i.key === key);
        if (!found) return;

        if (found.qty <= 1) {
          set({ items: items.filter((i) => i.key !== key) });
        } else {
          set({ items: changeQty(items, key, -1) });
        }
      },

      // Xóa 1 dòng
      removeItem: (key) => {
        set({ items: get().items.filter((i) => i.key !== key) });
      },

      // Xóa hết giỏ (dùng sau khi thanh toán thành công)
      clear: () => {
        set({ items: [] });
      },
    }),
    {
      name: 'brewlite-cart', // tên chỗ lưu trong trình duyệt
      skipHydration: true, // Header sẽ tự nạp lại giỏ sau khi trang mở (tránh lỗi Next.js)
    },
  ),
);

// Tổng tiền cả giỏ
export function getCartTotal(items: CartItem[]) {
  let total = 0;
  for (const i of items) {
    total = total + i.unitPrice * i.qty;
  }
  return total;
}

// Tổng số ly trong giỏ (để hiện trên badge)
export function getCartCount(items: CartItem[]) {
  let count = 0;
  for (const i of items) {
    count = count + i.qty;
  }
  return count;
}

// Đổi 45000 thành "45.000đ"
export function formatMoney(value: number) {
  return value.toLocaleString('vi-VN') + 'đ';
}
