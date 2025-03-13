import { useState, useEffect } from 'react';
import {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
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
      // ✅ SHA-256 해싱 적용

      // ✅ 해싱된 비밀번호를 서버에 전송
      await changeUserPassword({
        newPassword,
        confirmPassword,
      });

      return; // Promise<void> 타입과 일치하도록 명시적으로 반환
    } catch (err: any) {
      const errorMessage =
        err.response?.data ||
        '❌ 비밀번호 변경 중 예상치 못한 오류가 발생했습니다.';
      console.error(errorMessage);
      setError(errorMessage); // 오류 메시지를 상태로 저장

      throw err; // 에러를 다시 던져서 호출자에게 전파
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
    verifyPassword,
    changePassword,
  };
};
