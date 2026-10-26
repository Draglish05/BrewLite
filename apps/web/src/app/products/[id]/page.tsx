import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import ProductOptions from '@/components/ProductOptions';
import { getProduct } from '@/lib/products';

type Params = Promise<{ id: string }>;

async function ProductDetail({ params }: { params: Params }) {
  const { id } = await params;
  const product = await getProduct(id);

  if (product === null) {
    notFound();
  }

  return (
    <>
      <img
        src={product.imageUrl}
        alt={product.name}
        className="mb-4 aspect-square w-full rounded object-cover"
      />
      <h1 className="text-2xl font-bold">{product.name}</h1>
      <ProductOptions product={product} />
    </>
  );
}

export default function ProductPage({ params }: { params: Params }) {
  return (
    <main className="mx-auto max-w-sm p-4">
      <Suspense fallback={<p>Đang tải sản phẩm...</p>}>
        <ProductDetail params={params} />
      </Suspense>
    </main>
  );
}
