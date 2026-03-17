/**
 * GDS Driving School — Offers Redux Slice
 * ==========================================
 * Manages the list of exclusive offers fetched from Firestore.
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Ad } from '../../types/ad';

export interface OffersState {
  ads: Ad[];
  loading: boolean;
  error: string | null;
}

const initialState: OffersState = {
  ads: [],
  loading: false,
  error: null,
};

const offersSlice = createSlice({
  name: 'offers',
  initialState,
  reducers: {
    setAds(state, action: PayloadAction<Ad[]>) {
      state.ads = action.payload;
      state.loading = false;
      state.error = null;
    },
    setOffersLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setOffersError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.loading = false;
    },
    clearOffers(state) {
      state.ads = [];
      state.loading = false;
      state.error = null;
    },
  },
});

export const { setAds, setOffersLoading, setOffersError, clearOffers } = offersSlice.actions;
export default offersSlice.reducer;
