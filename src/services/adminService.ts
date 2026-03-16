/**
 * GDS Driving School — Admin Service
 * =====================================
 * Firestore operations for admin-specific functionality:
 *   - Instructor applications (approval/rejection)
 *   - System settings (commission, areas)
 *   - Analytics data
 *   - Admin payments / payouts
 */

import { db } from '../config/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  orderBy,
  limit,
} from '@react-native-firebase/firestore';
import {
  Collections,
  fromSnapshot,
  fromQuerySnapshot,
  serverTimestamp,
} from '../utils/mappers';
import type {
  UserProfile,
  CommissionSettings,
  AreaSettings,
  AdminDataSettings,
  Transaction,
  Payment,
  InstructorPayment,
  WeeklyInstructorPayment,
  Payout,
  PendingPackage,
  AvailablePackage,
} from '../types';

// ─── Instructor Applications ─────────────────────────────────────────────────

/**
 * Get all pending instructor applications.
 */
export const getPendingInstructorApplications = async (): Promise<UserProfile[]> => {
  const snap = await getDocs(
    query(
      collection(db, Collections.USERS),
      where('role', '==', 'instructor'),
      where('status', '==', 'pending'),
    ),
  );
  return fromQuerySnapshot<UserProfile>(snap);
};

/**
 * Approve an instructor application.
 */
