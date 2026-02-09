import apiClient from '@/utils/apiClient';
import type { InstrumentResponse, VenueResponse } from '@/types/FilterTypes';

export const filterService = {
  getVenues: async (params?: { venueType?: string }): Promise<VenueResponse[]> => {
    const response = await apiClient.get<VenueResponse[]>('/anomaly/filter/venues', { params });
    return response.data;
  },

  getInstruments: async (params?: { assetClass?: string; symbol?: string }): Promise<InstrumentResponse[]> => {
    const response = await apiClient.get<InstrumentResponse[]>('/anomaly/filter/instruments', { params });
    return response.data;
  },
};

export default filterService;

