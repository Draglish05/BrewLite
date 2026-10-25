export type Product = {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  stock: number;
};

export async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${process.env.API_URL}/products`);

  if (res.ok === false) {
    throw new Error('Không tải được menu');
  }

  return res.json();
}