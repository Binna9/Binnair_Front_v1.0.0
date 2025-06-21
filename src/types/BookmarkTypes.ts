import { Page } from './Page';

export interface BookmarkItem {
  id: string;
  productId: string;
  productName: string;
  productDescription: string;
  price: number;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookmarkResponse {
  bookmarkId: string; // 북마크 ID
  userId: string; // 사용자 ID
  productId: string; // 상품 ID
  productName: string; // 상품명
  productDescription: string; // 상품 설명
  price: number; // 상품 가격
  imageUrl: string; // 상품 이미지 URL
  createDatetime: string; // 생성 일시
  modifyDatetime: string; // 수정 일시
}

export interface BookmarkRequest {
  productId: string; // 상품 ID
}

export type PagedBookmarkResponse = Page<BookmarkResponse>;
