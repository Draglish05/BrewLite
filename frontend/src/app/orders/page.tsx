'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { API_URL, getErrorMessage } from '@/lib/api';
import { getStatusLabel, getStatusStyle, OrderData } from '@/lib/status';
import { useAuthStore } from '@/store/auth';
import { formatMoney } from '@/store/cart';

// Lịch sử đơn của tôi (GET /orders/me)
export default function MyOrdersPage() {
  const token = useAuthStore((state) => state.token);

  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await fetch(API_URL + '/orders/me', {
          headers: { Authorization: 'Bearer ' + token },
        });
        const data = await res.json();
        if (!res.ok) {
          setError(getErrorMessage(data));
          return;
        }
        setOrders(data);
      } catch {
        setError('Không kết nối được máy chủ');
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [token]);

  if (loading) {
    return <main className="mx-auto w-full max-w-2xl px-4 pt-16 text-center text-mocha">Đang tải lịch sử đơn...</main>;
  }

  if (error !== '') {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 pt-10">
        <p className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>
      </main>
    );
  }

  // Chưa có đơn nào
  if (orders.length === 0) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 pt-10">
        <h1 className="font-serif text-3xl font-semibold">Đơn của tôi</h1>
        <p className="mt-2 text-mocha">Bạn chưa có đơn hàng nào.</p>
        <Link href="/" className="mt-4 inline-block text-sm font-medium text-caramel hover:underline">
          ← Xem menu
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pb-10 pt-6">
      <h1 className="font-serif text-3xl font-semibold">Đơn của tôi</h1>

      <div className="mt-4 flex flex-col gap-3">
        {orders.map((order) => {
          // Đếm tổng số ly của đơn
          let cups = 0;
          for (const item of order.items) {
            cups = cups + item.qty;
          }

          return (
            <Link
              key={order.id}
              href={'/orders/' + order.id}
              className="rounded-2xl border border-line bg-card p-4 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="font-serif text-xl font-semibold">Đơn #{order.id}</span>
                <span className={'rounded-full px-3 py-1 text-xs font-semibold ' + getStatusStyle(order.status)}>
                  {getStatusLabel(order.status)}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-mocha">{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-mocha">{cups} ly</span>
                <span className="font-semibold text-caramel">{formatMoney(order.total)}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
