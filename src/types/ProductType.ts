import { Page } from './page';

export interface ProductType {
  productId: string;
  productName: string;
  productDescription: string;
  price: number;
  stockQuantity: number;
  category: string;
  imageUrl: string;
  discountRate: number;
  discountPrice: number;
}

export type PagedProductResponse = Page<ProductType>;
