'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProductImage from '@/components/ProductImage';
import CartBar from '@/components/CartBar';
import { formatMoney } from '@/store/cart';

// Khuôn dữ liệu 1 món (giống Product bên backend)
type Product = {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  stock: number;
  category: string;
  color: string;
};

// Các nút chọn loại, theo thứ tự hiển thị. Nút đầu tiên "Tất cả" là hiện mọi loại
const ALL = 'Tất cả';
const TABS = [ALL, 'Cà phê', 'Trà sữa', 'Trà', 'Matcha', 'Cacao'];

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Lấy ra các món thuộc 1 loại
function getProductsOfCategory(products: Product[], category: string) {
  const result: Product[] = [];
  for (const product of products) {
    if (product.category === category) {
      result.push(product);
    }
  }
  return result;
}

// 1 ô món trong lưới
function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={'/products/' + product.id}
      className="rounded-2xl border border-line bg-card p-2.5 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative flex h-32 items-center justify-center rounded-xl bg-latte">
        <ProductImage imageUrl={product.imageUrl} color={product.color} name={product.name} className="h-24" />
        {/* Nút + nhỏ ở góc: bấm vào để chọn size, topping */}
        <span className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-espresso text-lg leading-none text-cream">
          +
        </span>
      </div>
      <h3 className="mt-2.5 px-1 font-medium leading-snug">{product.name}</h3>
      <p className="px-1 pb-1 font-semibold text-caramel">{formatMoney(product.price)}</p>
    </Link>
  );
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]); // danh sách món
  const [loading, setLoading] = useState(true); // đang tải hay không
  const [error, setError] = useState(''); // câu báo lỗi (rỗng = không lỗi)
  const [search, setSearch] = useState(''); // chữ gõ trong ô tìm kiếm
  const [activeTab, setActiveTab] = useState(ALL); // loại đang chọn

  // Chạy 1 lần khi mở trang: gọi backend lấy menu
  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch(API_URL + '/products');
        if (!res.ok) {
          throw new Error('Backend trả lỗi');
        }
        const data = await res.json();
        setProducts(data);
      } catch {
        setError('Không tải được menu. Kiểm tra backend đã chạy chưa nhé.');
      }
      setLoading(false);
    }

    loadProducts();
  }, []);

  // Lọc món: tên phải có chữ đang tìm (không phân biệt hoa thường) và đúng loại đang chọn
  const keyword = search.toLowerCase();
  const shownProducts: Product[] = [];
  for (const product of products) {
    const matchName = product.name.toLowerCase().includes(keyword);

    let matchTab = true;
    if (activeTab !== ALL && product.category !== activeTab) {
      matchTab = false;
    }

    if (matchName && matchTab) {
      shownProducts.push(product);
    }
  }

  // Chọn nội dung hiển thị theo các tình huống
  let content;
  if (loading) {
    // 8 khung nhấp nháy trong lúc chờ
    const skeletons = [];
    for (let index = 1; index <= 8; index++) {
      skeletons.push(<div key={index} className="h-48 animate-pulse rounded-2xl bg-latte" />);
    }
    content = <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">{skeletons}</div>;
  } else if (error) {
    content = <p className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>;
  } else if (products.length === 0) {
    content = <p className="text-mocha">Hiện chưa có món nào.</p>;
  } else if (shownProducts.length === 0) {
    content = <p className="text-mocha">Không tìm thấy món nào phù hợp.</p>;
  } else if (activeTab === ALL) {
    // Tất cả: chia theo từng loại
    content = (
      <div className="flex flex-col gap-8">
        {TABS.map((tab) => {
          if (tab === ALL) return null;

          const list = getProductsOfCategory(shownProducts, tab);
          if (list.length === 0) return null;

          return (
            <section key={tab}>
              <h2 className="mb-3 font-serif text-xl font-semibold">{tab}</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {list.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    );
  } else {
    // 1 loại: chỉ 1 lưới
    content = (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {shownProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-4">
      {/* Ô tìm món */}
      <input
        type="text"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Tìm đồ uống..."
        className="w-full rounded-full border border-line bg-card px-5 py-2.5 outline-none placeholder:text-mocha/70 focus:border-caramel"
      />

      {/* Các nút chọn loại, trượt ngang được trên điện thoại */}
      <nav className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        {TABS.map((tab) => {
          let style = 'border-line bg-card text-mocha hover:border-espresso';
          if (activeTab === tab) {
            style = 'border-espresso bg-espresso text-cream';
          }
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={'shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium ' + style}
            >
              {tab}
            </button>
          );
        })}
      </nav>

      <div className="mt-5">{content}</div>

      <CartBar />
    </main>
  );
}
