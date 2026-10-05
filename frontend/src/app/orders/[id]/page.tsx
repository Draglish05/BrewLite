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
      } catch {
        setError('Không kết nối được máy chủ');
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [id, token]);

  if (loading) {
    return <main className="mx-auto w-full max-w-md px-4 pt-16 text-center text-mocha">Đang tải đơn hàng...</main>;
  }

  if (error !== '' || order === null) {
    return (
      <main className="mx-auto w-full max-w-md px-4 pt-10">
        <p className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>
        <Link href="/" className="mt-4 inline-block text-sm font-medium text-mocha hover:text-espresso">
          ← Về menu
        </Link>
      </main>
    );
  }

  // Tiêu đề theo trạng thái đơn (mở từ lịch sử có thể là đơn chưa thanh toán / lỗi / đã hủy)
  let icon = '✓';
  let iconStyle = 'bg-emerald-100 text-emerald-700';
  let title = 'Đặt hàng thành công';
  let note = 'Mời bạn tới quầy lấy nước';
  if (order.status === 'PENDING') {
    icon = '…';
    iconStyle = 'bg-amber-100 text-amber-700';
    title = 'Đơn đang chờ thanh toán';
    note = '';
  } else if (order.status === 'PAYMENT_FAILED') {
    icon = '!';
    iconStyle = 'bg-red-100 text-red-700';
    title = 'Thanh toán chưa thành công';
    note = '';
  } else if (order.status === 'CANCELLED') {
    icon = '✕';
    iconStyle = 'bg-stone-200 text-stone-600';
    title = 'Đơn đã hủy';
    note = '';
  } else if (order.status === 'COMPLETED') {
    note = 'Bạn đã nhận đồ uống. Cảm ơn bạn!';
  }

  // Có lời nhắn thì hiện dòng nhắn
  let noteBox = null;
  if (note !== '') {
    noteBox = <p className="mt-3 font-medium text-caramel">{note}</p>;
  }

  return (
    <main className="mx-auto w-full max-w-md px-4 pb-10 pt-8">
      <div className="rounded-3xl border border-line bg-card px-6 py-8 text-center">
        <div className={'mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl font-bold ' + iconStyle}>
          {icon}
        </div>
        <h1 className="mt-4 font-serif text-2xl font-semibold">{title}</h1>

        <p className="mt-4 text-sm text-mocha">Mã đơn</p>
        <p className="font-serif text-4xl font-semibold">#{order.id}</p>
        <span className={'mt-3 inline-block rounded-full px-3 py-1 text-sm font-semibold ' + getStatusStyle(order.status)}>
          {getStatusLabel(order.status)}
        </span>
        <p className="mt-2 text-xs text-mocha">{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
        {noteBox}

        {/* Các món đã đặt */}
        <div className="mt-6 border-t border-dashed border-line pt-4 text-left">
          {order.items.map((item) => {
            // Món có topping thì thêm 1 dòng ghi topping
            let toppingLine = null;
            if (item.toppings && item.toppings.length > 0) {
              toppingLine = <p className="text-xs text-mocha">+ {item.toppings.join(', ')}</p>;
            }

            return (
              <div key={item.id} className="py-1 text-sm">
                <div className="flex justify-between">
                  <span>
                    {item.qty} × {item.productName} <span className="text-mocha">({item.size})</span>
                  </span>
                  <span>{formatMoney(item.lineTotal)}</span>
                </div>
                {toppingLine}
              </div>
            );
          })}
          <div className="mt-2 flex justify-between border-t border-dashed border-line pt-2 text-lg font-semibold">
            <span>Tổng</span>
            <span>{formatMoney(order.total)}</span>
          </div>
        </div>
      </div>

      <Link
        href="/"
        className="mt-5 block w-full rounded-full bg-espresso py-3.5 text-center font-semibold text-cream hover:bg-black"
      >
        Về trang chủ
      </Link>
      <Link href="/orders" className="mt-3 block text-center text-sm font-medium text-mocha hover:text-espresso">
        Xem đơn của tôi
      </Link>
    </main>
  );
}
