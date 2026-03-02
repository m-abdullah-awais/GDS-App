/**
 * GDS Driving School — Payment Service
 * ========================================
 * Cloud Functions callable wrappers for Stripe payment flows.
 * Uses existing backend functions — no new functions created.
 */

import { callable } from '../config/firebase';
import { Linking } from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export interface CheckoutStatusResponse {
  status: string;
  customerEmail?: string;
  amountTotal?: number;
  metadata?: Record<string, string>;
}

export interface PaymentIntentResponse {
  clientSecret: string;
}

export interface PaymentSuccessResponse {
  success: boolean;
  hours?: number;
  message?: string;
}

export interface PayoutResponse {
  success: boolean;
  payoutId?: string;
  method?: string;
  status?: string;
  message?: string;
  stripeTransferId?: string;
}

// ─── Checkout Flow (primary payment path) ─────────────────────────────────────

/**
 * Create a Stripe Checkout session via Cloud Function.
 * Returns session ID and hosted checkout URL.
 */
export const createCheckoutSession = async (data: {
  packageId: string;
  instructorId: string;
  successUrl?: string;
  cancelUrl?: string;
}): Promise<CheckoutSessionResponse> => {
  const fn = callable('createCheckoutSession');
  const result = await fn({
    packageId: data.packageId,
    instructorId: data.instructorId,
    successUrl: data.successUrl ?? 'gds://payment/success',
    cancelUrl: data.cancelUrl ?? 'gds://payment/cancel',
  });
  return result.data as CheckoutSessionResponse;
};

/**
 * Verify checkout session status and trigger fallback fulfillment.
 */
export const getCheckoutSession = async (sessionId: string): Promise<CheckoutStatusResponse> => {
  const fn = callable('getCheckoutSession');
  const result = await fn({ sessionId });
  return result.data as CheckoutStatusResponse;
};

/**
 * Open Stripe Checkout in the device's browser.
 * The browser will redirect back to the app via deep link on completion.
 */
export const openCheckoutInBrowser = async (url: string): Promise<void> => {
  // Try InAppBrowser first, fall back to system browser
  try {
    const InAppBrowser = require('react-native-inappbrowser-reborn').default;
    if (await InAppBrowser.isAvailable()) {
      await InAppBrowser.open(url, {
        dismissButtonStyle: 'cancel',
        preferredBarTintColor: '#1A1A2E',
        preferredControlTintColor: '#FFFFFF',
        readerMode: false,
        animated: true,
        modalEnabled: true,
        enableBarCollapsing: false,
        // Android
        showTitle: true,
        enableUrlBarHiding: true,
        enableDefaultShare: false,
        forceCloseOnRedirection: true,
      });
      return;
    }
  } catch {
    // InAppBrowser not available, fall through
  }

  // Fallback: system browser
  await Linking.openURL(url);
};

// ─── Payment Intent Flow (alternative card flow) ──────────────────────────────

/**
 * Create a Payment Intent via Cloud Function.
 */
export const createPaymentIntent = async (data: {
  packageId: string;
  amount: number;
  instructorId: string;
}): Promise<PaymentIntentResponse> => {
  const fn = callable('createPaymentIntent');
  const result = await fn(data);
  return result.data as PaymentIntentResponse;
};

/**
 * Handle payment success (verify + fulfill).
 */
export const handlePaymentSuccess = async (
  paymentIntentId: string,
): Promise<PaymentSuccessResponse> => {
  const fn = callable('handlePaymentSuccess');
  const result = await fn({ paymentIntentId });
  return result.data as PaymentSuccessResponse;
};

// ─── Admin Payout ─────────────────────────────────────────────────────────────

/**
 * Process manual instructor payout (admin only).
 */
export const processInstructorPayout = async (data: {
  instructorId: string;
  amount: number;
}): Promise<PayoutResponse> => {
  const fn = callable('processInstructorPayout');
  const result = await fn(data);
  return result.data as PayoutResponse;
};
