import { motion } from 'framer-motion';
import { useState } from 'react';
import { XCircleIcon, CameraIcon } from '@heroicons/react/24/solid';
import { ProfileUser, ProfileAddress } from '../types/ProfileUser';
import { useProfileImage } from '../hooks/useProfileImage';

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
}

const UserProfilePopup: React.FC<UserProfilePopupProps> = ({
  isOpen,
  user,
  closePopup,
  updateUser,
  updateAddress,
  logout,
}) => {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<ProfileUser>>({ ...user });

  const { profileImage, uploadProfileImage } = useProfileImage(
    user?.userId || null
  );
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<Partial<ProfileAddress>>({});

  if (!isOpen) return null;

  // ✅ 사용자 정보 수정
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ 사용자 정보 저장
  const handleSave = async () => {
    await updateUser(formData);
    setEditing(false);
  };

  // ✅ 프로필 이미지 업로드
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      uploadProfileImage(e.target.files[0]);
    }
  };

  // ✅ 배송지 정보 변경
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressForm({ ...addressForm, [e.target.name]: e.target.value });
  };

  // ✅ 배송지 저장
  const handleSaveAddress = async () => {
    if (editingAddressId) {
      await updateAddress(editingAddressId, addressForm);
      setEditingAddressId(null);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="bg-white rounded-2xl shadow-xl w-96 max-w-full p-6 relative"
      >
        <button
          onClick={closePopup}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          <XCircleIcon className="w-6 h-6" />
        </button>

        {/* ✅ 프로필 이미지 */}
        <div className="flex flex-col items-center">
          <label className="relative cursor-pointer">
            <input
              type="file"
              className="hidden"
              onChange={handleImageUpload}
            />
            <img
              src={profileImage || '/default-profile.png'} // ✅ useProfileImage에서 가져온 값 사용
              alt="Profile"
              className="w-24 h-24 rounded-full border border-gray-300 shadow-md"
            />
            <CameraIcon className="absolute bottom-0 right-0 bg-white p-1 rounded-full w-6 h-6 text-gray-700" />
          </label>
        </div>

        {/* ✅ 사용자 정보 */}
        <div className="flex flex-col items-center space-y-4 mt-4">
          {editing ? (
            <>
              <input
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                className="border p-2 rounded w-full"
              />
              <input
                type="text"
                name="nickName"
                value={formData.nickName}
                onChange={handleChange}
                className="border p-2 rounded w-full"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="border p-2 rounded w-full"
              />
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="border p-2 rounded w-full"
              />
              <button
                onClick={handleSave}
                className="w-full bg-blue-500 text-white py-2 rounded-lg"
              >
                저장
              </button>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold">
                {user.userName} ({user.nickName})
              </h2>
              <p className="text-gray-500">{user.email}</p>
              <p className="text-gray-500">{user.phoneNumber}</p>
              <button
                onClick={() => setEditing(true)}
                className="text-blue-500 hover:text-blue-700"
              >
                정보 수정
              </button>
            </>
          )}
        </div>

        {/* ✅ 배송지 목록 */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold">배송지 목록</h3>
          {(user?.addresses ?? []).map((address) => (
            <div key={address.addressId} className="border p-3 rounded-md mt-2">
              {editingAddressId === address.addressId ? (
                <>
                  <input
                    type="text"
                    name="receiver"
                    value={addressForm.receiver || ''}
                    onChange={handleAddressChange}
                    className="border p-2 rounded w-full mb-2"
                  />
                  <input
                    type="text"
                    name="phone"
                    value={addressForm.phone || ''}
                    onChange={handleAddressChange}
                    className="border p-2 rounded w-full mb-2"
                  />
                  <input
                    type="text"
                    name="postalCode"
                    value={addressForm.postalCode || ''}
                    onChange={handleAddressChange}
                    className="border p-2 rounded w-full mb-2"
                  />
                  <input
                    type="text"
                    name="address1"
                    value={addressForm.address1 || ''}
                    onChange={handleAddressChange}
                    className="border p-2 rounded w-full mb-2"
                  />
                  <button
                    onClick={handleSaveAddress}
                    className="w-full bg-green-500 text-white py-1 rounded-lg"
                  >
                    저장
                  </button>
                </>
              ) : (
                <>
                  <p>
                    <strong>{address.receiver}</strong> | {address.phone}
                  </p>
                  <p>
                    {address.address1} ({address.postalCode})
                  </p>
                </>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={logout}
          className="w-full bg-red-500 text-white py-2 rounded-lg mt-4"
        >
          로그아웃
        </button>
      </motion.div>
    </div>
  );
};

export default UserProfilePopup;
