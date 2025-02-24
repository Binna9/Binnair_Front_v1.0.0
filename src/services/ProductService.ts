import apiClient from '../utils/apiClient';

// ✅ 단일 제품 이미지 가져오기
export const fetchProductImage = async (
  productId: string
): Promise<string | null> => {
  try {
    const response = await apiClient.get(`/products/${productId}/image`, {
      responseType: 'blob',
    });

    if (response.status === 200) {
      return URL.createObjectURL(response.data);
    }
  } catch (error) {
    console.error(`❌ 제품 이미지 불러오기 실패: ${productId}`, error);
  }
  return null;
};

// ✅ 여러 제품 이미지 가져오기
export const fetchProductImagesBatch = async (
  productIds: string[]
): Promise<Record<string, string | null>> => {
  const images: Record<string, string | null> = {};

  await Promise.all(
    productIds.map(async (productId) => {
      images[productId] = await fetchProductImage(productId);
    })
  );

  return images;
};

// ✅ 제품 이미지 업로드
export const uploadProductImage = async (
  productId: string,
  file: File
): Promise<string | null> => {
  if (!productId) {
    console.error('❌ productId가 필요합니다.');
    return null;
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await apiClient.put(
      `/products/${productId}/image-upload`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );

    if (response.status === 200) {
      return URL.createObjectURL(file);
    }
  } catch (error) {
    console.error('❌ 제품 이미지 업로드 실패:', error);
  }

  return null;
};
