'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

type Product = {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  stock: number;
};

// Size và số tiền cộng thêm
const SIZES = [
  { name: 'S', extra: 0 },
  { name: 'M', extra: 5000 },
  { name: 'L', extra: 10000 },
];

// Topping và giá của từng loại
const TOPPINGS = [
  { name: 'Trân châu', price: 5000 },
  { name: 'Kem', price: 7000 },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Đổi 45000 thành "45.000đ"
function formatMoney(value: number) {
  return value.toLocaleString('vi-VN') + 'đ';
}

export default function ProductDetail() {
  // Lấy id trên đường link, ví dụ /products/2 thì id = "2"
  const params = useParams();
  const id = params.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [size, setSize] = useState('S'); // size đang chọn
  const [toppings, setToppings] = useState<string[]>([]); // các topping đang chọn

  // Gọi backend lấy thông tin 1 món
  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await fetch(API_URL + '/products/' + id);
        if (!res.ok) {
          throw new Error('Không tìm thấy');
        }
        const data = await res.json();
        setProduct(data);
      } catch (e) {
        setError('Không tìm thấy món này.');
      }
      setLoading(false);
    }

    loadProduct();
  }, [id]);

  // Bấm vào 1 topping: đang chọn thì bỏ, chưa chọn thì thêm
  function toggleTopping(name: string) {
    if (toppings.includes(name)) {
      setToppings(toppings.filter((t) => t !== name));
    } else {
      setToppings([...toppings, name]);
    }
  }

  // Tính giá = giá gốc + tiền size + tiền topping
  function calcPrice(basePrice: number) {
    let total = basePrice;

    for (const s of SIZES) {
      if (s.name === size) {
        total = total + s.extra;
      }
    }

    for (const t of TOPPINGS) {
      if (toppings.includes(t.name)) {
        total = total + t.price;
      }
    }

    return total;
  }

  if (loading) {
    return <main className="p-8">Đang tải...</main>;
  }

  if (error || !product) {
    return (
      <main className="p-8">
        <p className="text-red-600">{error}</p>
        <Link href="/" className="text-amber-700 underline">← Về Menu</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md p-8">
      <Link href="/" className="text-amber-700">← Menu</Link>

      <img src={product.imageUrl} alt={product.name} className="mt-4 h-56 w-full rounded-xl object-cover" />
      <h1 className="mt-4 text-2xl font-bold">{product.name}</h1>
      <p className="text-gray-500">Giá: {formatMoney(product.price)}</p>

      {/* Chọn size */}
      <h2 className="mt-6 font-semibold">Size</h2>
      <div className="mt-2 flex gap-2">
        {SIZES.map((s) => (
          <button
            key={s.name}
            onClick={() => setSize(s.name)}
            className={
              size === s.name
                ? 'flex-1 rounded-lg border-2 border-amber-700 bg-amber-700 py-2 text-white'
                : 'flex-1 rounded-lg border-2 border-gray-300 py-2'
            }
          >
            {s.name}
            {s.extra > 0 && <span className="block text-xs">+{formatMoney(s.extra)}</span>}
          </button>
        ))}
      </div>

      {/* Chọn topping */}
      <h2 className="mt-6 font-semibold">Topping</h2>
      <div className="mt-2 flex flex-col gap-2">
        {TOPPINGS.map((t) => (
          <label key={t.name} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={toppings.includes(t.name)}
              onChange={() => toggleTopping(t.name)}
            />
            {t.name} (+{formatMoney(t.price)})
          </label>
        ))}
      </div>

      {/* Nút thêm vào giỏ: sẽ hoạt động ở Task 5 */}
      <button className="mt-8 w-full rounded-xl bg-amber-700 py-3 font-semibold text-white">
        Thêm vào giỏ – {formatMoney(calcPrice(product.price))}
      </button>
    </main>
  );
}
