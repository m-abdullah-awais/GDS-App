/**
 * GDS Driving School — Admin Redux Types
 * =========================================
 */

// ─── Entity Types ─────────────────────────────────────────────────────────────

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type AccountStatus = 'active' | 'suspended' | 'inactive';
export type PaymentStatus = 'paid' | 'pending';
export type MessageStatus = 'unread' | 'read' | 'resolved';

export interface AdminStudent {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  registrationDate: string;
  approvalStatus: ApprovalStatus;
  accountStatus: AccountStatus;
  instructorAssigned: string;
  lessonsCompleted: number;
  upcomingLessons: number;
  rating: number;
  avatar: string;
  lessons: StudentLesson[];
}

export interface StudentLesson {
  id: string;
  date: string;
  time: string;
  instructor: string;
  type: string;
  status: 'completed' | 'upcoming' | 'cancelled';
  duration: string;
}

export interface AdminInstructor {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  experience: string;
  licenseNumber: string;
  documentsUploaded: DocumentItem[];
  stripeAccountId: string;
  stripeConnectionStatus: 'connected' | 'pending' | 'not_connected';
  rating: number;
  completedLessons: number;
  earningsTotal: number;
  pendingPayment: number;
  approvalStatus: ApprovalStatus;
  accountStatus: AccountStatus;
  avatar: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  type: string;
  uploadedDate: string;
  status: 'verified' | 'pending' | 'rejected';
}

export interface Transaction {
  id: string;
  instructorId: string;
  instructorName: string;
  amount: number;
  date: string;
  status: PaymentStatus;
  method: string;
  description: string;
}

export interface Conversation {
  id: string;
  instructorId: string;
  instructorName: string;
  instructorAvatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  status: MessageStatus;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'admin' | 'instructor';
  text: string;
  timestamp: string;
  seen: boolean;
}

export interface AdminSettings {
  lessonPricingDefault: number;
  platformFees: number;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsAlerts: boolean;
}

export interface AdminPackage {
  id: string;
  instructorId: string;
  instructorName: string;
  title: string;
  description: string;
  lessonCount: number;
  price: number;
  commissionPercentage: number;
  status: ApprovalStatus;
  createdAt: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalInstructors: number;
  activeLessons: number;
  pendingApprovals: number;
  monthlyRevenue: number;
  pendingPayouts: number;
}

// ─── State Shape ──────────────────────────────────────────────────────────────

export interface AdminState {
  students: AdminStudent[];
  instructors: AdminInstructor[];
  transactions: Transaction[];
  conversations: Conversation[];
  messages: ChatMessage[];
  packages: AdminPackage[];
  settings: AdminSettings;
  dashboardStats: DashboardStats;
}

// ─── Action Types ─────────────────────────────────────────────────────────────

export const APPROVE_STUDENT = 'admin/APPROVE_STUDENT';
export const REJECT_STUDENT = 'admin/REJECT_STUDENT';
export const SUSPEND_STUDENT = 'admin/SUSPEND_STUDENT';
export const ACTIVATE_STUDENT = 'admin/ACTIVATE_STUDENT';
export const DELETE_STUDENT = 'admin/DELETE_STUDENT';

export const APPROVE_INSTRUCTOR = 'admin/APPROVE_INSTRUCTOR';
export const REJECT_INSTRUCTOR = 'admin/REJECT_INSTRUCTOR';
export const SUSPEND_INSTRUCTOR = 'admin/SUSPEND_INSTRUCTOR';
export const ACTIVATE_INSTRUCTOR = 'admin/ACTIVATE_INSTRUCTOR';

export const TRANSFER_PAYMENT = 'admin/TRANSFER_PAYMENT';

export const SEND_MESSAGE = 'admin/SEND_MESSAGE';
export const MARK_CONVERSATION_RESOLVED = 'admin/MARK_CONVERSATION_RESOLVED';
export const MARK_CONVERSATION_READ = 'admin/MARK_CONVERSATION_READ';

export const UPDATE_SETTINGS = 'admin/UPDATE_SETTINGS';

export const APPROVE_PACKAGE = 'admin/APPROVE_PACKAGE';
export const REJECT_PACKAGE = 'admin/REJECT_PACKAGE';
export const UPDATE_PACKAGE_COMMISSION = 'admin/UPDATE_PACKAGE_COMMISSION';
export const DELETE_PACKAGE = 'admin/DELETE_PACKAGE';

// ─── Action Interfaces ───────────────────────────────────────────────────────

interface ApproveStudentAction {
  type: typeof APPROVE_STUDENT;
  payload: { studentId: string };
}

interface RejectStudentAction {
  type: typeof REJECT_STUDENT;
  payload: { studentId: string };
}

interface SuspendStudentAction {
  type: typeof SUSPEND_STUDENT;
  payload: { studentId: string };
}

interface ActivateStudentAction {
  type: typeof ACTIVATE_STUDENT;
  payload: { studentId: string };
}

interface DeleteStudentAction {
  type: typeof DELETE_STUDENT;
  payload: { studentId: string };
}

interface ApproveInstructorAction {
  type: typeof APPROVE_INSTRUCTOR;
  payload: { instructorId: string };
}

interface RejectInstructorAction {
  type: typeof REJECT_INSTRUCTOR;
  payload: { instructorId: string };
}

interface SuspendInstructorAction {
  type: typeof SUSPEND_INSTRUCTOR;
  payload: { instructorId: string };
}

interface ActivateInstructorAction {
  type: typeof ACTIVATE_INSTRUCTOR;
  payload: { instructorId: string };
}

interface TransferPaymentAction {
  type: typeof TRANSFER_PAYMENT;
  payload: { instructorId: string; amount: number };
}

interface SendMessageAction {
  type: typeof SEND_MESSAGE;
  payload: { conversationId: string; text: string };
}

interface MarkConversationResolvedAction {
  type: typeof MARK_CONVERSATION_RESOLVED;
  payload: { conversationId: string };
}

interface MarkConversationReadAction {
  type: typeof MARK_CONVERSATION_READ;
  payload: { conversationId: string };
}

interface UpdateSettingsAction {
  type: typeof UPDATE_SETTINGS;
  payload: Partial<AdminSettings>;
}

interface ApprovePackageAction {
  type: typeof APPROVE_PACKAGE;
  payload: { packageId: string };
}

interface RejectPackageAction {
  type: typeof REJECT_PACKAGE;
  payload: { packageId: string };
}

interface UpdatePackageCommissionAction {
  type: typeof UPDATE_PACKAGE_COMMISSION;
  payload: { packageId: string; commissionPercentage: number };
}

interface DeletePackageAction {
  type: typeof DELETE_PACKAGE;
  payload: { packageId: string };
}

export type AdminAction =
  | ApproveStudentAction
  | RejectStudentAction
  | SuspendStudentAction
  | ActivateStudentAction
  | DeleteStudentAction
  | ApproveInstructorAction
  | RejectInstructorAction
  | SuspendInstructorAction
  | ActivateInstructorAction
  | TransferPaymentAction
  | SendMessageAction
  | MarkConversationResolvedAction
  | MarkConversationReadAction
  | UpdateSettingsAction
  | ApprovePackageAction
  | RejectPackageAction
  | UpdatePackageCommissionAction
  | DeletePackageAction;
