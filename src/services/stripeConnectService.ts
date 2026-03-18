/**
 * GDS Driving School — Stripe Connect Service
 * ===============================================
 * Cloud Functions callable wrappers for instructor Stripe onboarding.
 *
 * Mobile flow:
 * 1. Call createConnectedAccount() — cloud function creates Stripe Express
 *    account and returns an onboarding URL hosted on stripe.com.
 * 2. Open the onboarding URL in InAppBrowser.
 * 3. User completes Stripe KYC/verification on stripe.com.
 * 4. Stripe redirects to the web return URL (handled by cloud function defaults).
 * 5. User closes InAppBrowser (back button / X).
 * 6. App calls getAccountStatus() to sync Firestore + check verification state.
 *
 * NOTE: We do NOT pass returnUrl/refreshUrl from mobile — the cloud function
 * uses its own default web URLs. The mobile app doesn't need those pages;
 * it detects onboarding completion via getAccountStatus() after the browser closes.
 */

import { callable } from '../config/firebase';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ConnectedAccountResponse {
  success: boolean;
  accountId: string;
  onboardingUrl: string;
  message?: string;
}

export interface AccountStatusResponse {
  success: boolean;
  accountId?: string;
  status?: 'complete' | 'pending' | 'restricted' | 'not_created';
  detailsSubmitted?: boolean;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  requirements?: {
    currentlyDue?: string[];
    eventuallyDue?: string[];
    pastDue?: string[];
    pendingVerification?: string[];
  };
  capabilities?: {
    transfers?: 'active' | 'inactive' | 'pending';
  };
  message?: string;
}

export interface AccountLinkResponse {
  success: boolean;
  onboardingUrl: string;
  message?: string;
}

// ─── Callable Wrappers ───────────────────────────────────────────────────────

/**
 * Create or reuse a Stripe Express Connect account + get onboarding link.
 * Does NOT pass returnUrl/refreshUrl — lets the cloud function use its
 * default web app URLs (required by Stripe for valid HTTPS redirects).
 * (Instructor only)
 */
export const createConnectedAccount = async (): Promise<ConnectedAccountResponse> => {
  const fn = callable('createConnectedAccount');
  const result = await fn({});
  return result.data as ConnectedAccountResponse;
};

/**
 * Get current Stripe account verification/capability status.
 * Syncs `users.stripeAccountStatus` as a side effect.
 * (Instructor only)
 */
export const getAccountStatus = async (): Promise<AccountStatusResponse> => {
  const fn = callable('getAccountStatus');
  const result = await fn({});
  return result.data as AccountStatusResponse;
};

/**
 * Generate a fresh Stripe onboarding link for an existing account.
 * Does NOT pass returnUrl/refreshUrl — uses cloud function defaults.
 * (Instructor only)
 */
export const refreshAccountLink = async (): Promise<AccountLinkResponse> => {
  const fn = callable('refreshAccountLink');
  const result = await fn({});
  return result.data as AccountLinkResponse;
};
