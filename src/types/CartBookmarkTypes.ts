// ✅ 서버 응답 타입 (API 응답 그대로)
export interface CartResponse {
  cartId: string;
  productId: string;
  productName: string;
  productDescription: string;
  quantity: number;
  price: number;
}

export interface BookmarkResponse {
  bookmarkId: string;
  productId: string;
  productName: string;
  productDescription: string;
  price: number;
}

// ✅ 프론트엔드에서 사용할 타입 (UI에 맞게 가공)
export interface CartItem {
  id: string; // ✅ UI에서 사용할 ID (cartId)
  productId: string;
  productName: string;
  productDescription: string;
  quantity: number;
  price: number;
  updateQuantity?: (cartId: string, newQuantity: number) => void;
}

export interface BookmarkItem {
  id: string; // ✅ UI에서 사용할 ID (bookmarkId)
  productId: string;
  productName: string;
  productDescription: string;
  price: number;
}

export interface CartTotal {
  totalAmount: number;
  userId: string;
}
