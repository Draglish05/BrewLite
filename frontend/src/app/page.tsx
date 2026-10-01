'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import CupIcon from '@/components/CupIcon';

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

// Các loại đồ uống, theo thứ tự hiển thị
// id dùng để làm "mốc" trên trang: bấm #matcha sẽ nhảy tới phần Matcha
const CATEGORIES = [
  { name: 'Cà phê', id: 'ca-phe' },
  { name: 'Trà sữa', id: 'tra-sua' },
  { name: 'Trà', id: 'tra' },
  { name: 'Matcha', id: 'matcha' },
  { name: 'Cacao', id: 'cacao' },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  // Các "bảng ghi nhớ" của trang
  const [products, setProducts] = useState<Product[]>([]); // danh sách món
  const [loading, setLoading] = useState(true); // đang tải hay không
  const [error, setError] = useState(''); // câu báo lỗi (rỗng = không lỗi)
  const [search, setSearch] = useState(''); // chữ gõ trong ô tìm kiếm
  const [activeCat, setActiveCat] = useState('ca-phe'); // loại đang được chọn ở thanh bên

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

  // Lọc món theo ô tìm kiếm (không phân biệt hoa thường)
  const keyword = search.toLowerCase();
  const shownProducts = products.filter((p) => p.name.toLowerCase().includes(keyword));

  // Chọn nội dung hiển thị theo các tình huống
  let content;
  if (loading) {
    content = <p>Đang tải menu...</p>;
  } else if (error) {
    content = <p className="text-red-600">{error}</p>;
  } else if (products.length === 0) {
    content = <p>Hiện chưa có món nào.</p>;
  } else if (shownProducts.length === 0) {
    content = <p>Không tìm thấy món nào có chữ "{search}".</p>;
  } else {
    content = (
      <div className="flex flex-col gap-8">
        {CATEGORIES.map((cat) => {
          // Lọc ra các món thuộc loại này
          const list = shownProducts.filter((p) => p.category === cat.name);
          if (list.length === 0) return null;

          return (
            // scroll-mt-4: khi nhảy tới thì chừa khoảng trống phía trên
            <section key={cat.id} id={cat.id} className="scroll-mt-4">
              <h2 className="mb-3 border-b-2 border-sky-200 pb-1 text-xl font-bold text-sky-900">{cat.name}</h2>

              {/* Ô món nhỏ, trải hàng ngang: màn hình càng rộng càng nhiều cột */}
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">
                {list.map((p) => (
                  <Link
                    key={p.id}
                    href={'/products/' + p.id}
                    className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm hover:border-sky-400 hover:shadow-md"
                  >
                    <div className="flex h-24 items-center justify-center bg-sky-50">
                      <CupIcon color={p.color} className="h-20" />
                    </div>
                    <div className="p-2">
                      <h3 className="text-sm font-semibold leading-tight">{p.name}</h3>
                      <p className="text-sm text-sky-700">{p.price.toLocaleString('vi-VN')}đ</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    );
  }

  return (
    <main className="flex w-full flex-1 flex-col md:flex-row">
      {/* Thanh bên kiểu máy POS: ô tìm kiếm + danh sách loại */}
      <aside className="border-b border-gray-200 bg-white md:sticky md:top-0 md:h-screen md:w-52 md:shrink-0 md:border-b-0 md:border-r">
        <div className="p-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Tìm món..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
          />
        </div>

        <p className="px-4 pb-1 text-xs font-semibold uppercase text-gray-400">Loại đồ uống</p>
        <nav className="flex overflow-x-auto md:flex-col">
          {CATEGORIES.map((cat) => (
            <a
              key={cat.id}
              href={'#' + cat.id}
              onClick={() => setActiveCat(cat.id)}
              className={
                activeCat === cat.id
                  ? 'whitespace-nowrap border-l-4 border-sky-600 bg-sky-100 px-4 py-3 font-semibold text-sky-800'
                  : 'whitespace-nowrap border-l-4 border-transparent px-4 py-3 text-gray-700 hover:bg-gray-50'
              }
            >
              {cat.name}
            </a>
          ))}
        </nav>
      </aside>

      {/* Khu chọn món, chia theo từng loại */}
      <div className="flex-1 bg-gray-50 p-4 md:p-6">{content}</div>
    </main>
  );
}
