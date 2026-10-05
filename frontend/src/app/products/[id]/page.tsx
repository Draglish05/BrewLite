'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useCartStore, formatMoney } from '@/store/cart';
import ProductImage from '@/components/ProductImage';
import CartBar from '@/components/CartBar';

type Product = {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  stock: number;
  category: string;
  color: string;
};

// Size và số tiền cộng thêm
const SIZES = [
  { name: 'S', extra: 0 },
  { name: 'M', extra: 5000 },
  { name: 'L', extra: 10000 },
];

// Topping và giá của từng loại
// (phải giống bảng giá bên backend: backend/src/orders/pricing.ts)
const TOPPINGS = [
  { name: 'Trân châu', price: 5000 },
  { name: 'Thạch đào', price: 6000 },
  { name: 'Pudding trứng', price: 7000 },
  { name: 'Kem', price: 7000 },
  { name: 'Kem muối', price: 8000 },
  { name: 'Kem cheese', price: 10000 },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ProductDetail() {
  // Lấy id trên đường link, ví dụ /products/2 thì id = "2"
  const params = useParams();
  const id = params.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [size, setSize] = useState('S'); // size đang chọn
  const [toppings, setToppings] = useState<string[]>([]); // các topping đang chọn
  const [added, setAdded] = useState(false); // vừa thêm vào giỏ chưa

  const addItem = useCartStore((state) => state.addItem);

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
      } catch {
        setError('Không tìm thấy món này.');
      }
      setLoading(false);
    }

    loadProduct();
  }, [id]);

  // Bấm vào 1 topping: đang chọn thì bỏ, chưa chọn thì thêm
  function toggleTopping(name: string) {
    const newToppings: string[] = [];
    let wasSelected = false;

    // Chép các topping đang chọn sang danh sách mới, bỏ qua topping vừa bấm
    for (const topping of toppings) {
      if (topping === name) {
        wasSelected = true;
      } else {
        newToppings.push(topping);
      }
    }

    // Chưa chọn thì thêm vào
    if (!wasSelected) {
      newToppings.push(name);
    }

    setToppings(newToppings);
  }

  // Tính giá = giá gốc + tiền size + tiền topping
  function calcPrice(basePrice: number) {
    let total = basePrice;

    for (const sizeOption of SIZES) {
      if (sizeOption.name === size) {
        total = total + sizeOption.extra;
      }
    }

    for (const topping of TOPPINGS) {
      if (toppings.includes(topping.name)) {
        total = total + topping.price;
      }
    }

    return total;
  }

  // Bấm "Thêm vào giỏ"
  function handleAddToCart(selectedProduct: Product) {
    addItem({
      productId: selectedProduct.id,
      name: selectedProduct.name,
      color: selectedProduct.color,
      size: size,
      toppings: toppings,
      unitPrice: calcPrice(selectedProduct.price),
    });
    setAdded(true);
  }

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 pt-6">
        <div className="h-72 animate-pulse rounded-3xl bg-latte" />
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 pt-6">
        <p className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>
        <Link href="/" className="mt-4 inline-block text-sm font-medium text-mocha hover:text-espresso">
          ← Về menu
        </Link>
      </main>
    );
  }

  // Báo cho khách biết đã thêm thành công
  let addedMessage = null;
  if (added) {
    addedMessage = <p className="mt-3 text-center text-sm text-green-700">✓ Đã thêm vào giỏ</p>;
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 pb-28 pt-4">
      <Link href="/" className="text-sm font-medium text-mocha hover:text-espresso">
        ← Menu
      </Link>

      <div className="mt-3 grid gap-6 md:grid-cols-2">
        {/* Ảnh món: chiều cao cố định (điện thoại h-56, máy tính 28rem)
            để khi hiện dòng "Đã thêm vào giỏ" ở cột bên phải thì khung ảnh không bị kéo dài */}
        <div className="flex h-56 items-center justify-center rounded-3xl bg-latte md:h-[28rem]">
          <ProductImage imageUrl={product.imageUrl} color={product.color} name={product.name} className="h-44 md:h-56" />
        </div>

        <div>
          <p className="text-sm text-mocha">{product.category}</p>
          <h1 className="font-serif text-3xl font-semibold">{product.name}</h1>
          <p className="mt-1 text-lg font-semibold text-caramel">{formatMoney(product.price)}</p>

          {/* Chọn size */}
          <h2 className="mt-6 font-semibold">Size</h2>
          <div className="mt-2 flex gap-2">
            {SIZES.map((sizeOption) => {
              let style = 'border-line bg-card hover:border-espresso';
              // Size đang chọn thì tô nâu đậm
              if (size === sizeOption.name) {
                style = 'border-espresso bg-espresso text-cream';
              }

              // Dòng chữ nhỏ dưới tên size
              let extraText = 'Mặc định';
              if (sizeOption.extra > 0) {
                extraText = '+' + formatMoney(sizeOption.extra);
              }

              return (
                <button
                  key={sizeOption.name}
                  onClick={() => setSize(sizeOption.name)}
                  className={'flex-1 rounded-2xl border py-2.5 font-semibold ' + style}
                >
                  {sizeOption.name}
                  <span className="block text-xs font-normal opacity-80">{extraText}</span>
                </button>
              );
            })}
          </div>

          {/* Chọn topping: bấm để chọn / bỏ chọn */}
          <h2 className="mt-6 font-semibold">Topping</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {TOPPINGS.map((topping) => {
              let style = 'border-line bg-card text-espresso hover:border-espresso';
              if (toppings.includes(topping.name)) {
                style = 'border-espresso bg-espresso text-cream';
              }
              return (
                <button
                  key={topping.name}
                  onClick={() => toggleTopping(topping.name)}
                  className={'rounded-full border px-3.5 py-1.5 text-sm ' + style}
                >
                  {topping.name} <span className="opacity-70">+{formatMoney(topping.price)}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handleAddToCart(product)}
            className="mt-8 flex w-full items-center justify-between rounded-full bg-espresso px-6 py-3.5 font-semibold text-cream hover:bg-black"
          >
            <span>Thêm vào giỏ</span>
            <span className="text-honey">{formatMoney(calcPrice(product.price))}</span>
          </button>

          {addedMessage}
        </div>
      </div>

      <CartBar />
    </main>
  );
}
