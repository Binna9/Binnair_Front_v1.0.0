import apiClient from '../utils/apiClient';
import { CartTotal } from '../types/CartBookmarkTypes';

// ✅ 장바구니 총 금액 가져오기
export const fetchCartTotalAmount = async (): Promise<number> => {
  try {
    const response = await apiClient.get<CartTotal>('/carts/total'); // ✅ API 응답 타입 지정
    if (response.status === 200 && response.data.totalAmount !== undefined) {
      return response.data.totalAmount; // ✅ totalAmount만 반환
    }
  } catch (error) {
    console.error('❌ 장바구니 총 금액 불러오기 실패:', error);
  }
  return 0; // ✅ 기본값 반환 (오류 방지)
};
