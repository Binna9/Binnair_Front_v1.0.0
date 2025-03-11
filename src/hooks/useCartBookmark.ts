import { useState, useEffect, useCallback } from 'react';
import {
  CartItem,
  BookmarkItem,
  CartResponse,
  BookmarkResponse,
} from '../types/CartBookmarkTypes';
import CartBookmarkService from '../services/CartBookmarkService'; // API 클라이언트

export const useCartBookmark = (selected: 'cart' | 'bookmark' | null) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [bookmarkItems, setBookmarkItems] = useState<BookmarkItem[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [discountedTotal, setDiscountedTotal] = useState<number>(0);
  const [isLoadingCart, setIsLoadingCart] = useState<boolean>(false);
  const [isLoadingBookmark, setIsLoadingBookmark] = useState<boolean>(false);

  // 📌 장바구니 데이터 가져오기
  const fetchCartItems = useCallback(async () => {
    setIsLoadingCart(true); // ✅ 로딩 시작
    try {
      const response = await CartBookmarkService.getCartItems();
      const { carts, totalAmount, discountAmount, discountedTotal } =
        response.data;

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
      setDiscountAmount(discountAmount);
      setDiscountedTotal(discountedTotal);
    } catch (error) {
      console.error('❌ 장바구니 데이터를 불러오는 중 오류 발생:', error);
    } finally {
      setIsLoadingCart(false); // ✅ 로딩 완료
    }
  }, []);

  // 📌 즐겨찾기 데이터 가져오기
  const fetchBookmarkItems = async () => {
    setIsLoadingBookmark(true); // ✅ 로딩 시작
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
    } finally {
      setIsLoadingBookmark(false); // ✅ 로딩 완료
    }
  };

  // 📌 장바구니에 제품 추가
  const addToCart = async (productId: string, quantity: number) => {
    try {
      await CartBookmarkService.addToCart(productId, quantity);
      await fetchCartItems(); // 최신 데이터 반영
    } catch (error) {
      console.error('❌ 장바구니 추가 중 오류 발생:', error);
    }
  };

  // 📌 즐겨찾기에 제품 추가
  const addToBookmark = async (productId: string) => {
    try {
      await CartBookmarkService.addToBookmark(productId);
      await fetchBookmarkItems(); // 최신 데이터 반영
    } catch (error) {
      console.error('❌ 즐겨찾기 추가 중 오류 발생:', error);
    }
  };

  // 📌 장바구니 아이템 삭제
  const deleteCartItem = async (cartId: string) => {
    try {
      await CartBookmarkService.deleteCartItem(cartId);
      await fetchCartItems(); // ✅ 최신 데이터 불러오기
    } catch (error) {
      console.error('❌ 장바구니 아이템 삭제 중 오류 발생:', error);
    }
  };

  // 📌 즐겨찾기 아이템 삭제
  const deleteBookmarkItem = async (bookmarkId: string) => {
    try {
      await CartBookmarkService.deleteBookmarkItem(bookmarkId);
      await fetchBookmarkItems(); // ✅ 최신 데이터 불러오기
    } catch (error) {
      console.error('❌ 즐겨찾기 아이템 삭제 중 오류 발생:', error);
    }
  };

  // 📌 할인된 총 금액 조회 (별도로 호출 가능)
  const fetchDiscountedTotal = async (cartIds: string[]) => {
    try {
      const result = await CartBookmarkService.getDiscountedTotal(cartIds);
      setTotalAmount(result.totalAmount);
      setDiscountAmount(result.discountAmount);
      setDiscountedTotal(result.discountedTotal);
    } catch (error) {
      console.error('❌ 할인된 총 금액 조회 중 오류 발생:', error);
    }
  };

  // 📌 장바구니 수량 업데이트
  const updateCartQuantity = async (cartId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      console.warn('⚠ newQuantity가 1 미만이므로 업데이트 중단');
      return;
    }

    try {
      await CartBookmarkService.updateCartQuantity(cartId, newQuantity);
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === cartId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      console.error('❌ 장바구니 수량 업데이트 중 오류 발생:', error);
      await fetchCartItems();
    }
  };

  // 📌 selected 값 변경될 때 자동으로 데이터 가져오기
  useEffect(() => {
    if (selected === 'cart') {
      fetchCartItems();
    } else if (selected === 'bookmark') {
      fetchBookmarkItems();
    }
  }, [selected, fetchCartItems]);

  return {
    cartItems,
    bookmarkItems,
    totalAmount,
    discountAmount,
    discountedTotal,
    isLoadingCart,
    isLoadingBookmark,
    fetchCartItems,
    fetchBookmarkItems,
    fetchDiscountedTotal,
    updateCartQuantity,
    deleteCartItem,
    deleteBookmarkItem,
    addToCart,
    addToBookmark,
  };
};
