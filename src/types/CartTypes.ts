import { Page } from './page';

export interface CartResponse {
  cartId: string; // 장바구니 ID
  userId: string; // 사용자 ID
  productId: string; // 제품 ID
  productName: string; // 제품 명
  productDescription: string; // 제품 설명
  quantity: number; // 수량
  price: number; // 제품 가격
  discountAmount: number; // 제품 할인 금액
  discountPrice: number; // 제품 최종 금액
}

export interface CartRequest {
  productId: string; // 제품 ID
  quantity: number; // 수량
}

// 장바구니 금액
export interface CartPriceResponse {
  totalPrice: string; // 총 금액
  discountAmount: string; // 할인 금액
  discountPrice: string; // 최종 금액
}

export interface CartChangeRequest {
  cartId: string; // 장바구니 ID
  productId: string; // 제품 ID
}

export type PagedCartResponse = Page<CartResponse>;
