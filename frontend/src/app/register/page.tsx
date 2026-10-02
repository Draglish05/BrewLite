'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_URL, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useCartStore } from '@/store/cart';

export default function RegisterPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const cartItems = useCartStore((state) => state.items);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Mật khẩu nhập lại không khớp');
      return;
    }

    setLoading(true);
    try {
      // Bước 1: đăng ký
      const regRes = await fetch(API_URL + '/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password }),
      });
      const regData = await regRes.json();
      if (!regRes.ok) {
        setError(getErrorMessage(regData));
        return;
      }

      // Bước 2: đăng nhập luôn cho khách đỡ phải nhập lại
      const loginRes = await fetch(API_URL + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password }),
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok) {
        setError(getErrorMessage(loginData));
        return;
      }

      login(loginData.accessToken, loginData.user.email);

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

  let buttonText = 'Đăng ký';
  if (loading) {
    buttonText = 'Đang đăng ký...';
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-sky-100 p-4">
      {/* Chữ BREWLITE to, ở giữa trang */}
      <p className="mb-8 pl-[0.1em] text-center text-6xl font-extrabold tracking-widest text-sky-800 sm:text-7xl">
        BREWLITE
      </p>

      {/* Khung bên dưới */}
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow">
        <h1 className="mb-4 text-center text-xl font-semibold">Đăng ký</h1>

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
          placeholder="Mật khẩu (từ 6 ký tự)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="rounded-lg border border-gray-300 px-3 py-2"
        />
        <input
          type="password"
          placeholder="Nhập lại mật khẩu"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
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
        Đã có tài khoản,{' '}
        <Link href="/login" className="text-sky-700 underline">
          đăng nhập
        </Link>
      </p>
      </div>
    </main>
  );
}
