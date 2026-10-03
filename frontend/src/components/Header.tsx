'use client';

import Link from 'next/link';
import { useCartStore, getCartCount } from '@/store/cart';
import { useAuthStore } from '@/store/auth';

export default function Header() {
  const items = useCartStore((state) => state.items);
  const count = getCartCount(items); // tổng số ly
  const email = useAuthStore((state) => state.email);
  const logout = useAuthStore((state) => state.logout);

  return (
    <header className="bg-sky-100">
      <div className="px-4 py-3">
        <Link href="/" className="text-3xl font-bold text-sky-800">
          BrewLite ☕
        </Link>

        {/* 2 nút nằm bên trái, dưới chữ BrewLite, có khung bo góc */}
        <nav className="mt-3 flex gap-3">
          <Link
            href="/"
            className="rounded-xl border-2 border-sky-400 bg-white px-5 py-2 text-lg font-semibold text-sky-900 hover:bg-sky-50"
          >
            📋 Xem menu
          </Link>

          <Link
            href="/cart"
            className="relative rounded-xl border-2 border-sky-400 bg-white px-5 py-2 text-lg font-semibold text-sky-900 hover:bg-sky-50"
          >
            🛒 Giỏ hàng
            {/* Badge: tổng số ly, chỉ hiện khi giỏ có món */}
            {count > 0 && (
              <span className="absolute -right-2 -top-2 rounded-full bg-red-600 px-2 text-sm text-white">
                {count}
              </span>
            )}
          </Link>

          <Link
            href="/orders"
            className="rounded-xl border-2 border-sky-400 bg-white px-5 py-2 text-lg font-semibold text-sky-900 hover:bg-sky-50"
          >
            🧾 Đơn của tôi
          </Link>

          {/* Bên phải: email và nút đăng xuất */}
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sky-900">👤 {email}</span>
            <button onClick={logout} className="font-semibold text-red-600 hover:underline">
              Đăng xuất
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
