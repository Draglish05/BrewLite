'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useAuthStore } from '@/store/auth';
import { useCartStore } from '@/store/cart';

// "Cổng kiểm tra": chưa đăng nhập thì chỉ được vào trang đăng nhập / đăng ký
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuthStore((state) => state.token);
  const [ready, setReady] = useState(false); // đã nạp xong dữ liệu lưu trong trình duyệt chưa

  // Khi trang mở xong: nạp lại đăng nhập và giỏ hàng đã lưu
  useEffect(() => {
    useAuthStore.persist.rehydrate();
    useCartStore.persist.rehydrate();
    setReady(true);
  }, []);

  // Trang đăng nhập và đăng ký là trang công khai
  let isPublicPage = false;
  if (pathname === '/login' || pathname === '/register') {
    isPublicPage = true;
  }

  // Tự chuyển trang cho đúng
  useEffect(() => {
    if (!ready) return;

    if (token === '' && !isPublicPage) {
      router.replace('/login'); // chưa đăng nhập mà vào trang khác
    }
    if (token !== '' && isPublicPage) {
      router.replace('/'); // đã đăng nhập rồi thì không cần vào trang đăng nhập nữa
    }
  }, [ready, token, isPublicPage, router]);

  // Chưa nạp xong thì chưa hiện gì
  if (!ready) {
    return null;
  }

  // Trang đăng nhập / đăng ký: hiện riêng, không có Header
  if (isPublicPage) {
    return <>{children}</>;
  }

  // Chưa đăng nhập: không hiện gì trong lúc chuyển sang trang đăng nhập
  if (token === '') {
    return null;
  }

  // Đã đăng nhập: hiện Header và nội dung
  return (
    <>
      <Header />
      {children}
    </>
  );
}
