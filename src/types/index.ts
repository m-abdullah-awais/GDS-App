/**
 * GDS Driving School — Domain Types Index
 * ==========================================
 * Re-exports all Firestore-aligned domain types.
 */

// User & Auth
export type { UserProfile, UserDoc, UserRole, UserStatus, StripeAccountStatus, TransmissionType } from './user';

// Packages
export type { Package, PendingPackage, AvailablePackage, PackageStatus } from './package';

// Bookings
export type { BookingRequest, Booking, BookingRequestStatus, BookingStatus } from './booking';

// Assignments
export type { Assignment, CommissionSnapshot } from './assignment';

// Student-Instructor Requests
export type { StudentInstructorRequest, SIRequestStatus } from './request';

// Feedback & Lesson Lifecycle
export type { Feedback, FeedbackPending, LessonCompletion, LessonCancellation, PayoutStatus } from './feedback';

// Messages & Notifications
export type { Message, AdminMessage, Notification, Suggestion } from './message';

// Payments & Transactions
export type { Transaction, Payment, InstructorPayment, WeeklyInstructorPayment, Payout, Purchase } from './payment';

// Progress & Achievements
export type { StudentProgress, StudentAchievement, AchievementNotification } from './progress';

// System Config
export type {
  CommissionSettings,
  AreaSettings,
  AdminDataSettings,
  InstructorApplication,
  Timetable,
  AnalyticsEvent,
} from './system';
