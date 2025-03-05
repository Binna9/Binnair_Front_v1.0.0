import { useState, useEffect } from 'react';
import {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
} from '@/services/ProfileService'; // ✅ 서비스 레이어 import
import { ProfileUser, ProfileAddress } from '../types/ProfileUser';

export const useProfile = (userId: string | null) => {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ 사용자 정보 + 배송지 불러오기
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const userData = await getUserProfile(userId);
        setUser(userData);
      } catch (err) {
        console.error('❌ 프로필 정보를 불러오는 중 오류 발생:', err);
        setError('❌ 프로필 정보를 불러오는 중 오류 발생');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  // ✅ 사용자 정보 수정
  const updateUser = async (updatedUser: Partial<ProfileUser>) => {
    try {
      await updateUserProfile(userId!, updatedUser);
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
      await deleteUserProfile(userId!);
      setUser(null);
    } catch (err) {
      console.error('❌ 사용자를 삭제하는 중 오류 발생:', err);
      setError('❌ 사용자를 삭제하는 중 오류 발생');
    }
  };

  // ✅ 배송지 추가
  const addAddress = async (newAddress: ProfileAddress) => {
    try {
      const createdAddress = await addUserAddress(newAddress);
      setUser((prevUser) =>
        prevUser
          ? { ...prevUser, addresses: [...prevUser.addresses, createdAddress] }
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
      await updateUserAddress(addressId, updatedAddress);
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
      await deleteUserAddress(addressId);
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
