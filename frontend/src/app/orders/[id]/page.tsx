'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { API_URL, getErrorMessage } from '@/lib/api';
import { getStatusLabel, getStatusStyle, OrderData } from '@/lib/status';
import { useAuthStore } from '@/store/auth';
import { formatMoney } from '@/store/cart';

// Màn hình xác nhận đơn: mã đơn, trạng thái, các món đã đặt
export default function OrderConfirmationPage() {
  const params = useParams();
  const id = params.id;
  const token = useAuthStore((state) => state.token);

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadOrder() {
      try {
        const res = await fetch(API_URL + '/orders/' + id, {
          headers: { Authorization: 'Bearer ' + token },
        });
        const data = await res.json();
        if (!res.ok) {
          setError(getErrorMessage(data));
          return;
        }
        setOrder(data);
      } catch (err) {
        setError('Không kết nối được máy chủ');
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [id, token]);

  if (loading) {
    return <main className="mx-auto max-w-md p-8">Đang tải đơn hàng...</main>;
  }

  if (error !== '' || order === null) {
    return (
      <main className="mx-auto max-w-md p-8">
        <p className="text-red-600">{error}</p>
        <Link href="/" className="mt-4 inline-block text-sky-700 underline">
          ← Về menu
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md p-8">
      <div className="text-center">
        <p className="text-5xl">✅</p>
        <h1 className="mt-2 text-2xl font-bold">Đặt hàng thành công</h1>
        <p className="mt-1 text-3xl font-extrabold text-sky-800">Mã đơn #{order.id}</p>
        <span className={'mt-2 inline-block rounded-full px-3 py-1 text-sm font-semibold ' + getStatusStyle(order.status)}>
          {getStatusLabel(order.status)}
        </span>
        <p className="mt-2 text-sm text-gray-500">{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
      </div>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
        {order.items.map((item) => (
          <div key={item.id} className="py-1 text-sm">
            <div className="flex justify-between">
              <span>
                {item.qty} x {item.productName} ({item.size})
              </span>
              <span>{formatMoney(item.lineTotal)}</span>
            </div>
            {item.toppings && item.toppings.length > 0 && (
              <p className="text-xs text-gray-500">Topping: {item.toppings.join(', ')}</p>
            )}
          </div>
        ))}
        <div className="mt-2 flex justify-between border-t border-gray-300 pt-2 text-lg font-bold">
          <span>Tổng:</span>
          <span>{formatMoney(order.total)}</span>
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-6">
        <Link href="/" className="text-sky-700 underline">
          ← Về menu
        </Link>
        <Link href="/orders" className="text-sky-700 underline">
          Đơn của tôi
        </Link>
      </div>
    </main>
  );
}
