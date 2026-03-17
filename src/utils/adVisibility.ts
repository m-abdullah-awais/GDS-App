/**
 * GDS Driving School — Ad Visibility Helpers
 * =============================================
 * Determines whether an offer should be shown to a given user
 * based on role, postcode, date range, and active status.
 */

import type { Ad } from '../types/ad';

export type AdAudienceRole = 'student' | 'instructor' | 'admin';

function normalizePostcode(value: string): string {
  return value.replace(/\s+/g, '').toUpperCase();
}

export function isAdDateValid(ad: Ad, now = new Date()): boolean {
  const start = ad.startDate ? new Date(ad.startDate) : null;
  const end = ad.endDate ? new Date(ad.endDate) : null;

  if (start && now < start) return false;
  if (end && now > end) return false;
  return true;
}

export function isAdVisibleToRole(ad: Ad, role?: AdAudienceRole): boolean {
  if (role === 'admin') return true;

  const showToStudents = ad.showToStudents !== false;
  const showToInstructors = ad.showToInstructors !== false;

  if (role === 'student') return showToStudents;
  if (role === 'instructor') return showToInstructors;

  return showToStudents || showToInstructors;
}

export function isAdVisibleForPostcode(ad: Ad, postcode?: string): boolean {
  if (!ad.postcodes || ad.postcodes.length === 0) return false;
  if (!postcode) return false;

  const userPostcodeNormalized = normalizePostcode(postcode);
  return ad.postcodes.some((offerPostcode) => {
    const offerPostcodeNormalized = normalizePostcode(offerPostcode);
    return (
      offerPostcodeNormalized === userPostcodeNormalized ||
      userPostcodeNormalized.startsWith(offerPostcodeNormalized) ||
      offerPostcodeNormalized.startsWith(userPostcodeNormalized)
    );
  });
}

export function getVisibleAds(
  ads: Ad[],
  options: { role?: AdAudienceRole; postcode?: string; includeInactive?: boolean } = {},
): Ad[] {
  const { role, postcode, includeInactive = false } = options;

  const roleVisible = ads.filter((ad) => {
    if (!includeInactive && !ad.active) return false;
    if (!isAdDateValid(ad)) return false;
    return isAdVisibleToRole(ad, role);
  });

  const postcodeVisible = roleVisible.filter((ad) => isAdVisibleForPostcode(ad, postcode));
  return postcodeVisible;
}
