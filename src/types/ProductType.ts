import { Page } from './page';

export interface ProductType {
  productId: string;
  productName: string;
  productDescription: string;
  price: number;
  stockQuantity: number;
  category: string;
  imageUrl: string;
}

export type PagedProductResponse = Page<ProductType>;
