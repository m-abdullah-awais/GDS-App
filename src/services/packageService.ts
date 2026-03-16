/**
 * GDS Driving School — Package Service
 * =======================================
 * Firestore operations for packages, pendingPackages, availablePackages.
 * Replaces the legacy mock-data version.
 */

import { db } from '../config/firebase';
import { firebaseAuth } from '../config/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
} from '@react-native-firebase/firestore';
import {
  Collections,
  fromQuerySnapshot,
  fromSnapshot,
  serverTimestamp,
  toISOString,
  withDualIds,
} from '../utils/mappers';
import type { Package, PendingPackage, AvailablePackage } from '../types';
import type { PurchasedPackage } from '../store/student/types';

const ensureAuthenticated = () => {
  const currentUser = firebaseAuth.currentUser;
  if (!currentUser) {
    throw new Error('[Firebase][PackageService] User not authenticated before Firestore read');
  }
  return currentUser.uid;
};

const dedupeById = <T extends { id: string }>(items: T[]): T[] => {
  const map = new Map<string, T>();
  for (const item of items) {
    map.set(item.id, item);
  }
  return Array.from(map.values());
};

const toMillis = (value: any): number => {
  if (!value) {return 0;}
  if (typeof value?.toDate === 'function') {
    return value.toDate().getTime();
  }
  if (value instanceof Date) {
    return value.getTime();
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const ms = new Date(value).getTime();
    return Number.isNaN(ms) ? 0 : ms;
  }
  return 0;
};

const toIsoOrKeep = <T>(value: T): T | string => {
  if (!value) {return value;}
  const iso = toISOString(value as any);
  return iso || value;
};

const normalizeAvailablePackage = (pkg: AvailablePackage): AvailablePackage => ({
  ...pkg,
  approvedAt: toIsoOrKeep(pkg.approvedAt) as any,
  updatedAt: toIsoOrKeep(pkg.updatedAt) as any,
  createdAt: toIsoOrKeep((pkg as any).createdAt) as any,
});

const normalizePendingPackage = (pkg: PendingPackage): PendingPackage => ({
  ...pkg,
  created_at: toIsoOrKeep(pkg.created_at as any) as any,
  createdAt: toIsoOrKeep((pkg as any).createdAt) as any,
  updatedAt: toIsoOrKeep((pkg as any).updatedAt) as any,
});

// ─── Available Packages (created by instructor) ─────────────────────────────

/**
 * Get available packages for an instructor.
 */
export const getInstructorAvailablePackages = async (
  instructorId: string,
): Promise<AvailablePackage[]> => {
  const currentUserId = ensureAuthenticated();
  if (__DEV__) console.log('[Firebase][PackageService] Data request triggered: getInstructorAvailablePackages', {
    instructorId,
    currentUserId,
  });

  try {
    const [instructorIdSnap, instructorSnakeSnap] = await Promise.all([
      getDocs(
        query(
          collection(db, Collections.AVAILABLE_PACKAGES),
          where('instructorId', '==', instructorId),
        ),
      ),
      getDocs(
        query(
          collection(db, Collections.AVAILABLE_PACKAGES),
          where('instructor_id', '==', instructorId),
        ),
      ),
    ]);

    const merged = dedupeById<AvailablePackage>([
      ...fromQuerySnapshot<AvailablePackage>(instructorIdSnap),
      ...fromQuerySnapshot<AvailablePackage>(instructorSnakeSnap),
    ])
      .map(normalizeAvailablePackage)
      .filter(pkg => {
        const isApproved = pkg.status === 'approved';
        const isAvailable = pkg.available === true;
        const isLegacyActive = (pkg as any).isActive === true;
        return (isApproved && isAvailable) || isLegacyActive || isApproved;
      })
      .sort((a, b) => {
        const aMs = Math.max(toMillis((a as any).approvedAt), toMillis((a as any).createdAt));
        const bMs = Math.max(toMillis((b as any).approvedAt), toMillis((b as any).createdAt));
        return bMs - aMs;
      });

    if (__DEV__) console.log('[Firebase][PackageService] Data received: getInstructorAvailablePackages', {
      instructorId,
      count: merged.length,
    });

    return merged;
  } catch (error) {
    if (__DEV__) console.error('[Firebase][PackageService] Error output: getInstructorAvailablePackages', {
      instructorId,
      error,
    });
    throw error;
  }
};

/**
 * Subscribe to available packages for an instructor.
 */
