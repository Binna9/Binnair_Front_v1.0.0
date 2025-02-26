import React from 'react';

interface GalleryItemProps {
  index: number;
  common: string;
  binomial: string;
  photo: {
    code: string;
    page: string;
    text: string;
    by: string;
  };
}

const GalleryItem: React.FC<GalleryItemProps> = ({
  index,
  common,
  binomial,
  photo,
}) => {
  const baseUrl = 'https://images.unsplash.com/photo';
  const imageUrl = `${baseUrl}-${photo.code}?h=900`;

  return (
    <article
      className="relative w-60 h-80 bg-black/60 rounded-xl shadow-lg transition-transform duration-300 
                 hover:scale-110 hover:shadow-2xl cursor-pointer"
      style={{
        transform: `rotateY(${index * (360 / 10)}deg) translateZ(300px)`, // ✅ 기본 회전 유지
      }}
    >
      {/* 카드 헤더 */}
      <header className="absolute top-0 left-0 w-full bg-black/80 text-white p-3 rounded-t-xl">
        <h2 className="text-lg font-bold">{common}</h2>
        <em className="text-sm text-gray-300">{binomial}</em>
      </header>

      {/* 이미지 */}
      <figure className="relative w-full h-full">
        <img
          className="w-full h-full object-cover rounded-b-xl"
          src={imageUrl}
          alt={photo.text}
        />
        <figcaption className="absolute bottom-0 w-full bg-black/70 text-white p-2 text-xs">
          by{' '}
          <a
            className="text-blue-400 underline"
            href={`https://unsplash.com/photos/${photo.page}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {photo.by}
          </a>
        </figcaption>
      </figure>
    </article>
  );
};

export default GalleryItem;
