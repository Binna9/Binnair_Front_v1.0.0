import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  FileText,
  Trash2,
  Check,
  CreditCard,
  Home,
  Package,
  Gift,
  ArrowRight,
  ChevronRight,
  ArrowLeft,
  MapPin,
  DollarSign,
  X,
  Plus,
  Minus,
  RefreshCw,
  ShoppingBag,
  Calendar,
} from 'lucide-react';
import CartBookmarkService from '@/services/CartBookmarkService';
import { useProductImageBatch } from '@/hooks/useProductImageBatch';
import { CartItemsResponse, CartTotal } from '@/types/CartBookmarkTypes';
import VerticalSidebar from './VerticalSidebar';
import CartPromotionBox from './CartPromotionBox';

enum OrderStep {
  CART = 'cart',
  CHECKOUT = 'checkout',
  PAYMENT = 'payment',
  CONFIRMATION = 'confirmation',
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  selected: boolean;
  productId: string;
  option?: string;
}

interface ProductOption {
  productId: string;
  name: string;
  price: number;
}

export default function Market() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [currentStep, setCurrentStep] = useState<OrderStep>(OrderStep.CART);
  const [allSelected, setAllSelected] = useState(true);
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState<CartTotal | null>(null);
  const [productOptions, setProductOptions] = useState<
    Record<string, ProductOption[]>
  >({});
  const [showOptionsFor, setShowOptionsFor] = useState<string | null>(null);
  const [isChangingOption, setIsChangingOption] = useState(false);
  const navigate = useNavigate();

  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    phone: '',
    address: '',
    zipCode: '',
    memo: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [orderNumber, setOrderNumber] = useState('');

  useEffect(() => {
    fetchCartItems();
  }, []);

  const productIds = cartItems.map((item) => item.productId);

  const productImages = useProductImageBatch(productIds);

  const fetchProductOptions = async (productId: string) => {
    return [
      { productId: productId, name: '기본 옵션', price: 0 },
      { productId: `${productId}-v1`, name: '옵션 A', price: 5000 },
      { productId: `${productId}-v2`, name: '옵션 B', price: 10000 },
    ];
  };

  const handleStepClick = (step: OrderStep) => {
    setCurrentStep(step);
  };

  const fetchCartItems = async () => {
    setIsLoading(true);
    try {
      const response = await CartBookmarkService.getCartItems();

      if (response.data && response.data.carts) {
        const items: CartItem[] = response.data.carts.map((item) => ({
          id: item.cartId,
          name: item.productName,
          price: item.price,
          quantity: item.quantity,
          selected: true,
          productId: item.productId,
          option: item.option,
        }));

        setCartItems(items);
        setAllSelected(true);

        if (items.length > 0) {
          updateCartTotal(items.map((item) => item.id));
        }
      }
    } catch (error) {
      console.error('Failed to fetch cart items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCartTotal = async (cartIds: string[]) => {
    try {
      const totalInfo = await CartBookmarkService.getDiscountedTotal(cartIds);
      setTotal(totalInfo);
    } catch (error) {
      console.error('Failed to get cart total:', error);
    }
  };

  const toggleSelectItem = (id: string) => {
    const updatedItems = cartItems.map((item) =>
      item.id === id ? { ...item, selected: !item.selected } : item
    );

    setCartItems(updatedItems);

    const allItemsSelected = updatedItems.every((item) => item.selected);
    setAllSelected(allItemsSelected);

    const selectedCartIds = updatedItems
      .filter((item) => item.selected)
      .map((item) => item.id);

    if (selectedCartIds.length > 0) {
      updateCartTotal(selectedCartIds);
    }
  };

  const toggleSelectAll = () => {
    const newSelectAll = !allSelected;
    setAllSelected(newSelectAll);

    const updatedItems = cartItems.map((item) => ({
      ...item,
      selected: newSelectAll,
    }));

    setCartItems(updatedItems);

    if (newSelectAll && cartItems.length > 0) {
      updateCartTotal(cartItems.map((item) => item.id));
    }
  };

  const updateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      await CartBookmarkService.updateCartQuantity(id, newQuantity);

      const updatedItems = cartItems.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      );

      setCartItems(updatedItems);

      const selectedCartIds = updatedItems
        .filter((item) => item.selected)
        .map((item) => item.id);

      if (selectedCartIds.length > 0) {
        updateCartTotal(selectedCartIds);
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const removeItem = async (id: string) => {
    try {
      await CartBookmarkService.deleteCartItem(id);

      const updatedItems = cartItems.filter((item) => item.id !== id);
      setCartItems(updatedItems);

      const selectedCartIds = updatedItems
        .filter((item) => item.selected)
        .map((item) => item.id);

      if (selectedCartIds.length > 0) {
        updateCartTotal(selectedCartIds);
      } else {
        setTotal(null);
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const applyDiscount = () => {
    if (discountCode.trim() !== '') {
      setDiscountApplied(true);
      // In a real app, you would call an API to validate and apply the discount
      // For now, we'll just simulate a discount
      if (total) {
        setTotal({
          ...total,
          discountAmount: 10000,
          discountedTotal: total.totalAmount - 10000,
        });
      }
    }
  };

  const calculateShippingCost = () => {
    const subtotal = total?.totalAmount || 0;
    return subtotal > 50000 ? 0 : 3000;
  };

  const processOrder = () => {
    // Generate random order number
    const newOrderNumber =
      'ORD' +
      Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, '0');
    setOrderNumber(newOrderNumber);
    setCurrentStep(OrderStep.CONFIRMATION);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleShowOptions = async (itemId: string, productId: string) => {
    setShowOptionsFor(itemId);

    try {
      if (!productOptions[productId]) {
        const options = await fetchProductOptions(productId);
        setProductOptions((prev) => ({
          ...prev,
          [productId]: options,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch product options:', error);
    }
  };

  const handleChangeOption = async (
    cartId: string,
    newProductId: string,
    newOption: string,
    price: number
  ) => {
    setIsChangingOption(true);
    try {
      await CartBookmarkService.changeProduct(cartId, newProductId);

      // Update local state
      const updatedItems = cartItems.map((item) =>
        item.id === cartId
          ? { ...item, productId: newProductId, option: newOption, price }
          : item
      );

      setCartItems(updatedItems);
      setShowOptionsFor(null);

      const selectedCartIds = updatedItems
        .filter((item) => item.selected)
        .map((item) => item.id);

      if (selectedCartIds.length > 0) {
        updateCartTotal(selectedCartIds);
      }
    } catch (error) {
      console.error('Failed to change product option:', error);
    } finally {
      setIsChangingOption(false);
    }
  };

  const renderCart = () => {
    return (
      <div className="w-full bg-zinc-100 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-semibold mb-6 flex items-center drop-shadow-md">
          <ShoppingCart size={24} className="mr-3" /> 장바구니
        </h1>
        {isLoading ? (
          <div className="text-center py-16">
            <p>Loading...</p>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <ShoppingCart size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">장바구니가 비어 있습니다.</p>
            <button
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={() => navigate('/product')}
            >
              쇼핑 계속하기
            </button>
          </div>
        ) : (
          <>
            {/* Cart header - 흰색 배경과 그림자 추가 */}
            <div className="bg-white p-4 rounded-lg mb-8 shadow-lg">
              <div className="flex items-center pb-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="mr-2"
                  />
                  <span>
                    전체선택 ({cartItems.filter((item) => item.selected).length}
                    /{cartItems.length})
                  </span>
                </label>
                <button
                  className="ml-4 text-zinc-700 text-sm flex items-center"
                  onClick={() => {
                    // In a real app, you would call an API to delete all items
                    cartItems.forEach((item) => removeItem(item.id));
                  }}
                >
                  <Trash2 size={14} className="mr-1" />
                  전체삭제
                </button>
              </div>

              {/* Cart items - 흰색 배경과 그림자 추가 */}

              <div className="mb-4 mt-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="py-4 border-b last:border-b-0">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => toggleSelectItem(item.id)}
                        className="mr-4"
                      />
                      <div className="flex-shrink-0 mr-4">
                        <img
                          src={
                            productImages[item.productId] ||
                            '/api/placeholder/80/80'
                          }
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded"
                        />
                      </div>
                      <div className="flex-grow mr-4">
                        <h3 className="font-medium">{item.name}</h3>
                        <div className="flex items-center mt-1">
                          {item.option && (
                            <span className="text-sm text-gray-500 mr-2">
                              옵션: {item.option}
                            </span>
                          )}
                          <button
                            className="text-xs text-blue-500 flex items-center"
                            onClick={() =>
                              handleShowOptions(item.id, item.productId)
                            }
                          >
                            <RefreshCw size={12} className="mr-1" />
                            옵션변경
                          </button>
                        </div>
                        <p className="mt-1 font-medium">
                          {item.price.toLocaleString()}원
                        </p>
                      </div>
                      <div className="flex items-center mr-4">
                        <button
                          className="w-8 h-8 bg-zinc-200 hover:bg-zinc-300 rounded-l flex items-center justify-center"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-10 h-8 flex items-center justify-center border-t border-b">
                          {item.quantity}
                        </span>
                        <button
                          className="w-8 h-8 bg-zinc-200 hover:bg-zinc-300 rounded-r flex items-center justify-center"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <div className="text-right min-w-[100px] font-medium">
                        {(item.price * item.quantity).toLocaleString()}원
                      </div>
                      <button
                        className="ml-4 text-gray-400 hover:text-gray-700"
                        onClick={() => removeItem(item.id)}
                      >
                        <X size={20} />
                      </button>
                    </div>

                    {/* Product Options Panel */}
                    {showOptionsFor === item.id && (
                      <div className="mt-3 ml-10 p-3 bg-gray-50 rounded-md">
                        <h4 className="text-sm font-medium mb-2">옵션 선택</h4>
                        <div className="space-y-2">
                          {productOptions[item.productId]?.map((option) => (
                            <div
                              key={option.productId}
                              className="flex justify-between cursor-pointer p-2 hover:bg-gray-100 rounded"
                              onClick={() =>
                                handleChangeOption(
                                  item.id,
                                  option.productId,
                                  option.name,
                                  item.price + option.price
                                )
                              }
                            >
                              <div>
                                <span className="text-sm">{option.name}</span>
                                {option.price > 0 && (
                                  <span className="text-xs text-gray-500 ml-2">
                                    (+{option.price.toLocaleString()}원)
                                  </span>
                                )}
                              </div>
                              {isChangingOption ? (
                                <span className="text-xs text-gray-500">
                                  변경 중...
                                </span>
                              ) : (
                                <button className="text-xs text-blue-500">
                                  선택
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 flex justify-end">
                          <button
                            className="text-xs text-gray-500"
                            onClick={() => setShowOptionsFor(null)}
                          >
                            닫기
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Discount code */}
            <div className="bg-white p-4 rounded-lg mb-8 shadow-lg">
              <h3 className="font-medium mb-2">할인 쿠폰</h3>
              <div className="flex">
                <input
                  type="text"
                  className="flex-grow border rounded-l px-3 py-2 focus:outline-none focus:border-blue-500"
                  placeholder="쿠폰 코드 입력"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  disabled={discountApplied}
                />
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600"
                  onClick={applyDiscount}
                  disabled={discountApplied}
                >
                  적용
                </button>
              </div>
              {discountApplied && (
                <p className="text-green-600 text-sm mt-2">
                  <Check size={14} className="inline mr-1" />
                  10,000원 할인이 적용되었습니다.
                </p>
              )}
            </div>

            {/* Order summary */}
            <div className="bg-white p-4 rounded-lg mb-8 shadow-lg">
              <h3 className="font-medium mb-4">주문 요약</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>상품 금액</span>
                  <span>{(total?.totalAmount || 0).toLocaleString()}원</span>
                </div>
                <div className="flex justify-between">
                  <span>배송비</span>
                  <span>
                    {calculateShippingCost() > 0
                      ? `${calculateShippingCost().toLocaleString()}원`
                      : '무료'}
                  </span>
                </div>
                {discountApplied && (
                  <div className="flex justify-between text-red-500">
                    <span>할인</span>
                    <span>
                      -{(total?.discountAmount || 0).toLocaleString()}원
                    </span>
                  </div>
                )}
              </div>
              <div className="flex justify-between border-t pt-4 font-medium text-lg">
                <span>총 결제금액</span>
                <span className="text-blue-600">
                  {(
                    (total?.discountedTotal || total?.totalAmount || 0) +
                    calculateShippingCost()
                  ).toLocaleString()}
                  원
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-between">
              <button
                className="px-6 py-3 bg-white shadow-lg rounded-lg hover:bg-gray-50 transition-colors duration-200 text-gray-700 font-medium flex-1 sm:flex-initial flex items-center justify-center"
                onClick={() => navigate('/product')}
              >
                <ArrowLeft size={18} className="mr-2" />
                쇼핑 계속하기
              </button>
              <button
                className="px-6 py-3 bg-blue-600 text-white shadow-lg rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md font-medium flex-1 sm:flex-initial flex items-center justify-center"
                onClick={() => setCurrentStep(OrderStep.CHECKOUT)}
              >
                주문하기
                <ArrowRight size={18} className="ml-2" />
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  // Render checkout page (same as before)
  const renderCheckout = () => {
    return (
      <div className="w-full bg-zinc-100 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-semibold mb-6 flex items-center drop-shadow-md">
          <FileText size={24} className="mr-3" /> 주문서 작성
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Shipping information */}
            <div className="bg-white border rounded-lg p-6 mb-6 shadow-lg">
              <h2 className="text-lg font-semibold mb-4">배송 정보</h2>

              <div className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm">수령인 이름 *</label>
                  <input
                    type="text"
                    name="name"
                    value={shippingInfo.name}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm">연락처 *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={shippingInfo.phone}
                    onChange={handleInputChange}
                    placeholder="000-0000-0000"
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="block mb-1 text-sm">우편번호 *</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={shippingInfo.zipCode}
                      onChange={handleInputChange}
                      className="w-full border rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="col-span-2 flex items-end">
                    <button className="px-4 py-2 border border-gray-300 rounded h-[42px] hover:bg-gray-100">
                      주소 찾기
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-sm">주소 *</label>
                  <input
                    type="text"
                    name="address"
                    value={shippingInfo.address}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm">배송 메모</label>
                  <textarea
                    name="memo"
                    value={shippingInfo.memo}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:border-blue-500 h-20"
                    placeholder="배송시 요청사항을 입력해주세요."
                  />
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="bg-white border rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-4">결제 방법</h2>

              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="mr-2"
                  />
                  <CreditCard size={16} className="mr-2" />
                  신용카드
                </label>

                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank"
                    checked={paymentMethod === 'bank'}
                    onChange={() => setPaymentMethod('bank')}
                    className="mr-2"
                  />
                  <Home size={16} className="mr-2" />
                  무통장 입금
                </label>

                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="phone"
                    checked={paymentMethod === 'phone'}
                    onChange={() => setPaymentMethod('phone')}
                    className="mr-2"
                  />
                  <Package size={16} className="mr-2" />
                  휴대폰 결제
                </label>

                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="point"
                    checked={paymentMethod === 'point'}
                    onChange={() => setPaymentMethod('point')}
                    className="mr-2"
                  />
                  <Gift size={16} className="mr-2" />
                  포인트 결제
                </label>
              </div>

              {paymentMethod === 'card' && (
                <div className="mt-4 p-4 bg-gray-50 rounded">
                  <p className="text-sm text-gray-500">
                    결제하기 버튼을 클릭하면 카드 결제 화면으로 이동합니다.
                  </p>
                </div>
              )}

              {paymentMethod === 'bank' && (
                <div className="mt-4 p-4 bg-gray-50 rounded">
                  <p className="font-medium mb-2">무통장 입금 정보</p>
                  <p className="text-sm">은행명: 국민은행</p>
                  <p className="text-sm">계좌번호: 123-456-789012</p>
                  <p className="text-sm">예금주: binnair</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            {/* Order summary */}
            <div className="bg-white border rounded-lg p-6 sticky top-6 shadow-lg">
              <h2 className="text-lg font-medium mb-4">주문 요약</h2>

              <div className="max-h-60 overflow-y-auto mb-4">
                {cartItems
                  .filter((item) => item.selected)
                  .map((item) => (
                    <div key={item.id} className="flex py-2 border-b">
                      <div className="flex-shrink-0 mr-3">
                        <img
                          src={
                            productImages[item.productId] ||
                            '/api/placeholder/80/80'
                          }
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      </div>
                      <div className="flex-grow">
                        <h4 className="text-sm font-medium">{item.name}</h4>
                        {item.option && (
                          <p className="text-xs text-gray-500">
                            {item.option} / {item.quantity}개
                          </p>
                        )}
                        <p className="text-sm mt-1">
                          {(item.price * item.quantity).toLocaleString()}원
                        </p>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>상품 금액</span>
                  <span>{(total?.totalAmount || 0).toLocaleString()}원</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>배송비</span>
                  <span>
                    {calculateShippingCost() > 0
                      ? `${calculateShippingCost().toLocaleString()}원`
                      : '무료'}
                  </span>
                </div>
                {discountApplied && (
                  <div className="flex justify-between text-sm text-red-500">
                    <span>할인</span>
                    <span>
                      -{(total?.discountAmount || 0).toLocaleString()}원
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-between border-t pt-4 font-medium text-lg mb-6">
                <span>총 결제금액</span>
                <span className="text-blue-600">
                  {(
                    (total?.discountedTotal || total?.totalAmount || 0) +
                    calculateShippingCost()
                  ).toLocaleString()}
                  원
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" required />
                  <span className="text-sm">
                    주문 내용을 확인하였으며 결제 진행에 동의합니다. (필수)
                  </span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" required />
                  <span className="text-sm">
                    개인정보 수집 및 이용에 동의합니다. (필수)
                  </span>
                </label>
              </div>

              <button
                className="w-full py-3 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 flex items-center justify-center"
                onClick={() => setCurrentStep(OrderStep.CONFIRMATION)}
                disabled={
                  !shippingInfo.name ||
                  !shippingInfo.phone ||
                  !shippingInfo.address
                }
              >
                결제하기 <ArrowRight size={16} className="ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderConfirmation = () => {
    return (
      <div className="w-full max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* 상단 성공 영역 */}
        <div className="bg-gradient-to-r from-green-400 to-blue-500 py-8 px-6 text-center text-white">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Check size={32} className="text-green-500" />
          </div>
          <h1 className="text-3xl font-bold mb-2">주문이 완료되었습니다</h1>
          <p className="text-lg opacity-90">주문번호: {orderNumber}</p>
        </div>

        {/* 주문 정보 영역 */}
        <div className="p-8">
          <h2 className="text-xl font-semibold mb-6 flex items-center border-b pb-4">
            <ShoppingBag className="mr-2 text-gray-600" size={20} />
            주문 정보
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* 주문 일시 */}
            <div className="bg-gray-50 shadow-lg p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                <Calendar size={16} className="mr-2" />
                주문 일시
              </h3>
              <p className="text-gray-800">
                {new Date().toLocaleString('ko-KR')}
              </p>
            </div>

            {/* 결제 방법 */}
            <div className="bg-gray-50 shadow-lg p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                <CreditCard size={16} className="mr-2" />
                결제 방법
              </h3>
              <p className="text-gray-800">
                {paymentMethod === 'card' && '신용카드'}
                {paymentMethod === 'bank' && '무통장 입금'}
                {paymentMethod === 'phone' && '휴대폰 결제'}
                {paymentMethod === 'point' && '포인트 결제'}
              </p>
            </div>

            {/* 주문 상품 */}
            <div className="md:col-span-2 shadow-lg bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                <Package size={16} className="mr-2" />
                주문 상품
              </h3>
              <div className="max-h-32 overflow-y-auto pr-2">
                {cartItems
                  .filter((item) => item.selected)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                    >
                      <span>{item.name}</span>
                      <span className="text-gray-600 text-sm">
                        {item.quantity}개
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* 배송지 */}
            <div className="bg-gray-50 shadow-lg p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                <MapPin size={16} className="mr-2" />
                배송지
              </h3>
              <p className="font-medium text-gray-800">{shippingInfo.name}</p>
              <p className="text-gray-700 text-sm mt-1">
                {shippingInfo.address}
              </p>
              <p className="text-gray-700 text-sm mt-1">{shippingInfo.phone}</p>
            </div>

            {/* 결제 금액 */}
            <div className="bg-gray-50 shadow-lg p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                <DollarSign size={16} className="mr-2" />
                결제 금액
              </h3>
              <p className="font-bold text-xl text-zinc-600">
                {(
                  (total?.discountedTotal || total?.totalAmount || 0) +
                  calculateShippingCost()
                ).toLocaleString()}
                원
              </p>
            </div>
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className="px-8 pb-8 pt-2 flex flex-col sm:flex-row justify-center gap-4">
          <button
            className="px-6 py-3 bg-white shadow-lg rounded-lg hover:bg-gray-50 transition-colors duration-200 text-gray-700 font-medium flex-1 sm:flex-initial flex items-center justify-center"
            onClick={() => navigate('/product')}
          >
            <ArrowLeft size={18} className="mr-2" />
            쇼핑 계속하기
          </button>
          <button
            className="px-6 py-3 bg-blue-600 text-white shadow-lg rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md font-medium flex-1 sm:flex-initial flex items-center justify-center"
            onClick={() => (window.location.href = '/orders')}
          >
            주문 내역 확인
            <ArrowRight size={18} className="ml-2" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-[1400px] mx-auto py-10 mt-12">
      <div className="flex flex-col lg:flex-row gap-4">
        <VerticalSidebar
          currentStep={currentStep}
          onStepClick={handleStepClick}
        />
        {currentStep === OrderStep.CART && renderCart()}
        {currentStep === OrderStep.CHECKOUT && renderCheckout()}
        {currentStep === OrderStep.CONFIRMATION && renderConfirmation()}
        <CartPromotionBox />
      </div>
    </div>
  );
}
