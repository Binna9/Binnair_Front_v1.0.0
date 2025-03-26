import { Page } from './page';
import { FileResponse } from './File';

export interface ProductResponse {
  productId: string; // 제품 ID
  productName: string; // 제품 명
  productDescription: string; // 제품 설명
  price: number; // 가격
  stockQuantity: number; // 재고량
  category: string; // 제품 카테고리
  discountRate: number; // 제품 할인율
  discountAmount: number; // 제품 할인 금액
  discountPrice: number; // 제품 할인 적용 가격
  files: FileResponse[]; // 파일 리스트
}

export interface ProductRequest {
  productName: string; // 제품 명
  productDescription: string; // 제품 설명
  price: number; // 가격
  stockQuantity: number; // 재고량
  category: string; // 제품 카테고리
  discountRate: number; // 제품 할인율
}

export type PagedProductResponse = Page<ProductResponse>;
