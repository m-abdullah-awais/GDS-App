/**
 * GDS — Instructor View-Model Types
 * ====================================
 * UI-layer types used by instructor screens, formerly in modules/instructor/mockData.ts.
 * These are view-model shapes consumed by components; Firestore types live in the other type files.
 */

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type LessonStatus = 'upcoming' | 'completed' | 'pending_review' | 'confirmed' | 'cancelled' | 'pending';

export interface InstructorLesson {
  id: string;
  studentName: string;
  studentAvatar: string;
  date: string;
  time: string;
  duration: string;
  status: string;
  reviewed: boolean;
}

export interface LessonReview {
  id: string;
  lessonId: string;
  studentName: string;
  date: string;
  duration: string;
  rating: number;
  comment: string;
  skills?: { skill: string; rating: number }[];
  notes?: string;
  action?: 'submit' | 'cancel' | 'lesson_cancelled';
}

export interface InstructorConversation {
  id: string;
  studentName: string;
  studentAvatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

export interface InstructorChatMessage {
  id: string;
  conversationId: string;
  text: string;
  sender: 'student' | 'instructor';
  timestamp: string;
}

export interface InstructorStudent {
  id: string;
  name: string;
  avatar: string;
  postcode: string;
  email: string;
  phone: string;
  lessonsCompleted: number;
  totalLessons: number;
}

export interface InstructorPackageView {
  id: string;
  title: string;
  description: string;
  lessonCount: number;
  price: number;
  commissionPercentage: number;
  status: ApprovalStatus;
  createdAt: string;
}

export interface AvailabilitySlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface Area {
  id: string;
  name: string;
  postcodes: Postcode[];
}

export interface Postcode {
  id: string;
  code: string;
  selected: boolean;
}

export interface StudentRequestView {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  postcode: string;
  status: 'pending' | 'accepted' | 'rejected';
  direction: 'incoming' | 'outgoing';
  sentDate: string;
  responseDate?: string;
}

export interface EarningsSummary {
  totalEarnings: number;
  thisMonth: number;
  lastMonth: number;
  pendingPayout: number;
  totalLessons: number;
  commissionPaid: number;
}

export interface TransactionView {
  id: string;
  studentName: string;
  packageName: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending';
}
