import apiClient from '../utils/apiClient';
import { ProductType, PagedProductResponse } from '@/types/ProductTypes';

export const fetchAllProducts = async (
  page: number = 0,
  size: number = 9
): Promise<PagedProductResponse | null> => {
  try {
    const response = await apiClient.get<PagedProductResponse>(
      `/products?page=${page}&size=${size}`
    );

    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    console.error('❌ 모든 제품 조회 실패:', error);
  }

  return null;
};

// ✅ 개별 제품 조회
export const fetchProductById = async (
  productId: string
): Promise<ProductType | null> => {
  try {
    const response = await apiClient.get<ProductType>(`/products/${productId}`);

    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    console.error(`❌ 개별 제품 조회 실패: ${productId}`, error);
  }

  return null;
};

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

export const fetchCategories = async (): Promise<string[] | null> => {
  try {
    const response = await apiClient.get<string[]>('/products/list');

    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    console.error('❌ 제품 카테고리 조회 실패:', error);
  }

  return null;
};
