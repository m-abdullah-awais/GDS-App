/**
 * GDS Driving School — Instructor Module Mock Data
 * ===================================================
 *
 * Realistic data for the Instructor flow UI development.
 * No backend integration — pure mock data.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type TransmissionType = 'Manual' | 'Automatic' | 'Both';

export interface InstructorProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatar: string;
  experience: number;
  transmissionType: TransmissionType;
  areas: string[];
  insuranceBadge: string | null;
  drivingLicense: string | null;
  approvalStatus: ApprovalStatus;
  profileCompleted: boolean;
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

export interface InstructorPackage {
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
  day: string;
  startTime: string;
  endTime: string;
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

export type StudentRequestStatus = 'pending' | 'accepted' | 'rejected';
export type StudentRequestDirection = 'incoming' | 'outgoing';

export interface StudentRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  postcode: string;
  status: StudentRequestStatus;
  direction: StudentRequestDirection;
  sentDate: string;
  responseDate?: string;
}

export type LessonStatus = 'upcoming' | 'completed' | 'pending_review';

export interface InstructorLesson {
  id: string;
  studentName: string;
  studentAvatar: string;
  date: string;
  time: string;
  duration: string;
  status: LessonStatus;
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
}

export interface Transaction {
  id: string;
  studentName: string;
  packageName: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending';
}

export interface EarningsSummary {
  totalEarnings: number;
  thisMonth: number;
  lastMonth: number;
  pendingPayout: number;
  totalLessons: number;
  commissionPaid: number;
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

// ─── Instructor Profile ───────────────────────────────────────────────────────

export const instructorProfile: InstructorProfile = {
  id: 'INS-001',
  fullName: 'James Mitchell',
  email: 'james.mitchell@gds.com',
  phone: '+44 7700 900123',
  avatar: 'JM',
  experience: 12,
  transmissionType: 'Both',
  areas: ['South West London', 'Central London'],
  insuranceBadge: 'insurance_badge.pdf',
  drivingLicense: 'driving_license.pdf',
  approvalStatus: 'approved',
  profileCompleted: true,
};

// ─── Areas & Postcodes ────────────────────────────────────────────────────────

export const areas: Area[] = [
  {
    id: 'AREA-001',
    name: 'South West London',
    postcodes: [
      { id: 'PC-001', code: 'SW1', selected: true },
      { id: 'PC-002', code: 'SW3', selected: true },
      { id: 'PC-003', code: 'SW5', selected: true },
      { id: 'PC-004', code: 'SW7', selected: true },
      { id: 'PC-005', code: 'SW9', selected: false },
      { id: 'PC-006', code: 'SW11', selected: false },
      { id: 'PC-007', code: 'SW15', selected: false },
    ],
  },
  {
    id: 'AREA-002',
    name: 'Central London',
    postcodes: [
      { id: 'PC-008', code: 'W1', selected: true },
      { id: 'PC-009', code: 'W2', selected: false },
      { id: 'PC-010', code: 'WC1', selected: true },
      { id: 'PC-011', code: 'WC2', selected: false },
      { id: 'PC-012', code: 'EC1', selected: false },
      { id: 'PC-013', code: 'EC2', selected: false },
    ],
  },
  {
    id: 'AREA-003',
    name: 'North London',
    postcodes: [
      { id: 'PC-014', code: 'N1', selected: false },
      { id: 'PC-015', code: 'N7', selected: false },
      { id: 'PC-016', code: 'N19', selected: false },
      { id: 'PC-017', code: 'NW1', selected: false },
      { id: 'PC-018', code: 'NW3', selected: false },
      { id: 'PC-019', code: 'NW5', selected: false },
    ],
  },
  {
    id: 'AREA-004',
    name: 'East London',
    postcodes: [
      { id: 'PC-020', code: 'E1', selected: false },
      { id: 'PC-021', code: 'E2', selected: false },
      { id: 'PC-022', code: 'E3', selected: false },
      { id: 'PC-023', code: 'E14', selected: false },
      { id: 'PC-024', code: 'E15', selected: false },
    ],
  },
  {
    id: 'AREA-005',
    name: 'South East London',
    postcodes: [
      { id: 'PC-025', code: 'SE1', selected: false },
      { id: 'PC-026', code: 'SE5', selected: false },
      { id: 'PC-027', code: 'SE15', selected: false },
      { id: 'PC-028', code: 'SE22', selected: false },
    ],
  },
];

// ─── Packages ─────────────────────────────────────────────────────────────────

export const instructorPackages: InstructorPackage[] = [
  {
    id: 'PKG-001',
    title: 'Starter Pack',
    description: 'Perfect for beginners. Covers basics, steering, and road positioning.',
    lessonCount: 5,
    price: 150,
    commissionPercentage: 15,
    status: 'approved',
    createdAt: '2026-01-10',
  },
  {
    id: 'PKG-002',
    title: 'Confidence Builder',
    description: 'Build real road confidence with dual carriageways, roundabouts, and city driving.',
    lessonCount: 10,
    price: 290,
    commissionPercentage: 15,
    status: 'approved',
    createdAt: '2026-01-15',
  },
  {
    id: 'PKG-003',
    title: 'Test Ready',
    description: 'Intensive preparation for your driving test. Includes mock tests and manoeuvres.',
    lessonCount: 20,
    price: 540,
    commissionPercentage: 15,
    status: 'pending',
    createdAt: '2026-02-20',
  },
  {
    id: 'PKG-004',
    title: 'Premium Complete',
    description: 'Full learning journey from first lesson to test day. Best value for serious learners.',
    lessonCount: 30,
    price: 750,
    commissionPercentage: 15,
    status: 'approved',
    createdAt: '2026-01-05',
  },
];

// ─── Availability Slots ───────────────────────────────────────────────────────

export const availabilitySlots: AvailabilitySlot[] = [
  { id: 'SLOT-001', day: 'Mon', startTime: '09:00', endTime: '12:00' },
  { id: 'SLOT-002', day: 'Mon', startTime: '14:00', endTime: '17:00' },
  { id: 'SLOT-003', day: 'Tue', startTime: '10:00', endTime: '13:00' },
  { id: 'SLOT-004', day: 'Tue', startTime: '15:00', endTime: '18:00' },
  { id: 'SLOT-005', day: 'Wed', startTime: '09:00', endTime: '11:00' },
  { id: 'SLOT-006', day: 'Wed', startTime: '13:00', endTime: '16:00' },
  { id: 'SLOT-007', day: 'Thu', startTime: '08:00', endTime: '12:00' },
  { id: 'SLOT-008', day: 'Thu', startTime: '14:00', endTime: '18:00' },
  { id: 'SLOT-009', day: 'Fri', startTime: '09:00', endTime: '13:00' },
  { id: 'SLOT-010', day: 'Fri', startTime: '14:00', endTime: '17:00' },
  { id: 'SLOT-011', day: 'Sat', startTime: '10:00', endTime: '14:00' },
];

// ─── Students ─────────────────────────────────────────────────────────────────

export const instructorStudents: InstructorStudent[] = [
  {
    id: 'STU-001',
    name: 'Alex Johnson',
    avatar: 'AJ',
    postcode: 'SW1',
    email: 'alex.johnson@email.com',
    phone: '+44 7700 900201',
    lessonsCompleted: 16,
    totalLessons: 30,
  },
  {
    id: 'STU-002',
    name: 'Emma Thompson',
    avatar: 'ET',
    postcode: 'SW3',
    email: 'emma.t@email.com',
    phone: '+44 7700 900202',
    lessonsCompleted: 8,
    totalLessons: 10,
  },
  {
    id: 'STU-003',
    name: 'Oliver King',
    avatar: 'OK',
    postcode: 'SW5',
    email: 'oliver.king@email.com',
    phone: '+44 7700 900203',
    lessonsCompleted: 3,
    totalLessons: 5,
  },
  {
    id: 'STU-004',
    name: 'Sophie Richards',
    avatar: 'SR',
    postcode: 'W1',
    email: 'sophie.r@email.com',
    phone: '+44 7700 900204',
    lessonsCompleted: 20,
    totalLessons: 20,
  },
  {
    id: 'STU-005',
    name: 'Rahul Patel',
    avatar: 'RP',
    postcode: 'SW7',
    email: 'rahul.patel@email.com',
    phone: '+44 7700 900205',
    lessonsCompleted: 5,
    totalLessons: 10,
  },
];

// ─── Student Requests ─────────────────────────────────────────────────────────

export const studentRequests: StudentRequest[] = [
  {
    id: 'REQ-001',
    studentId: 'STU-006',
    studentName: 'Lucy Walker',
    studentAvatar: 'LW',
    postcode: 'SW9',
    status: 'pending',
    direction: 'incoming',
    sentDate: '2026-02-24',
  },
  {
    id: 'REQ-002',
    studentId: 'STU-007',
    studentName: 'Daniel Harris',
    studentAvatar: 'DH',
    postcode: 'SW11',
    status: 'pending',
    direction: 'incoming',
    sentDate: '2026-02-23',
  },
  {
    id: 'REQ-003',
    studentId: 'STU-008',
    studentName: 'Jessica Lee',
    studentAvatar: 'JL',
    postcode: 'W2',
    status: 'accepted',
    direction: 'incoming',
    sentDate: '2026-02-18',
    responseDate: '2026-02-19',
  },
  {
    id: 'REQ-004',
    studentId: 'STU-009',
    studentName: 'Tom Bennett',
    studentAvatar: 'TB',
    postcode: 'WC1',
    status: 'rejected',
    direction: 'incoming',
    sentDate: '2026-02-15',
    responseDate: '2026-02-16',
  },
  {
    id: 'REQ-005',
    studentId: 'STU-010',
    studentName: 'Meera Singh',
    studentAvatar: 'MS',
    postcode: 'N1',
    status: 'pending',
    direction: 'outgoing',
    sentDate: '2026-02-25',
  },
  {
    id: 'REQ-006',
    studentId: 'STU-011',
    studentName: 'Chris Adams',
    studentAvatar: 'CA',
    postcode: 'E1',
    status: 'accepted',
    direction: 'outgoing',
    sentDate: '2026-02-20',
    responseDate: '2026-02-21',
  },
];

// ─── Lessons ──────────────────────────────────────────────────────────────────

export const instructorLessons: InstructorLesson[] = [
  {
    id: 'LES-001',
    studentName: 'Alex Johnson',
    studentAvatar: 'AJ',
    date: '2026-02-28',
    time: '10:00 AM',
    duration: '2 hours',
    status: 'upcoming',
    reviewed: false,
  },
  {
    id: 'LES-002',
    studentName: 'Emma Thompson',
    studentAvatar: 'ET',
    date: '2026-03-01',
    time: '2:00 PM',
    duration: '1.5 hours',
    status: 'upcoming',
    reviewed: false,
  },
  {
    id: 'LES-003',
    studentName: 'Oliver King',
    studentAvatar: 'OK',
    date: '2026-03-02',
    time: '11:00 AM',
    duration: '1 hour',
    status: 'upcoming',
    reviewed: false,
  },
  {
    id: 'LES-004',
    studentName: 'Rahul Patel',
    studentAvatar: 'RP',
    date: '2026-03-03',
    time: '9:00 AM',
    duration: '2 hours',
    status: 'upcoming',
    reviewed: false,
  },
  {
    id: 'LES-005',
    studentName: 'Alex Johnson',
    studentAvatar: 'AJ',
    date: '2026-02-24',
    time: '10:00 AM',
    duration: '2 hours',
    status: 'completed',
    reviewed: true,
  },
  {
    id: 'LES-006',
    studentName: 'Emma Thompson',
    studentAvatar: 'ET',
    date: '2026-02-22',
    time: '3:00 PM',
    duration: '1.5 hours',
    status: 'completed',
    reviewed: true,
  },
  {
    id: 'LES-007',
    studentName: 'Sophie Richards',
    studentAvatar: 'SR',
    date: '2026-02-20',
    time: '11:00 AM',
    duration: '2 hours',
    status: 'pending_review',
    reviewed: false,
  },
  {
    id: 'LES-008',
    studentName: 'Oliver King',
    studentAvatar: 'OK',
    date: '2026-02-18',
    time: '1:00 PM',
    duration: '1 hour',
    status: 'pending_review',
    reviewed: false,
  },
  {
    id: 'LES-009',
    studentName: 'Rahul Patel',
    studentAvatar: 'RP',
    date: '2026-02-15',
    time: '9:00 AM',
    duration: '2 hours',
    status: 'pending_review',
    reviewed: false,
  },
];

// ─── Lesson Reviews ───────────────────────────────────────────────────────────

export const lessonReviews: LessonReview[] = [
  {
    id: 'REV-001',
    lessonId: 'LES-005',
    studentName: 'Alex Johnson',
    date: '2026-02-24',
    duration: '2 hours',
    rating: 5,
    comment: 'Excellent progress on roundabouts. Alex is gaining confidence quickly.',
  },
  {
    id: 'REV-002',
    lessonId: 'LES-006',
    studentName: 'Emma Thompson',
    date: '2026-02-22',
    duration: '1.5 hours',
    rating: 4,
    comment: 'Good lesson. Needs more practice with parallel parking.',
  },
];

// ─── Earnings & Transactions ──────────────────────────────────────────────────

export const earningsSummary: EarningsSummary = {
  totalEarnings: 4850,
  thisMonth: 1240,
  lastMonth: 980,
  pendingPayout: 320,
  totalLessons: 52,
  commissionPaid: 855,
};

export const transactions: Transaction[] = [
  {
    id: 'TXN-001',
    studentName: 'Alex Johnson',
    packageName: 'Premium Complete',
    amount: 750,
    date: '2026-02-25',
    status: 'completed',
  },
  {
    id: 'TXN-002',
    studentName: 'Emma Thompson',
    packageName: 'Confidence Builder',
    amount: 290,
    date: '2026-02-22',
    status: 'completed',
  },
  {
    id: 'TXN-003',
    studentName: 'Oliver King',
    packageName: 'Starter Pack',
    amount: 150,
    date: '2026-02-18',
    status: 'completed',
  },
  {
    id: 'TXN-004',
    studentName: 'Sophie Richards',
    packageName: 'Test Ready',
    amount: 540,
    date: '2026-02-15',
    status: 'completed',
  },
  {
    id: 'TXN-005',
    studentName: 'Rahul Patel',
    packageName: 'Confidence Builder',
    amount: 290,
    date: '2026-02-10',
    status: 'completed',
  },
  {
    id: 'TXN-006',
    studentName: 'Jessica Lee',
    packageName: 'Starter Pack',
    amount: 150,
    date: '2026-02-08',
    status: 'completed',
  },
  {
    id: 'TXN-007',
    studentName: 'Meera Singh',
    packageName: 'Premium Complete',
    amount: 750,
    date: '2026-02-05',
    status: 'pending',
  },
  {
    id: 'TXN-008',
    studentName: 'Chris Adams',
    packageName: 'Test Ready',
    amount: 540,
    date: '2026-01-28',
    status: 'completed',
  },
  {
    id: 'TXN-009',
    studentName: 'Daniel Harris',
    packageName: 'Starter Pack',
    amount: 150,
    date: '2026-01-20',
    status: 'completed',
  },
  {
    id: 'TXN-010',
    studentName: 'Lucy Walker',
    packageName: 'Confidence Builder',
    amount: 290,
    date: '2026-01-15',
    status: 'completed',
  },
];

// ─── Searchable Students (for Student Search screen) ──────────────────────────

export const searchableStudents: InstructorStudent[] = [
  ...instructorStudents,
  {
    id: 'STU-006',
    name: 'Lucy Walker',
    avatar: 'LW',
    postcode: 'SW9',
    email: 'lucy.w@email.com',
    phone: '+44 7700 900206',
    lessonsCompleted: 0,
    totalLessons: 0,
  },
  {
    id: 'STU-007',
    name: 'Daniel Harris',
    avatar: 'DH',
    postcode: 'SW11',
    email: 'daniel.h@email.com',
    phone: '+44 7700 900207',
    lessonsCompleted: 0,
    totalLessons: 0,
  },
  {
    id: 'STU-008',
    name: 'Jessica Lee',
    avatar: 'JL',
    postcode: 'W2',
    email: 'jessica.lee@email.com',
    phone: '+44 7700 900208',
    lessonsCompleted: 0,
    totalLessons: 0,
  },
  {
    id: 'STU-009',
    name: 'Tom Bennett',
    avatar: 'TB',
    postcode: 'WC1',
    email: 'tom.b@email.com',
    phone: '+44 7700 900209',
    lessonsCompleted: 0,
    totalLessons: 0,
  },
  {
    id: 'STU-010',
    name: 'Meera Singh',
    avatar: 'MS',
    postcode: 'N1',
    email: 'meera.s@email.com',
    phone: '+44 7700 900210',
    lessonsCompleted: 0,
    totalLessons: 0,
  },
  {
    id: 'STU-011',
    name: 'Chris Adams',
    avatar: 'CA',
    postcode: 'E1',
    email: 'chris.a@email.com',
    phone: '+44 7700 900211',
    lessonsCompleted: 0,
    totalLessons: 0,
  },
];

// ─── Conversations ────────────────────────────────────────────────────────────

export const instructorConversations: InstructorConversation[] = [
  {
    id: 'CONV-I-001',
    studentName: 'Alex Johnson',
    studentAvatar: 'AJ',
    lastMessage: 'Thanks for todays lesson, really helpful!',
    timestamp: '2 min ago',
    unreadCount: 2,
  },
  {
    id: 'CONV-I-002',
    studentName: 'Emma Thompson',
    studentAvatar: 'ET',
    lastMessage: 'Can we reschedule Thursday to Friday?',
    timestamp: '1 hr ago',
    unreadCount: 1,
  },
  {
    id: 'CONV-I-003',
    studentName: 'Oliver King',
    studentAvatar: 'OK',
    lastMessage: 'I will be there at 10. See you!',
    timestamp: 'Yesterday',
    unreadCount: 0,
  },
  {
    id: 'CONV-I-004',
    studentName: 'Sophie Richards',
    studentAvatar: 'SR',
    lastMessage: 'Passed my test! Thank you so much 🎉',
    timestamp: 'Mon',
    unreadCount: 0,
  },
  {
    id: 'CONV-I-005',
    studentName: 'Rahul Patel',
    studentAvatar: 'RP',
    lastMessage: 'Do I need to bring anything for the mock test?',
    timestamp: 'Sun',
    unreadCount: 0,
  },
];

// ─── Chat Messages ────────────────────────────────────────────────────────────

export const instructorChatMessages: InstructorChatMessage[] = [
  // Conversation with Alex Johnson
  {
    id: 'IMSG-001',
    conversationId: 'CONV-I-001',
    text: 'Hi, just wanted to say the parallel parking practice was really useful today.',
    sender: 'student',
    timestamp: '3:40 PM',
  },
  {
    id: 'IMSG-002',
    conversationId: 'CONV-I-001',
    text: 'Glad to hear it! You nailed it by the third attempt.',
    sender: 'instructor',
    timestamp: '3:42 PM',
  },
  {
    id: 'IMSG-003',
    conversationId: 'CONV-I-001',
    text: 'Should we do more manoeuvres next session?',
    sender: 'instructor',
    timestamp: '3:43 PM',
  },
  {
    id: 'IMSG-004',
    conversationId: 'CONV-I-001',
    text: 'Yes please! Bay parking is still tricky for me.',
    sender: 'student',
    timestamp: '3:45 PM',
  },
  {
    id: 'IMSG-005',
    conversationId: 'CONV-I-001',
    text: 'Thanks for todays lesson, really helpful!',
    sender: 'student',
    timestamp: '3:46 PM',
  },
  // Conversation with Emma Thompson
  {
    id: 'IMSG-006',
    conversationId: 'CONV-I-002',
    text: 'Hi James, can we reschedule Thursday to Friday?',
    sender: 'student',
    timestamp: '11:00 AM',
  },
  {
    id: 'IMSG-007',
    conversationId: 'CONV-I-002',
    text: 'Let me check my availability and get back to you.',
    sender: 'instructor',
    timestamp: '11:15 AM',
  },
  {
    id: 'IMSG-008',
    conversationId: 'CONV-I-002',
    text: 'Can we reschedule Thursday to Friday?',
    sender: 'student',
    timestamp: '2:00 PM',
  },
  // Conversation with Oliver King
  {
    id: 'IMSG-009',
    conversationId: 'CONV-I-003',
    text: 'What time is our lesson tomorrow?',
    sender: 'student',
    timestamp: '6:30 PM',
  },
  {
    id: 'IMSG-010',
    conversationId: 'CONV-I-003',
    text: 'We are set for 10am at the usual pickup point.',
    sender: 'instructor',
    timestamp: '6:45 PM',
  },
  {
    id: 'IMSG-011',
    conversationId: 'CONV-I-003',
    text: 'I will be there at 10. See you!',
    sender: 'student',
    timestamp: '6:50 PM',
  },
  // Conversation with Sophie Richards
  {
    id: 'IMSG-012',
    conversationId: 'CONV-I-004',
    text: 'Passed my test! Thank you so much 🎉',
    sender: 'student',
    timestamp: '12:00 PM',
  },
  {
    id: 'IMSG-013',
    conversationId: 'CONV-I-004',
    text: 'Congratulations Sophie! You worked so hard for this. Well deserved!',
    sender: 'instructor',
    timestamp: '12:10 PM',
  },
  // Conversation with Rahul Patel
  {
    id: 'IMSG-014',
    conversationId: 'CONV-I-005',
    text: 'Do I need to bring anything for the mock test?',
    sender: 'student',
    timestamp: '9:00 AM',
  },
  {
    id: 'IMSG-015',
    conversationId: 'CONV-I-005',
    text: 'Just your provisional licence and a good attitude! We will cover all the manoeuvres.',
    sender: 'instructor',
    timestamp: '9:30 AM',
  },
];