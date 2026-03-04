/**
 * GDS Driving School — Notification Service
 * ============================================
 * Firestore reads for `notifications` collection.
 * Web uses `targetAudience` field with values: 'students', 'instructors', 'all'
 * and queries with `in` operator to include role-specific + 'all' notifications.
 */

import { db } from '../config/firebase';
import { Collections, fromQuerySnapshot } from '../utils/mappers';
import type { Notification } from '../types';

/**
 * Map a user role to the targetAudience values that apply.
 * Web writes targetAudience as 'students' | 'instructors' | 'all'
 * and queries with `in` to include the role-specific value + 'all'.
 */
const getAudienceValues = (role: string): string[] => {
  switch (role) {
    case 'student':
      return ['students', 'all'];
    case 'instructor':
      return ['instructors', 'all'];
    case 'admin':
      return ['admins', 'all'];
    default:
      return [role, 'all'];
  }
};

/**
 * Get active notifications targeted at a specific role.
 * Matches web query: where('targetAudience', 'in', ['<role>s', 'all'])
 */
export const getNotificationsForRole = async (role: string): Promise<Notification[]> => {
  const snapshot = await db
    .collection(Collections.NOTIFICATIONS)
    .where('isActive', '==', true)
    .where('targetAudience', 'in', getAudienceValues(role))
    .orderBy('createdAt', 'desc')
    .get();
  return fromQuerySnapshot<Notification>(snapshot);
};

/**
 * Get active notifications by audience value(s).
 * Uses `in` operator to match web query pattern.
 */
export const getNotificationsByAudience = async (audience: string): Promise<Notification[]> => {
  const audienceValues = audience === 'all' ? [audience] : [audience, 'all'];
  const snapshot = await db
    .collection(Collections.NOTIFICATIONS)
    .where('isActive', '==', true)
    .where('targetAudience', 'in', audienceValues)
    .orderBy('createdAt', 'desc')
    .get();
  return fromQuerySnapshot<Notification>(snapshot);
};

/**
 * Real-time listener for role-targeted notifications.
 * Matches web query: where('targetAudience', 'in', ['<role>s', 'all'])
 */
export const onNotifications = (
  role: string,
  callback: (notifications: Notification[]) => void,
): (() => void) => {
  return db
    .collection(Collections.NOTIFICATIONS)
    .where('isActive', '==', true)
    .where('targetAudience', 'in', getAudienceValues(role))
    .orderBy('createdAt', 'desc')
    .onSnapshot(
      (snapshot) => callback(fromQuerySnapshot<Notification>(snapshot)),
    );
};
