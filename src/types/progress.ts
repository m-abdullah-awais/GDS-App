/**
 * GDS Driving School — Progress / Achievement Domain Types
 * ==========================================================
 * Maps to `studentProgress`, `studentAchievements`,
 * `achievementNotifications` collections.
 */

import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

/** `studentProgress/{studentId}` document. */
export interface StudentProgress {
  id: string;
  totalLessonsCompleted?: number;
  totalHours?: number;
  currentStreak?: number;
  longestStreak?: number;
  skillRatings?: Record<string, number>;
  lastLessonDate?: FirebaseFirestoreTypes.Timestamp;
  updatedAt?: FirebaseFirestoreTypes.Timestamp;
}

/** `studentAchievements/{studentId}` document. */
export interface StudentAchievement {
  id: string;
  achievementIds?: string[];
  unlockedAt?: Record<string, FirebaseFirestoreTypes.Timestamp>;
}

/** `achievementNotifications` collection. */
export interface AchievementNotification {
  id: string;
  studentId: string;
  achievementId: string;
  title?: string;
  description?: string;
  read: boolean;
  createdAt?: FirebaseFirestoreTypes.Timestamp;
}
