import { useState, useEffect } from 'react';
import apiClient from '../utils/apiClient'; // ✅ apiClient 사용

// ✅ 제품 이미지 로드 및 업로드를 위한 커스텀 훅
export function useProductImage(productId: string | null) {
  const [productImage, setProductImage] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;

    const fetchProductImage = async () => {
      try {
        const response = await apiClient.get(`/products/${productId}/image`, {
          responseType: 'blob', // ✅ 바이너리 데이터 (이미지) 가져오기
        });

        if (response.status === 200) {
          const imageUrl = URL.createObjectURL(response.data);
          setProductImage(imageUrl);
        }
      } catch (error) {
        console.error(`❌ 제품 이미지 불러오기 실패: ${productId}`, error);
        setProductImage(null); // 기본 이미지 사용
      }
    };

    fetchProductImage();
  }, [productId]);

  // ✅ 제품 이미지 업로드 기능 추가
  const uploadProductImage = async (file: File) => {
    if (!productId) {
      console.error('❌ productId가 필요합니다.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.put(
        `/products/${productId}/image-upload`, // ✅ 업로드 API 경로
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status === 200) {
        const imageUrl = URL.createObjectURL(file);
        setProductImage(imageUrl);
      }
    } catch (error) {
      console.error('❌ 제품 이미지 업로드 실패:', error);
    }
  };

  return { productImage, uploadProductImage };
}
