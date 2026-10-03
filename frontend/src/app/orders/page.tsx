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
      } catch (err) {
        setError('Không kết nối được máy chủ');
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [token]);

  if (loading) {
    return <main className="mx-auto max-w-2xl p-8">Đang tải lịch sử đơn...</main>;
  }

  if (error !== '') {
    return <main className="mx-auto max-w-2xl p-8 text-red-600">{error}</main>;
  }

  // Chưa có đơn nào
  if (orders.length === 0) {
    return (
      <main className="mx-auto max-w-2xl p-8">
        <h1 className="mb-4 text-2xl font-bold">Đơn của tôi</h1>
        <p>Bạn chưa có đơn hàng nào.</p>
        <Link href="/" className="mt-4 inline-block text-sky-700 underline">
          ← Xem menu
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-4 text-2xl font-bold">Đơn của tôi</h1>

      <div className="flex flex-col gap-3">
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
              className="rounded-xl border border-gray-200 bg-white p-4 hover:bg-sky-50"
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">Đơn #{order.id}</span>
                <span className={'rounded-full px-3 py-1 text-sm font-semibold ' + getStatusStyle(order.status)}>
                  {getStatusLabel(order.status)}
                </span>
              </div>
              <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
              <div className="mt-1 flex justify-between text-sm">
                <span>{cups} ly</span>
                <span className="font-semibold">{formatMoney(order.total)}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
