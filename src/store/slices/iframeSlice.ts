import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IframeState {
  lastUrl: string;
  isLoaded: boolean;
  hasError: boolean;
}

const initialState: IframeState = {
  lastUrl: 'http://127.0.0.1:8501/?embedded=true',
  isLoaded: false,
  hasError: false,
};

const iframeSlice = createSlice({
  name: 'iframe',
  initialState,
  reducers: {
    setLastUrl: (state, action: PayloadAction<string>) => {
      state.lastUrl = action.payload;
    },
    setIframeLoaded: (state, action: PayloadAction<boolean>) => {
      state.isLoaded = action.payload;
    },
    setIframeError: (state, action: PayloadAction<boolean>) => {
      state.hasError = action.payload;
    },
  },
});

export const { setLastUrl, setIframeLoaded, setIframeError } =
  iframeSlice.actions;
export default iframeSlice.reducer;
