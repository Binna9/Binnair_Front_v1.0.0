export interface ProfileUser {
  userId: string;
  loginId: string;
  userName: string;
  email: string;
  nickName: string;
  phoneNumber: string;
  imageFilePath?: string; // 프로필 이미지 (선택 사항)
  addresses: ProfileAddress[]; // 배송지 리스트
}

export interface ProfileAddress {
  addressId: string;
  receiver: string;
  phoneNumber: string;
  postalCode: string;
  address: string;
  isDefault: boolean;
}
