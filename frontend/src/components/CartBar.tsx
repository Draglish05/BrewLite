'use client';

import BagIcon from '@/components/BagIcon';
import { useCartStore, getCartCount, getCartTotal, formatMoney } from '@/store/cart';

// Thanh "Xem giỏ hàng" nổi ở cuối màn hình, chỉ hiện khi giỏ có món.
// Bấm vào thì giỏ hàng trượt ra bên phải (không chuyển trang)
export default function CartBar() {
  const items = useCartStore((state) => state.items);
  const openCart = useCartStore((state) => state.openCart);
  const count = getCartCount(items);
  const total = getCartTotal(items);

  if (count === 0) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-4 z-20 px-4">
      <button
        onClick={openCart}
        className="mx-auto flex w-full max-w-md items-center justify-between rounded-full bg-espresso px-5 py-3.5 text-cream shadow-lg shadow-espresso/25 hover:bg-black"
      >
        <span className="flex items-center gap-2 font-semibold">
          <BagIcon className="h-5 w-5" />
          Xem giỏ hàng · {count} ly
        </span>
        <span className="font-semibold text-honey">{formatMoney(total)}</span>
      </button>
    </div>
  );
}
