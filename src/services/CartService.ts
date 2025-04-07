// import apiClient from '@/utils/apiClient';
// import {
//   CartRequest,
//   CartResponse,
//   CartChangeRequest,
//   CartPriceResponse,
//   PagedCartResponse,
// } from '@/types/CartTypes';

// interface PageRequest {
//   page?: number;
//   size?: number;
//   sort?: string;
//   direction?: 'ASC' | 'DESC';
// }

// export const CartService = {
//   // 모든 장바구니 조회 (페이징)
//   getAllCarts: async (
//     pageRequest: PageRequest = {}
//   ): Promise<PagedCartResponse> => {
//     const {
//       page = 0,
//       size = 9,
//       sort = 'createDatetime',
//       direction = 'DESC',
//     } = pageRequest;

//     const response = await apiClient.get('/carts', {
//       params: {
//         page,
//         size,
//         sort,
//         direction,
//       },
//     });

//     return response.data;
//   },

//   // 개별 장바구니 조회
//   getCartById: async (cartId: string): Promise<CartResponse> => {
//     const response = await apiClient.get(`/carts/${cartId}`);
//     return response.data;
//   },

//   // 장바구니 추가
//   createCart: async (cartRequest: CartRequest): Promise<void> => {
//     await apiClient.post('/carts', cartRequest);
//   },

//   // 장바구니 수량 업데이트
//   updateCartQuantity: async (
//     cartId: string,
//     quantity: number
//   ): Promise<void> => {
//     await apiClient.put(`/carts/${cartId}/quantity`, null, {
//       params: { quantity },
//     });
//   },

//   // 장바구니 제품 옵션 변경
//   changeProduct: async (
//     cartChangeRequest: CartChangeRequest
//   ): Promise<void> => {
//     await apiClient.put('/carts/change', cartChangeRequest);
//   },

//   // 선택된 장바구니 아이템 할인 금액 계산
//   calculateDiscountedTotal: async (
//     cartIds: string[]
//   ): Promise<CartPriceResponse> => {
//     const response = await apiClient.post('/carts/calculate', cartIds);
//     return response.data;
//   },

//   // 장바구니 삭제
//   deleteCart: async (cartId: string): Promise<void> => {
//     await apiClient.delete(`/carts/${cartId}`);
//   },
// };

// export default CartService;
