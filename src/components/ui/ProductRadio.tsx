import React from 'react';

interface ProductRadioProps {
  categories: string[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

const ProductRadio: React.FC<ProductRadioProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
}) => {
  // 카테고리 아이콘 컴포넌트
  const CategoryIcon = () => {
    return (
      <div className="radio-icon">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
        </svg>
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="radio-inputs flex flex-wrap justify-center w-full max-w-full">
        {/* 전체보기 옵션 */}
        <div className="m-2">
          <input
            className="radio-input"
            type="radio"
            name="category"
            id="category-all"
            checked={selectedCategory === null}
            onChange={() => onCategoryChange(null)}
          />
          <label className="radio-tile" htmlFor="category-all">
            <div className="radio-icon">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
              </svg>
            </div>
            <span className="radio-label">전체 보기</span>
          </label>
        </div>

        {/* 각 카테고리 옵션 */}
        {categories.map((category) => (
          <div className="m-2" key={category}>
            <input
              className="radio-input"
              type="radio"
              name="category"
              id={`category-${category}`}
              checked={selectedCategory === category}
              onChange={() => onCategoryChange(category)}
            />
            <label className="radio-tile" htmlFor={`category-${category}`}>
              <CategoryIcon />
              <span className="radio-label">{category}</span>
            </label>
          </div>
        ))}
      </div>

      {/* CSS 스타일 */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
    .radio-inputs {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }
    .radio-inputs > * {
      margin: 6px;
    }
    .radio-input:checked + .radio-tile {
      border-color: #8B4513;
      box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
      color: #8B4513;
    }
    .radio-input:checked + .radio-tile:before {
      transform: scale(1);
      opacity: 1;
      background-color: #8B4513;
      border-color: #8B4513;
    }
    .radio-input:checked + .radio-tile .radio-icon svg {
      fill: #8B4513;
    }
    .radio-input:checked + .radio-tile .radio-label {
      color: #8B4513;
    }
    .radio-input:focus + .radio-tile {
      border-color: #8B4513;
      box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1), 0 0 0 4px #D2B48C;
    }
    .radio-input:focus + .radio-tile:before {
      transform: scale(1);
      opacity: 1;
    }
    .radio-tile {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 80px;
      min-height: 80px;
      border-radius: 0.5rem;
      border: 2px solid #b5bfd9;
      background-color: #fff;
      box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
      transition: 0.15s ease;
      cursor: pointer;
      position: relative;
    }
    .radio-tile:before {
      content: "";
      position: absolute;
      display: block;
      width: 0.75rem;
      height: 0.75rem;
      border: 2px solid #b5bfd9;
      background-color: #fff;
      border-radius: 50%;
      top: 0.25rem;
      left: 0.25rem;
      opacity: 0;
      transform: scale(0);
      transition: 0.25s ease;
    }
    .radio-tile:hover {
      border-color: #8B4513;
    }
    .radio-tile:hover:before {
      transform: scale(1);
      opacity: 1;
    }
    .radio-icon svg {
      width: 2rem;
      height: 2rem;
      fill: #494949;
    }
    .radio-label {
      color: #707070;
      transition: 0.375s ease;
      text-align: center;
      font-size: 13px;
    }
    .radio-input {
      clip: rect(0 0 0 0);
      -webkit-clip-path: inset(100%);
      clip-path: inset(100%);
      height: 1px;
      overflow: hidden;
      position: absolute;
      white-space: nowrap;
      width: 1px;
    }
  `,
        }}
      />
    </div>
  );
};

export default ProductRadio;
