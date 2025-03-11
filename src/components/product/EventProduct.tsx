import React from 'react';

const EventProduct = () => {
  return (
    <div className="max-w-lg mx-auto bg-white rounded-lg shadow-lg flex mt-12">
      {/* 제품 이미지 */}
      <div className="w-1/2">
        <img
          src="https://i.postimg.cc/W30ZbJym/product-img.png"
          alt="Harvest Vase"
          className="h-full w-full object-cover rounded-l-lg"
        />
      </div>

      {/* 제품 정보 */}
      <div className="w-1/2 flex flex-col justify-between p-6">
        {/* 텍스트 영역 */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Harvest Vase</h1>
          <h2 className="text-xs uppercase text-gray-400 tracking-wide mt-1">
            by studio and friends
          </h2>
          <p className="text-sm text-gray-600 mt-4">
            Harvest Vases are a reinterpretation of peeled fruits and vegetables
            as functional objects. The surfaces appear to be sliced and pulled
            aside, allowing room for growth.
          </p>
        </div>

        {/* 가격 및 구매 버튼 */}
        <div className="flex justify-between items-center mt-6">
          <p className="text-xl font-semibold text-gray-800">
            <span className="text-2xl font-bold">78</span>$
          </p>
          <button className="px-6 py-2 bg-green-400 text-white text-sm uppercase rounded-full tracking-wide hover:bg-green-500 transition">
            Buy now
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventProduct;
