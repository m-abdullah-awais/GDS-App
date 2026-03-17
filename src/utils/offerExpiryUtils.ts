/**
 * GDS Driving School — Offer Expiry Utilities
 * ===============================================
 * Colour-tiered expiry info for offer badges.
 */

export type ExpiryTier = 'red' | 'yellow' | 'green';

export interface OfferExpiryInfo {
  daysRemaining: number;
  label: string;
  shortLabel: string;
  tier: ExpiryTier;
}

export function getOfferExpiryInfo(endDate?: string): OfferExpiryInfo | null {
  if (!endDate) return null;

  const now = new Date();
  const end = new Date(endDate);
  const daysRemaining = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysRemaining <= 0) {
    return { daysRemaining: 0, label: 'Expired', shortLabel: 'Expired', tier: 'red' };
  }
  if (daysRemaining <= 7) {
    return { daysRemaining, label: `${daysRemaining}d left`, shortLabel: `${daysRemaining}d`, tier: 'red' };
  }
  if (daysRemaining <= 30) {
    return { daysRemaining, label: `${daysRemaining}d left`, shortLabel: `${daysRemaining}d`, tier: 'yellow' };
  }
  return { daysRemaining, label: `${daysRemaining}d left`, shortLabel: `${daysRemaining}d`, tier: 'green' };
}

export function formatExpiryDate(endDate?: string): string | null {
  if (!endDate) return null;
  return new Date(endDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
