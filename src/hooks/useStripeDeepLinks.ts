/**
 * useStripeDeepLinks
 * ===================
 * Listens for Stripe Connect deep-link callbacks and takes appropriate action.
 *
 * Primary flow: The InAppBrowser opens Stripe onboarding; after the user
 * closes the browser, the screens check account status via getAccountStatus().
 * This hook serves as a fallback for cases where the system browser is used
 * and the app receives a deep link callback.
 *
 * Deep links handled:
 *   gds://stripe/return   — user completed (or exited) Stripe onboarding
 *   gds://stripe/refresh  — onboarding link expired, generate a new one
 *   gds://payment/success — payment completed (student flow)
 */

import { useEffect, useRef } from 'react';
import { Linking } from 'react-native';
import { getAccountStatus } from '../services/stripeConnectService';

const STRIPE_RETURN_PATH = 'stripe/return';
const STRIPE_REFRESH_PATH = 'stripe/refresh';

/**
 * Hook that subscribes to incoming deep links and handles
 * Stripe Connect return / refresh callbacks as a fallback.
 *
 * - On `stripe/return`: checks account status (side-effect updates Firestore).
 * - On `stripe/refresh`: checks account status (the onboarding is handled
 *   by the web refresh page when using HTTPS URLs).
 */
export const useStripeDeepLinks = () => {
  const handlingRef = useRef(false);

  useEffect(() => {
    const handleUrl = async (url: string) => {
      if (handlingRef.current) return;

      try {
        // Normalise: strip scheme, leading slashes
        const path = url.replace(/^gds:\/\//, '').replace(/^\/+/, '');

        if (path.startsWith(STRIPE_RETURN_PATH) || path.startsWith(STRIPE_REFRESH_PATH)) {
          handlingRef.current = true;

          // Wait briefly for Stripe webhook to process
          await new Promise<void>(resolve => setTimeout(resolve, 3000));

          // Check account status — the cloud function also updates
          // the Firestore user doc, so the real-time listener on
          // PendingApproval will pick up the change automatically.
          try {
            await getAccountStatus();
          } catch {
            // Non-critical — Firestore listener will catch up
          }

          handlingRef.current = false;
        }
      } catch (err) {
        console.warn('[StripeDeepLinks] handleUrl error:', err);
        handlingRef.current = false;
      }
    };

    // Handle deep link that launched / resumed the app
    const handleInitialUrl = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        await handleUrl(initialUrl);
      }
    };

    handleInitialUrl();

    // Listen for deep links while app is running
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleUrl(url);
    });

    return () => subscription.remove();
  }, []);
};
