// src/services/ProfileService.ts
import apiClient from '@/utils/apiClient';
import { ProfileUser, ProfileAddress } from '@/types/ProfileUser';

// ✅ 사용자 정보 가져오기
export const getUserProfile = async (userId: string) => {
  const userResponse = await apiClient.get<ProfileUser>(`/users/${userId}`);
  const addressResponse = await apiClient.get<ProfileAddress[]>('/addresses');

  return {
    ...userResponse.data,
    userId,
    addresses: Array.isArray(addressResponse.data) ? addressResponse.data : [],
  };
};

// ✅ 사용자 정보 수정
export const updateUserProfile = async (
  userId: string,
  updatedUser: Partial<ProfileUser>
) => {
  await apiClient.put(`/users/${userId}`, updatedUser);
  return updatedUser; // 업데이트된 정보 반환
};

// ✅ 사용자 삭제
export const deleteUserProfile = async (userId: string) => {
  await apiClient.delete(`/users/${userId}`);
};

// ✅ 배송지 추가
export const addUserAddress = async (newAddress: ProfileAddress) => {
  const response = await apiClient.post<ProfileAddress>(
    '/addresses',
    newAddress
  );
  return response.data;
};

// ✅ 배송지 수정
export const updateUserAddress = async (
  addressId: string,
  updatedAddress: Partial<ProfileAddress>
) => {
  await apiClient.put(`/addresses/${addressId}`, updatedAddress);
  return updatedAddress;
};

// ✅ 배송지 삭제
export const deleteUserAddress = async (addressId: string) => {
  await apiClient.delete(`/addresses/${addressId}`);
};

// ✅ 비밀번호 검증 API
export const verifyUserPassword = async (currentPassword: string) => {
  console.log('서버로 전송될 비밀번호:', currentPassword);

  const response = await apiClient.post<boolean>(
    `/users/verify-password`,
    { password: currentPassword }, // ✅ JSON 형식으로 변경
    {
      headers: {
        'Content-Type': 'application/json', // ✅ JSON 형식으로 변경
      },
    }
  );

  return response.data; // true or false 반환
};

// ✅ 비밀번호 변경 API
export const changeUserPassword = async (passwordChangeDto: {
  newPassword: string;
  confirmPassword: string;
}) => {
  await apiClient.put(`/users/change-password`, passwordChangeDto, {
    headers: {
      'Content-Type': 'application/json', // ✅ JSON 형식 유지
    },
  });
};
