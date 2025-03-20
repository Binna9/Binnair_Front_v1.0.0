import { useState, useEffect } from 'react';
import {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  addUserAddress,
  deleteUserAddress,
  updateDefaultAddress,
  verifyUserPassword,
  changeUserPassword,
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

  // ✅ 기본 배송지 변경 (새 기능 추가)
  const setDefaultAddress = async (addressId: string) => {
    try {
      await updateDefaultAddress(addressId);

      setUser((prevUser) =>
        prevUser
          ? {
              ...prevUser,
              addresses: prevUser.addresses.map((addr) =>
                addr.addressId === addressId
                  ? { ...addr, isDefault: true }
                  : { ...addr, isDefault: false }
              ),
            }
          : null
      );
    } catch (err) {
      console.error('❌ 기본 배송지 변경 중 오류 발생:', err);
      setError('❌ 기본 배송지 변경 중 오류 발생');
    }
  };

  // ✅ 비밀번호 검증
  const verifyPassword = async (currentPassword: string): Promise<boolean> => {
    try {
      const isValid = await verifyUserPassword(currentPassword);
      return isValid;
    } catch (err) {
      console.error('❌ 비밀번호 검증 중 오류 발생:', err);
      setError('❌ 비밀번호 검증 중 오류 발생');
      return false;
    }
  };

  // ✅ 비밀번호 변경
  const changePassword = async (
    newPassword: string,
    confirmPassword: string
  ): Promise<void> => {
    try {
      await changeUserPassword({
        newPassword,
        confirmPassword,
      });
    } catch (err: any) {
      const errorMessage =
        err.response?.data ||
        '❌ 비밀번호 변경 중 예상치 못한 오류가 발생했습니다.';
      console.error(errorMessage);
      setError(errorMessage);
      throw err;
    }
  };

  // ✅ 사용자 정보 새로고침 함수 추가
  const refreshUserAddresses = async (): Promise<
    ProfileAddress[] | undefined
  > => {
    try {
      if (!userId) return undefined;

      const userData = await getUserProfile(userId);

      // 상태 업데이트
      setUser((prevUser) =>
        prevUser
          ? {
              ...prevUser,
              addresses: [...userData.addresses], // ✅ 깊은 복사 적용 (새로운 배열 할당)
            }
          : prevUser
      );

      console.log('✅ 배송지 정보가 갱신되었습니다:', userData.addresses);
      return userData.addresses; // 배송지 배열 반환
    } catch (err) {
      console.error('❌ 배송지 정보를 새로고침하는 중 오류 발생:', err);
      setError('❌ 배송지 정보를 새로고침하는 중 오류 발생');
      return undefined;
    }
  };

  return {
    user,
    loading,
    error,
    updateUser,
    deleteUser,
    addAddress,
    deleteAddress,
    verifyPassword,
    changePassword,
    setDefaultAddress,
    refreshUserAddresses,
  };
};
