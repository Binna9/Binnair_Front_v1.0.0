import { useState, useEffect } from 'react';
import apiClient from '../utils/apiClient';

export function useProductImageBatch(productIds: string[]) {
  const [productImages, setProductImages] = useState<
    Record<string, string | null>
  >({});

  useEffect(() => {
    if (productIds.length === 0) return;

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
            images[productId] = null; // 기본 이미지
          }
        })
      );

      setProductImages(images);
    };

    fetchImages();
  }, [productIds]);

  return productImages;
}
