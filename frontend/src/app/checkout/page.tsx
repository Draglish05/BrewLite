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
  const openCart = useCartStore((state) => state.openCart);

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
        for (const cartItem of items) {
          orderItems.push({
            productId: cartItem.productId,
            size: cartItem.size,
            toppings: cartItem.toppings,
            qty: cartItem.qty,
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
      // Mỗi lần bấm "Xác nhận trả" tạo 1 mã riêng (Idempotency-Key).
      // Request này lỡ bị gửi lại thì backend thấy trùng mã, không trừ tiền lần 2
      const idempotencyKey = 'pay-' + id + '-' + Date.now();
      const payRes = await fetch(API_URL + '/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
          'Idempotency-Key': idempotencyKey,
        },
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
    } catch {
      setError('Không kết nối được máy chủ');
    } finally {
      setLoading(false);
    }
  }

  // Thanh toán thành công: đang chuyển sang màn hình xác nhận
  if (result) {
    return <main className="mx-auto w-full max-w-md px-4 pt-16 text-center text-mocha">Đang chuyển đến màn hình xác nhận...</main>;
  }

  // Chưa đăng nhập
  if (token === '') {
    return (
      <main className="mx-auto w-full max-w-md px-4 pt-10">
        <h1 className="font-serif text-3xl font-semibold">Thanh toán</h1>
        <p className="mt-2 text-mocha">Bạn cần đăng nhập để thanh toán.</p>
        <div className="mt-4 flex gap-4 text-sm font-medium">
          <Link href="/login" className="text-caramel hover:underline">
            Đăng nhập
          </Link>
          <Link href="/register" className="text-caramel hover:underline">
            Đăng ký
          </Link>
        </div>
      </main>
    );
  }

  // Giỏ trống
  if (items.length === 0) {
    return (
      <main className="mx-auto w-full max-w-md px-4 pt-10">
        <h1 className="font-serif text-3xl font-semibold">Thanh toán</h1>
        <p className="mt-2 text-mocha">Giỏ hàng đang trống.</p>
        <Link href="/" className="mt-4 inline-block text-sm font-medium text-caramel hover:underline">
          ← Xem menu
        </Link>
      </main>
    );
  }

  // Các phương thức thanh toán (không dùng tiền mặt)
  const METHODS = [
    { value: 'WALLET', label: 'Ví điện tử', note: 'Momo, ZaloPay, VNPay (giả lập)' },
    { value: 'CARD', label: 'Thẻ ngân hàng', note: 'Visa, Mastercard, ATM (giả lập)' },
  ];

  let buttonText = 'Xác nhận trả';
  if (loading) {
    buttonText = 'Đang xử lý...';
  }

  // Có lỗi thì hiện khung báo lỗi
  let errorBox = null;
  if (error !== '') {
    errorBox = <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>;
  }

  return (
    <main className="mx-auto w-full max-w-md px-4 pb-10 pt-6">
      {/* Mở lại giỏ hàng (trượt ra bên phải) để sửa món */}
      <button onClick={openCart} className="text-sm font-medium text-mocha hover:text-espresso">
        ← Sửa giỏ hàng
      </button>
      <h1 className="mt-2 font-serif text-3xl font-semibold">Thanh toán</h1>

      {/* Tóm tắt đơn */}
      <div className="mt-4 rounded-2xl border border-line bg-card p-4">
        {items.map((item) => (
          <div key={item.key} className="flex justify-between py-1 text-sm">
            <span>
              {item.qty} × {item.name} <span className="text-mocha">({item.size})</span>
            </span>
            <span>{formatMoney(item.unitPrice * item.qty)}</span>
          </div>
        ))}
        <div className="mt-2 flex justify-between border-t border-dashed border-line pt-2 text-lg font-semibold">
          <span>Tổng</span>
          <span>{formatMoney(total)}</span>
        </div>
      </div>

      {/* Chọn phương thức */}
      <h2 className="mb-2 mt-6 font-semibold">Phương thức</h2>
      <div className="flex flex-col gap-2">
        {METHODS.map((option) => {
          let boxStyle = 'border-line bg-card';
          let dotStyle = 'border-line';
          if (method === option.value) {
            boxStyle = 'border-espresso bg-card ring-1 ring-espresso';
            dotStyle = 'border-espresso border-[6px]';
          }
          return (
            <button
              key={option.value}
              onClick={() => setMethod(option.value)}
              className={'flex items-center gap-3 rounded-2xl border p-4 text-left ' + boxStyle}
            >
              <span className={'h-5 w-5 shrink-0 rounded-full border-2 bg-white ' + dotStyle} />
              <span>
                <span className="block font-semibold">{option.label}</span>
                <span className="block text-sm text-mocha">{option.note}</span>
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-center text-xs text-mocha">Không dùng tiền mặt</p>

      {/* Dùng để demo thanh toán lỗi */}
      <label className="mt-4 flex items-center gap-2 text-sm text-mocha">
        <input
          type="checkbox"
          checked={simulateFail}
          onChange={(event) => setSimulateFail(event.target.checked)}
          className="accent-espresso"
        />
        Giả lập thanh toán lỗi (để demo)
      </label>

      {errorBox}

      <button
        onClick={handlePay}
        disabled={loading}
        className="mt-6 flex w-full items-center justify-between rounded-full bg-espresso px-6 py-3.5 font-semibold text-cream hover:bg-black disabled:opacity-60"
      >
        <span>{buttonText}</span>
        <span className="text-honey">{formatMoney(total)}</span>
      </button>
    </main>
  );
}
