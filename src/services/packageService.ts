/**
 * GDS Driving School — Package Service
 * =======================================
 * Firestore operations for packages, pendingPackages, availablePackages.
 * Replaces the legacy mock-data version.
 */

import { db } from '../config/firebase';
import {
  Collections,
  fromQuerySnapshot,
  fromSnapshot,
  serverTimestamp,
  withDualIds,
} from '../utils/mappers';
import type { Package, PendingPackage, AvailablePackage } from '../types';

// ─── Available Packages (created by instructor) ─────────────────────────────

/**
 * Get available packages for an instructor.
 */
export const getInstructorAvailablePackages = async (
  instructorId: string,
): Promise<AvailablePackage[]> => {
  const snap = await db
    .collection(Collections.AVAILABLE_PACKAGES)
    .where('instructorId', '==', instructorId)
    .where('isActive', '==', true)
    .orderBy('createdAt', 'desc')
    .get();
  return fromQuerySnapshot<AvailablePackage>(snap);
};

/**
 * Subscribe to available packages for an instructor.
 */
export const onInstructorAvailablePackages = (
  instructorId: string,
  callback: (packages: AvailablePackage[]) => void,
): (() => void) => {
  return db
    .collection(Collections.AVAILABLE_PACKAGES)
    .where('instructorId', '==', instructorId)
    .where('isActive', '==', true)
    .orderBy('createdAt', 'desc')
    .onSnapshot(
      (snap) => callback(fromQuerySnapshot<AvailablePackage>(snap)),
    );
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
  const ref = await db.collection(Collections.AVAILABLE_PACKAGES).add({
    instructorId: data.instructorId,
    instructor_id: data.instructorId,
    name: data.name,
    description: data.description,
    price: data.price,
    totalLessons: data.totalLessons,
    total_lessons: data.totalLessons,
    duration: data.duration,
    transmission: data.transmission,
    isActive: true,
    createdAt: serverTimestamp(),
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
    .orderBy('createdAt', 'desc')
    .get();
  return fromQuerySnapshot<PendingPackage>(snap);
};

/**
 * Get pending packages for a specific instructor.
 */
export const getInstructorPendingPackages = async (
  instructorId: string,
): Promise<PendingPackage[]> => {
  const snap = await db
    .collection(Collections.PENDING_PACKAGES)
    .where('instructorId', '==', instructorId)
    .orderBy('createdAt', 'desc')
    .get();
  return fromQuerySnapshot<PendingPackage>(snap);
};

/**
 * Subscribe to pending packages for an instructor.
 */
export const onInstructorPendingPackages = (
  instructorId: string,
  callback: (packages: PendingPackage[]) => void,
): (() => void) => {
  return db
    .collection(Collections.PENDING_PACKAGES)
    .where('instructorId', '==', instructorId)
    .orderBy('createdAt', 'desc')
    .onSnapshot(
      (snap) => callback(fromQuerySnapshot<PendingPackage>(snap)),
    );
};

// ─── Purchased Packages (student has paid) ───────────────────────────────────

/**
 * Get active purchased packages for a student.
 */
export const getStudentPackages = async (
  studentId: string,
): Promise<Package[]> => {
  const snap = await db
    .collection(Collections.PACKAGES)
    .where('studentId', '==', studentId)
    .where('status', '==', 'active')
    .orderBy('purchaseDate', 'desc')
    .get();
  return fromQuerySnapshot<Package>(snap);
};

/**
 * Get all purchased packages for a student (any status).
 */
export const getAllStudentPackages = async (
  studentId: string,
): Promise<Package[]> => {
  const snap = await db
    .collection(Collections.PACKAGES)
    .where('studentId', '==', studentId)
    .orderBy('purchaseDate', 'desc')
    .get();
  return fromQuerySnapshot<Package>(snap);
};

/**
 * Subscribe to student packages (real-time).
 */
export const onStudentPackages = (
  studentId: string,
  callback: (packages: Package[]) => void,
): (() => void) => {
  return db
    .collection(Collections.PACKAGES)
    .where('studentId', '==', studentId)
    .orderBy('purchaseDate', 'desc')
    .onSnapshot(
      (snap) => callback(fromQuerySnapshot<Package>(snap)),
    );
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
  packages: Package[],
  instructorId: string,
): Package[] => {
  return packages.filter(
    p => (p.instructorId === instructorId || p.instructor_id === instructorId) && p.status === 'active',
  );
};

/**
 * Check if a package is already purchased.
 */
export const isPackagePurchased = (
  packages: Package[],
  packageId: string,
): Package | undefined => {
  return packages.find(p => p.id === packageId || p.packageId === packageId);
};

/**
 * Get remaining lessons for a purchased package.
 */
export const getRemainingLessons = (pkg: Package): number => {
  const total = pkg.totalLessons || pkg.total_lessons || 0;
  const used = pkg.lessonsUsed || pkg.lessons_used || 0;
  return Math.max(0, total - used);
};
