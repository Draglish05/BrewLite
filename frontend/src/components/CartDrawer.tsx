'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import BagIcon from '@/components/BagIcon';
import CupIcon from '@/components/CupIcon';
import { useCartStore, getCartTotal, getCartCount, formatMoney } from '@/store/cart';

// Giỏ hàng trượt ra từ bên phải, ngay trên trang đang xem (không chuyển trang)
export default function CartDrawer() {
  const items = useCartStore((state) => state.items);
  const isOpen = useCartStore((state) => state.isOpen);
  const closeCart = useCartStore((state) => state.closeCart);
  const increase = useCartStore((state) => state.increase);
  const decrease = useCartStore((state) => state.decrease);
  const removeItem = useCartStore((state) => state.removeItem);

  const total = getCartTotal(items);
  const totalQty = getCartCount(items); // tổng số ly

  // Giỏ đang mở thì khóa cuộn trang phía sau
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  // Kiểu hiển thị khi mở / đóng: lớp nền tối hiện dần, khung giỏ trượt từ phải vào
  let overlayStyle = 'pointer-events-none opacity-0';
  let panelStyle = 'translate-x-full';
  if (isOpen) {
    overlayStyle = 'opacity-100';
    panelStyle = 'translate-x-0';
  }

  // Phần giữa: giỏ trống hoặc danh sách món
  let body;
  if (items.length === 0) {
    body = (
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-latte text-mocha">
          <BagIcon className="h-8 w-8" />
        </div>
        <p className="mt-4 font-serif text-xl font-semibold">Giỏ hàng đang trống</p>
        <p className="mt-1 text-sm text-mocha">Chọn vài món ngon trong menu nhé.</p>
        <Link
          href="/"
          onClick={closeCart}
          className="mt-5 rounded-full bg-espresso px-6 py-2.5 font-semibold text-cream hover:bg-black"
        >
          Xem menu
        </Link>
      </div>
    );
  } else {
    body = (
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-4">
        {items.map((item) => {
          // Dòng mô tả: size, có topping thì ghi thêm topping
          let detail = 'Size ' + item.size;
          if (item.toppings.length > 0) {
            detail = detail + ' · ' + item.toppings.join(', ');
          }

          return (
            <div key={item.key} className="flex items-center gap-3 rounded-2xl border border-line bg-card p-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-latte">
                <CupIcon color={item.color} className="h-11" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-semibold leading-snug">{item.name}</p>
                <p className="text-sm text-mocha">{detail}</p>
                <p className="text-sm font-semibold text-caramel">{formatMoney(item.unitPrice)}</p>
              </div>

              <div className="flex flex-col items-end gap-1.5">
                {/* Nút giảm / số lượng / tăng */}
                <div className="flex items-center rounded-full border border-line bg-cream">
                  <button onClick={() => decrease(item.key)} className="h-8 w-8 rounded-full hover:bg-latte">
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-semibold">{item.qty}</span>
                  <button onClick={() => increase(item.key)} className="h-8 w-8 rounded-full hover:bg-latte">
                    +
                  </button>
                </div>
                <button onClick={() => removeItem(item.key)} className="text-xs text-mocha hover:text-red-600">
                  Xóa
                </button>
              </div>
            </div>
          );
        })}

        <Link href="/" onClick={closeCart} className="text-sm font-medium text-caramel hover:underline">
          + Thêm món khác
        </Link>
      </div>
    );
  }

  // Phần dưới: tổng tiền + nút thanh toán (chỉ hiện khi giỏ có món)
  let footer = null;
  if (items.length > 0) {
    footer = (
      <div className="border-t border-line bg-card px-5 py-4">
        <div className="flex justify-between text-sm text-mocha">
          <span>Tổng số lượng</span>
          <span>{totalQty} ly</span>
        </div>
        <div className="mt-1 flex justify-between text-lg font-semibold">
          <span>Tổng</span>
          <span>{formatMoney(total)}</span>
        </div>

        {/* Nút thanh toán hiện tổng tiền (theo US-05 của đề) */}
        <Link
          href="/checkout"
          onClick={closeCart}
          className="mt-3 flex w-full items-center justify-between rounded-full bg-espresso px-6 py-3.5 font-semibold text-cream hover:bg-black"
        >
          <span>Thanh toán</span>
          <span className="text-honey">{formatMoney(total)}</span>
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Lớp nền tối phía sau, bấm vào thì đóng giỏ */}
      <div
        onClick={closeCart}
        className={'fixed inset-0 z-40 bg-espresso/40 backdrop-blur-sm transition-opacity duration-300 ' + overlayStyle}
      />

      {/* Khung giỏ hàng bên phải */}
      <aside
        inert={!isOpen}
        aria-label="Giỏ hàng"
        className={
          'fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-cream shadow-2xl transition-transform duration-300 ' +
          panelStyle
        }
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="flex items-center gap-2 font-serif text-2xl font-semibold">
            <BagIcon className="h-6 w-6 text-caramel" />
            Giỏ hàng
            <span className="rounded-full bg-latte px-2 text-sm font-semibold text-mocha">{totalQty}</span>
          </h2>
          <button onClick={closeCart} aria-label="Đóng giỏ hàng" className="rounded-full p-2 text-xl leading-none hover:bg-latte">
            ✕
          </button>
        </div>

        {body}
        {footer}
      </aside>
    </>
  );
}
