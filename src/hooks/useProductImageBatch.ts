import { useState, useEffect } from 'react';
import apiClient from '../utils/apiClient';

export function useProductImageBatch(productIds: string[]) {
  const [productImages, setProductImages] = useState<
    Record<string, string | null>
  >({});

  useEffect(() => {
    if (productIds.length === 0) return;

    let isMounted = true; // ✅ 컴포넌트가 언마운트되었을 때 상태 업데이트 방지

    const fetchImages = async () => {
      const images: Record<string, string | null> = {};

      await Promise.all(
        productIds.map(async (productId) => {
          try {
            const response = await apiClient.get(
              `/products/${productId}/image`,
              {
                responseType: 'blob',
              }
            );
            images[productId] = URL.createObjectURL(response.data);
          } catch (error) {
            console.error(`❌ 제품 이미지 불러오기 실패: ${productId}`, error);
            images[productId] = null; // 기본 이미지 설정
          }
        })
      );

      if (isMounted) {
        setProductImages((prevImages) => {
          // ✅ 기존 상태와 비교하여 변경된 경우에만 업데이트
          const isDifferent = Object.keys(images).some(
            (key) => images[key] !== prevImages[key]
          );
          return isDifferent ? images : prevImages;
        });
      }
    };

    fetchImages();

    return () => {
      isMounted = false; // ✅ 컴포넌트 언마운트 시 상태 업데이트 방지
    };
  }, [JSON.stringify(productIds)]); // ✅ 배열 변경 체크 방식 개선

  return productImages;
}
