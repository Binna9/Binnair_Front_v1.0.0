import { createContext, useContext, useState } from 'react';
import {
  CartItem,
  BookmarkItem,
  CartResponse,
  BookmarkResponse,
  CartTotal,
} from '../types/CartBookmarkTypes';
import CartBookmarkService from '../services/CartBookmarkService';

// ✅ Context 타입 정의
interface CartBookmarkContextType {
  cartItems: CartItem[];
  bookmarkItems: BookmarkItem[];
  totalAmount: number;
  fetchCartItems: () => Promise<void>;
  fetchBookmarkItems: () => Promise<void>;
  updateCartQuantity: (cartId: string, newQuantity: number) => Promise<void>;
  deleteCartItem: (cartId: string) => Promise<void>;
  deleteBookmarkItem: (bookmarkId: string) => Promise<void>;
}

// ✅ Context 생성
const CartBookmarkContext = createContext<CartBookmarkContextType | undefined>(
  undefined
);

// ✅ Context Provider 생성
export const CartBookmarkProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  console.log('✅ CartBookmarkProvider 실행됨!');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [bookmarkItems, setBookmarkItems] = useState<BookmarkItem[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  // 📌 장바구니 데이터 가져오기
  const fetchCartItems = async () => {
    try {
      const response = await CartBookmarkService.getCartItems();
      const { carts, totalAmount } = response.data;

      setCartItems(
        carts.map((item: CartResponse) => ({
          id: item.cartId,
          productId: item.productId,
          productName: item.productName,
          productDescription: item.productDescription,
          quantity: item.quantity,
          price: item.price,
        }))
      );
      setTotalAmount(totalAmount);
    } catch (error) {
      console.error('❌ 장바구니 데이터를 불러오는 중 오류 발생:', error);
    }
  };

  // 📌 즐겨찾기 데이터 가져오기
  const fetchBookmarkItems = async () => {
    try {
      const response = await CartBookmarkService.getBookmarkItems();
      setBookmarkItems(
        response.data.map((item: BookmarkResponse) => ({
          id: item.bookmarkId,
          productId: item.productId,
          productName: item.productName,
          productDescription: item.productDescription,
          price: item.price,
        }))
      );
    } catch (error) {
      console.error('❌ 즐겨찾기 데이터를 불러오는 중 오류 발생:', error);
    }
  };

  // 📌 장바구니 수량 업데이트
  const updateCartQuantity = async (cartId: string, newQuantity: number) => {
    console.log('📢 updateCartQuantity called:', { cartId, newQuantity });

    if (newQuantity < 1) {
      console.warn('⚠ newQuantity가 1 미만이므로 업데이트 중단');
      return;
    }

    try {
      const result: CartTotal = await CartBookmarkService.updateCartQuantity(
        cartId,
        newQuantity
      );

      setCartItems((prev) =>
        prev.map((item) =>
          item.id === cartId ? { ...item, quantity: result.quantity } : item
        )
      );

      setTotalAmount(result.totalAmount);
    } catch (error) {
      console.error('❌ 장바구니 수량 업데이트 중 오류 발생:', error);
    }
  };

  // 📌 장바구니 아이템 삭제
  const deleteCartItem = async (cartId: string) => {
    try {
      await CartBookmarkService.deleteCartItem(cartId);
      console.log(`✅ ${cartId} 삭제 완료!`);

      // ✅ 삭제된 아이템을 제외한 새로운 배열 생성
      setCartItems((prev) => prev.filter((item) => item.id !== cartId));

      // ✅ totalAmount 업데이트 (각 아이템의 price를 기반으로 차감)
      setTotalAmount((prevTotal) => {
        const deletedItem = cartItems.find((item) => item.id === cartId);
        return deletedItem
          ? prevTotal - deletedItem.price * deletedItem.quantity
          : prevTotal;
      });
    } catch (error) {
      console.error('❌ 장바구니 아이템 삭제 중 오류 발생:', error);
    }
  };

  // 📌 즐겨찾기 아이템 삭제
  const deleteBookmarkItem = async (bookmarkId: string) => {
    try {
      await CartBookmarkService.deleteBookmarkItem(bookmarkId);
      setBookmarkItems((prev) => prev.filter((item) => item.id !== bookmarkId));
    } catch (error) {
      console.error('❌ 즐겨찾기 아이템 삭제 중 오류 발생:', error);
    }
  };

  return (
    <CartBookmarkContext.Provider
      value={{
        cartItems,
        bookmarkItems,
        totalAmount,
        fetchCartItems,
        fetchBookmarkItems,
        updateCartQuantity,
        deleteCartItem,
        deleteBookmarkItem,
      }}
    >
      {children}
    </CartBookmarkContext.Provider>
  );
};

// ✅ Context를 쉽게 가져다 쓰는 훅
export const useCartBookmark = () => {
  const context = useContext(CartBookmarkContext);
  console.log('📢 useCartBookmark 훅 실행됨!');
  if (!context) {
    throw new Error(
      'useCartBookmark must be used within a CartBookmarkProvider'
    );
  }
  return context;
};
