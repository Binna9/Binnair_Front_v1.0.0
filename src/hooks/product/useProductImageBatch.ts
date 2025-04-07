import { useState, useEffect } from 'react';
import { ProductService } from '@/services/ProductService';

export const useProductImageBatch = (productIds: string[]) => {
  const [productImages, setProductImages] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchProductImages = async () => {
      try {
        const images: Record<string, string> = {};
        for (const productId of productIds) {
          const response = await ProductService.getProductImage(productId);
          images[productId] = response.data.imageUrl;
        }
        setProductImages(images);
      } catch (error) {
        console.error('❌ 상품 이미지 가져오는 중 오류 발생:', error);
      }
    };

    if (productIds.length > 0) {
      fetchProductImages();
    }
  }, [productIds]);

  return productImages;
};
