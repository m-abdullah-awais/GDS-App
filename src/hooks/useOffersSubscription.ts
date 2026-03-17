/**
 * GDS Driving School — Offers Real-time Subscription Hook
 * =========================================================
 * Subscribes to the Firestore `ads` collection and keeps
 * the Redux `offers` slice in sync. Attach this hook once
 * at the app root (AppContent) so every screen reads from
 * the same live data.
 */

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { subscribeToAds } from '../services/offersService';
import { setAds, setOffersLoading, setOffersError } from '../store/offers/offersSlice';
import type { RootState } from '../store';

export function useOffersSubscription() {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    // Only subscribe when user is authenticated
    if (!user) return;

    dispatch(setOffersLoading(true));

    const unsubscribe = subscribeToAds(
      (ads) => {
        dispatch(setAds(ads));
      },
      (error) => {
        console.error('[Offers] Subscription error:', error);
        dispatch(setOffersError('Failed to load offers'));
      },
    );

    return () => {
      unsubscribe();
    };
  }, [dispatch, user]);
}
