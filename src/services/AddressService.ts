import { AddressRequest, AddressResponse } from '@/types/AddressTypes';
import apiClient from '@/utils/apiClient';

// 사용자 배송지 관리 서비스
export const addressService = {
  // ✅ 사용자 배송지 목록 조회
  getUserAddresses: async (): Promise<AddressResponse[]> => {
    const response = await apiClient.get<AddressResponse[]>('/addresses');
    return response.data;
  },

  // ✅ 배송지 추가
  createAddress: async (addressRequest: AddressRequest): Promise<void> => {
    await apiClient.post('/addresses', addressRequest);
  },

  // ✅ 기본 배송지 변경
  updateDefaultAddress: async (addressId: string): Promise<void> => {
    await apiClient.put(`/addresses/${addressId}/default`);
  },

  // ✅ 배송지 삭제
  removeAddress: async (addressId: string): Promise<void> => {
    await apiClient.delete(`/addresses/${addressId}`);
  },
};

export default addressService;
