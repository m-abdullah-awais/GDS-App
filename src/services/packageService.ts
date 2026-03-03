/**
 * GDS Driving School — Package Service
 * =======================================
 * Firestore operations for packages, pendingPackages, availablePackages.
 * Replaces the legacy mock-data version.
 */

import { db } from '../config/firebase';
import { firebaseAuth } from '../config/firebase';
import {
  Collections,
  fromQuerySnapshot,
  fromSnapshot,
  serverTimestamp,
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

// ─── Available Packages (created by instructor) ─────────────────────────────

/**
 * Get available packages for an instructor.
 */
export const getInstructorAvailablePackages = async (
  instructorId: string,
): Promise<AvailablePackage[]> => {
  const currentUserId = ensureAuthenticated();
  console.log('[Firebase][PackageService] Data request triggered: getInstructorAvailablePackages', {
    instructorId,
    currentUserId,
  });

  try {
    const [instructorIdSnap, instructorSnakeSnap] = await Promise.all([
      db
        .collection(Collections.AVAILABLE_PACKAGES)
        .where('instructorId', '==', instructorId)
        .get(),
      db
        .collection(Collections.AVAILABLE_PACKAGES)
        .where('instructor_id', '==', instructorId)
        .get(),
    ]);

    const merged = dedupeById<AvailablePackage>([
      ...fromQuerySnapshot<AvailablePackage>(instructorIdSnap),
      ...fromQuerySnapshot<AvailablePackage>(instructorSnakeSnap),
    ])
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

    console.log('[Firebase][PackageService] Data received: getInstructorAvailablePackages', {
      instructorId,
      count: merged.length,
    });

    return merged;
  } catch (error) {
    console.error('[Firebase][PackageService] Error output: getInstructorAvailablePackages', {
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
  console.log('[Firebase][PackageService] Data request triggered: onInstructorAvailablePackages', {
    instructorId,
  });

  const unsubscribers = [
    db
      .collection(Collections.AVAILABLE_PACKAGES)
      .where('instructorId', '==', instructorId)
      .onSnapshot(
        () => {
          getInstructorAvailablePackages(instructorId)
            .then(callback)
            .catch(error => {
              console.error('[Firebase][PackageService] Error output: onInstructorAvailablePackages', {
                instructorId,
                error,
              });
            });
        },
        (error) => {
          console.error('[Firebase][PackageService] Error output: onInstructorAvailablePackages(snapshot)', {
            instructorId,
            error,
          });
        },
      ),
    db
      .collection(Collections.AVAILABLE_PACKAGES)
      .where('instructor_id', '==', instructorId)
      .onSnapshot(
        () => {
          getInstructorAvailablePackages(instructorId)
            .then(callback)
            .catch(error => {
              console.error('[Firebase][PackageService] Error output: onInstructorAvailablePackages(legacy)', {
                instructorId,
                error,
              });
            });
        },
        (error) => {
          console.error('[Firebase][PackageService] Error output: onInstructorAvailablePackages(legacy snapshot)', {
            instructorId,
            error,
          });
        },
      ),
  ];

  return () => {
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
    console.warn('[Firebase][PackageService] instructorId mismatch; using authenticated uid for package submission', {
      providedInstructorId: data.instructorId,
      currentUserId,
    });
  }

  console.log('[Firebase][PackageService] Data request triggered: createPackageSubmission', {
    instructorId: currentUserId,
    title: data.name,
  });

  const ref = await db.collection(Collections.PENDING_PACKAGES).add({
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

  console.log('[Firebase][PackageService] Data received: createPackageSubmission', {
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
  await db
    .collection(Collections.AVAILABLE_PACKAGES)
    .doc(packageId)
    .update({
      ...data,
      updatedAt: serverTimestamp(),
    });
};

/**
 * Deactivate an available package.
 */
export const deactivateAvailablePackage = async (packageId: string): Promise<void> => {
  await db
    .collection(Collections.AVAILABLE_PACKAGES)
    .doc(packageId)
    .update({
      isActive: false,
      updatedAt: serverTimestamp(),
    });
};

// ─── Pending Packages ────────────────────────────────────────────────────────

/**
 * Get pending packages awaiting admin approval.
 */
export const getPendingPackages = async (): Promise<PendingPackage[]> => {
  const snap = await db
    .collection(Collections.PENDING_PACKAGES)
    .where('status', '==', 'pending')
    .get();
  return fromQuerySnapshot<PendingPackage>(snap).sort(
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
    db
      .collection(Collections.PENDING_PACKAGES)
      .where('instructorId', '==', instructorId)
      .get(),
    db
      .collection(Collections.PENDING_PACKAGES)
      .where('instructor_id', '==', instructorId)
      .get(),
  ]);

  return dedupeById<PendingPackage>([
    ...fromQuerySnapshot<PendingPackage>(camelSnap),
    ...fromQuerySnapshot<PendingPackage>(snakeSnap),
  ]).sort((a, b) => toMillis((b as any).createdAt) - toMillis((a as any).createdAt));
};

/**
 * Subscribe to pending packages for an instructor.
 */
export const onInstructorPendingPackages = (
  instructorId: string,
  callback: (packages: PendingPackage[]) => void,
): (() => void) => {
  const emitMerged = async () => {
    const packages = await getInstructorPendingPackages(instructorId);
    callback(packages);
  };

  const unsubscribers = [
    db
      .collection(Collections.PENDING_PACKAGES)
      .where('instructorId', '==', instructorId)
      .onSnapshot(
        () => {
          emitMerged().catch(error => {
            console.error('[Firebase][PackageService] Error output: onInstructorPendingPackages(camel)', {
              instructorId,
              error,
            });
          });
        },
      ),
    db
      .collection(Collections.PENDING_PACKAGES)
      .where('instructor_id', '==', instructorId)
      .onSnapshot(
        () => {
          emitMerged().catch(error => {
            console.error('[Firebase][PackageService] Error output: onInstructorPendingPackages(snake)', {
              instructorId,
              error,
            });
          });
        },
      ),
  ];

  emitMerged().catch(error => {
    console.error('[Firebase][PackageService] Error output: onInstructorPendingPackages(initial)', {
      instructorId,
      error,
    });
  });

  return () => {
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
  const [camel, snake] = await Promise.all([
    db
      .collection(Collections.PACKAGES)
      .where('studentId', '==', studentId)
      .where('status', '==', 'active')
      .orderBy('purchaseDate', 'desc')
      .get(),
    db
      .collection(Collections.PACKAGES)
      .where('student_id', '==', studentId)
      .where('status', '==', 'active')
      .orderBy('purchaseDate', 'desc')
      .get(),
  ]);
  return dedupeById([
    ...fromQuerySnapshot<Package>(camel),
    ...fromQuerySnapshot<Package>(snake),
  ]);
};

/**
 * Get all purchased packages for a student (any status).
 */
export const getAllStudentPackages = async (
  studentId: string,
): Promise<Package[]> => {
  ensureAuthenticated();
  const [camel, snake] = await Promise.all([
    db
      .collection(Collections.PACKAGES)
      .where('studentId', '==', studentId)
      .orderBy('purchaseDate', 'desc')
      .get(),
    db
      .collection(Collections.PACKAGES)
      .where('student_id', '==', studentId)
      .orderBy('purchaseDate', 'desc')
      .get(),
  ]);
  return dedupeById([
    ...fromQuerySnapshot<Package>(camel),
    ...fromQuerySnapshot<Package>(snake),
  ]);
};

/**
 * Subscribe to student packages (real-time).
 */
export const onStudentPackages = (
  studentId: string,
  callback: (packages: Package[]) => void,
): (() => void) => {
  ensureAuthenticated();

  const emitMerged = async () => {
    const merged = await getAllStudentPackages(studentId);
    callback(merged);
  };

  const unsubscribers = [
    db
      .collection(Collections.PACKAGES)
      .where('studentId', '==', studentId)
      .orderBy('purchaseDate', 'desc')
      .onSnapshot(
        () => {
          emitMerged().catch(error => {
            console.error('[Firebase][PackageService] Error output: onStudentPackages(camel)', {
              studentId,
              error,
            });
          });
        },
        (error) => {
          console.error('[Firebase][PackageService] Error output: onStudentPackages(camel snapshot)', {
            studentId,
            error,
          });
        },
      ),
    db
      .collection(Collections.PACKAGES)
      .where('student_id', '==', studentId)
      .orderBy('purchaseDate', 'desc')
      .onSnapshot(
        () => {
          emitMerged().catch(error => {
            console.error('[Firebase][PackageService] Error output: onStudentPackages(snake)', {
              studentId,
              error,
            });
          });
        },
        (error) => {
          console.error('[Firebase][PackageService] Error output: onStudentPackages(snake snapshot)', {
            studentId,
            error,
          });
        },
      ),
  ];

  emitMerged().catch(error => {
    console.error('[Firebase][PackageService] Error output: onStudentPackages(initial)', {
      studentId,
      error,
    });
  });

  return () => {
    unsubscribers.forEach(unsub => unsub());
  };
};

/**
 * Get a single package by ID.
 */
export const getPackage = async (packageId: string): Promise<Package | null> => {
  const snap = await db.collection(Collections.PACKAGES).doc(packageId).get();
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
