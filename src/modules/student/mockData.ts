/**
 * GDS Driving School — Student Module Mock Data
 * ================================================
 *
 * Realistic driving lesson data for UI development.
 * No backend integration — pure mock data.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Instructor {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  transmissionType: 'Manual' | 'Automatic' | 'Both';
  coveredPostcodes: string[];
  acceptingStudents: boolean;
  about: string;
  yearsExperience: number;
  passRate: number;
  reviews: Review[];
}

export interface Review {
  id: string;
  studentName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Package {
  id: string;
  instructorId: string;
  title: string;
  description: string;
  lessonCount: number;
  originalPrice: number;
  finalPrice: number;
  popular?: boolean;
}

export type LessonStatus = 'upcoming' | 'completed' | 'cancelled';

export interface Lesson {
  id: string;
  instructorName: string;
  instructorAvatar: string;
  date: string;
  time: string;
  duration: string;
  status: LessonStatus;
  location?: string;
}

export interface Conversation {
  id: string;
  instructorName: string;
  instructorAvatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  text: string;
  sender: 'student' | 'instructor';
  timestamp: string;
}

export type RequestStatus = 'pending' | 'accepted' | 'rejected';

export interface StudentRequest {
  id: string;
  instructorId: string;
  instructorName: string;
  instructorAvatar: string;
  status: RequestStatus;
  sentDate: string;
  responseDate?: string;
  studentMessage?: string;
  instructorMessage?: string;
}

// ─── Student Profile ──────────────────────────────────────────────────────────

export const studentProfile = {
  id: 'STU-001',
  name: 'Alex Johnson',
  remainingHours: 14,
  totalHours: 30,
  activeInstructor: 'James Mitchell',
  activeInstructorAvatar: 'JM',
};

// ─── Instructors ──────────────────────────────────────────────────────────────

export const instructors: Instructor[] = [
  {
    id: 'INS-001',
    name: 'James Mitchell',
    avatar: 'JM',
    rating: 4.9,
    reviewCount: 127,
    transmissionType: 'Both',
    coveredPostcodes: ['SW1', 'SW3', 'SW5', 'SW7'],
    acceptingStudents: true,
    about:
      'DVSA-approved instructor with 12 years of experience. I specialise in building confidence for nervous learners and have an exceptional first-time pass rate. My lessons are structured, patient, and tailored to your pace.',
    yearsExperience: 12,
    passRate: 94,
    reviews: [
      {
        id: 'REV-001',
        studentName: 'Emma T.',
        rating: 5,
        comment:
          'James was incredibly patient and helped me pass first time! Highly recommend.',
        date: '2026-01-15',
      },
      {
        id: 'REV-002',
        studentName: 'Oliver K.',
        rating: 5,
        comment:
          'Structured lessons with clear progress tracking. Best instructor in South London.',
        date: '2025-12-20',
      },
      {
        id: 'REV-003',
        studentName: 'Sophie R.',
        rating: 4,
        comment:
          'Very professional and easy to get along with. Made me feel at ease from day one.',
        date: '2025-11-08',
      },
    ],
  },
  {
    id: 'INS-002',
    name: 'Sarah Collins',
    avatar: 'SC',
    rating: 4.8,
    reviewCount: 93,
    transmissionType: 'Automatic',
    coveredPostcodes: ['E1', 'E2', 'E3', 'E14'],
    acceptingStudents: true,
    about:
      'Friendly and dedicated automatic-only instructor covering East London. I focus on making you a safe, confident driver — not just someone who passes the test. DVSA Grade A.',
    yearsExperience: 8,
    passRate: 91,
    reviews: [
      {
        id: 'REV-004',
        studentName: 'Rahul P.',
        rating: 5,
        comment: 'Sarah is amazing! Super patient and encouraging. Passed on first attempt.',
        date: '2026-02-01',
      },
      {
        id: 'REV-005',
        studentName: 'Lucy W.',
        rating: 5,
        comment: 'Great instructor, really knows how to explain things clearly.',
        date: '2025-12-05',
      },
    ],
  },
  {
    id: 'INS-003',
    name: 'David Park',
    avatar: 'DP',
    rating: 4.7,
    reviewCount: 64,
    transmissionType: 'Manual',
    coveredPostcodes: ['N1', 'N7', 'N19', 'NW5'],
    acceptingStudents: true,
    about:
      'Manual specialist based in North London. I believe mastering manual gives you complete control. Relaxed teaching style with a structured syllabus. Book a trial lesson today!',
    yearsExperience: 6,
    passRate: 88,
    reviews: [
      {
        id: 'REV-006',
        studentName: 'Meera S.',
        rating: 5,
        comment: 'David made manual driving feel so natural. Excellent teacher!',
        date: '2026-01-28',
      },
    ],
  },
  {
    id: 'INS-004',
    name: 'Priya Sharma',
    avatar: 'PS',
    rating: 4.6,
    reviewCount: 45,
    transmissionType: 'Automatic',
    coveredPostcodes: ['SE1', 'SE5', 'SE15', 'SE22'],
    acceptingStudents: false,
    about:
      'Patient and thorough instructor covering South East London. My structured lesson plans ensure steady progress. Currently fully booked but check back soon!',
    yearsExperience: 5,
    passRate: 86,
    reviews: [
      {
        id: 'REV-007',
        studentName: 'Tom B.',
        rating: 4,
        comment: 'Really good lessons. Priya explains everything step by step.',
        date: '2025-11-22',
      },
    ],
  },
  {
    id: 'INS-005',
    name: 'Michael O\'Brien',
    avatar: 'MO',
    rating: 4.9,
    reviewCount: 156,
    transmissionType: 'Both',
    coveredPostcodes: ['W1', 'W2', 'W8', 'W11'],
    acceptingStudents: true,
    about:
      'Premium driving instruction in Central & West London. 15 years experience, DVSA Grade A rated. I offer both manual and automatic lessons with flexible scheduling.',
    yearsExperience: 15,
    passRate: 96,
    reviews: [
      {
        id: 'REV-008',
        studentName: 'Jessica L.',
        rating: 5,
        comment:
          'Michael is worth every penny. Incredibly professional and effective teaching style.',
        date: '2026-02-10',
      },
      {
        id: 'REV-009',
        studentName: 'Daniel H.',
        rating: 5,
        comment: 'The best! Passed with only 2 minors thanks to his guidance.',
        date: '2026-01-05',
      },
    ],
  },
];

// ─── Packages ─────────────────────────────────────────────────────────────────

export const packages: Package[] = [
  {
    id: 'PKG-001',
    instructorId: 'INS-001',
    title: 'Starter Pack',
    description: 'Perfect for beginners. Covers basics, steering, and road positioning.',
    lessonCount: 5,
    originalPrice: 175,
    finalPrice: 150,
  },
  {
    id: 'PKG-002',
    instructorId: 'INS-001',
    title: 'Confidence Builder',
    description:
      'Build real road confidence with dual carriageways, roundabouts, and city driving.',
    lessonCount: 10,
    originalPrice: 340,
    finalPrice: 290,
    popular: true,
  },
  {
    id: 'PKG-003',
    instructorId: 'INS-001',
    title: 'Test Ready',
    description:
      'Intensive preparation for your driving test. Includes mock tests and manoeuvres.',
    lessonCount: 20,
    originalPrice: 660,
    finalPrice: 540,
  },
  {
    id: 'PKG-004',
    instructorId: 'INS-001',
    title: 'Premium Complete',
    description:
      'Full learning journey from first lesson to test day. Best value for serious learners.',
    lessonCount: 30,
    originalPrice: 990,
    finalPrice: 750,
    popular: true,
  },
];

// ─── Lessons ──────────────────────────────────────────────────────────────────

export const lessons: Lesson[] = [
  {
    id: 'LES-001',
    instructorName: 'James Mitchell',
    instructorAvatar: 'JM',
    date: '2026-02-27',
    time: '10:00 AM',
    duration: '2 hours',
    status: 'upcoming',
    location: 'SW1 Pick-up Point',
  },
  {
    id: 'LES-002',
    instructorName: 'James Mitchell',
    instructorAvatar: 'JM',
    date: '2026-03-02',
    time: '2:00 PM',
    duration: '1.5 hours',
    status: 'upcoming',
    location: 'SW3 Main Road',
  },
  {
    id: 'LES-003',
    instructorName: 'James Mitchell',
    instructorAvatar: 'JM',
    date: '2026-03-06',
    time: '11:00 AM',
    duration: '2 hours',
    status: 'upcoming',
    location: 'SW5 Test Centre',
  },
  {
    id: 'LES-004',
    instructorName: 'James Mitchell',
    instructorAvatar: 'JM',
    date: '2026-02-20',
    time: '10:00 AM',
    duration: '2 hours',
    status: 'completed',
    location: 'SW1 Pick-up Point',
  },
  {
    id: 'LES-005',
    instructorName: 'James Mitchell',
    instructorAvatar: 'JM',
    date: '2026-02-17',
    time: '9:00 AM',
    duration: '1.5 hours',
    status: 'completed',
    location: 'SW7 Roundabout Practice',
  },
  {
    id: 'LES-006',
    instructorName: 'James Mitchell',
    instructorAvatar: 'JM',
    date: '2026-02-13',
    time: '3:00 PM',
    duration: '2 hours',
    status: 'completed',
    location: 'SW3 Dual Carriageway',
  },
  {
    id: 'LES-007',
    instructorName: 'James Mitchell',
    instructorAvatar: 'JM',
    date: '2026-02-10',
    time: '11:00 AM',
    duration: '1 hour',
    status: 'cancelled',
    location: 'SW1 Pick-up Point',
  },
  {
    id: 'LES-008',
    instructorName: 'Sarah Collins',
    instructorAvatar: 'SC',
    date: '2026-01-28',
    time: '2:00 PM',
    duration: '2 hours',
    status: 'cancelled',
    location: 'E1 Tower Hamlets',
  },
];

// ─── Conversations ────────────────────────────────────────────────────────────

export const conversations: Conversation[] = [
  {
    id: 'CONV-001',
    instructorName: 'James Mitchell',
    instructorAvatar: 'JM',
    lastMessage: 'See you Thursday at 10am. Don\'t forget your provisional!',
    timestamp: '2:30 PM',
    unreadCount: 2,
  },
  {
    id: 'CONV-002',
    instructorName: 'Sarah Collins',
    instructorAvatar: 'SC',
    lastMessage: 'Thanks for your interest! I have availability next week.',
    timestamp: 'Yesterday',
    unreadCount: 0,
  },
  {
    id: 'CONV-003',
    instructorName: 'Michael O\'Brien',
    instructorAvatar: 'MO',
    lastMessage: 'Your test preparation schedule is attached.',
    timestamp: 'Mon',
    unreadCount: 1,
  },
];

// ─── Chat Messages ────────────────────────────────────────────────────────────

export const chatMessages: ChatMessage[] = [
  // Conversation with James Mitchell
  {
    id: 'MSG-001',
    conversationId: 'CONV-001',
    text: 'Hi James, I wanted to confirm our lesson for Thursday.',
    sender: 'student',
    timestamp: '2:15 PM',
  },
  {
    id: 'MSG-002',
    conversationId: 'CONV-001',
    text: 'Yes, confirmed! We\'ll focus on roundabouts and lane discipline.',
    sender: 'instructor',
    timestamp: '2:22 PM',
  },
  {
    id: 'MSG-003',
    conversationId: 'CONV-001',
    text: 'Sounds great. Should I bring anything specific?',
    sender: 'student',
    timestamp: '2:25 PM',
  },
  {
    id: 'MSG-004',
    conversationId: 'CONV-001',
    text: 'See you Thursday at 10am. Don\'t forget your provisional!',
    sender: 'instructor',
    timestamp: '2:30 PM',
  },
  {
    id: 'MSG-005',
    conversationId: 'CONV-001',
    text: 'Perfect, will do. Thanks James!',
    sender: 'student',
    timestamp: '2:31 PM',
  },
  // Conversation with Sarah Collins
  {
    id: 'MSG-006',
    conversationId: 'CONV-002',
    text: 'Hi Sarah, do you offer automatic lessons in E14 area?',
    sender: 'student',
    timestamp: '10:00 AM',
  },
  {
    id: 'MSG-007',
    conversationId: 'CONV-002',
    text: 'Thanks for your interest! I have availability next week.',
    sender: 'instructor',
    timestamp: '11:30 AM',
  },
  // Conversation with Michael O'Brien
  {
    id: 'MSG-008',
    conversationId: 'CONV-003',
    text: 'Hi Michael, I\'d like to know more about your test prep package.',
    sender: 'student',
    timestamp: '9:00 AM',
  },
  {
    id: 'MSG-009',
    conversationId: 'CONV-003',
    text: 'Great to hear from you! The test prep package includes 20 lessons with focus on mock tests, manoeuvres, and building exam confidence.',
    sender: 'instructor',
    timestamp: '9:45 AM',
  },
  {
    id: 'MSG-010',
    conversationId: 'CONV-003',
    text: 'Your test preparation schedule is attached.',
    sender: 'instructor',
    timestamp: '9:46 AM',
  },
];

// ─── Student Requests ─────────────────────────────────────────────────────────

export const studentRequests: StudentRequest[] = [
  {
    id: 'REQ-001',
    instructorId: 'INS-001',
    instructorName: 'James Mitchell',
    instructorAvatar: 'JM',
    status: 'accepted',
    sentDate: '2026-02-10',
    responseDate: '2026-02-11',
    studentMessage:
      'Hi James, I\'m looking for an instructor in the SW area for manual + automatic lessons. Would love to join your calendar!',
    instructorMessage:
      'Welcome aboard, Alex! I\'d be happy to take you on. Feel free to browse my packages and book whenever you\'re ready.',
  },
  {
    id: 'REQ-002',
    instructorId: 'INS-002',
    instructorName: 'Sarah Collins',
    instructorAvatar: 'SC',
    status: 'pending',
    sentDate: '2026-02-22',
    studentMessage:
      'Hi Sarah, I\'m interested in automatic lessons in the E14 area. Do you have availability?',
  },
  {
    id: 'REQ-003',
    instructorId: 'INS-004',
    instructorName: 'Priya Sharma',
    instructorAvatar: 'PS',
    status: 'rejected',
    sentDate: '2026-02-18',
    responseDate: '2026-02-19',
    studentMessage:
      'Hello Priya, I\'d like to book automatic lessons in the SE15 area.',
    instructorMessage:
      'Thank you for your interest, Alex. Unfortunately I\'m fully booked at the moment. Please try again in a few weeks!',
  },
];
