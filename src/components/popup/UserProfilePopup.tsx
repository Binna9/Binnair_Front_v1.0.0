import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { XCircleIcon, CameraIcon } from '@heroicons/react/24/solid';
import {
  PencilIcon,
  UserIcon,
  ShoppingBagIcon,
  CogIcon,
  HomeIcon,
  PenIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
} from 'lucide-react';
import { ProfileUser, ProfileAddress } from '@/types/ProfileUser';
import { useProfileImage } from '@/hooks/useProfileImage';
import { useProfile } from '@/hooks/useProfile';
import { useNotification } from '@/context/NotificationContext';

interface UserProfilePopupProps {
  isOpen: boolean;
  user: ProfileUser;
  closePopup: () => void;
  updateUser: (updatedUser: Partial<ProfileUser>) => void;
  uploadProfileImage: (file: File) => void;
  updateAddress: (
    addressId: string,
    updatedAddress: Partial<ProfileAddress>
  ) => void;

  logout: () => void;
  verifyPassword?: (currentPassword: string) => Promise<boolean>; // 추가
  changePassword?: (
    newPassword: string,
    confirmPassword: string
  ) => Promise<void>;
}

const UserProfilePopup: React.FC<UserProfilePopupProps> = ({
  isOpen,
  user,
  closePopup,
  updateUser,
  uploadProfileImage,
  updateAddress,
  logout,
}) => {
  const { verifyPassword, changePassword } = useProfile(user.userId);
  const [activeTab, setActiveTab] = useState('profile');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<ProfileUser>>({ ...user });
  const [currentUser, setCurrentUser] = useState<ProfileUser | null>(null);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<Partial<ProfileAddress>>({});
  const { profileImage, uploadProfileImage: handleProfileImageUpload } =
    useProfileImage(currentUser?.userId || '');
  const notification = useNotification();

  // 비밀번호 변경 관련 상태
  const [passwordChangeStep, setPasswordChangeStep] = useState<
    'verification' | 'change' | null
  >(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // user 정보가 변경될 때 현재 사용자 정보 업데이트
  useEffect(() => {
    if (isOpen && user) {
      console.log('✅ UserProfilePopup: user 업데이트됨', user);
      setCurrentUser(user);
      setFormData({ ...user });
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  // 사용자 정보 수정
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 사용자 정보 저장
  const handleSave = async () => {
    const isConfirmed = await notification.showConfirm(
      'SAVE',
      '저장하시겠습니까?'
    );
  
    if (!isConfirmed) {
      return; // 사용자가 취소를 누르면 중단
    }
  
    try {
      await updateUser(formData);
      setEditing(false);
      notification.showAlert('SUCCESS', '사용자 정보가 성공적으로 저장되었습니다.');
    } catch (error) {
      notification.showAlert('FAIL', '오류가 발생했습니다 관리자에게 문의해주세요.');
    }
  };

  // 프로필 이미지 업로드
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      uploadProfileImage(e.target.files[0]);
    }
  };

  // 배송지 정보 변경
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressForm({ ...addressForm, [e.target.name]: e.target.value });
  };

  // 배송지 편집 시작
  const handleEditAddress = (address: ProfileAddress) => {
    setEditingAddressId(address.addressId);
    setAddressForm({
      receiver: address.receiver,
      phone: address.phone,
      postalCode1: address.postalCode1,
      address1: address.address1,
    });
  };

  // 배송지 저장
  const handleSaveAddress = async () => {
    if (editingAddressId) {
      await updateAddress(editingAddressId, addressForm);
      setEditingAddressId(null);
    }
  };

  // 비밀번호 변경 프로세스 시작
  const startPasswordChange = () => {
    setPasswordChangeStep('verification');
    setPasswordError('');
  };

  // 비밀번호 검증
  const handleVerifyPassword = async () => {
    if (!currentPassword) {
      setPasswordError('현재 비밀번호를 입력해주세요.');
      return;
    }

    if (typeof verifyPassword !== 'function') {
      console.error('verifyPassword is not a function:', verifyPassword);
      setPasswordError(
        '❌ 시스템 오류: 비밀번호 검증 함수가 정의되지 않았습니다.'
      );
      return;
    }

    setIsVerifying(true);
    setPasswordError('');

    try {
      const isValid = await verifyPassword(currentPassword);

      if (isValid) {
        setPasswordChangeStep('change');
        setCurrentPassword('');
      } else {
        setPasswordError('❌ 현재 비밀번호가 일치하지 않습니다.');
      }
    } catch (err) {
      console.error('비밀번호 검증 중 오류 발생:', err);
      setPasswordError('❌ 비밀번호 검증 중 오류가 발생했습니다.');
    } finally {
      setIsVerifying(false);
    }
  };

  // 새 비밀번호 변경
  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      setPasswordError('새 비밀번호와 비밀번호 확인을 입력해주세요.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('❌ 새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    try {
      await changePassword(newPassword, confirmPassword);

      setPasswordChangeStep(null);
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
      alert('비밀번호가 성공적으로 변경되었습니다.');
    } catch (err) {
      console.error('비밀번호 변경 중 오류 발생:', err);
      setPasswordError('❌ 비밀번호 변경 중 오류가 발생했습니다.');
    }
  };
  // 비밀번호 변경 취소
  const cancelPasswordChange = () => {
    setPasswordChangeStep(null);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="flex rounded-2xl overflow-hidden w-3/4 max-w-5xl h-3/4 max-h-[32rem] 
                bg-black shadow-lg drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]"
      >
        {/* 사이드바 - 이미지 부분 수정 */}
        <div className="w-64 bg-white text-zinc-900 border-r border-gray-300 shadow-sm">
          <div className="p-6 flex flex-col items-center border-b border-zinc-200">
            <div className="relative cursor-pointer mb-4 group">
              <label htmlFor="profile-upload" className="cursor-pointer">
                <input
                  id="profile-upload"
                  type="file"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <img
                  src={profileImage || '/default-profile.png'}
                  alt="Profile"
                  className="w-20 h-20 rounded-full border-2 border-gray-400 shadow-lg object-cover 
                             transition-all duration-300 group-hover:border-blue-400 
                             group-hover:shadow-blue-100 group-hover:scale-105"
                />
                <div className="absolute bottom-0 right-0 bg-zinc-400 p-1 rounded-full group-hover:bg-blue-500 transition-colors duration-300">
                  <CameraIcon className="w-4 h-4 text-white" />
                </div>
              </label>
            </div>
            <h3 className="text-lg font-bold text-zinc-900">{user.userName}</h3>
            <p className="text-sm text-zinc-800">@{user.nickName}</p>
          </div>

          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center p-3 rounded-lg transition ${
                    activeTab === 'profile'
                      ? 'bg-zinc-800 text-white shadow-md'
                      : 'text-zinc-800 hover:bg-zinc-400 hover:shadow-sm hover:translate-x-1'
                  }`}
                >
                  <UserIcon className="w-5 h-5 mr-3" />
                  <span>My Profile</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center p-3 rounded-lg transition ${
                    activeTab === 'orders'
                      ? 'bg-zinc-800 text-white shadow-md'
                      : 'text-zinc-800 hover:bg-zinc-400 hover:shadow-sm hover:translate-x-1'
                  }`}
                >
                  <ShoppingBagIcon className="w-5 h-5 mr-3" />
                  <span>주문 목록</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('addresses')}
                  className={`w-full flex items-center p-3 rounded-lg transition ${
                    activeTab === 'addresses'
                      ? 'bg-zinc-800 text-white shadow-md'
                      : 'text-zinc-800 hover:bg-zinc-400 hover:shadow-sm hover:translate-x-1'
                  }`}
                >
                  <HomeIcon className="w-5 h-5 mr-3" />
                  <span>배송지 관리</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center p-3 rounded-lg transition ${
                    activeTab === 'settings'
                      ? 'bg-zinc-800 text-white shadow-md'
                      : 'text-zinc-800 hover:bg-zinc-400 hover:shadow-sm hover:translate-x-1'
                  }`}
                >
                  <CogIcon className="w-5 h-5 mr-3" />
                  <span>설정</span>
                </button>
              </li>
            </ul>
          </nav>

          <div className="mt-auto p-4 border-t border-gray-200">
            <button
              onClick={logout}
              className="w-full bg-red-500 hover:bg-red-700 text-white py-2 rounded-lg transition"
            >
              로그아웃
            </button>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div
          className="flex-1 text-white overflow-y-auto p-8 relative"
          style={{
            backgroundImage: "url('/img/profile_popup.png')",
            backgroundBlendMode: 'overlay',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: '35% center',
          }}
        >
          <button
            onClick={closePopup}
            className="absolute top-4 right-4 text-white hover:text-gray-400 transition"
          >
            <XCircleIcon className="w-7 h-7" />
          </button>

          {/* 프로필 탭 */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white border-b border-white pb-4 flex items-center">
                <UserIcon className="w-6 h-6 mr-2 inline" />
                MY PROFILE
                {!passwordChangeStep && (
                  <PencilIcon
                    className="w-7 h-7 ml-5 text-gray-300 cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-110 hover:text-blue-400"
                    onClick={() => setEditing(true)}
                  />
                )}
              </h2>

              {/* 비밀번호 검증 단계 */}
              {passwordChangeStep === 'verification' && (
                <div className="space-y-4 bg-gray-800 p-6 rounded-lg border border-gray-600">
                  <h3 className="text-xl font-semibold flex items-center">
                    <LockIcon className="w-5 h-5 mr-2" />
                    비밀번호 확인
                  </h3>
                  <p className="text-gray-300">
                    계속하려면 현재 비밀번호를 입력해주세요.
                  </p>

                  <div className="space-y-2">
                    <label className="block text-gray-300 text-sm">
                      현재 비밀번호
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-500 p-3 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        placeholder="현재 비밀번호 입력"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3 text-gray-400 hover:text-white"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                      >
                        {showCurrentPassword ? (
                          <EyeOffIcon className="w-5 h-5" />
                        ) : (
                          <EyeIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {passwordError && (
                    <div className="text-red-400 text-sm py-1">
                      {passwordError}
                    </div>
                  )}

                  <div className="flex space-x-4 pt-2">
                    <button
                      onClick={handleVerifyPassword}
                      disabled={isVerifying}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isVerifying ? '확인 중...' : '확인'}
                    </button>
                    <button
                      onClick={cancelPasswordChange}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg transition"
                    >
                      취소
                    </button>
                  </div>
                </div>
              )}

              {/* 비밀번호 변경 단계 */}
              {passwordChangeStep === 'change' && (
                <div className="space-y-4 bg-gray-800 p-6 rounded-lg border border-gray-600">
                  <h3 className="text-xl font-semibold flex items-center">
                    <LockIcon className="w-5 h-5 mr-2" />새 비밀번호 설정
                  </h3>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label className="block text-gray-300 text-sm">
                        새 비밀번호
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-gray-700 border border-gray-500 p-3 rounded-lg text-white focus:outline-none focus:border-blue-500"
                          placeholder="새 비밀번호 입력("
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-3 text-gray-400 hover:text-white"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeOffIcon className="w-5 h-5" />
                          ) : (
                            <EyeIcon className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-gray-300 text-sm">
                        새 비밀번호 확인
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-gray-700 border border-gray-500 p-3 rounded-lg text-white focus:outline-none focus:border-blue-500"
                          placeholder="새 비밀번호 확인"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-3 text-gray-400 hover:text-white"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOffIcon className="w-5 h-5" />
                          ) : (
                            <EyeIcon className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {passwordError && (
                      <div className="text-red-400 text-sm py-1">
                        {passwordError}
                      </div>
                    )}

                    <div className="flex space-x-4 pt-2">
                      <button
                        onClick={handleChangePassword}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition"
                      >
                        변경하기
                      </button>
                      <button
                        onClick={cancelPasswordChange}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg transition"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 프로필 정보 폼 */}
              {!passwordChangeStep && (
                <>
                  {editing ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-gray-300 text-sm">
                          Name
                        </label>
                        <input
                          type="text"
                          name="userName"
                          value={formData.userName || ''}
                          onChange={handleChange}
                          className="w-full bg-white border border-gray-300 p-3 rounded-lg text-black focus:outline-none focus:border-blue-500 hover:bg-gray-200"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-gray-300 text-sm">
                          닉네임
                        </label>
                        <input
                          type="text"
                          name="nickName"
                          value={formData.nickName || ''}
                          onChange={handleChange}
                          className="w-full bg-white border border-gray-300 p-3 rounded-lg text-black focus:outline-none focus:border-blue-500 hover:bg-gray-200"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-gray-300 text-sm">
                          이메일
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email || ''}
                          onChange={handleChange}
                          className="w-full bg-white border border-gray-300 p-3 rounded-lg text-black focus:outline-none focus:border-blue-500 hover:bg-gray-200"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-gray-300 text-sm">
                          전화번호
                        </label>
                        <input
                          type="text"
                          name="phoneNumber"
                          value={formData.phoneNumber || ''}
                          onChange={handleChange}
                          className="w-full bg-white border border-gray-300 p-3 rounded-lg text-black focus:outline-none focus:border-blue-500 hover:bg-gray-200"
                        />
                      </div>

                      <div className="flex space-x-4 pt-4">
                        <button
                          onClick={handleSave}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg transition"
                        >
                          저장
                        </button>
                        <button
                          onClick={() => setEditing(false)}
                          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg transition"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-gray-300 font-bold text-md">
                            Name
                          </p>
                          <p className="text-xl font-bold">{user.userName}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-300 font-bold text-md">
                            NickName
                          </p>
                          <p className="text-xl font-bold">{user.nickName}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-300 font-bold text-md">
                            @Email
                          </p>
                          <p className="text-xl font-bold">{user.email}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-300 font-bold text-md">
                            PhoneNumber
                          </p>
                          <p className="text-xl font-bold">
                            {user.phoneNumber}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={startPasswordChange}
                        className="bg-zinc-200 hover:bg-zinc-300 text-zinc-900 py-2 px-4 rounded-lg transition flex items-center"
                      >
                        <LockIcon className="w-5 h-5 mr-2" />
                        Password Change
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* 주문 목록 탭 - 변경된 부분 */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white border-b border-white pb-4">
                <ShoppingBagIcon className="w-6 h-6 mr-2 inline" />
                나의 주문 목록
              </h2>

              <div className="space-y-4">
                {[1, 2, 3].map((order) => (
                  <div
                    key={order}
                    className="bg-white rounded-lg p-4 border border-gray-300 hover:border-blue-400 transition cursor-pointer"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-lg font-medium text-black">
                          주문 #{order}45678
                        </p>
                        <p className="text-sm text-gray-600">
                          2024년 3월 {order + 9}일
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-black">
                          ₩{order * 35000}
                        </p>
                        <span className="text-xs px-2 py-1 rounded-full bg-green-500 text-white">
                          배송완료
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 배송지 관리 탭 */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white border-b border-white pb-4">
                <HomeIcon className="w-6 h-6 mr-2 inline" />
                배송지 관리
              </h2>

              <div className="space-y-4">
                {(user?.addresses ?? []).map((address) => (
                  <div
                    key={address.addressId}
                    className="bg-white rounded-lg p-4 border border-gray-300"
                  >
                    {editingAddressId === address.addressId ? (
                      <div className="space-y-3">
                        {/* 배송지 관리 탭 - 수정된 편집 폼 */}
                        <div className="space-y-1">
                          <label className="block text-gray-300 text-sm">
                            수령인
                          </label>
                          <input
                            type="text"
                            name="receiver"
                            value={addressForm.receiver || ''}
                            onChange={handleAddressChange}
                            className="w-full bg-white border border-gray-300 p-2 rounded-lg text-black focus:outline-none focus:border-blue-400 hover:bg-gray-100"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-gray-300 text-sm">
                            전화번호
                          </label>
                          <input
                            type="text"
                            name="phone"
                            value={addressForm.phone || ''}
                            onChange={handleAddressChange}
                            className="w-full bg-white border border-gray-300 p-2 rounded-lg text-black focus:outline-none focus:border-blue-400 hover:bg-gray-100"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-gray-300 text-sm">
                            우편번호
                          </label>
                          <input
                            type="text"
                            name="postalCode"
                            value={addressForm.postalCode1 || ''}
                            onChange={handleAddressChange}
                            className="w-full bg-white border border-gray-300 p-2 rounded-lg text-black focus:outline-none focus:border-blue-400 hover:bg-gray-100"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-gray-300 text-sm">
                            주소
                          </label>
                          <input
                            type="text"
                            name="address1"
                            value={addressForm.address1 || ''}
                            onChange={handleAddressChange}
                            className="w-full bg-white border border-gray-300 p-2 rounded-lg text-black focus:outline-none focus:border-blue-400 hover:bg-gray-100"
                          />
                        </div>

                        <div className="flex space-x-3 pt-2">
                          <button
                            onClick={handleSaveAddress}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition"
                          >
                            저장
                          </button>
                          <button
                            onClick={() => setEditingAddressId(null)}
                            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition"
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium text-lg text-black">
                              {address.receiver}
                            </p>
                            <p className="text-gray-600">{address.phone}</p>
                            <p className="text-gray-600">
                              {address.address1} ({address.postalCode1})
                            </p>
                          </div>
                          <div>
                            <button
                              onClick={() => handleEditAddress(address)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              편집
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                <button className="w-full border border-dashed border-gray-400 p-3 rounded-lg text-gray-600 hover:text-black hover:border-blue-400 transition bg-white">
                  + 새 배송지 추가
                </button>
              </div>
            </div>
          )}

          {/* 설정 탭 */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white border-b border-white pb-4">
                <CogIcon className="w-6 h-6 mr-2 inline" />
                설정
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                  <div>
                    <p className="font-medium text-black">마케팅 정보 수신</p>
                    <p className="text-sm text-gray-600">
                      특별 프로모션 및 이벤트 알림 수신
                    </p>
                  </div>
                  <div className="w-12 h-6 bg-blue-500 rounded-full relative cursor-pointer">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-1 top-0.5"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                  <div>
                    <p className="font-medium text-black">2단계 인증</p>
                    <p className="text-sm text-gray-600">
                      보안 강화를 위한 2단계 인증 설정
                    </p>
                  </div>
                  <div className="w-12 h-6 bg-gray-600 rounded-full relative cursor-pointer">
                    <div className="w-5 h-5 bg-white rounded-full absolute left-1 top-0.5"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                  <div>
                    <p className="font-medium text-black">다크 모드</p>
                    <p className="text-sm text-gray-600">어두운 테마 설정</p>
                  </div>
                  <div className="w-12 h-6 bg-blue-500 rounded-full relative cursor-pointer">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-1 top-0.5"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default UserProfilePopup;
