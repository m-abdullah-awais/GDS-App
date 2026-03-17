/**
 * GDS Driving School — Firestore Mapper Utilities
 * ==================================================
 * Handles conversion between Firestore documents and app domain types.
 *
 * Key responsibilities:
 * - Attach document ID to data
 * - Normalize timestamps (Timestamp | Date | string → consistent output)
 * - Write both snake_case and camelCase field variants where backend expects them
 * - serverTimestamp() injection on create/update
 */

import {
  serverTimestamp as firestoreServerTimestamp,
  collection as firestoreCollection,
  doc as firestoreDoc,
  addDoc,
  setDoc as firestoreSetDoc,
  updateDoc as firestoreUpdateDoc,
  getDoc as firestoreGetDoc,
} from '@react-native-firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { db } from '../config/firebase';

// ─── Timestamp Helpers ────────────────────────────────────────────────────────

/** Convert any timestamp variant to JS Date. */
export const toDate = (
  value: FirebaseFirestoreTypes.Timestamp | Date | string | undefined | null,
): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  // Firestore Timestamp
  if (typeof (value as FirebaseFirestoreTypes.Timestamp).toDate === 'function') {
    return (value as FirebaseFirestoreTypes.Timestamp).toDate();
  }
  return null;
};

/** Convert any timestamp variant to ISO string. */
export const toISOString = (
  value: FirebaseFirestoreTypes.Timestamp | Date | string | undefined | null,
): string | null => {
  const d = toDate(value);
  return d ? d.toISOString() : null;
};

/**
 * Format a timestamp into a user-friendly date string for message screens.
 * - Today: "10:30 AM"
 * - Yesterday: "Yesterday"
 * - This week: "Mon", "Tue", etc.
 * - This year: "12 Mar"
 * - Older: "12 Mar 2025"
 */
export const formatMessageDate = (
  value: FirebaseFirestoreTypes.Timestamp | Date | string | undefined | null,
): string => {
  const d = toDate(value);
  if (!d) return '';

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Today: show time
  if (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  ) {
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }

  // Yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear()
  ) {
    return 'Yesterday';
  }

  // Within last 7 days: show day name
  if (diffDays < 7) {
    return d.toLocaleDateString('en-GB', { weekday: 'short' });
  }

  // Same year: "12 Mar"
  if (d.getFullYear() === now.getFullYear()) {
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }

  // Older: "12 Mar 2025"
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

/** Get Firestore server timestamp sentinel. */
export const serverTimestamp = () => firestoreServerTimestamp();

// ─── Document Snapshot Converter ──────────────────────────────────────────────

/**
 * Generic converter: extracts data + id from a Firestore DocumentSnapshot.
 *
 * Usage:
 * ```ts
 * const user = fromSnapshot<UserProfile>(snapshot);
 * ```
 */
export const fromSnapshot = <T extends { id: string }>(
  snapshot: FirebaseFirestoreTypes.DocumentSnapshot<any>,
): T | null => {
  if (!snapshot.exists) return null;
  const data = {
    id: snapshot.id,
    ...snapshot.data(),
  } as T;
  return data;
};

/**
 * Convert a QuerySnapshot to an array of typed documents.
 *
 * Usage:
 * ```ts
 * const bookings = fromQuerySnapshot<Booking>(querySnapshot);
 * ```
 */
export const fromQuerySnapshot = <T extends { id: string }>(
  snapshot: FirebaseFirestoreTypes.QuerySnapshot<any>,
): T[] => {
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as T[];
};

// ─── Dual-Name Writer Helpers ─────────────────────────────────────────────────
/**
 * For collections that use both snake_case and camelCase IDs,
 * this ensures both variants are written.
 */

export const withDualIds = (
  studentId: string,
  instructorId: string,
): Record<string, string> => ({
  studentId,
  student_id: studentId,
  instructorId,
  instructor_id: instructorId,
});

/**
 * Resolve a user ID from a document that might use either naming.
 */
export const resolveStudentId = (doc: Record<string, unknown>): string | undefined =>
  (doc.studentId as string) || (doc.student_id as string) || undefined;

export const resolveInstructorId = (doc: Record<string, unknown>): string | undefined =>
  (doc.instructorId as string) || (doc.instructor_id as string) || undefined;

// ─── Collection References ───────────────────────────────────────────────────

/** Typed collection reference helper. */
export const collection = (path: string) => firestoreCollection(db, path);

/** Typed document reference helper. */
export const doc = (path: string, docId: string) => firestoreDoc(firestoreCollection(db, path), docId);

