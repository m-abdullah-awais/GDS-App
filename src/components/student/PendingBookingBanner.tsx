/**
 * GDS Driving School — PendingBookingBanner
 * ============================================
 * Shows instructor-initiated booking requests that need student response.
 * Mirrors web's StudentPendingRequests / attention box in StudentLiveTimetable.
 *
 * Fetches from `bookingRequests` where:
 *   - studentId matches current user
 *   - requestedBy === 'instructor'
 *   - status in ['pending', 'amendment_pending']
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';
import { db } from '../../config/firebase';
import { firebaseAuth } from '../../config/firebase';
import { collection, query, where, getDocs, onSnapshot } from '@react-native-firebase/firestore';
import { Collections, updateDoc, createDoc, toDate } from '../../utils/mappers';

interface PendingRequest {
  id: string;
  instructorId: string;
  instructorName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: 'pending' | 'amendment_pending';
  week: number;
  day: number;
}

const PendingBookingBanner = () => {
  const { theme } = useTheme();
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const currentUserId = firebaseAuth.currentUser?.uid || '';

  useEffect(() => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }

    // Real-time listener for instructor-initiated pending requests
    const q = query(
      collection(db, Collections.BOOKING_REQUESTS),
      where('studentId', '==', currentUserId),
      where('status', 'in', ['pending', 'amendment_pending']),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        // Use start of today so we don't filter out today's bookings
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const pending: PendingRequest[] = [];

        for (const doc of snapshot.docs) {
          const data = doc.data();
          // Only show instructor-initiated requests
          if (data.requestedBy !== 'instructor') continue;

          // Only skip bookings from before today (keep today's)
          const requestDate = toDate(data.date);
          if (requestDate && requestDate < startOfToday) continue;

          pending.push({
            id: doc.id,
            instructorId: data.instructorId || data.instructor_id || '',
            instructorName: data.instructorName || 'Instructor',
            date: requestDate
              ? requestDate.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
              : 'Unknown',
            startTime: data.startTime || '',
            endTime: data.endTime || '',
            duration: data.duration || 1,
            status: data.status,
            week: data.week || 0,
            day: data.day || 0,
          });
        }

        // Sort by date ascending
        pending.sort((a, b) => a.date.localeCompare(b.date));
        setRequests(pending);
        setLoading(false);
      },
      (_error) => {
        if (__DEV__) console.warn('[PendingBookingBanner] Listener error:', _error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [currentUserId]);

  const handleAccept = useCallback(async (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    setActionLoading(requestId);
    try {
      // Update booking request status
      await updateDoc(Collections.BOOKING_REQUESTS, requestId, {
        status: 'accepted',
        respondedAt: new Date().toISOString(),
      });

      // Send notification to instructor
      let studentName = '';
      try {
        const store = require('../../store').default;
        studentName = store?.getState?.()?.auth?.profile?.full_name || '';
      } catch (_e) {}

      await createDoc(Collections.MESSAGES, {
        sender_id: currentUserId,
        sender_name: studentName,
        sender_role: 'student',
        receiver_id: request.instructorId,
        receiver_name: request.instructorName,
        receiver_role: 'instructor',
        content: `I have accepted your lesson request for ${request.date} at ${request.startTime}.`,
        read: false,
      });
    } catch (err) {
      if (__DEV__) console.error('[PendingBookingBanner] Accept failed:', err);
    } finally {
      setActionLoading(null);
    }
  }, [requests, currentUserId]);

  const handleDecline = useCallback(async (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    setActionLoading(requestId);
    try {
      await updateDoc(Collections.BOOKING_REQUESTS, requestId, {
        status: 'declined',
        respondedAt: new Date().toISOString(),
      });

      let studentName = '';
      try {
        const store = require('../../store').default;
        studentName = store?.getState?.()?.auth?.profile?.full_name || '';
      } catch (_e) {}

      await createDoc(Collections.MESSAGES, {
        sender_id: currentUserId,
        sender_name: studentName,
        sender_role: 'student',
        receiver_id: request.instructorId,
        receiver_name: request.instructorName,
        receiver_role: 'instructor',
        content: `I have declined your lesson request for ${request.date} at ${request.startTime}.`,
        read: false,
      });
    } catch (err) {
      if (__DEV__) console.error('[PendingBookingBanner] Decline failed:', err);
    } finally {
      setActionLoading(null);
    }
  }, [requests, currentUserId]);

  if (loading || requests.length === 0) return null;

  return (
    <View style={styles(theme).container}>
      <View style={styles(theme).header}>
        <Ionicons name="notifications-outline" size={18} color={theme.colors.warning} />
        <Text style={styles(theme).headerText}>
          {requests.length} Pending Request{requests.length !== 1 ? 's' : ''}
        </Text>
      </View>
      {requests.map(req => (
        <View key={req.id} style={styles(theme).card}>
          <View style={styles(theme).cardContent}>
            <Text style={styles(theme).cardTitle}>
              {req.status === 'amendment_pending' ? 'Amendment' : 'Booking'} from {req.instructorName}
            </Text>
            <Text style={styles(theme).cardMeta}>
              {req.date} at {req.startTime} – {req.endTime} ({req.duration}h)
            </Text>
          </View>
          <View style={styles(theme).actions}>
            {actionLoading === req.id ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <>
                <Pressable
                  style={styles(theme).acceptBtn}
                  onPress={() => handleAccept(req.id)}>
                  <Ionicons name="checkmark" size={18} color="#fff" />
                </Pressable>
                <Pressable
                  style={styles(theme).declineBtn}
                  onPress={() => handleDecline(req.id)}>
                  <Ionicons name="close" size={18} color="#fff" />
                </Pressable>
              </>
            )}
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      marginHorizontal: theme.spacing.md,
      marginTop: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.warning,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      marginBottom: theme.spacing.sm,
    },
    headerText: {
      ...theme.typography.h4,
      color: theme.colors.warning,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.sm,
      marginTop: theme.spacing.xs,
    },
    cardContent: {
      flex: 1,
    },
    cardTitle: {
      ...theme.typography.bodySmall,
      color: theme.colors.textPrimary,
      fontWeight: '600',
    },
    cardMeta: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginTop: 2,
    },
    actions: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
      marginLeft: theme.spacing.sm,
    },
    acceptBtn: {
      backgroundColor: theme.colors.success,
      borderRadius: theme.borderRadius.sm,
      padding: theme.spacing.xs,
    },
    declineBtn: {
      backgroundColor: theme.colors.error,
      borderRadius: theme.borderRadius.sm,
      padding: theme.spacing.xs,
    },
  });

export default PendingBookingBanner;
