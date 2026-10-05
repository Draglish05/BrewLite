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

// Thông tin món khi bấm "Thêm vào giỏ" (chưa có key và qty, giỏ sẽ tự tạo)
export type NewCartItem = {
  productId: number;
  name: string;
  color: string;
  size: string;
  toppings: string[];
  unitPrice: number;
};

// Những gì cái "bảng ghi nhớ chung" có
type CartState = {
  items: CartItem[];
  isOpen: boolean; // khung giỏ hàng bên phải đang mở hay đóng
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: NewCartItem) => void;
  increase: (key: string) => void;
  decrease: (key: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
};

// Tìm dòng có mã "key" trong giỏ, không có thì trả về null
function findItem(items: CartItem[], key: string) {
  for (const item of items) {
    if (item.key === key) {
      return item;
    }
  }
  return null;
}

// Tạo danh sách mới, bỏ dòng có mã "key"
function removeByKey(items: CartItem[], key: string) {
  const newItems: CartItem[] = [];
  for (const item of items) {
    if (item.key !== key) {
      newItems.push(item);
    }
  }
  return newItems;
}

// Tạo danh sách mới, trong đó dòng có mã "key" được cộng thêm "amount" ly
// (amount = 1 là tăng, amount = -1 là giảm)
function changeQty(items: CartItem[], key: string, amount: number) {
  const newItems: CartItem[] = [];
  for (const item of items) {
    if (item.key === key) {
      // Tạo dòng mới giống hệt dòng cũ, chỉ khác số lượng
      const updatedItem: CartItem = {
        key: item.key,
        productId: item.productId,
        name: item.name,
        color: item.color,
        size: item.size,
        toppings: item.toppings,
        unitPrice: item.unitPrice,
        qty: item.qty + amount,
      };
      newItems.push(updatedItem);
    } else {
      newItems.push(item);
    }
  }
  return newItems;
}

export const useCartStore = create<CartState>()(
  // persist: lưu giỏ vào trình duyệt, tải lại trang không bị mất
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      // Mở / đóng khung giỏ hàng trượt ra từ bên phải
      openCart: () => {
        set({ isOpen: true });
      },
      closeCart: () => {
        set({ isOpen: false });
      },

      // Thêm món: nếu đã có đúng món + size + topping đó thì chỉ tăng số lượng
      addItem: (item) => {
        const key = item.productId + '-' + item.size + '-' + item.toppings.join(',');
        const items = get().items;
        const found = findItem(items, key);

        if (found) {
          set({ items: changeQty(items, key, 1) });
        } else {
          const newItem: CartItem = {
            key: key,
            productId: item.productId,
            name: item.name,
            color: item.color,
            size: item.size,
            toppings: item.toppings,
            unitPrice: item.unitPrice,
            qty: 1,
          };

          // Chép các dòng cũ sang danh sách mới rồi thêm dòng mới vào cuối
          const newItems: CartItem[] = [];
          for (const oldItem of items) {
            newItems.push(oldItem);
          }
          newItems.push(newItem);

          set({ items: newItems });
        }
      },

      increase: (key) => {
        set({ items: changeQty(get().items, key, 1) });
      },

      // Giảm số lượng; còn 1 mà bấm giảm thì xóa luôn dòng đó
      decrease: (key) => {
        const items = get().items;
        const found = findItem(items, key);
        if (!found) return;

        if (found.qty <= 1) {
          set({ items: removeByKey(items, key) });
        } else {
          set({ items: changeQty(items, key, -1) });
        }
      },

      removeItem: (key) => {
        set({ items: removeByKey(get().items, key) });
      },

      // Xóa hết giỏ (dùng sau khi thanh toán thành công)
      clear: () => {
        set({ items: [] });
      },
    }),
    {
      name: 'brewlite-cart', // tên chỗ lưu trong trình duyệt
      skipHydration: true, // Header sẽ tự nạp lại giỏ sau khi trang mở (tránh lỗi Next.js)
      // Chỉ lưu danh sách món, không lưu "giỏ đang mở" (tải lại trang thì giỏ luôn đóng)
      partialize: (state) => {
        return { items: state.items };
      },
    },
  ),
);

// Tổng tiền cả giỏ
export function getCartTotal(items: CartItem[]) {
  let total = 0;
  for (const item of items) {
    total = total + item.unitPrice * item.qty;
  }
  return total;
}

// Tổng số ly trong giỏ (để hiện trên badge)
export function getCartCount(items: CartItem[]) {
  let count = 0;
  for (const item of items) {
    count = count + item.qty;
  }
  return count;
}

// Đổi 45000 thành "45.000đ"
export function formatMoney(value: number) {
  return value.toLocaleString('vi-VN') + 'đ';
}
