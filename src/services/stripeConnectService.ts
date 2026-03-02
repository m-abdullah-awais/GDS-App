/**
 * GDS Driving School — Stripe Connect Service
 * ===============================================
 * Cloud Functions callable wrappers for instructor Stripe onboarding.
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
  status?: string;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  requirements?: {
    currentlyDue?: string[];
    eventuallyDue?: string[];
    pastDue?: string[];
  };
  detailsSubmitted?: boolean;
}

export interface AccountLinkResponse {
  success: boolean;
  onboardingUrl: string;
  message?: string;
}

// ─── Callable Wrappers ───────────────────────────────────────────────────────

/**
 * Create or reuse a Stripe Express Connect account + get onboarding link.
 * (Instructor only)
 */
export const createConnectedAccount = async (data?: {
  refreshUrl?: string;
  returnUrl?: string;
}): Promise<ConnectedAccountResponse> => {
  const fn = callable('createConnectedAccount');
  const result = await fn({
    refreshUrl: data?.refreshUrl ?? 'gds://stripe/refresh',
    returnUrl: data?.returnUrl ?? 'gds://stripe/return',
  });
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
 * (Instructor only)
 */
export const refreshAccountLink = async (data?: {
  refreshUrl?: string;
  returnUrl?: string;
}): Promise<AccountLinkResponse> => {
  const fn = callable('refreshAccountLink');
  const result = await fn({
    refreshUrl: data?.refreshUrl ?? 'gds://stripe/refresh',
    returnUrl: data?.returnUrl ?? 'gds://stripe/return',
  });
  return result.data as AccountLinkResponse;
};
