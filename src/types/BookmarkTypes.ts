import { Page } from './page';

export interface BookmarkResponse {
  bookmarkId: string; // 즐겨찾기 ID
  userId: string; // 사용자 ID
  productId: string; // 제품 ID
  productName: string; // 제품 명
  productDescription: string; // 제품 설명
  price: number; // 가격
}

export interface BookmarkRequest {
  productId: string; // 제품 ID
}

export type PagedBookmarkResponse = Page<BookmarkResponse>;
