'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { getErrorMessage, postJson } from '@/lib/api';
import { useAuth } from '@/store/auth';

export default function RegisterPage() {
  const router = useRouter();
  const login = useAuth((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');

    try {
      const registered = await postJson('/auth/register', { email, password });
      if (registered.ok === false) {
        setError(getErrorMessage(registered.data));
        return;
      }

      // Đăng ký xong thì đăng nhập luôn
      const loggedIn = await postJson('/auth/login', { email, password });
      if (loggedIn.ok === false) {
        setError(getErrorMessage(loggedIn.data));
        return;
      }
      login(loggedIn.data.accessToken, email);
      router.push('/');
    } catch {
      setError('Không kết nối được máy chủ');
    }
  }

  return (
    <main className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Đăng ký</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded border p-2"
          required
        />
        <input
          type="password"
          placeholder="Mật khẩu (tối thiểu 6 ký tự)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded border p-2"
          required
        />
        {error !== '' && <p className="text-red-600">{error}</p>}
        <button type="submit" className="rounded bg-black px-4 py-2 text-white">
          Đăng ký
        </button>
      </form>
      <p className="mt-4">
        Đã có tài khoản?{' '}
        <Link href="/login" className="underline">
          Đăng nhập
        </Link>
      </p>
    </main>
  );
}
