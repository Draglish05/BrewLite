import { Injectable, NotFoundException } from '@nestjs/common';

export interface Product {
    id: number;
    name: string;
    price: number;
    imageUrl: string;
    stock: number;
}

@Injectable()
export class ProductsService {
    private products: Product[] = [
        { id: 1, name: 'Cà phê sữa', price: 35000, imageUrl: '/images/ca-phe-sua.svg', stock: 50 },
        { id: 2, name: 'Americano', price: 40000, imageUrl: '/images/americano.svg', stock: 50 },
        { id: 3, name: 'Cappuccino', price: 45000, imageUrl: '/images/cappuccino.svg', stock: 30 },
        { id: 4, name: 'Espresso', price: 40000, imageUrl: '/images/espresso.svg', stock: 20 },
    ];

    findAll(): Product[] {
        return this.products;
    }

    findOne(id: number): Product {
        const product = this.products.find((p) => p.id === id);
        if (!product) {
            throw new NotFoundException(`Không tìm thấy sản phẩm id=${id}`);
        }
        return product;
    }
}
