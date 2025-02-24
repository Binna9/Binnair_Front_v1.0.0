import { useState, useEffect } from 'react';
import { fetchProductImagesBatch } from '@/services/ProductService';

export function useProductImageBatch(productIds: string[]) {
  const [productImages, setProductImages] = useState<
    Record<string, string | null>
  >({});

  useEffect(() => {
    if (productIds.length === 0) return;

    let isMounted = true;

    const loadImages = async () => {
      const images = await fetchProductImagesBatch(productIds);

      if (isMounted) {
        setProductImages((prevImages) => {
          const isDifferent = Object.keys(images).some(
            (key) => images[key] !== prevImages[key]
          );
          return isDifferent ? images : prevImages;
        });
      }
    };

    loadImages();

    return () => {
      isMounted = false;
    };
  }, [JSON.stringify(productIds)]);

  return productImages;
}
