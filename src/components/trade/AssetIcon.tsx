import React, { useState } from 'react';
import { getAssetFallbackLetter, getAssetIconUrl } from '@/utils/assetIcon';

interface AssetIconProps {
  asset: string;
  size?: number;
  className?: string;
}

/** 자산 심볼 아이콘 — CDN 실패 시 이니셜 뱃지 */
const AssetIcon: React.FC<AssetIconProps> = ({ asset, size = 20, className = '' }) => {
  const [failed, setFailed] = useState(false);
  const letter = getAssetFallbackLetter(asset);

  if (failed) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-full bg-[#2b3139] text-[#f0b90b] font-semibold flex-shrink-0 ${className}`}
        style={{ width: size, height: size, fontSize: Math.max(9, size * 0.45) }}
        title={asset}
      >
        {letter}
      </span>
    );
  }

  return (
    <img
      src={getAssetIconUrl(asset)}
      alt={asset}
      width={size}
      height={size}
      className={`rounded-full flex-shrink-0 bg-[#1e2329] ${className}`}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
};

export default AssetIcon;
