/**
 * /anomaly/filter API 응답 타입
 * - 서버 model: com.bin.anomaly.filter.model.VenueResponse / InstrumentResponse
 */

export interface VenueResponse {
  venueId: number;
  venueCode: string;
  venueType: string;
  timezone: string;
  isActive: boolean;
  metadata: string;
  createDatetime: string; // OffsetDateTime ISO 8601
}

export interface InstrumentResponse {
  instrumentId: number;
  symbol: string;
  assetClass: string;
  baseAsset: string;
  quoteAsset: string;
  currency: string;
  country: string;
  mic: string;
  sessionCalendar: string;
  isActive: boolean;
  metadata: string;
  createDatetime: string; // OffsetDateTime ISO 8601
  modifyDatetime: string; // OffsetDateTime ISO 8601
}

