import { getProducts } from '@/lib/products';

export default async function MenuPage() {
  const products = await getProducts();

  if (products.length === 0) {
    return <p className="p-4 text-center">Menu đang trống</p>;
  }

  return (
    <main className="p-4">
      <h1 className="mb-4 text-2xl font-bold">BrewLite</h1>
      <ul className="grid grid-cols-2 gap-4">
        {products.map((product) => (
          <li key={product.id} className="rounded-lg border p-3">
            <img src={product.imageUrl} alt={product.name} className="mb-2 w-full" />
            <p className="font-semibold">{product.name}</p>
            <p>{product.price.toLocaleString('vi-VN')}đ</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
