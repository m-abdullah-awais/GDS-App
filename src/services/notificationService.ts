/**
 * GDS Driving School — Notification Service
 * ============================================
 * Firestore reads for `notifications` collection.
 */

import { db } from '../config/firebase';
import { Collections, fromQuerySnapshot } from '../utils/mappers';
import type { Notification } from '../types';

/**
 * Get active notifications targeted at a specific role.
 */
export const getNotificationsForRole = async (role: string): Promise<Notification[]> => {
  const snapshot = await db
    .collection(Collections.NOTIFICATIONS)
    .where('isActive', '==', true)
    .where('targetRole', '==', role)
    .orderBy('createdAt', 'desc')
    .get();
  return fromQuerySnapshot<Notification>(snapshot);
};

/**
 * Get active notifications (alternate field name `targetAudience`).
 */
export const getNotificationsByAudience = async (audience: string): Promise<Notification[]> => {
  const snapshot = await db
    .collection(Collections.NOTIFICATIONS)
    .where('isActive', '==', true)
    .where('targetAudience', '==', audience)
    .orderBy('createdAt', 'desc')
    .get();
  return fromQuerySnapshot<Notification>(snapshot);
};

/**
 * Real-time listener for role-targeted notifications.
 */
export const onNotifications = (
  role: string,
  callback: (notifications: Notification[]) => void,
): (() => void) => {
  return db
    .collection(Collections.NOTIFICATIONS)
    .where('isActive', '==', true)
    .where('targetRole', '==', role)
    .orderBy('createdAt', 'desc')
    .onSnapshot(
      (snapshot) => callback(fromQuerySnapshot<Notification>(snapshot)),
    );
};
