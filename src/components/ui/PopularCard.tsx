import React from 'react';
import styled from 'styled-components';

/* ✅ Props 타입 추가 */
interface PopularCardProps {
  gradient?: 'pink-blue' | 'purple-cyan';
  title: string;
  description: string;
}

const PopularCard: React.FC<PopularCardProps> = ({
  gradient = 'pink-blue',
  title,
  description,
}) => {
  return (
    <StyledWrapper className={gradient}>
      <StyledCard>
        <p className="heading">{title}</p>
        <p>{description}</p>
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

  .heading {
    font-size: 18px;
    text-transform: capitalize;
    font-weight: 700;
    color: white;
  }

  p:not(.heading) {
    font-size: 14px;
    color: white;
  }

  p:last-child {
    color: #e81cff;
    font-weight: 600;
  }
`;

export default PopularCard;
