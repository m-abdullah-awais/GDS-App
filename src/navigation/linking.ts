/**
 * GDS Driving School — Deep Linking Configuration
 * ==================================================
 * Handles deep links for Stripe payment callbacks and other flows.
 *
 * URL Scheme: gds://
 *
 * Registered links:
 *   gds://payment/success?session_id=xxx
 *   gds://payment/cancel
 *   gds://stripe/return     (Stripe Connect onboarding return)
 *   gds://stripe/refresh    (Stripe Connect onboarding refresh)
 */

import type { LinkingOptions } from '@react-navigation/native';

/**
 * React Navigation linking config.
 *
 * This maps deep-link URLs to navigator routes.
 * The actual payment handling is done in paymentService.handlePaymentDeepLink().
 */
export const linkingConfig: LinkingOptions<ReactNavigation.RootParamList> = {
  prefixes: ['gds://'],
  config: {
    // Deep links are primarily intercepted by the useStripeDeepLinks hook
    // and paymentService.ts via Linking.addEventListener.
    // The screen mappings below serve as fallback route targets.
    screens: {},
  },
};

export const DEEP_LINK_PREFIX = 'gds://';

export const DeepLinkPaths = {
  PAYMENT_SUCCESS: 'payment/success',
  PAYMENT_CANCEL: 'payment/cancel',
  STRIPE_RETURN: 'stripe/return',
  STRIPE_REFRESH: 'stripe/refresh',
} as const;

/**
 * Build a full deep-link URL.
 */
export const buildDeepLink = (
  path: string,
  params?: Record<string, string>,
): string => {
  const url = `${DEEP_LINK_PREFIX}${path}`;
  if (!params) return url;
  const qs = new URLSearchParams(params).toString();
  return `${url}?${qs}`;
};
