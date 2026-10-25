'use client';

import { useState } from 'react';
import { SIZES, TOPPINGS } from '@/lib/options';
import type { Product } from '@/lib/products';

export default function ProductOptions({ product }: { product: Product }) {
  const [size, setSize] = useState(SIZES[0]);
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);

  function toggleTopping(name: string) {
    if (selectedToppings.includes(name)) {
      setSelectedToppings(selectedToppings.filter((t) => t !== name));
    } else {
      setSelectedToppings([...selectedToppings, name]);
    }
  }

  let total = product.price + size.extra;
  for (const topping of TOPPINGS) {
    if (selectedToppings.includes(topping.name)) {
      total += topping.extra;
    }
  }

  return (
    <div>
      <fieldset className="my-4">
        <legend className="font-semibold">Size</legend>
        {SIZES.map((s) => (
          <label key={s.name} className="mr-4">
            <input
              type="radio"
              name="size"
              checked={size.name === s.name}
              onChange={() => setSize(s)}
            />{' '}
            {s.name}
          </label>
        ))}
      </fieldset>

      <fieldset className="my-4">
        <legend className="font-semibold">Topping</legend>
        {TOPPINGS.map((t) => (
          <label key={t.name} className="mr-4">
            <input
              type="checkbox"
              checked={selectedToppings.includes(t.name)}
              onChange={() => toggleTopping(t.name)}
            />{' '}
            {t.name} (+{t.extra.toLocaleString('vi-VN')}đ)
          </label>
        ))}
      </fieldset>

      <p className="text-xl font-bold">Giá: {total.toLocaleString('vi-VN')}đ</p>
    </div>
  );
}
