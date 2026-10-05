'use client';

import Link from 'next/link';
import BagIcon from '@/components/BagIcon';
import { useCartStore, getCartCount } from '@/store/cart';
import { useAuthStore } from '@/store/auth';

const LINK_STYLE = 'whitespace-nowrap text-sm font-medium text-mocha hover:text-espresso';

export default function Header() {
  const items = useCartStore((state) => state.items);
  const count = getCartCount(items); // tổng số ly
  const token = useAuthStore((state) => state.token);
  const email = useAuthStore((state) => state.email);
  const logout = useAuthStore((state) => state.logout);
  const openCart = useCartStore((state) => state.openCart);

  // Đã đăng nhập thì hiện email + đăng xuất, chưa thì hiện nút đăng nhập
  let account;
  if (token !== '') {
    account = (
      <>
        <span className="hidden max-w-40 truncate text-sm text-mocha md:inline">{email}</span>
        <button onClick={logout} className={LINK_STYLE}>
          Đăng xuất
        </button>
      </>
    );
  } else {
    account = (
      <Link href="/login" className={LINK_STYLE}>
        Đăng nhập
      </Link>
    );
  }

  // Badge tổng số ly, chỉ hiện khi giỏ có món
  let badge = null;
  if (count > 0) {
    badge = (
      <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-caramel px-1 text-xs font-semibold text-white">
        {count}
      </span>
    );
  }

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-cream/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-3">
        {/* Logo chữ có chân, viết thường, có dấu chấm màu caramel */}
        <Link href="/" className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
          brewlite<span className="text-caramel">.</span>
        </Link>

        <div className="ml-auto flex items-center gap-3 sm:gap-4">
          {/* Điện thoại hiện chữ ngắn "Đơn", màn hình rộng hiện "Đơn của tôi" */}
          <Link href="/orders" className={LINK_STYLE}>
            <span className="sm:hidden">Đơn</span>
            <span className="hidden sm:inline">Đơn của tôi</span>
          </Link>
          {account}

          {/* Nút giỏ hàng: icon túi + badge tổng số ly, bấm thì giỏ trượt ra bên phải */}
          <button onClick={openCart} className="relative rounded-full p-2 hover:bg-latte" aria-label="Mở giỏ hàng">
            <BagIcon className="h-6 w-6" />
            {badge}
          </button>
        </div>
      </div>
    </header>
  );
}
