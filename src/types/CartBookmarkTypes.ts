// ✅ 서버 응답 타입 (API 응답 그대로)
export interface CartResponse {
  cartId: string;
  productId: string;
  productName: string;
  productDescription: string;
  quantity: number;
  option?: string;
  price: number;
}

export interface CartItemsResponse {
  totalAmount: number;
  discountAmount: number;
  discountedTotal: number;
  carts: CartResponse[];
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
  updateQuantity?: (cartId: string, newQuantity: number) => void; // ✅ 단일 cartId로 변경
}

export interface BookmarkItem {
  id: string; // ✅ UI에서 사용할 ID (bookmarkId)
  productId: string;
  productName: string;
  productDescription: string;
  price: number;
}

export enum OrderStep {
  CART = 'cart',
  CHECKOUT = 'checkout',
  PAYMENT = 'payment',
  CONFIRMATION = 'confirmation',
}

export interface CartTotal {
  userId: string;
  quantity: number;
  totalAmount: number;
  discountAmount: number;
  discountedTotal: number;
}

export interface ShippingInfo {
  name: string;
  phone: string;
  address: string;
  zipCode: string;
  memo: string;
}

export interface ProductOption {
  productId: string;
  name: string;
  price: number;
}
