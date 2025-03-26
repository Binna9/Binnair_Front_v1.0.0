export interface AddressResponse {
  addressId: string; // 주소 ID
  receiver: string; // 수령인
  phoneNumber: string; // 전화번호
  postalCode: string; // 우편번호
  address: string; // 주소
  isDefault: boolean; // 기본 주소 값
}

export interface AddressRequest {
  receiver: string; // 수령인
  phoneNumber: string; // 전화번호
  postalCode: string; // 우편번호
  address: string; // 주소
  isDefault: boolean; // 기본 주소 값
}
