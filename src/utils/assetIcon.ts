/**
 * 자산 아이콘 URL.
 * 현재는 공개 CDN(cryptocurrency-icons)을 쓰고,
 * 이후 실지갑/거래소 연동 시 자체 에셋 맵으로 교체하면 된다.
 */
export function getAssetIconUrl(asset: string): string {
  const symbol = asset.trim().toLowerCase();
  // USDT 등 stable은 아이콘 패키지 심볼이 다를 수 있어 별도 매핑
  const mapped =
    symbol === 'usdt'
      ? 'usdt'
      : symbol === 'usdc'
        ? 'usdc'
        : symbol === 'busd'
          ? 'busd'
          : symbol;

  return `https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/32/color/${mapped}.png`;
}

export function getAssetFallbackLetter(asset: string): string {
  return (asset.trim()[0] ?? '?').toUpperCase();
}