export const onInstructorAvailablePackages = (
  instructorId: string,
  callback: (packages: AvailablePackage[]) => void,
): (() => void) => {
  ensureAuthenticated();
  if (__DEV__) console.log('[Firebase][PackageService] Data request triggered: onInstructorAvailablePackages', {
    instructorId,
  });

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const emitMerged = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      try {
        const packages = await getInstructorAvailablePackages(instructorId);
        callback(packages);
      } catch (error) {
        if (__DEV__) console.error('[Firebase][PackageService] Error output: onInstructorAvailablePackages', {
          instructorId,
          error,
        });
      }
    }, 300);
  };

  const unsubscribers = [
    onSnapshot(
      query(
        collection(db, Collections.AVAILABLE_PACKAGES),
        where('instructorId', '==', instructorId),
      ),
      () => emitMerged(),
      (error) => {
        if (__DEV__) console.error('[Firebase][PackageService] Error output: onInstructorAvailablePackages(snapshot)', {
          instructorId,
          error,
        });
      },
    ),
    onSnapshot(
      query(
        collection(db, Collections.AVAILABLE_PACKAGES),
        where('instructor_id', '==', instructorId),
      ),
      () => emitMerged(),
      (error) => {
        if (__DEV__) console.error('[Firebase][PackageService] Error output: onInstructorAvailablePackages(legacy snapshot)', {
          instructorId,
          error,
        });
      },
    ),
  ];

  emitMerged();

  return () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    unsubscribers.forEach(unsub => unsub());
  };
};

/**
 * Create a new available package (instructor action).
 */
export const createAvailablePackage = async (data: {
  instructorId: string;
  name: string;
  description: string;
  price: number;
  totalLessons: number;
  duration: string;
  transmission: string;
}): Promise<string> => {
  const currentUserId = ensureAuthenticated();

  if (data.instructorId !== currentUserId) {
    if (__DEV__) console.warn('[Firebase][PackageService] instructorId mismatch; using authenticated uid for package submission', {
      providedInstructorId: data.instructorId,
      currentUserId,
    });
  }

  if (__DEV__) console.log('[Firebase][PackageService] Data request triggered: createPackageSubmission', {
    instructorId: currentUserId,
    title: data.name,
  });

  const ref = await addDoc(collection(db, Collections.PENDING_PACKAGES), {
    instructorId: currentUserId,
    instructor_id: currentUserId,
    title: data.name,
    name: data.name,
    description: data.description,
    number_of_lessons: data.totalLessons,
    totalLessons: data.totalLessons,
    total_lessons: data.totalLessons,
    price: data.price,
    duration: data.duration,
    transmission: data.transmission,
    status: 'pending',
    type: 'new',
    createdAt: serverTimestamp(),
  });

  if (__DEV__) console.log('[Firebase][PackageService] Data received: createPackageSubmission', {
    pendingPackageId: ref.id,
    instructorId: currentUserId,
  });

  return ref.id;
};

/**
 * Update an available package.
 */
export const updateAvailablePackage = async (
  packageId: string,
  data: Partial<AvailablePackage>,
): Promise<void> => {
  await updateDoc(doc(collection(db, Collections.AVAILABLE_PACKAGES), packageId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Deactivate an available package.
 */
export const deactivateAvailablePackage = async (packageId: string): Promise<void> => {
  await updateDoc(doc(collection(db, Collections.AVAILABLE_PACKAGES), packageId), {
    isActive: false,
    updatedAt: serverTimestamp(),
  });
};

// ─── Pending Packages ────────────────────────────────────────────────────────

/**
 * Get pending packages awaiting admin approval.
 */
export const getPendingPackages = async (): Promise<PendingPackage[]> => {
  const snap = await getDocs(
    query(
      collection(db, Collections.PENDING_PACKAGES),
      where('status', '==', 'pending'),
    ),
  );
  return fromQuerySnapshot<PendingPackage>(snap)
    .map(normalizePendingPackage)
    .sort(
    (a, b) => toMillis((b as any).createdAt) - toMillis((a as any).createdAt),
  );
};

/**
 * Get pending packages for a specific instructor.
 */
export const getInstructorPendingPackages = async (
  instructorId: string,
): Promise<PendingPackage[]> => {
  const [camelSnap, snakeSnap] = await Promise.all([
    getDocs(
      query(
        collection(db, Collections.PENDING_PACKAGES),
        where('instructorId', '==', instructorId),
      ),
    ),
    getDocs(
      query(
        collection(db, Collections.PENDING_PACKAGES),
        where('instructor_id', '==', instructorId),
      ),
    ),
  ]);

  return dedupeById<PendingPackage>([
    ...fromQuerySnapshot<PendingPackage>(camelSnap),
    ...fromQuerySnapshot<PendingPackage>(snakeSnap),
  ])
    .map(normalizePendingPackage)
    .sort((a, b) => toMillis((b as any).createdAt) - toMillis((a as any).createdAt));
};

/**
 * Subscribe to pending packages for an instructor.
 */
export const onInstructorPendingPackages = (
  instructorId: string,
  callback: (packages: PendingPackage[]) => void,
): (() => void) => {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const emitMerged = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      try {
        const packages = await getInstructorPendingPackages(instructorId);
        callback(packages);
      } catch (error) {
        if (__DEV__) console.error('[Firebase][PackageService] Error output: onInstructorPendingPackages', {
          instructorId,
          error,
        });
      }
    }, 300);
  };

  const unsubscribers = [
    onSnapshot(
      query(
        collection(db, Collections.PENDING_PACKAGES),
        where('instructorId', '==', instructorId),
      ),
      () => emitMerged(),
      (error) => {
        if (__DEV__) console.error('[Firebase][PackageService] Error output: onInstructorPendingPackages(camel snapshot)', {
          instructorId,
          error,
        });
      },
    ),
    onSnapshot(
      query(
        collection(db, Collections.PENDING_PACKAGES),
        where('instructor_id', '==', instructorId),
      ),
      () => emitMerged(),
      (error) => {
        if (__DEV__) console.error('[Firebase][PackageService] Error output: onInstructorPendingPackages(snake snapshot)', {
          instructorId,
          error,
        });
      },
    ),
  ];

  emitMerged();

  return () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    unsubscribers.forEach(unsub => unsub());
  };
};

