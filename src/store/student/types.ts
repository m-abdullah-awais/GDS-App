/**
 * GDS Driving School — Student Redux Types
 * ===========================================
 * Entity types, action constants, and action interfaces
 * for the student booking lifecycle.
 */

// ─── Status Types ─────────────────────────────────────────────────────────────

export type InstructorRequestStatus = 'pending' | 'accepted' | 'rejected';
export type PackagePurchaseStatus = 'active' | 'expired' | 'exhausted';
export type BookingLessonStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

// ─── Entity Types ─────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  studentName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface StudentInstructor {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  experience: string;
  city: string;
  bio: string;
  passRate: number;
  transmissionType: 'Manual' | 'Automatic' | 'Both';
  coveredPostcodes: string[];
  acceptingStudents: boolean;
  about: string;
  yearsExperience: number;
  reviews: Review[];
}

export interface InstructorRequest {
  id: string;
  instructorId: string;
  status: InstructorRequestStatus;
  sentDate: string;
  responseDate?: string;
  message?: string;
}

export interface InstructorPackage {
  id: string;
  instructorId: string;
  name: string;
  totalLessons: number;
  price: number;
  duration: string;
  description: string;
  popular?: boolean;
}

export interface PurchasedPackage {
  id: string;
  packageId: string;
  instructorId: string;
  packageName: string;
  purchaseDate: string;
  status: PackagePurchaseStatus;
  lessonsUsed: number;
  totalLessons: number;
  price: number;
  duration: string;
}

export interface AvailableSlot {
  id: string;
  instructorId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  booked: boolean;
}

export interface BookedLesson {
  id: string;
  instructorId: string;
  instructorName: string;
  instructorAvatar: string;
  packageId: string;
  packageName: string;
  date: string;
  time: string;
  duration: string;
  status: BookingLessonStatus;
  location?: string;
  cancelledBy?: 'student' | 'instructor';
}

// ─── Action Type Constants ────────────────────────────────────────────────────

export const SET_INSTRUCTORS = 'student/SET_INSTRUCTORS';
export const SEND_REQUEST = 'student/SEND_REQUEST';
export const UPDATE_REQUEST_STATUS = 'student/UPDATE_REQUEST_STATUS';
export const SET_MY_INSTRUCTORS = 'student/SET_MY_INSTRUCTORS';
export const SET_PACKAGES = 'student/SET_PACKAGES';
export const PURCHASE_PACKAGE = 'student/PURCHASE_PACKAGE';
export const SET_AVAILABLE_SLOTS = 'student/SET_AVAILABLE_SLOTS';
export const BOOK_LESSON = 'student/BOOK_LESSON';
export const UPDATE_LESSON_STATUS = 'student/UPDATE_LESSON_STATUS';
export const CANCEL_BOOKING = 'student/CANCEL_BOOKING';
export const SET_LOADING = 'student/SET_LOADING';
export const UPDATE_PACKAGE_USAGE = 'student/UPDATE_PACKAGE_USAGE';

// ─── Action Interfaces ────────────────────────────────────────────────────────

export interface SetInstructorsAction {
  type: typeof SET_INSTRUCTORS;
  payload: { instructors: StudentInstructor[] };
}

export interface SendRequestAction {
  type: typeof SEND_REQUEST;
  payload: { request: InstructorRequest };
}

export interface UpdateRequestStatusAction {
  type: typeof UPDATE_REQUEST_STATUS;
  payload: {
    requestId: string;
    status: InstructorRequestStatus;
    responseDate?: string;
    message?: string;
  };
}

export interface SetMyInstructorsAction {
  type: typeof SET_MY_INSTRUCTORS;
  payload: { instructors: StudentInstructor[] };
}

export interface SetPackagesAction {
  type: typeof SET_PACKAGES;
  payload: { instructorId: string; packages: InstructorPackage[] };
}

export interface PurchasePackageAction {
  type: typeof PURCHASE_PACKAGE;
  payload: { purchasedPackage: PurchasedPackage };
}

export interface SetAvailableSlotsAction {
  type: typeof SET_AVAILABLE_SLOTS;
  payload: { slots: AvailableSlot[] };
}

export interface BookLessonAction {
  type: typeof BOOK_LESSON;
  payload: { lesson: BookedLesson };
}

export interface UpdateLessonStatusAction {
  type: typeof UPDATE_LESSON_STATUS;
  payload: {
    lessonId: string;
    status: BookingLessonStatus;
    cancelledBy?: 'student' | 'instructor';
  };
}

export interface CancelBookingAction {
  type: typeof CANCEL_BOOKING;
  payload: { lessonId: string; cancelledBy: 'student' | 'instructor' };
}

export interface SetLoadingAction {
  type: typeof SET_LOADING;
  payload: {
    key: 'searchLoading' | 'packagesLoading' | 'slotsLoading' | 'bookingLoading' | 'requestLoading';
    value: boolean;
  };
}

export interface UpdatePackageUsageAction {
  type: typeof UPDATE_PACKAGE_USAGE;
  payload: { purchasedPackageId: string; lessonsUsed: number };
}

export type StudentAction =
  | SetInstructorsAction
  | SendRequestAction
  | UpdateRequestStatusAction
  | SetMyInstructorsAction
  | SetPackagesAction
  | PurchasePackageAction
  | SetAvailableSlotsAction
  | BookLessonAction
  | UpdateLessonStatusAction
  | CancelBookingAction
  | SetLoadingAction
  | UpdatePackageUsageAction;

// ─── State Shape ──────────────────────────────────────────────────────────────

export interface StudentState {
  instructors: StudentInstructor[];
  myInstructors: StudentInstructor[];
  requests: InstructorRequest[];
  packages: Record<string, InstructorPackage[]>;
  purchasedPackages: PurchasedPackage[];
  availableSlots: AvailableSlot[];
  lessons: BookedLesson[];
  searchLoading: boolean;
  packagesLoading: boolean;
  slotsLoading: boolean;
  bookingLoading: boolean;
  requestLoading: boolean;
}
