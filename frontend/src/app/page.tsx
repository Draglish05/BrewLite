'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// Khuôn dữ liệu 1 món (giống Product bên backend)
type Product = {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  stock: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  // 3 "bảng ghi nhớ" của trang
  const [products, setProducts] = useState<Product[]>([]); // danh sách món
  const [loading, setLoading] = useState(true); // đang tải hay không
  const [error, setError] = useState(''); // câu báo lỗi (rỗng = không lỗi)

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
      } catch (e) {
        setError('Không tải được menu. Kiểm tra backend đã chạy chưa nhé.');
      }
      setLoading(false);
    }

    loadProducts();
  }, []);

  // Chọn nội dung hiển thị theo 4 tình huống
  let content;
  if (loading) {
    content = <p>Đang tải menu...</p>;
  } else if (error) {
    content = <p className="text-red-600">{error}</p>;
  } else if (products.length === 0) {
    content = <p>Hiện chưa có món nào.</p>;
  } else {
    content = (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {products.map((p) => (
          <Link key={p.id} href={'/products/' + p.id} className="rounded-xl border bg-white text-gray-900 shadow hover:shadow-lg">
            <img src={p.imageUrl} alt={p.name} className="h-40 w-full rounded-t-xl object-cover" />
            <div className="p-3">
              <h2 className="font-semibold">{p.name}</h2>
              <p className="text-amber-700">{p.price.toLocaleString('vi-VN')}đ</p>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="mb-6 text-3xl font-bold">Menu</h1>
      {content}
    </main>
  );
}
