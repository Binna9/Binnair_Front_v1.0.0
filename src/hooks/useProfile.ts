import { useState, useEffect } from 'react';
import apiClient from '@/utils/apiClient'; // ✅ 공용 Axios 모듈 import
import { ProfileUser, ProfileAddress } from '../types/ProfileUser';

export const useProfile = (userId: string) => {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ 사용자 정보 + 배송지 불러오기
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;

      try {
        const [userResponse, addressResponse] = await Promise.all([
          apiClient.get<ProfileUser>(`/users/${userId}`),
          apiClient.get<ProfileAddress[]>('/addresses'),
        ]);

        setUser({
          ...userResponse.data,
          addresses: Array.isArray(addressResponse.data)
            ? addressResponse.data
            : [], // 🚀 안전한 배열 변환
        });
      } catch (err) {
        console.error('❌ 사용자 정보를 불러오는 중 오류 발생:', err);
        setError('❌ 사용자 정보를 불러오는 중 오류 발생');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  // ✅ 사용자 정보 수정
  const updateUser = async (updatedUser: Partial<ProfileUser>) => {
    try {
      await apiClient.put(`/users/${userId}`, updatedUser);
      setUser((prevUser) =>
        prevUser ? { ...prevUser, ...updatedUser } : null
      );
    } catch (err) {
      console.error('❌ 사용자 정보를 업데이트하는 중 오류 발생:', err);
      setError('❌ 사용자 정보를 업데이트하는 중 오류 발생');
    }
  };

  // ✅ 사용자 삭제
  const deleteUser = async () => {
    try {
      await apiClient.delete(`/users/${userId}`);
      setUser(null);
    } catch (err) {
      console.error('❌ 사용자를 삭제하는 중 오류 발생:', err);
      setError('❌ 사용자를 삭제하는 중 오류 발생');
    }
  };

  // ✅ 배송지 추가
  const addAddress = async (newAddress: ProfileAddress) => {
    try {
      const response = await apiClient.post<ProfileAddress>(
        '/addresses',
        newAddress
      );
      setUser((prevUser) =>
        prevUser
          ? { ...prevUser, addresses: [...prevUser.addresses, response.data] }
          : null
      );
    } catch (err) {
      console.error('❌ 배송지 추가 중 오류 발생:', err);
      setError('❌ 배송지 추가 중 오류 발생');
    }
  };

  // ✅ 배송지 수정
  const updateAddress = async (
    addressId: string,
    updatedAddress: Partial<ProfileAddress>
  ) => {
    try {
      await apiClient.put(`/addresses/${addressId}`, updatedAddress);
      setUser((prevUser) =>
        prevUser
          ? {
              ...prevUser,
              addresses: prevUser.addresses.map((addr) =>
                addr.addressId === addressId
                  ? { ...addr, ...updatedAddress }
                  : addr
              ),
            }
          : null
      );
    } catch (err) {
      console.error('❌ 배송지 정보를 업데이트하는 중 오류 발생:', err);
      setError('❌ 배송지 정보를 업데이트하는 중 오류 발생');
    }
  };

  // ✅ 배송지 삭제
  const deleteAddress = async (addressId: string) => {
    try {
      await apiClient.delete(`/addresses/${addressId}`);
      setUser((prevUser) =>
        prevUser
          ? {
              ...prevUser,
              addresses: prevUser.addresses.filter(
                (addr) => addr.addressId !== addressId
              ),
            }
          : null
      );
    } catch (err) {
      console.error('❌ 배송지 삭제 중 오류 발생:', err);
      setError('❌ 배송지 삭제 중 오류 발생');
    }
  };

  return {
    user,
    loading,
    error,
    updateUser,
    deleteUser,
    addAddress,
    updateAddress,
    deleteAddress,
  };
};