// ─── Common Write Helpers ─────────────────────────────────────────────────────

/**
 * Create a document with auto-generated ID, injecting server timestamp.
 * Returns the new document ID.
 */
export const createDoc = async (
  collectionPath: string,
  data: Record<string, unknown>,
): Promise<string> => {
  const ref = await addDoc(firestoreCollection(db, collectionPath), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

/**
 * Create or overwrite a document at a specific path with server timestamp.
 */
export const setDoc = async (
  collectionPath: string,
  docId: string,
  data: Record<string, unknown>,
  options: { merge?: boolean } = { merge: true },
): Promise<void> => {
  await firestoreSetDoc(
    firestoreDoc(firestoreCollection(db, collectionPath), docId),
    {
      ...data,
      updated_at: serverTimestamp(),
    },
    options,
  );
};

/**
 * Update specific fields on a document with server timestamp.
 */
export const updateDoc = async (
  collectionPath: string,
  docId: string,
  data: Record<string, unknown>,
): Promise<void> => {
  await firestoreUpdateDoc(
    firestoreDoc(firestoreCollection(db, collectionPath), docId),
    {
      ...data,
      updated_at: serverTimestamp(),
    },
  );
};

/**
 * Read a single document.
 */
export const getDoc = async <T extends { id: string }>(
  collectionPath: string,
  docId: string,
): Promise<T | null> => {
  const snapshot = await firestoreGetDoc(
    firestoreDoc(firestoreCollection(db, collectionPath), docId),
  );
  return fromSnapshot<T>(snapshot);
};

// ─── Collection Name Constants ────────────────────────────────────────────────

export const Collections = {
  USERS: 'users',
  INSTRUCTOR_APPLICATIONS: 'instructorApplications',
  PACKAGES: 'packages',
  PENDING_PACKAGES: 'pendingPackages',
  AVAILABLE_PACKAGES: 'availablePackages',
  STUDENT_INSTRUCTOR_REQUESTS: 'studentInstructorRequests',
  ASSIGNMENTS: 'assignments',
  BOOKING_REQUESTS: 'bookingRequests',
  BOOKINGS: 'bookings',
  TIMETABLES: 'timetables',
  FEEDBACK_PENDING: 'feedbackPending',
  FEEDBACK: 'feedback',
  LESSON_COMPLETIONS: 'lessonCompletions',
  LESSON_CANCELLATIONS: 'lessonCancellations',
  STUDENT_PROGRESS: 'studentProgress',
  STUDENT_ACHIEVEMENTS: 'studentAchievements',
  ACHIEVEMENT_NOTIFICATIONS: 'achievementNotifications',
  MESSAGES: 'messages',
  ADMIN_MESSAGES: 'adminMessages',
  SUGGESTIONS: 'suggestions',
  NOTIFICATIONS: 'notifications',
  ANALYTICS_EVENTS: 'analyticsEvents',
  PURCHASES: 'purchases',
  TRANSACTIONS: 'transactions',
  PAYMENTS: 'payments',
  INSTRUCTOR_PAYMENTS: 'instructorPayments',
  WEEKLY_INSTRUCTOR_PAYMENTS: 'weeklyInstructorPayments',
  PAYOUTS: 'payouts',
  SYSTEM_SETTINGS: 'systemSettings',
  ADMIN_DATA: 'adminData',
} as const;

// ─── View-Model Mapper Functions ──────────────────────────────────────────────
// These convert Firestore domain types to the store/screen view-model shapes.

import type {
  UserProfile,
  Booking,
  BookingRequest,
  AvailablePackage,
  Assignment,
  StudentInstructorRequest,
  Message,
  Timetable,
  PendingPackage,
  LessonCompletion,
  InstructorPayment,
  WeeklyInstructorPayment,
} from '../types';

import type {
  StudentInstructor,
  InstructorRequest,
  InstructorPackage,
  PurchasedPackage,
  AvailableSlot,
  BookedLesson,
} from '../store/student/types';

import type {
  AdminStudent,
  AdminInstructor,
  AdminPackage,
  Transaction as AdminTransaction,
  Conversation,
  DashboardStats,
} from '../store/admin/types';

/**
 * Map a UserProfile (Firestore) to StudentInstructor (student store view-model).
 */
export const mapUserToStudentInstructor = (
  user: UserProfile,
  reviewCount?: number,
  avgRating?: number,
): StudentInstructor => ({
  id: user.id || user.uid,
  name: user.full_name || '',
  avatar: user.profile_picture_url || user.profileImage || '',
  rating: avgRating || 0,
  reviewCount: reviewCount || 0,
  experience: user.about_me ? '5+ years' : 'New',
  city: user.address || '',
  bio: user.about_me || '',
  passRate: 0,
  transmissionType: (user.car_transmission as 'Manual' | 'Automatic' | 'Both') || 'Manual',
  coveredPostcodes: [],
  acceptingStudents: user.status === 'active',
  about: user.about_me || '',
  yearsExperience: 0,
  reviews: [],
});

/**
 * Map a StudentInstructorRequest (Firestore) to InstructorRequest (student store).
 */
export const mapRequestToInstructorRequest = (
  req: StudentInstructorRequest,
): InstructorRequest => ({
  id: req.id,
  instructorId: req.instructorId || req.instructor_id || '',
  status: (req.status === 'confirmed' ? 'accepted' : req.status) as 'pending' | 'accepted' | 'rejected',
  sentDate: req.createdAt
    ? toISOString(req.createdAt) || new Date().toISOString()
    : new Date().toISOString(),
  responseDate: req.acceptedAt
    ? toISOString(req.acceptedAt) || undefined
    : req.rejectedAt
    ? toISOString(req.rejectedAt) || undefined
    : undefined,
  message: undefined,
});

/**
 * Map an AvailablePackage (Firestore) to InstructorPackage (student store).
 */
export const mapAvailablePackageToInstructorPackage = (
  pkg: AvailablePackage,
): InstructorPackage => ({
  id: pkg.id,
  instructorId: pkg.instructorId,
  name: pkg.title || '',
  totalLessons: pkg.number_of_lessons || 0,
  price: pkg.price || 0,
  duration: `${pkg.number_of_lessons || 0} lessons`,
  description: pkg.description || '',
  popular: false,
});

/**
 * Map an Assignment (Firestore) to PurchasedPackage (student store).
 */
export const mapAssignmentToPurchasedPackage = (
  assignment: Assignment,
  packageInfo?: { name?: string; price?: number; totalLessons?: number },
): PurchasedPackage => ({
  id: assignment.id,
  packageId: assignment.package_id || '',
  instructorId: assignment.instructorId || assignment.instructor_id || '',
  packageName: packageInfo?.name || 'Driving Package',
  purchaseDate: assignment.assigned_at
    ? toISOString(assignment.assigned_at) || new Date().toISOString()
    : new Date().toISOString(),
  status: (assignment.remaining_hours || 0) > 0 ? 'active' : 'exhausted',
  lessonsUsed: (assignment.total_hours || 0) - (assignment.remaining_hours || 0),
  totalLessons: packageInfo?.totalLessons || assignment.total_hours || 0,
  price: packageInfo?.price || 0,
  duration: `${packageInfo?.totalLessons || assignment.total_hours || 0} lessons`,
});

/**
 * Map a Booking (Firestore) to BookedLesson (student store).
 */
export const mapBookingToBookedLesson = (
  booking: Booking,
  instructorName?: string,
  packageName?: string,
): BookedLesson => ({
  id: booking.id,
  instructorId: booking.instructorId || booking.instructor_id || '',
  instructorName: instructorName || booking.instructorName || '',
  instructorAvatar: '',
  packageId: booking.packageId || booking.package_id || '',
  packageName: packageName || '',
  date: booking.date
    ? toISOString(booking.date)?.split('T')[0] || ''
    : booking.scheduled_date
    ? toISOString(booking.scheduled_date)?.split('T')[0] || ''
    : '',
  time: booking.startTime || '',
  duration: booking.duration ? `${booking.duration} min` : booking.duration_hours ? `${booking.duration_hours}h` : '1h',
  status: booking.status as 'pending' | 'confirmed' | 'completed' | 'cancelled',
  location: undefined,
  cancelledBy: undefined,
});

/**
 * Map a Timetable (Firestore) to AvailableSlot[] (student store).
 * Updated to read web's `timeBlocks` format instead of legacy `slots`.
 */
export const mapTimetableToAvailableSlots = (
  timetable: Timetable,
  instructorId: string,
  bookedSlots?: Array<{ date: string; startTime: string }>,
): AvailableSlot[] => {
  const slots: AvailableSlot[] = [];

  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

  // Web format: timeBlocks array
  if (timetable.timeBlocks && Array.isArray(timetable.timeBlocks) && timetable.timeBlocks.length > 0) {
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon, ...
      // Convert to DAYS index: 0=Mon, 1=Tue, ..., 6=Sun
      const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const dateStr = date.toISOString().split('T')[0];

      // Find timeBlocks for this day
      const dayBlocks = timetable.timeBlocks.filter(
        b => b.day === dayIndex && (!b.status || b.status === 'available'),
      );

      for (const block of dayBlocks) {
        // Calculate endTime from startTime + duration
        const [sh, sm] = block.startTime.split(':').map(Number);
        const totalMinutes = sh * 60 + sm + (block.duration * 60);
        const eh = Math.floor(totalMinutes / 60);
        const em = totalMinutes % 60;
        const endTime = `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;

        const isBooked = bookedSlots?.some(
          b => b.date === dateStr && b.startTime === block.startTime,
        ) || false;

        slots.push({
          id: `${instructorId}_${dateStr}_${block.startTime}`,
          instructorId,
          date: dateStr,
          startTime: block.startTime,
          endTime,
          duration: `${block.duration}h`,
          booked: isBooked,
        });
      }
    }
    return slots;
  }

  // Fallback: availability lookup format { Mon: ["09:00", ...] }
  if (timetable.availability && typeof timetable.availability === 'object') {
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayOfWeek = date.getDay();
      const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const dayName = DAYS[dayIndex];
      const dateStr = date.toISOString().split('T')[0];

      const times = (timetable.availability as Record<string, string[]>)[dayName] || [];
      for (const startTime of times) {
        const [sh, sm] = startTime.split(':').map(Number);
        const endMinutes = sh * 60 + sm + 60; // default 1h
        const eh = Math.floor(endMinutes / 60);
        const em = endMinutes % 60;
        const endTime = `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;

        const isBooked = bookedSlots?.some(
          b => b.date === dateStr && b.startTime === startTime,
        ) || false;

        slots.push({
          id: `${instructorId}_${dateStr}_${startTime}`,
          instructorId,
          date: dateStr,
          startTime,
          endTime,
          duration: '1h',
          booked: isBooked,
        });
      }
    }
  }

  return slots;
};

/**
 * Map a UserProfile (Firestore) to AdminStudent (admin store).
 */
export const mapUserToAdminStudent = (
  user: UserProfile,
  lessonsCompleted?: number,
  upcomingLessons?: number,
): AdminStudent => ({
  id: user.id || user.uid,
  name: user.full_name || '',
  email: user.email || '',
  phone: user.phone || '',
  city: user.address || '',
  registrationDate: user.createdAt
    ? toISOString(user.createdAt)?.split('T')[0] || ''
    : '',
  approvalStatus: (user.status === 'active' ? 'approved' : user.status === 'rejected' ? 'rejected' : 'pending') as 'pending' | 'approved' | 'rejected',
  accountStatus: (user.status === 'frozen' ? 'suspended' : user.status === 'active' ? 'active' : 'inactive') as 'active' | 'suspended' | 'inactive',
  instructorAssigned: '',
  lessonsCompleted: lessonsCompleted || 0,
  upcomingLessons: upcomingLessons || 0,
  rating: 0,
  avatar: user.profile_picture_url || user.profileImage || '',
  lessons: [],
});

/**
 * Map a UserProfile (Firestore) to AdminInstructor (admin store).
 */
export const mapUserToAdminInstructor = (user: UserProfile): AdminInstructor => ({
  id: user.id || user.uid,
  name: user.full_name || '',
  email: user.email || '',
  phone: user.phone || '',
  city: user.address || '',
  experience: user.about_me ? 'Experienced' : 'New',
  licenseNumber: user.badge_number || '',
  documentsUploaded: [
    ...(user.badge_url ? [{ id: 'badge', name: 'Driving Badge', type: 'badge', uploadedDate: '', status: 'verified' as const }] : []),
    ...(user.insurance_url ? [{ id: 'insurance', name: 'Insurance', type: 'insurance', uploadedDate: '', status: 'verified' as const }] : []),
  ],
  stripeAccountId: user.stripeAccountId || '',
  stripeConnectionStatus: user.stripeAccountStatus === 'verified'
    ? 'connected'
    : user.stripeAccountId
    ? 'pending'
    : 'not_connected',
  rating: 0,
  completedLessons: 0,
  earningsTotal: 0,
  pendingPayment: 0,
  approvalStatus: (user.status === 'active' && user.approved ? 'approved' : user.status === 'rejected' ? 'rejected' : 'pending') as 'pending' | 'approved' | 'rejected',
  accountStatus: (user.status === 'frozen' ? 'suspended' : user.status === 'active' ? 'active' : 'inactive') as 'active' | 'suspended' | 'inactive',
  avatar: user.profile_picture_url || user.profileImage || '',
});

/**
 * Map AvailablePackage/PendingPackage to AdminPackage (admin store).
 */
export const mapPackageToAdminPackage = (
  pkg: AvailablePackage | PendingPackage,
  instructorName?: string,
): AdminPackage => ({
  id: pkg.id,
  instructorId: pkg.instructorId,
  instructorName: instructorName || pkg.instructorName || '',
  title: pkg.title || '',
  description: pkg.description || '',
  lessonCount: pkg.number_of_lessons || 0,
  price: pkg.price || 0,
  commissionPercentage: ('commission_percent' in pkg ? (pkg as AvailablePackage).commission_percent : 0) || 0,
  status: (pkg.status === 'approved' ? 'approved' : pkg.status === 'rejected' ? 'rejected' : 'pending') as 'pending' | 'approved' | 'rejected',
  createdAt: ('created_at' in pkg && pkg.created_at)
    ? (typeof pkg.created_at === 'string' ? pkg.created_at : toISOString(pkg.created_at) || '')
    : '',
});

/**
 * Map Firestore Transaction to admin store Transaction.
 */
export const mapTransactionToAdminTransaction = (
  tx: import('../types').Transaction,
  instructorName?: string,
): AdminTransaction => ({
  id: tx.id,
  instructorId: tx.instructor_id || '',
  instructorName: instructorName || tx.instructor_name || '',
  amount: tx.amount || 0,
  date: tx.created_at ? toISOString(tx.created_at)?.split('T')[0] || '' : '',
  status: tx.status === 'completed' ? 'paid' : 'pending',
  method: tx.processed_via || 'stripe',
  description: tx.package_title || 'Payment',
});

/**
 * Group messages into conversations for messaging screens.
 */
export const mapMessagesToConversations = (
  messages: Message[],
  currentUserId: string,
): Conversation[] => {
  const convMap: Record<string, { messages: Message[]; otherUser: { id: string; name: string; avatar: string } }> = {};

  for (const msg of messages) {
    const isIncoming = msg.receiver_id === currentUserId;
    const otherUserId = isIncoming ? msg.sender_id : msg.receiver_id;
    const otherUserName = isIncoming ? msg.sender_name || '' : msg.receiver_name || '';

    if (!convMap[otherUserId]) {
      convMap[otherUserId] = {
        messages: [],
        otherUser: { id: otherUserId, name: otherUserName, avatar: '' },
      };
    }
    convMap[otherUserId].messages.push(msg);
  }

  return Object.entries(convMap).map(([otherUserId, data]) => {
    const sorted = data.messages.sort((a, b) => {
      const aDate = a.createdAt ? toDate(a.createdAt)?.getTime() || 0 : 0;
      const bDate = b.createdAt ? toDate(b.createdAt)?.getTime() || 0 : 0;
      return bDate - aDate;
    });
    const latest = sorted[0];
    const unreadCount = data.messages.filter(m => m.receiver_id === currentUserId && !m.read).length;

    return {
      id: otherUserId,
      instructorId: otherUserId,
      instructorName: data.otherUser.name,
      instructorAvatar: data.otherUser.avatar,
      lastMessage: latest?.content || '',
      timestamp: latest?.createdAt ? formatMessageDate(latest.createdAt) : '',
      unreadCount,
      status: unreadCount > 0 ? 'unread' as const : 'read' as const,
    };
  });
};

/**
 * Build a DashboardStats object from computed values.
 */
export const buildDashboardStats = (params: {
  totalStudents: number;
  totalInstructors: number;
  activeLessons: number;
  pendingApprovals: number;
  monthlyRevenue: number;
  pendingPayouts: number;
}): DashboardStats => params;

/**
 * Map a Booking to an instructor lesson view model (for instructor screens).
 */
export const mapBookingToInstructorLesson = (
  booking: Booking,
  studentName?: string,
): {
  id: string;
  studentName: string;
  studentAvatar: string;
  date: string;
  time: string;
  duration: string;
  status: string;
  reviewed: boolean;
} => ({
  id: booking.id,
  studentName: studentName || booking.studentName || '',
  studentAvatar: '',
  date: booking.date
    ? toISOString(booking.date)?.split('T')[0] || ''
    : booking.scheduled_date
    ? toISOString(booking.scheduled_date)?.split('T')[0] || ''
    : '',
  time: booking.startTime || '',
  duration: booking.duration ? `${booking.duration} min` : booking.duration_hours ? `${booking.duration_hours}h` : '1h',
  status: booking.status,
  reviewed: booking.status === 'completed',
});
