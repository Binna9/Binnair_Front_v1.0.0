import { useState } from 'react';

const options = [
  {
    title: 'Blonkisoaz',
    subtitle: 'Omuke trughte a otufta',
    icon: 'fas fa-walking',
    background:
      'https://66.media.tumblr.com/6fb397d822f4f9f4596dff2085b18f2e/tumblr_nzsvb4p6xS1qho82wo1_1280.jpg',
  },
  {
    title: 'Oretemauw',
    subtitle: 'Omuke trughte a otufta',
    icon: 'fas fa-snowflake',
    background:
      'https://66.media.tumblr.com/8b69cdde47aa952e4176b4200052abf4/tumblr_o51p7mFFF21qho82wo1_1280.jpg',
  },
  {
    title: 'Iteresuselle',
    subtitle: 'Omuke trughte a otufta',
    icon: 'fas fa-tree',
    background:
      'https://66.media.tumblr.com/5af3f8303456e376ceda1517553ba786/tumblr_o4986gakjh1qho82wo1_1280.jpg',
  },
  {
    title: 'Idiefe',
    subtitle: 'Omuke trughte a otufta',
    icon: 'fas fa-tint',
    background:
      'https://66.media.tumblr.com/5516a22e0cdacaa85311ec3f8fd1e9ef/tumblr_o45jwvdsL11qho82wo1_1280.jpg',
  },
  {
    title: 'Inatethi',
    subtitle: 'Omuke trughte a otufta',
    icon: 'fas fa-sun',
    background:
      'https://66.media.tumblr.com/f19901f50b79604839ca761cd6d74748/tumblr_o65rohhkQL1qho82wo1_1280.jpg',
  },
];

export default function OptionsList() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="flex justify-center items-center h-screen ">
      <div className="flex space-x-4 w-full max-w-5xl h-[500px]">
        {options.map((option, index) => (
          <div
            key={index}
            className={`relative flex-grow cursor-pointer overflow-hidden transition-all duration-500 rounded-2xl shadow-lg
              ${
                activeIndex === index
                  ? 'flex-[5] max-w-[600px]'
                  : 'flex-1 max-w-[100px]'
              }`}
            style={{
              backgroundImage: `url(${option.background})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            onClick={() => setActiveIndex(index)}
          >
            <div className="absolute inset-0 bg-opacity-30 transition-all duration-500"></div>
            <div className="absolute bottom-4 left-4 flex items-center space-x-3">
              <div className="w-10 h-10 flex items-center justify-center bg-white text-gray-800 rounded-full">
                <i className={option.icon}></i>
              </div>
              <div className="text-white">
                <div className="text-lg font-bold">{option.title}</div>
                <div className="text-sm opacity-80">{option.subtitle}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
