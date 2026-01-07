import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

const SubscriptionCard = ({
  title,
  price,
  description,
  features,
  buttonText,
  isPopular,
  gradientColors,
}) => {
  return (
    <div className="relative w-full sm:w-auto max-w-sm">
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white py-1 px-4 rounded-full text-sm font-bold shadow-lg z-20">
          Best Plan
        </div>
      )}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradientColors} opacity-30 blur-2xl rounded-lg scale-105`}
      ></div>
      <div className="relative z-10 bg-gray-900 rounded-xl overflow-hidden border border-gray-700 shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(56,189,248,0.3)]">
        <div className="p-6">
          <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
          <div className="flex items-baseline mb-4">
            <span className="text-4xl font-extrabold text-white">{price}</span>
            {price !== '무료' && (
              <span className="text-gray-400 ml-1">/월</span>
            )}
          </div>
          <p className="text-gray-300 mb-6">{description}</p>

          <div className="space-y-3 mb-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start">
                <CheckCircleIcon className="w-5 h-5 text-cyan-400 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">{feature}</span>
              </div>
            ))}
          </div>

          <button className="w-full py-3 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl">
            {buttonText}
            <ArrowTopRightOnSquareIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCard;
