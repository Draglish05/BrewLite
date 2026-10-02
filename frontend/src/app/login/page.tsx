'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_URL, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useCartStore } from '@/store/cart';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const cartItems = useCartStore((state) => state.items);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); // không cho trình duyệt tải lại trang
    setError('');
    setLoading(true);

    try {
      const res = await fetch(API_URL + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(getErrorMessage(data));
        return;
      }

      login(data.accessToken, data.user.email);

      // Giỏ có món thì về giỏ hàng để thanh toán, không thì về menu
      if (cartItems.length > 0) {
        router.push('/cart');
      } else {
        router.push('/');
      }
    } catch (err) {
      setError('Không kết nối được máy chủ');
    } finally {
      setLoading(false);
    }
  }

  let buttonText = 'Đăng nhập';
  if (loading) {
    buttonText = 'Đang đăng nhập...';
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-sky-100 p-4">
      {/* Chữ BREWLITE to, ở giữa trang */}
      <p className="mb-8 pl-[0.1em] text-center text-6xl font-extrabold tracking-widest text-sky-800 sm:text-7xl">
        BREWLITE
      </p>

      {/* Khung bên dưới */}
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow">
        <h1 className="mb-4 text-center text-xl font-semibold">Đăng nhập</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="rounded-lg border border-gray-300 px-3 py-2"
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="rounded-lg border border-gray-300 px-3 py-2"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-sky-600 py-2 font-semibold text-white hover:bg-sky-700 disabled:bg-gray-400"
        >
          {buttonText}
        </button>
      </form>

      <p className="mt-4 text-center text-sm">
        Chưa có tài khoản,{' '}
        <Link href="/register" className="text-sky-700 underline">
          đăng ký ngay
        </Link>
      </p>
      </div>
    </main>
  );
}
