'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import CartDrawer from '@/components/CartDrawer';
import { useAuthStore } from '@/store/auth';
import { useCartStore } from '@/store/cart';

// Trang cần đăng nhập mới vào được: thanh toán và đơn của tôi.
// Menu, chi tiết món, giỏ hàng thì ai cũng xem được (đúng luồng của đề:
// xem menu -> chọn món -> giỏ hàng -> đăng nhập nếu chưa -> thanh toán)
function isPrivatePage(pathname: string) {
  if (pathname === '/checkout') {
    return true;
  }
  if (pathname === '/orders' || pathname.startsWith('/orders/')) {
    return true;
  }
  return false;
}

// "Cổng kiểm tra": chưa đăng nhập mà vào trang cần đăng nhập thì chuyển sang trang đăng nhập
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuthStore((state) => state.token);
  const cartCount = useCartStore((state) => state.items.length);
  const [ready, setReady] = useState(false); // đã nạp xong dữ liệu lưu trong trình duyệt chưa

  // Khi trang mở xong: nạp lại đăng nhập và giỏ hàng đã lưu
  useEffect(() => {
    async function loadSaved() {
      await useAuthStore.persist.rehydrate();
      await useCartStore.persist.rehydrate();
      setReady(true);
    }
    loadSaved();
  }, []);

  // Trang đăng nhập và đăng ký
  let isAuthPage = false;
  if (pathname === '/login' || pathname === '/register') {
    isAuthPage = true;
  }
  const isPrivate = isPrivatePage(pathname);

  // Tự chuyển trang cho đúng
  useEffect(() => {
    if (!ready) return;

    if (token === '' && isPrivate) {
      router.replace('/login'); // chưa đăng nhập mà vào trang cần đăng nhập
    }
    // Đã đăng nhập (hoặc vừa đăng nhập / đăng ký xong) mà đang ở trang đăng nhập:
    // giỏ có món thì đi tiếp tới thanh toán, không thì về menu
    if (token !== '' && isAuthPage) {
      if (cartCount > 0) {
        router.replace('/checkout');
      } else {
        router.replace('/');
      }
    }
  }, [ready, token, cartCount, isAuthPage, isPrivate, router]);

  // Chưa nạp xong thì chưa hiện gì
  if (!ready) {
    return null;
  }

  // Trang đăng nhập / đăng ký: hiện riêng, không có Header
  if (isAuthPage) {
    return <>{children}</>;
  }

  // Chưa đăng nhập mà vào trang cần đăng nhập: không hiện gì trong lúc chuyển trang
  if (token === '' && isPrivate) {
    return null;
  }

  return (
    <>
      <Header />
      {children}
      <CartDrawer />
    </>
  );
}
