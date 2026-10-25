'use client';

import Link from 'next/link';
import { useHydrated } from '@/lib/useHydrated';
import { useCart } from '@/store/cart';

export default function CartLink() {
  const hydrated = useHydrated();
  const items = useCart((state) => state.items);

  let count = 0;
  for (const item of items) {
    count += item.qty;
  }

  return <Link href="/cart">Giỏ hàng ({hydrated ? count : 0})</Link>;
}
