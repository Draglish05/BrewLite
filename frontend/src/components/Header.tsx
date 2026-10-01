'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useCartStore, getCartCount } from '@/store/cart';

export default function Header() {
  const items = useCartStore((state) => state.items);
  const count = getCartCount(items);

  // Khi trang mở xong: nạp lại giỏ hàng đã lưu trong trình duyệt
  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);

  return (
    <header className="border-b bg-white text-gray-900">
      <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
        <Link href="/" className="text-xl font-bold">
          BrewLite ☕
        </Link>

        <Link href="/cart" className="relative rounded-lg border px-3 py-2">
          🛒 Giỏ hàng
          {/* Badge số lượng: chỉ hiện khi giỏ có món */}
          {count > 0 && (
            <span className="absolute -right-2 -top-2 rounded-full bg-red-600 px-2 text-sm text-white">
              {count}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
