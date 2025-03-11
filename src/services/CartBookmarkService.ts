import apiClient from '@/utils/apiClient';
import {
  BookmarkResponse,
  CartResponse,
  CartTotal,
  CartItemsResponse,
} from '../types/CartBookmarkTypes';

const CartBookmarkService = {
  // 장바구니 추가
  addToCart: async (
    productId: string,
    quantity: number
  ): Promise<CartResponse> => {
    const response = await apiClient.post<CartResponse>('/carts', {
      productId,
      quantity,
    });
    return response.data;
  },

  // 즐겨찾기 추가
  addToBookmark: async (productId: string): Promise<BookmarkResponse> => {
    const response = await apiClient.post<BookmarkResponse>('/bookmarks', {
      productId,
    });
    return response.data;
  },

  // 장바구니 목록 조회
  getCartItems: async (): Promise<{ data: CartItemsResponse }> => {
    return await apiClient.get<CartItemsResponse>('/carts');
  },

  // 즐겨찾기 목록 조회
  getBookmarkItems: async (): Promise<{ data: BookmarkResponse[] }> => {
    return await apiClient.get<BookmarkResponse[]>('/bookmarks');
  },

  // 장바구니 아이템 삭제
  deleteCartItem: async (cartId: string): Promise<void> => {
    await apiClient.delete(`/carts/${cartId}`);
  },

  // 즐겨찾기 아이템 삭제
  deleteBookmarkItem: async (bookmarkId: string): Promise<void> => {
    await apiClient.delete(`/bookmarks/${bookmarkId}`);
  },

  // ✅ 장바구니 수량 업데이트 (쿼리 스트링 방식)
  updateCartQuantity: async (
    cartId: string,
    newQuantity: number
  ): Promise<void> => {
    await apiClient.put(
      `/carts/update-quantity?cartId=${cartId}&quantity=${newQuantity}`
    );
  },

  // ✅ 할인된 총 금액 조회
  getDiscountedTotal: async (cartIds: string[]): Promise<CartTotal> => {
    const response = await apiClient.post<CartTotal>(
      '/carts/discounted-total',
      {
        cartIds,
      }
    );
    return response.data;
  },
};

export default CartBookmarkService;