export const approveInstructor = async (instructorId: string): Promise<void> => {
  await updateDoc(doc(collection(db, Collections.USERS), instructorId), {
    status: 'active',
    approved: true,
    // Capability flags (matches web firebaseHelpers.ts approveInstructor)
    canCreatePackages: true,
    canAcceptBookings: true,
    canViewStudents: true,
    canMessageStudents: true,
    canViewEarnings: true,
    canManageSchedule: true,
    canGiveFeedback: true,
    canEditProfile: true,
    canAccessDashboard: true,
    isFullyRegistered: true,
    profileComplete: true,
    profile_completed: true,
    registrationDate: serverTimestamp(),
    lastActive: serverTimestamp(),
    approvedAt: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
};

/**
 * Reject an instructor application.
 */
export const rejectInstructor = async (
  instructorId: string,
  reason?: string,
): Promise<void> => {
  await updateDoc(doc(collection(db, Collections.USERS), instructorId), {
    status: 'rejected',
    rejectionReason: reason || '',
    rejectedAt: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
};

/**
 * Suspend an instructor.
 */
export const suspendInstructor = async (
  instructorId: string,
  reason?: string,
): Promise<void> => {
  await updateDoc(doc(collection(db, Collections.USERS), instructorId), {
    status: 'suspended',
    suspensionReason: reason || '',
    suspendedAt: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
};

/**
 * Reactivate a suspended instructor.
 */
export const reactivateInstructor = async (instructorId: string): Promise<void> => {
  await updateDoc(doc(collection(db, Collections.USERS), instructorId), {
    status: 'active',
    reactivatedAt: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
};

// ─── System Settings ─────────────────────────────────────────────────────────

/**
 * Get commission settings.
 */
export const getCommissionSettings = async (): Promise<CommissionSettings | null> => {
  const snap = await getDoc(
    doc(collection(db, Collections.SYSTEM_SETTINGS), 'commission'),
  );
  return fromSnapshot<CommissionSettings>(snap);
};

/**
 * Update commission settings.
 */
export const updateCommissionSettings = async (
  data: Partial<CommissionSettings>,
): Promise<void> => {
  await setDoc(
    doc(collection(db, Collections.SYSTEM_SETTINGS), 'commission'),
    { ...data, updatedAt: serverTimestamp() },
    { merge: true },
  );
};

/**
 * Get area settings.
 */
export const getAreaSettings = async (): Promise<AreaSettings | null> => {
  const snap = await getDoc(
    doc(collection(db, Collections.SYSTEM_SETTINGS), 'areaSettings'),
  );
  return fromSnapshot<AreaSettings>(snap);
};

/**
 * Update area settings.
 */
export const updateAreaSettings = async (
  data: Partial<AreaSettings>,
): Promise<void> => {
  await setDoc(
    doc(collection(db, Collections.SYSTEM_SETTINGS), 'areaSettings'),
    { ...data, updatedAt: serverTimestamp() },
    { merge: true },
  );
};

/**
 * Get admin data settings.
 */
export const getAdminDataSettings = async (): Promise<AdminDataSettings | null> => {
  const snap = await getDoc(
    doc(collection(db, Collections.ADMIN_DATA), 'settings'),
  );
  return fromSnapshot<AdminDataSettings>(snap);
};

// ─── Admin Payments & Payouts ────────────────────────────────────────────────

/**
 * Get all transactions.
 */
export const getAllTransactions = async (
  limitCount = 50,
): Promise<Transaction[]> => {
  const snap = await getDocs(
    query(
      collection(db, Collections.TRANSACTIONS),
      orderBy('created_at', 'desc'),
      limit(limitCount),
    ),
  );
  return fromQuerySnapshot<Transaction>(snap);
};

/**
 * Get all payments.
 */
export const getAllPayments = async (
  limitCount = 50,
): Promise<Payment[]> => {
  const snap = await getDocs(
    query(
      collection(db, Collections.PAYMENTS),
      orderBy('createdAt', 'desc'),
      limit(limitCount),
    ),
  );
  return fromQuerySnapshot<Payment>(snap);
};

/**
 * Get instructor payments.
 */
export const getInstructorPayments = async (
  instructorId: string,
): Promise<InstructorPayment[]> => {
  const snap = await getDocs(
    query(
      collection(db, Collections.INSTRUCTOR_PAYMENTS),
      where('instructorId', '==', instructorId),
      orderBy('createdAt', 'desc'),
    ),
  );
  return fromQuerySnapshot<InstructorPayment>(snap);
};

/**
 * Get weekly instructor payment summaries.
 */
export const getWeeklyInstructorPayments = async (
  instructorId: string,
): Promise<WeeklyInstructorPayment[]> => {
  const snap = await getDocs(
    query(
      collection(db, Collections.WEEKLY_INSTRUCTOR_PAYMENTS),
      where('instructorId', '==', instructorId),
      orderBy('weekStart', 'desc'),
    ),
  );
  return fromQuerySnapshot<WeeklyInstructorPayment>(snap);
};

/**
 * Get all payouts (admin view).
 */
export const getAllPayouts = async (
  limitCount = 50,
): Promise<Payout[]> => {
  const snap = await getDocs(
    query(
      collection(db, Collections.PAYOUTS),
      orderBy('createdAt', 'desc'),
      limit(limitCount),
    ),
  );
  return fromQuerySnapshot<Payout>(snap);
};

/**
 * Subscribe to all users for admin dashboard.
 */
export const onAllUsers = (
  callback: (users: UserProfile[]) => void,
): (() => void) => {
  return onSnapshot(
    query(
      collection(db, Collections.USERS),
      orderBy('createdAt', 'desc'),
    ),
    (snap) => callback(fromQuerySnapshot<UserProfile>(snap)),
  );
};

/**
 * Counts for dashboard stats.
 */
export const getDashboardCounts = async (): Promise<{
  totalStudents: number;
  totalInstructors: number;
  pendingInstructors: number;
  activeInstructors: number;
}> => {
  const [students, instructors, pending] = await Promise.all([
    getDocs(
      query(
        collection(db, Collections.USERS),
        where('role', '==', 'student'),
      ),
    ),
    getDocs(
      query(
        collection(db, Collections.USERS),
        where('role', '==', 'instructor'),
      ),
    ),
    getDocs(
      query(
        collection(db, Collections.USERS),
        where('role', '==', 'instructor'),
        where('status', '==', 'pending'),
      ),
    ),
  ]);

  const activeCount = instructors.docs.filter(
    (d) => d.data().status === 'active',
  ).length;

  return {
    totalStudents: students.size,
    totalInstructors: instructors.size,
    pendingInstructors: pending.size,
    activeInstructors: activeCount,
  };
};

// ─── Student Management (Admin) ──────────────────────────────────────────────

/**
 * Approve a student account.
 */
export const approveStudent = async (studentId: string): Promise<void> => {
  await updateDoc(doc(collection(db, Collections.USERS), studentId), {
    status: 'active',
    approved: true,
    approvedAt: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
};

/**
 * Reject a student account.
 */
export const rejectStudent = async (
  studentId: string,
  reason?: string,
): Promise<void> => {
  await updateDoc(doc(collection(db, Collections.USERS), studentId), {
    status: 'rejected',
    rejectionReason: reason || '',
    rejectedAt: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
};

/**
 * Suspend a student account.
 */
export const suspendStudent = async (
  studentId: string,
  reason?: string,
): Promise<void> => {
  await updateDoc(doc(collection(db, Collections.USERS), studentId), {
    status: 'frozen',
    suspensionReason: reason || '',
    suspendedAt: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
};

/**
 * Activate a suspended student account.
 */
export const activateStudent = async (studentId: string): Promise<void> => {
  await updateDoc(doc(collection(db, Collections.USERS), studentId), {
    status: 'active',
    reactivatedAt: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
};

/**
 * Delete a student user document.
 */
export const deleteStudentUser = async (studentId: string): Promise<void> => {
  await deleteDoc(doc(collection(db, Collections.USERS), studentId));
};

// ─── Package Management (Admin) ──────────────────────────────────────────────

/**
 * Approve a pending package → create/update in availablePackages.
 */
export const approvePendingPackage = async (packageId: string): Promise<void> => {
  const snap = await getDoc(doc(collection(db, Collections.PENDING_PACKAGES), packageId));
  if (!snap.exists) {throw new Error('Pending package not found');}
  const data = snap.data()!;

  // Calculate commission fields (matches web AdminPackageManagement)
  const commissionRate = data.commissionRate ?? 20; // default 20%
  const price = data.price ?? 0;
  const commissionAmount = (price * commissionRate) / 100;
  const instructorEarnings = price - commissionAmount;

  // Update the pending package status
  await updateDoc(doc(collection(db, Collections.PENDING_PACKAGES), packageId), {
    status: 'approved',
    approvedAt: serverTimestamp(),
  });

  // If editing existing, update availablePackages
  if (data.availablePackageId) {
    await updateDoc(doc(collection(db, Collections.AVAILABLE_PACKAGES), data.availablePackageId), {
      title: data.title,
      description: data.description,
      number_of_lessons: data.number_of_lessons,
      price: data.price,
      commission_rate: commissionRate,
      commission_amount: commissionAmount,
      instructor_earnings: instructorEarnings,
      status: 'approved',
      updatedAt: serverTimestamp(),
    });
  } else {
    // New package → create in availablePackages
    const availRef = await addDoc(collection(db, Collections.AVAILABLE_PACKAGES), {
      instructorId: data.instructorId,
      instructor_id: data.instructorId || data.instructor_id || '',
      instructorName: data.instructorName || '',
      title: data.title,
      description: data.description,
      number_of_lessons: data.number_of_lessons,
      price: data.price,
      commission_rate: commissionRate,
      commission_amount: commissionAmount,
      instructor_earnings: instructorEarnings,
      status: 'approved',
      available: true,
      approvedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Also create in `packages` collection (matches web)
    await addDoc(collection(db, Collections.PACKAGES), {
      instructorId: data.instructorId,
      instructor_id: data.instructorId || data.instructor_id || '',
      instructorName: data.instructorName || '',
      title: data.title,
      description: data.description,
      number_of_lessons: data.number_of_lessons,
      price: data.price,
      commission_rate: commissionRate,
      commission_amount: commissionAmount,
      instructor_earnings: instructorEarnings,
      availablePackageId: availRef.id,
      status: 'approved',
      available: true,
      approvedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    });
  }

  // Delete the processed pending package (matches web flow)
  await deleteDoc(doc(collection(db, Collections.PENDING_PACKAGES), packageId));
};

/**
 * Reject a pending package.
 */
export const rejectPendingPackage = async (
  packageId: string,
  reason?: string,
): Promise<void> => {
  await updateDoc(doc(collection(db, Collections.PENDING_PACKAGES), packageId), {
    status: 'rejected',
    rejectionReason: reason || '',
    rejectedAt: serverTimestamp(),
  });
};

/**
 * Update commission on an available package.
 */
export const updatePackageCommission = async (
  packageId: string,
  commissionPercent: number,
): Promise<void> => {
  await updateDoc(doc(collection(db, Collections.AVAILABLE_PACKAGES), packageId), {
    commission_percent: commissionPercent,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Deactivate/delete an available package.
 */
export const deleteAvailablePackage = async (packageId: string): Promise<void> => {
  await updateDoc(doc(collection(db, Collections.AVAILABLE_PACKAGES), packageId), {
    available: false,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Get all packages for admin review (pending + available combined).
 */
export const getAllPackagesForAdmin = async (
  limitCount = 50,
): Promise<{
  pending: PendingPackage[];
  available: AvailablePackage[];
}> => {
  const [pendingSnap, availSnap] = await Promise.all([
    getDocs(
      query(
        collection(db, Collections.PENDING_PACKAGES),
        orderBy('created_at', 'desc'),
        limit(limitCount),
      ),
    ),
    getDocs(
      query(
        collection(db, Collections.AVAILABLE_PACKAGES),
        orderBy('updatedAt', 'desc'),
        limit(limitCount),
      ),
    ),
  ]);
  return {
    pending: fromQuerySnapshot<PendingPackage>(pendingSnap),
    available: fromQuerySnapshot<AvailablePackage>(availSnap),
  };
};

/**
 * Get all active bookings count.
 */
export const getActiveBookingsCount = async (): Promise<number> => {
  const snap = await getDocs(
    query(
      collection(db, Collections.BOOKINGS),
      where('status', 'in', ['pending', 'confirmed']),
    ),
  );
  return snap.size;
};

/**
 * Get monthly revenue (sum of completed transactions in current month).
 */
export const getMonthlyRevenue = async (): Promise<number> => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const snap = await getDocs(
    query(
      collection(db, Collections.TRANSACTIONS),
      where('status', '==', 'completed'),
      where('created_at', '>=', startOfMonth),
    ),
  );
  return snap.docs.reduce((sum, d) => sum + (d.data().amount || 0), 0);
};

/**
 * Get total pending payouts.
 */
export const getPendingPayoutsTotal = async (): Promise<number> => {
  const snap = await getDocs(
    collection(db, Collections.WEEKLY_INSTRUCTOR_PAYMENTS),
  );
  return snap.docs.reduce(
    (sum, d) => sum + (d.data().weeklyInstructorPayment || 0),
    0,
  );
};

// ─── Admin Settings (Extended) ───────────────────────────────────────────────

/**
 * Update admin data settings.
 */
export const updateAdminDataSettings = async (
  data: Record<string, unknown>,
): Promise<void> => {
  await setDoc(
    doc(collection(db, Collections.ADMIN_DATA), 'settings'),
    { ...data, updatedAt: serverTimestamp() },
    { merge: true },
  );
};
