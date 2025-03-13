import { useEffect, useState } from 'react';
import { fetchAllProducts } from '@/services/ProductService';
import { BsStar, BsStarFill } from 'react-icons/bs';
import { useProductImageBatch } from '@/hooks/useProductImageBatch';
import { PagedProductResponse } from '@/types/ProductType';
import { fetchCategories } from '@/services/ProductService';
import ProductRadio from '../ui/ProductRadio';
import CartBookmarkService from '@/services/CartBookmarkService';

const AllProduct = () => {
  const [productPage, setProductPage] = useState<PagedProductResponse | null>(
    null
  );
  const [bookmarkedProducts, setBookmarkedProducts] = useState<Set<string>>(
    new Set()
  );
  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: {
      bookmarkLoading: boolean;
      cartLoading: boolean;
    };
  }>({});
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        // Pass the current page to fetchAllProducts
        const data = await fetchAllProducts(currentPage);
        setProductPage(data);

        // Initialize quantities for all products
        const initialQuantities = {};
        data.content.forEach((product) => {
          initialQuantities[product.productId] = 1;
        });
        setQuantities(initialQuantities);

        // Initialize loading states for all products
        const initialLoadingStates = {};
        data.content.forEach((product) => {
          initialLoadingStates[product.productId] = {
            bookmarkLoading: false,
            cartLoading: false,
          };
        });
        setLoadingStates(initialLoadingStates);

        // Fetch existing bookmarks to show already bookmarked items
        loadBookmarks();
      } catch (error) {
        console.error('Failed to load products:', error);
      }
    };

    loadProducts();
  }, [currentPage]);

  useEffect(() => {
    const loadCategories = async () => {
      const fetchedCategories = await fetchCategories();
      if (fetchedCategories) {
        setCategories(fetchedCategories);
      }
    };
    loadCategories();
  }, []);

  // 페이지네이션
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // When category changes, we should reset to first page
    if (page !== currentPage) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 북마크 목록 불러오기
  const loadBookmarks = async () => {
    try {
      const response = await CartBookmarkService.getBookmarkItems();
      const bookmarks = response.data;

      // 북마크된 제품 ID Set 생성
      const bookmarkedIds = new Set(bookmarks.map((item) => item.productId));
      setBookmarkedProducts(bookmarkedIds);
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    }
  };

  // 제품 리스트 가져오기 (content 값)
  const products = productPage?.content ?? [];

  // 선택된 카테고리에 따라 필터링
  const filteredProducts = selectedCategory
    ? products.filter((product) => product.category === selectedCategory)
    : products;

  // 제품 ID 목록을 추출하여 이미지 배치 요청
  const productIds = filteredProducts.map((p) => p.productId);
  const productImages = useProductImageBatch(productIds);

  // 카테고리 변경 핸들러
  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
  };

  // 장바구니에 제품 추가
  const handleAddToCart = async (productId: string) => {
    // 이미 로딩 중이면 중복 요청 방지
    if (loadingStates[productId]?.cartLoading) return;

    // 로딩 상태 업데이트
    setLoadingStates((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        cartLoading: true,
      },
    }));

    try {
      const quantity = quantities[productId] || 1;
      await CartBookmarkService.addToCart(productId, quantity);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      // 로딩 상태 해제
      setLoadingStates((prev) => ({
        ...prev,
        [productId]: {
          ...prev[productId],
          cartLoading: false,
        },
      }));
    }
  };

  // 즐겨찾기에 제품 추가
  const handleAddBookmark = async (productId: string) => {
    // 이미 북마크된 상품이거나 로딩 중이면 중복 요청 방지
    if (
      bookmarkedProducts.has(productId) ||
      loadingStates[productId]?.bookmarkLoading
    )
      return;

    // 로딩 상태 업데이트
    setLoadingStates((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        bookmarkLoading: true,
      },
    }));

    try {
      await CartBookmarkService.addToBookmark(productId);

      // 북마크 상태 업데이트
      setBookmarkedProducts((prev) => new Set([...prev, productId]));
    } catch (error) {
      console.error('Failed to add bookmark:', error);
    } finally {
      // 로딩 상태 해제
      setLoadingStates((prev) => ({
        ...prev,
        [productId]: {
          ...prev[productId],
          bookmarkLoading: false,
        },
      }));
    }
  };

  // 수량 변경 핸들러
  const handleQuantityChange = (productId: string, newQuantity: number) => {
    // 최소 수량은 1
    if (newQuantity < 1) return;

    setQuantities((prev) => ({
      ...prev,
      [productId]: newQuantity,
    }));
  };

  // 제품을 3개씩 그룹화하는 함수
  const groupProductsInThrees = (products) => {
    const groups = [];
    for (let i = 0; i < products.length; i += 3) {
      groups.push(products.slice(i, i + 3));
    }
    return groups;
  };

  // 제품 그룹 생성
  const productGroups = groupProductsInThrees(filteredProducts);

  // 제품 컴포넌트 생성 함수
  const renderProductCard = (product) => {
    const isBookmarked = bookmarkedProducts.has(product.productId);
    const isBookmarkLoading =
      loadingStates[product.productId]?.bookmarkLoading || false;
    const isCartLoading =
      loadingStates[product.productId]?.cartLoading || false;
    const quantity = quantities[product.productId] || 1;

    return (
      <div
        key={product.productId}
        className="relative gap-2 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105 p-5 flex flex-col items-center w-4/5 h-[460px] mt-10"
      >
        {/* 📌 제품별 카테고리 북마크 태그 */}
        <div className="absolute top-[-8px] left-0 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-lg rounded-bl-none shadow-md before:content-[''] before:absolute before:bottom-0 before:left-0 before:border-t-[8px] before:border-t-transparent before:border-l-[12px] before:border-l-red-300">
          {product.category}
        </div>

        {/* 제품 이미지 컨테이너 */}
        <div className="w-full h-60 flex items-center justify-center overflow-hidden rounded-lg relative">
          {/* 즐겨찾기 별 아이콘 (우측 상단) */}
          <button
            onClick={() => handleAddBookmark(product.productId)}
            disabled={isBookmarked || isBookmarkLoading}
            className="absolute top-2 right-2 z-10 text-lg bg-white/80 hover:bg-white p-1.5 rounded-full shadow-md transition-colors"
          >
            {isBookmarked ? (
              <BsStarFill className="text-yellow-400" />
            ) : (
              <BsStar
                className={`${
                  isBookmarkLoading ? 'animate-pulse' : ''
                } text-gray-500 hover:text-yellow-400`}
              />
            )}
          </button>

          {/* 할인율 표시 (이미지 하단 왼쪽) - 고급 리본 스타일 */}
          {product.discountRate > 0 && (
            <div className="absolute top-2 left-8 w-40 h-40 z-10">
              <div className="absolute top-0 left-0 transform -translate-x-1/2 translate-y-1/3 rotate-[-45deg] w-48 bg-gradient-to-r from-red-600 to-red-400 text-white font-bold py-1 text-center shadow-lg">
                <div className="flex justify-center items-center">
                  <span className="text-xs">OFF</span>
                  <span className="text-base ml-1">
                    {product.discountRate}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 제품 이미지 */}
          {productImages[product.productId] ? (
            <img
              src={productImages[product.productId] as string}
              alt={product.productName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">이미지 없음</span>
            </div>
          )}
        </div>

        {/* 제품 정보 */}
        <h2 className="text-2xl font-bold mt-2">{product.productName}</h2>
        <p className="text-md text-gray-600 text-center">
          {product.productDescription}
        </p>
        {/* 가격 표시 - 할인 적용 시 원래 가격에 취소선 표시 */}
        <div className="mt-1">
          {product.discountRate > 0 ? (
            <div className="flex flex-col items-center">
              <p className="text-sm font-medium text-gray-500 line-through">
                {product.price.toLocaleString()}원
              </p>
              <p className="text-lg font-bold text-red-600">
                {product.discountPrice.toLocaleString()}원
              </p>
            </div>
          ) : (
            <p className="text-lg font-bold text-slate-900">
              {product.price.toLocaleString()}원
            </p>
          )}
        </div>
        {/* 수량 선택 및 장바구니 추가 버튼 */}
        <div className="flex items-center mt-2 w-full justify-between">
          <div className="flex items-center border rounded-md">
            <button
              onClick={() =>
                handleQuantityChange(product.productId, quantity - 1)
              }
              className="px-2 py-1 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
              disabled={quantity <= 1 || isCartLoading}
            >
              -
            </button>
            <span className="px-3 py-1 min-w-[30px] text-center">
              {quantity}
            </span>
            <button
              onClick={() =>
                handleQuantityChange(product.productId, quantity + 1)
              }
              className="px-2 py-1 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
              disabled={isCartLoading}
            >
              +
            </button>
          </div>
          <button
            onClick={() => handleAddToCart(product.productId)}
            disabled={isCartLoading}
            className="bg-zinc-500 hover:bg-zinc-600 text-white font-semibold py-1.5 px-4 rounded-lg shadow-md transition disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {isCartLoading ? '추가 중...' : 'Add to Cart'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center mb-5">
      {/* 📌 전체 카테고리 목록 (페이지 상단) - ProductRadio 컴포넌트 사용 */}
      <div
        className="w-full max-w-[1400px] shadow-lg rounded-xl p-4 mb-4 mt-20 relative bg-cover bg-center backdrop-blur-md bg-white/10 border border-white/30"
        style={{
          backgroundImage: "url('/img/shoplistimage.jpg')",
          backgroundBlendMode: 'overlay',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backgroundAttachment: 'fixed',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      >
        {/* 북마크 - 카테고리 섹션 */}
        <div className="absolute -top-3 left-6 bg-zinc-300 text-gray-900 text-sm font-bold px-5 py-2 rounded-lg rounded-bl-none shadow-lg before:content-[''] before:absolute before:bottom-0 before:left-0 before:border-t-[10px] before:border-t-transparent before:border-l-[15px] before:border-l-zinc-200">
          CATEGORY
        </div>
        <ProductRadio
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />
      </div>

      {/* 📌 제품 리스트 */}
      <div
        className="w-full max-w-[1400px] shadow-xl rounded-xl p-6 relative mt-5 backdrop-blur-md bg-white/10 border border-white/30"
        style={{
          backgroundImage: "url('/img/shoplistimage.jpg')",
          backgroundBlendMode: 'overlay',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover', // ✅ 컨테이너를 꽉 채우도록 확대
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      >
        {/* 북마크 - 제품 리스트 섹션 */}
        <div className="absolute -top-3 left-6 bg-zinc-300 text-gary-900 text-sm font-bold px-5 py-2 rounded-lg rounded-bl-none shadow-lg before:content-[''] before:absolute before:bottom-0 before:left-0 before:border-t-[10px] before:border-t-transparent before:border-l-[15px] before:border-l-zinc-200">
          PRODUCT
        </div>
        {filteredProducts.length > 0 ? (
          <div className="flex flex-col gap-20">
            {productGroups.map((group, index) => (
              <div
                key={index}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pl-20"
              >
                {group.map(renderProductCard)}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-white text-lg w-full">
            선택한 카테고리에 제품이 없습니다.
          </p>
        )}
        {productPage && productPage.totalPages > 0 && (
          <div className="flex justify-center gap-2 mt-16 mb-8">
            {Array.from({ length: productPage.totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => handlePageChange(index)}
                className={`px-3 py-2 rounded-md ${
                  currentPage === index
                    ? 'bg-zinc-500 text-white font-bold'
                    : 'bg-zinc-100 text-gray-700 hover:bg-zinc-200'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllProduct;
