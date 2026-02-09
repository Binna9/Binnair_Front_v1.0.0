import { createSlice } from '@reduxjs/toolkit';

type UiState = {
  apiInFlight: number;
  routePending: boolean;
};

const initialState: UiState = {
  apiInFlight: 0,
  routePending: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    apiRequestStarted(state) {
      state.apiInFlight += 1;
    },
    apiRequestFinished(state) {
      state.apiInFlight = Math.max(0, state.apiInFlight - 1);
    },
    routeTransitionStarted(state) {
      state.routePending = true;
    },
    routeTransitionFinished(state) {
      state.routePending = false;
    },
    resetGlobalLoading(state) {
      state.apiInFlight = 0;
      state.routePending = false;
    },
  },
});

export const {
  apiRequestStarted,
  apiRequestFinished,
  routeTransitionStarted,
  routeTransitionFinished,
  resetGlobalLoading,
} = uiSlice.actions;

export default uiSlice.reducer;

