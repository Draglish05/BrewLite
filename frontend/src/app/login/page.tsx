'use client';

import { useState } from 'react';
import Link from 'next/link';
import { API_URL, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export default function LoginPage() {
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault(); // không cho trình duyệt tải lại trang
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

      // Lưu đăng nhập. AuthGate sẽ tự chuyển trang:
      // giỏ có món thì đi tiếp tới thanh toán, không thì về menu
      login(data.accessToken, data.user.email);
    } catch {
      setError('Không kết nối được máy chủ');
    } finally {
      setLoading(false);
    }
  }

  let buttonText = 'Đăng nhập';
  if (loading) {
    buttonText = 'Đang đăng nhập...';
  }

  // Có lỗi thì hiện dòng báo lỗi
  let errorBox = null;
  if (error !== '') {
    errorBox = <p className="text-sm text-red-600">{error}</p>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream p-4">
      {/* Logo brewlite to, ở giữa trang */}
      <p className="mb-6 text-center font-serif text-6xl font-semibold tracking-tight sm:text-7xl">
        brewlite<span className="text-caramel">.</span>
      </p>

      {/* Khung bên dưới */}
      <div className="w-full max-w-sm rounded-3xl border border-line bg-card p-8">
        <h1 className="mb-5 text-center font-serif text-2xl font-semibold">Đăng nhập</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="rounded-full border border-line bg-cream px-4 py-2.5 outline-none focus:border-caramel"
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="rounded-full border border-line bg-cream px-4 py-2.5 outline-none focus:border-caramel"
          />

          {errorBox}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 rounded-full bg-espresso py-3 font-semibold text-cream hover:bg-black disabled:opacity-60"
          >
            {buttonText}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-mocha">
          Chưa có tài khoản,{' '}
          <Link href="/register" className="font-medium text-caramel hover:underline">
            đăng ký ngay
          </Link>
        </p>
      </div>

      <Link href="/" className="mt-5 text-sm font-medium text-mocha hover:text-espresso">
        ← Tiếp tục xem menu
      </Link>
    </main>
  );
}
