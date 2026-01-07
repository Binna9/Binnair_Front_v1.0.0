import React from 'react';
import styled from 'styled-components';

/* ✅ Props 타입 추가 */
interface PopularCardProps {
  gradient?: 'pink-blue' | 'purple-cyan';
  title: string;
  description: string;
  image?: string;
}

const PopularCard: React.FC<PopularCardProps> = ({
  gradient = 'pink-blue',
  title,
  description,
  image,
}) => {
  return (
    <StyledWrapper className={gradient}>
      <StyledCard>
        {image && (
          <StyledImageContainer>
            <img src={image} alt={title} className="card-image" />
          </StyledImageContainer>
        )}
        <div className="card-content">
          <p className="heading">{title}</p>
        </div>
      </StyledCard>
    </StyledWrapper>
  );
};

/* ✅ 효과가 들어갈 Wrapper (검은색 카드 뒤 배경 효과용) */
const StyledWrapper = styled.div`
  position: relative;
  width: 190px;
  height: 254px;
  z-index: 5;

  &::before {
    content: '';
    position: absolute;
    inset: -10px;
    border-radius: 12px;
    pointer-events: none;
    transition: transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    filter: blur(15px);
  }

  &.pink-blue::before {
    background: linear-gradient(-45deg, red 0%, yellow 100%);
  }

  &.purple-cyan::before {
    background: linear-gradient(-45deg, #8a2be2 0%, #00ffcc 100%);
  }

  &:hover::before {
    filter: blur(25px);
    transform: rotate(-10deg) scale(1.1);
  }
`;

/* ✅ 이미지 컨테이너 */
const StyledImageContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 50px;
  overflow: hidden;
  z-index: 1;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60%;
    background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.7) 100%);
    pointer-events: none;
    z-index: 2;
  }

  .card-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
    opacity: 0.8;
    filter: brightness(1.1) contrast(1.05);
  }
`;

/* ✅ 검은색 카드 자체 */
const StyledCard = styled.div`
  position: relative;
  width: 190px;
  height: 254px;
  background-color: #000;
  display: flex;
  flex-direction: column;
  justify-content: end;
  padding: 12px;
  gap: 12px;
  border-radius: 8px;
  cursor: pointer;
  z-index: 10;
  overflow: hidden;

  .card-content {
    position: relative;
    z-index: 2;
  }

  .heading {
    font-size: 18px;
    text-transform: capitalize;
    font-weight: 700;
    color: white;
  }

`;

export default PopularCard;
