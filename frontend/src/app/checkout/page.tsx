'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_URL, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useCartStore, getCartTotal, formatMoney } from '@/store/cart';

// Kết quả khi thanh toán thành công
type PaymentResult = {
  orderId: number;
  status: string;
  method: string;
  amount: number;
};

export default function CheckoutPage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const items = useCartStore((state) => state.items);
  const clear = useCartStore((state) => state.clear);

  const [method, setMethod] = useState('WALLET');
  const [simulateFail, setSimulateFail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState<number | null>(null); // đơn đã tạo, để thử lại không tạo đơn mới
  const [result, setResult] = useState<PaymentResult | null>(null);

  const total = getCartTotal(items);

  async function handlePay() {
    setError('');
    setLoading(true);

    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      };

      // Bước 1: tạo đơn (chỉ làm lần đầu, thử lại thì dùng lại đơn cũ)
      let id = orderId;
      if (id === null) {
        const orderItems = [];
        for (const i of items) {
          orderItems.push({
            productId: i.productId,
            size: i.size,
            toppings: i.toppings,
            qty: i.qty,
          });
        }

        const orderRes = await fetch(API_URL + '/orders', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({ items: orderItems }),
        });
        const orderData = await orderRes.json();

        if (orderRes.status === 401) {
          logout();
          setError('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
          return;
        }
        if (!orderRes.ok) {
          setError(getErrorMessage(orderData));
          return;
        }

        id = orderData.orderId;
        setOrderId(orderData.orderId);
      }

      // Bước 2: thanh toán đơn
      const payRes = await fetch(API_URL + '/payments', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ orderId: id, method: method, simulateFail: simulateFail }),
      });
      const payData = await payRes.json();

      if (payRes.status === 401) {
        logout();
        setError('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
        return;
      }
      if (!payRes.ok) {
        setError(getErrorMessage(payData));
        return;
      }

      if (payData.status === 'PAID') {
        // Thành công: xóa giỏ và chuyển sang màn hình xác nhận
        clear();
        setResult(payData);
        router.push('/orders/' + payData.orderId);
      } else {
        // Thất bại: GIỮ NGUYÊN giỏ hàng, cho khách thử lại
        setError(payData.message);
      }
    } catch (err) {
      setError('Không kết nối được máy chủ');
    } finally {
      setLoading(false);
    }
  }

  // Thanh toán thành công: đang chuyển sang màn hình xác nhận
  if (result) {
    return <main className="mx-auto max-w-md p-8 text-center">Đang chuyển đến màn hình xác nhận...</main>;
  }

  // Chưa đăng nhập
  if (token === '') {
    return (
      <main className="mx-auto max-w-md p-8">
        <h1 className="mb-4 text-2xl font-bold">Thanh toán</h1>
        <p>Bạn cần đăng nhập để thanh toán.</p>
        <div className="mt-4 flex gap-4">
          <Link href="/login" className="text-sky-700 underline">
            Đăng nhập
          </Link>
          <Link href="/register" className="text-sky-700 underline">
            Đăng ký
          </Link>
        </div>
      </main>
    );
  }

  // Giỏ trống
  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-md p-8">
        <h1 className="mb-4 text-2xl font-bold">Thanh toán</h1>
        <p>Giỏ hàng đang trống.</p>
        <Link href="/" className="mt-4 inline-block text-sky-700 underline">
          ← Xem menu
        </Link>
      </main>
    );
  }

  // Màn thanh toán
  let walletStyle = 'border-gray-300';
  let cardStyle = 'border-gray-300';
  if (method === 'WALLET') {
    walletStyle = 'border-sky-500 bg-sky-50';
  } else {
    cardStyle = 'border-sky-500 bg-sky-50';
  }

  let buttonText = 'Xác nhận thanh toán – ' + formatMoney(total);
  if (loading) {
    buttonText = 'Đang xử lý...';
  }

  return (
    <main className="mx-auto max-w-md p-8">
      <h1 className="mb-4 text-2xl font-bold">Thanh toán</h1>

      {/* Tóm tắt đơn */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        {items.map((item) => (
          <div key={item.key} className="flex justify-between py-1 text-sm">
            <span>
              {item.qty} x {item.name} ({item.size})
            </span>
            <span>{formatMoney(item.unitPrice * item.qty)}</span>
          </div>
        ))}
        <div className="mt-2 flex justify-between border-t border-gray-300 pt-2 text-lg font-bold">
          <span>Tổng:</span>
          <span>{formatMoney(total)}</span>
        </div>
      </div>

      {/* Chọn phương thức */}
      <h2 className="mb-2 mt-6 font-semibold">Phương thức thanh toán</h2>
      <div className="flex gap-3">
        <button
          onClick={() => setMethod('WALLET')}
          className={'flex-1 rounded-xl border-2 py-3 font-semibold ' + walletStyle}
        >
          👛 Ví
        </button>
        <button
          onClick={() => setMethod('CARD')}
          className={'flex-1 rounded-xl border-2 py-3 font-semibold ' + cardStyle}
        >
          💳 Thẻ
        </button>
      </div>

      {/* Dùng để demo thanh toán lỗi */}
      <label className="mt-4 flex items-center gap-2 text-sm text-gray-600">
        <input
          type="checkbox"
          checked={simulateFail}
          onChange={(e) => setSimulateFail(e.target.checked)}
        />
        Giả lập thanh toán lỗi (để demo)
      </label>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <button
        onClick={handlePay}
        disabled={loading}
        className="mt-6 w-full rounded-xl bg-sky-600 py-3 font-semibold text-white hover:bg-sky-700 disabled:bg-gray-400"
      >
        {buttonText}
      </button>

      <Link href="/cart" className="mt-4 inline-block text-sky-700 underline">
        ← Về giỏ hàng
      </Link>
    </main>
  );
}
