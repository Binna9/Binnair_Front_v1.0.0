import React, { useEffect } from 'react';
import styled from 'styled-components';

const base = 'unsplash.com/photo';
const data = [
  {
    common: 'Lion',
    binomial: 'Panthera leo',
    photo: {
      code: '1583499871880-de841d1ace2a',
      page: 'lion-lying-on-brown-rock-MUeeyzsjiY8',
      text: 'lion couple kissing on a brown rock',
      pos: '47% 35%',
      by: 'Clément Roy',
    },
  },
  {
    common: 'Asiatic elephant',
    binomial: 'Elephas maximus',
    photo: {
      code: '1571406761758-9a3eed5338ef',
      page: 'shallow-focus-photo-of-black-elephants-hZhhVLLKJQ4',
      text: 'herd of Sri Lankan elephants walking away from a river',
      pos: '75% 65%',
      by: 'Alex Azabache',
    },
  },
  // 더 많은 데이터 추가 가능
];

const EventProduct: React.FC = () => {
  useEffect(() => {
    const f = (k: number) => {
      if (Math.abs(k) > 0.5) {
        scrollTo(
          0,
          0.5 *
            (k - Math.sign(k) + 1) *
            (document.documentElement.offsetHeight - window.innerHeight)
        );
      }
    };

    f(-1);
    window.addEventListener('scroll', () =>
      f(+getComputedStyle(document.body).getPropertyValue('--k'))
    );

    return () => {
      window.removeEventListener('scroll', () =>
        f(+getComputedStyle(document.body).getPropertyValue('--k'))
      );
    };
  }, []);

  return (
    <StyledGallery style={{ '--n': data.length } as React.CSSProperties}>
      <svg width="0" height="0" aria-hidden="true">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="7.13" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope=".02" />
          </feComponentTransfer>
          <feBlend in2="SourceGraphic" />
        </filter>
      </svg>
      <StyledScene>
        {data.map((item, i) => {
          const img = item.photo;
          const pos = img.pos ? `; --pos: ${img.pos}` : '';
          const url = `https://images.${base}-${img.code}?h=900`;

          return (
            <StyledArticle
              key={i}
              style={
                {
                  '--i': i,
                  '--url': `url(${url})${pos}`,
                } as React.CSSProperties
              }
            >
              <StyledHeader>
                <h2>{item.common}</h2>
                <em>{item.binomial}</em>
              </StyledHeader>
              <StyledFigure>
                <img src={url} alt={img.text} />
                <StyledFigcaption>
                  by{' '}
                  <a
                    href={`https://${base}s/${img.page}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {img.by}
                  </a>
                </StyledFigcaption>
              </StyledFigure>
            </StyledArticle>
          );
        })}
      </StyledScene>
    </StyledGallery>
  );
};

export default EventProduct;

/* Styled Components */
const StyledGallery = styled.div`
  height: calc(var(--n) * 100%);
  display: grid;
  grid-template-rows: max-content 1fr max-content;
  position: fixed;
  width: 100%;
  height: 100vh;
  color: #dedede;
  font-family: 'Saira', sans-serif;
  animation: k 1s linear;
  animation-timeline: scroll();
  z-index: 50;
`;

const StyledScene = styled.section`
  overflow: hidden;
  perspective: 50em;
  display: grid;
  place-content: center;
  place-items: center;
`;

const StyledArticle = styled.article`
  --w: clamp(4em, min(50vh, 25vw), 18em);
  --z: calc(1.25 * -0.5 * var(--w) / tan(0.5turn / var(--n)));
  translate: 0 0 var(--z);
  rotate: y calc((var(--k) + 0.5) * -1turn);
  display: grid;
  width: var(--w);
  aspect-ratio: 2/3;
  transform-style: preserve-3d;
  transform: rotateY(calc(var(--i) * 1turn)) translateZ(var(--z));

  &:hover {
    transform: scale(1.1);
  }
`;

const StyledHeader = styled.header`
  text-align: center;
  font-size: 1.125em;
`;

const StyledFigure = styled.figure`
  position: relative;
  border: 4px solid transparent;
  border-radius: 0.5em;
  background: var(--url) 50% / cover;
  box-shadow: 5px 5px 13px #000;
  transition: 0.35s ease-out;
`;

const StyledFigcaption = styled.figcaption`
  align-self: end;
  padding: 0.5em;
  background: rgba(255, 255, 255, 0.3);
  color: #040404;
  font-size: 0.75rem;
  text-align: right;
  text-shadow: 1px 1px 1px #0006;
  backdrop-filter: blur(5px) brightness(1.5);
`;
