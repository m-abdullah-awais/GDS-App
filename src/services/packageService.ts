/**
 * GDS Driving School — Package Service
 * =======================================
 * Abstraction layer for package-related operations.
 * Currently uses mock data; structured for future API replacement.
 */

import { Dispatch } from 'redux';
import {
  setPackages,
  purchasePackage as purchasePackageAction,
  setLoading,
} from '../store/student/actions';
import type {
  InstructorPackage,
  PurchasedPackage,
} from '../store/student/types';
import { instructorPackages as mockPackages } from '../modules/student/mockData';

// ─── Fetch packages for an instructor (simulated API) ─────────────────────────

export const fetchInstructorPackages = (
  instructorId: string,
  dispatch: Dispatch,
): Promise<InstructorPackage[]> => {
  return new Promise((resolve) => {
    dispatch(setLoading('packagesLoading', true));

    setTimeout(() => {
      const packages = mockPackages[instructorId] || [];
      dispatch(setPackages(instructorId, packages));
      dispatch(setLoading('packagesLoading', false));
      resolve(packages);
    }, 600);
  });
};

// ─── Purchase a package (simulated API) ───────────────────────────────────────

export const buyPackage = (
  pkg: InstructorPackage,
  dispatch: Dispatch,
): Promise<PurchasedPackage> => {
  return new Promise((resolve) => {
    dispatch(setLoading('packagesLoading', true));

    const purchased: PurchasedPackage = {
      id: `PP-${Date.now()}`,
      packageId: pkg.id,
      instructorId: pkg.instructorId,
      packageName: pkg.name,
      purchaseDate: new Date().toISOString().split('T')[0],
      status: 'active',
      lessonsUsed: 0,
      totalLessons: pkg.totalLessons,
      price: pkg.price,
      duration: pkg.duration,
    };

    // Simulate payment processing
    setTimeout(() => {
      dispatch(purchasePackageAction(purchased));
      dispatch(setLoading('packagesLoading', false));
      resolve(purchased);
    }, 1200);
  });
};

// ─── Get active purchased packages for an instructor ──────────────────────────

export const getActivePackagesForInstructor = (
  purchasedPackages: PurchasedPackage[],
  instructorId: string,
): PurchasedPackage[] => {
  return purchasedPackages.filter(
    pp => pp.instructorId === instructorId && pp.status === 'active',
  );
};

// ─── Get all active purchased packages ────────────────────────────────────────

export const getAllActivePackages = (
  purchasedPackages: PurchasedPackage[],
): PurchasedPackage[] => {
  return purchasedPackages.filter(pp => pp.status === 'active');
};

// ─── Check if a package is already purchased ──────────────────────────────────

export const isPackagePurchased = (
  purchasedPackages: PurchasedPackage[],
  packageId: string,
): PurchasedPackage | undefined => {
  return purchasedPackages.find(pp => pp.packageId === packageId);
};

// ─── Get remaining lessons for a purchased package ────────────────────────────

export const getRemainingLessons = (purchased: PurchasedPackage): number => {
  return Math.max(0, purchased.totalLessons - purchased.lessonsUsed);
};
