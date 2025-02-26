import apiClient from '@/utils/apiClient';
import {
  BookmarkResponse,
  CartTotal,
  CartItemsResponse,
  // QuantityDto, // 만약 별도의 타입으로 분리되어 있다면
} from '../types/CartBookmarkTypes';

const CartBookmarkService = {
  // 장바구니 목록 조회 (CartResponse[] 배열 반환)
  getCartItems: (): Promise<{ data: CartItemsResponse }> => {
    return apiClient.get<CartItemsResponse>('/carts');
  },

  // 즐겨찾기 목록 조회 (BookmarkResponse[] 배열 반환)
  getBookmarkItems: (): Promise<{ data: BookmarkResponse[] }> => {
    return apiClient.get<BookmarkResponse[]>('/bookmarks');
  },

  // 장바구니 수량 업데이트 후, 변경된 수량과 총액을 포함한 CartTotal 반환
  updateCartQuantity: (
    cartId: string,
    newQuantity: number
  ): Promise<CartTotal> => {
    return apiClient
      .put<CartTotal>(`/carts/${cartId}`, { quantity: newQuantity })
      .then((response) => response.data);
  },

  // 장바구니 아이템 삭제
  deleteCartItem: (cartId: string): Promise<void> => {
    return apiClient.delete(`/carts/${cartId}`);
  },

  // 즐겨찾기 아이템 삭제
  deleteBookmarkItem: (bookmarkId: string): Promise<void> => {
    return apiClient.delete(`/bookmarks/${bookmarkId}`);
  },

  // 장바구니 총액 조회
  getCartTotalAmount: (): Promise<number> => {
    return apiClient
      .get<{ totalAmount: number }>('/carts/total')
      .then((response) => response.data.totalAmount);
  },
};

export default CartBookmarkService;
