import { useState, useEffect } from 'react';
import axios from 'axios';
import { fetchCartTotalAmount } from '../services/CartBookmarkService';
import { useAuth } from '../hooks/useAuth';
import {
  CartItem,
  BookmarkItem,
  CartResponse,
  BookmarkResponse,
} from '../types/CartBookmarkTypes';

export const useCartBookmark = (selected: string | null) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [bookmarkItems, setBookmarkItems] = useState<BookmarkItem[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [forceRender, setForceRender] = useState(false);

  useEffect(() => {
    fetchCartTotalAmount().then((amount) => {
      console.log('🟢 totalAmount 업데이트 예정:', amount);
      setTotalAmount(amount);
      setForceRender((prev) => !prev); // ✅ 강제 리렌더링 추가
    });
  }, []);

  // ✅ 장바구니 데이터 가져오기 (토큰 추가)
  const fetchCartItems = async () => {
    const token = localStorage.getItem('accessToken'); // ✅ 토큰 가져오기
    if (!token) {
      console.error('❌ No token found, skipping fetchCartItems.');
      return;
    }

    try {
      const response = await axios.get<CartResponse[]>('/carts', {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ 인증 헤더 추가
        },
      });

      const data: CartItem[] = response.data.map((item) => ({
        id: item.cartId,
        productId: item.productId,
        productName: item.productName,
        productDescription: item.productDescription,
        quantity: item.quantity,
        price: item.price,
      }));
      setCartItems(data);

      if (user) {
        fetchCartTotalAmount().then((amount) => setTotalAmount(amount));
      }
    } catch (error) {
      console.error('❌ 장바구니 데이터를 불러오는 중 오류 발생:', error);
    }
  };

  // ✅ 즐겨찾기 데이터 가져오기 (토큰 추가)
  const fetchBookmarkItems = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.error('❌ No token found, skipping fetchBookmarkItems.');
      return;
    }

    try {
      const response = await axios.get<BookmarkResponse[]>('/bookmarks', {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ 인증 헤더 추가
        },
      });

      const data: BookmarkItem[] = response.data.map((item) => ({
        id: item.bookmarkId,
        productId: item.productId,
        productName: item.productName,
        productDescription: item.productDescription,
        price: item.price,
      }));
      setBookmarkItems(data);
    } catch (error) {
      console.error('❌ 즐겨찾기 데이터를 불러오는 중 오류 발생:', error);
    }
  };

  // ✅ 장바구니 삭제 (토큰 추가)
  const deleteCartItem = async (cartId: string) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.error('❌ No token found, skipping deleteCartItem.');
      return;
    }

    try {
      await axios.delete(`/carts/${cartId}`, {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ 인증 헤더 추가
        },
      });
      setCartItems((prev) => prev.filter((item) => item.id !== cartId));
    } catch (error) {
      console.error('❌ 장바구니 아이템 삭제 중 오류 발생:', error);
    }
  };

  // ✅ 즐겨찾기 삭제 (토큰 추가)
  const deleteBookmarkItem = async (bookmarkId: string) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.error('❌ No token found, skipping deleteBookmarkItem.');
      return;
    }

    try {
      await axios.delete(`/bookmarks/${bookmarkId}`, {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ 인증 헤더 추가
        },
      });
      setBookmarkItems((prev) => prev.filter((item) => item.id !== bookmarkId));
    } catch (error) {
      console.error('❌ 즐겨찾기 아이템 삭제 중 오류 발생:', error);
    }
  };

  const updateCartQuantity = async (cartId: string, newQuantity: number) => {
    if (newQuantity < 1) return; // 최소 수량 제한

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const response = await axios.put(
        `/carts/${cartId}`,
        { quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ 상태 업데이트 (프론트에서 반영)
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === cartId
            ? { ...item, quantity: response.data.quantity }
            : item
        )
      );
    } catch (error) {
      console.error('❌ 장바구니 수량 업데이트 중 오류 발생:', error);
    }
  };

  useEffect(() => {
    if (selected === 'cart') {
      fetchCartItems();
    } else if (selected === 'bookmark') {
      fetchBookmarkItems();
    }
  }, [selected]);

  return {
    cartItems,
    bookmarkItems,
    totalAmount,
    forceRender,
    deleteCartItem,
    deleteBookmarkItem,
    updateCartQuantity,
  };
};
