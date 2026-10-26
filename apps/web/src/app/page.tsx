import Link from 'next/link';
import { getProducts } from '@/lib/products';

export default async function MenuPage() {
  const products = await getProducts();

  if (products.length === 0) {
    return <p className="p-4 text-center">Menu đang trống</p>;
  }

  return (
    <main className="mx-auto max-w-3xl p-4">
      <h1 className="mb-4 text-2xl font-bold">Menu</h1>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {products.map((product) => (
          <li key={product.id} className="rounded-lg border p-2">
            <Link href={`/products/${product.id}`} className="flex h-full flex-col">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="mb-2 aspect-square w-full rounded object-cover"
              />
              <p className="font-semibold">{product.name}</p>
              <p className="mt-auto">{product.price.toLocaleString('vi-VN')}đ</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
