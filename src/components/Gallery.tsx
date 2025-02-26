import React, { useEffect, useState } from 'react';
import GalleryItem from './GalleryItem';

const data = [
  {
    common: 'Lion',
    binomial: 'Panthera leo',
    photo: {
      code: '1583499871880-de841d1ace2a',
      page: 'lion-lying-on-brown-rock-MUeeyzsjiY8',
      text: 'lion couple kissing on a brown rock',
      by: 'Clément Roy',
    },
  },
  {
    common: 'Asiatic Elephant',
    binomial: 'Elephas maximus',
    photo: {
      code: '1571406761758-9a3eed5338ef',
      page: 'shallow-focus-photo-of-black-elephants-hZhhVLLKJQ4',
      text: 'herd of Sri Lankan elephants',
      by: 'Alex Azabache',
    },
  },
  {
    common: 'Cheetah',
    binomial: 'Acinonyx jubatus',
    photo: {
      code: '1541707519942-08fd2f6480ba',
      page: 'leopard-sitting-on-grass-field-3pekyY0-yOw',
      text: 'cheetah sitting in the grass under a blue sky',
      by: 'Mike Bird',
    },
  },
];

const Gallery: React.FC = () => {
  const [scrollValue, setScrollValue] = useState(0);

  const handleScroll = () => {
    setScrollValue(window.scrollY * 0.005);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative h-screen flex items-center justify-center overflow-hidden">
      <section
        className="relative flex gap-8"
        style={{
          transform: `rotateY(${scrollValue}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {data.map((item, index) => (
          <div
            key={index}
            className="relative"
            style={{
              transform: `rotateY(${
                index * (360 / data.length)
              }deg) translateZ(300px)`,
            }}
          >
            <GalleryItem index={index} {...item} />
          </div>
        ))}
      </section>
    </div>
  );
};

export default Gallery;
