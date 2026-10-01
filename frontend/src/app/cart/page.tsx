'use client';

import Link from 'next/link';
import { useCartStore, getCartTotal, getCartCount, formatMoney } from '@/store/cart';
import CupIcon from '@/components/CupIcon';

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const increase = useCartStore((state) => state.increase);
  const decrease = useCartStore((state) => state.decrease);
  const removeItem = useCartStore((state) => state.removeItem);

  const total = getCartTotal(items);
  const totalQty = getCartCount(items); // tổng số ly

  // Giỏ trống
  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-2xl p-8">
        <h1 className="mb-4 text-2xl font-bold">Giỏ hàng</h1>
        <p>Giỏ hàng đang trống.</p>
        <Link href="/" className="mt-4 inline-block text-sky-700 underline">
          ← Xem menu
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-4 text-2xl font-bold">Giỏ hàng</h1>

      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div key={item.key} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-sky-50">
              <CupIcon color={item.color} className="h-14" />
            </div>

            <div className="flex-1">
              <p className="font-semibold">
                {item.name} – size {item.size}
              </p>
              {item.toppings.length > 0 && (
                <p className="text-sm text-gray-500">Topping: {item.toppings.join(', ')}</p>
              )}
              <p className="text-sm text-sky-700">{formatMoney(item.unitPrice)} / ly</p>
            </div>

            {/* Nút giảm / số lượng / tăng */}
            <div className="flex items-center gap-2">
              <button onClick={() => decrease(item.key)} className="h-8 w-8 rounded-full border">
                −
              </button>
              <span className="w-6 text-center">{item.qty}</span>
              <button onClick={() => increase(item.key)} className="h-8 w-8 rounded-full border">
                +
              </button>
            </div>

            <div className="w-24 text-right">
              <p className="font-semibold">{formatMoney(item.unitPrice * item.qty)}</p>
              <button onClick={() => removeItem(item.key)} className="text-sm text-red-600">
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Tổng số lượng */}
      <div className="mt-6 flex items-center justify-between">
        <span>Tổng số lượng:</span>
        <span>{totalQty} ly</span>
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-gray-300 pt-2 text-xl font-bold">
        <span>Tổng:</span>
        <span>{formatMoney(total)}</span>
      </div>

      <Link href="/" className="mt-4 inline-block text-sky-700 underline">
        + Thêm món khác
      </Link>

      {/* Nút thanh toán hiện tổng tiền (theo US-05). Màn thanh toán làm ở Task 8 */}
      <button className="mt-6 w-full rounded-xl bg-sky-600 py-3 font-semibold text-white hover:bg-sky-700">
        Thanh toán – {formatMoney(total)}
      </button>
    </main>
  );
}
