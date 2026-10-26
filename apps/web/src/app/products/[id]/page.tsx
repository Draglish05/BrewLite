import { notFound } from 'next/navigation';
import ProductOptions from '@/components/ProductOptions';
import { getProduct } from '@/lib/products';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (product === null) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-sm p-4">
      <img
        src={product.imageUrl}
        alt={product.name}
        className="mb-4 aspect-square w-full rounded object-cover"
      />
      <h1 className="text-2xl font-bold">{product.name}</h1>
      <ProductOptions product={product} />
    </main>
  );
}