// ─── Purchased Packages (student has paid) ───────────────────────────────────

/**
 * Get active purchased packages for a student.
 */
export const getStudentPackages = async (
  studentId: string,
): Promise<Package[]> => {
  ensureAuthenticated();
  try {
    // The packages collection may not have studentId-filtered docs.
    // Student purchases are tracked in assignments, but some views use this.
    // Query both field variants without orderBy (sort in memory).
    const [camel, snake] = await Promise.all([
      getDocs(
        query(
          collection(db, Collections.PACKAGES),
          where('studentId', '==', studentId),
          where('status', '==', 'active'),
        ),
      ),
      getDocs(
        query(
          collection(db, Collections.PACKAGES),
          where('student_id', '==', studentId),
          where('status', '==', 'active'),
        ),
      ),
    ]);
    const result = dedupeById([
      ...fromQuerySnapshot<Package>(camel),
      ...fromQuerySnapshot<Package>(snake),
    ]);
    // Sort in memory to avoid composite index requirement
    return result.sort((a, b) => toMillis((b as any).purchaseDate) - toMillis((a as any).purchaseDate));
  } catch (error: any) {
    if (error?.code === 'firestore/permission-denied') {
      if (__DEV__) console.warn('[PackageService] Permission denied for student packages');
      return [];
    }
    throw error;
  }
};

/**
 * Get all purchased packages for a student (any status).
 */
export const getAllStudentPackages = async (
  studentId: string,
): Promise<Package[]> => {
  ensureAuthenticated();
  try {
    // Query both field variants without orderBy (sort in memory).
    const [camel, snake] = await Promise.all([
      getDocs(
        query(
          collection(db, Collections.PACKAGES),
          where('studentId', '==', studentId),
        ),
      ),
      getDocs(
        query(
          collection(db, Collections.PACKAGES),
          where('student_id', '==', studentId),
        ),
      ),
    ]);
    const result = dedupeById([
      ...fromQuerySnapshot<Package>(camel),
      ...fromQuerySnapshot<Package>(snake),
    ]);
    // Sort in memory to avoid composite index requirement
    return result.sort((a, b) => toMillis((b as any).purchaseDate) - toMillis((a as any).purchaseDate));
  } catch (error: any) {
    if (error?.code === 'firestore/permission-denied') {
      if (__DEV__) console.warn('[PackageService] Permission denied for all student packages');
      return [];
    }
    throw error;
  }
};

/**
 * Subscribe to student packages (real-time).
 */
export const onStudentPackages = (
  studentId: string,
  callback: (packages: Package[]) => void,
): (() => void) => {
  ensureAuthenticated();
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const emitMerged = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      try {
        const merged = await getAllStudentPackages(studentId);
        callback(merged);
      } catch (error) {
        if (__DEV__) console.error('[PackageService] onStudentPackages error:', error);
      }
    }, 300);
  };

  const unsubscribers = [
    onSnapshot(
      query(collection(db, Collections.PACKAGES), where('studentId', '==', studentId)),
      () => emitMerged(),
      (error) => { if (__DEV__) console.error('[PackageService] onStudentPackages camel error:', error); },
    ),
    onSnapshot(
      query(collection(db, Collections.PACKAGES), where('student_id', '==', studentId)),
      () => emitMerged(),
      (error) => { if (__DEV__) console.error('[PackageService] onStudentPackages snake error:', error); },
    ),
  ];

  emitMerged();

  return () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    unsubscribers.forEach(unsub => unsub());
  };
};

/**
 * Get a single package by ID.
 */
export const getPackage = async (packageId: string): Promise<Package | null> => {
  const snap = await getDoc(doc(collection(db, Collections.PACKAGES), packageId));
  return fromSnapshot<Package>(snap);
};

// ─── Utility: client-side helpers ────────────────────────────────────────────

/**
 * Get active purchased packages for a specific instructor.
 */
export const getActivePackagesForInstructor = (
  packages: PurchasedPackage[],
  instructorId: string,
): PurchasedPackage[] => {
  return packages.filter(
    p => p.instructorId === instructorId && p.status === 'active',
  );
};

/**
 * Check if a package is already purchased.
 */
export const isPackagePurchased = (
  packages: PurchasedPackage[],
  packageId: string,
): PurchasedPackage | undefined => {
  return packages.find(p => p.id === packageId || p.packageId === packageId);
};

/**
 * Get remaining lessons for a purchased package.
 */
export const getRemainingLessons = (pkg: Pick<PurchasedPackage, 'totalLessons' | 'lessonsUsed'>): number => {
  const total = pkg.totalLessons || 0;
  const used = pkg.lessonsUsed || 0;
  return Math.max(0, total - used);
};
