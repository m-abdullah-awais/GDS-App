/**
 * GDS Driving School — Student Module Mock Data (Refactored)
 * ============================================================
 * Structured mock data for the corrected student booking lifecycle.
 *
 * Flow: Search Instructors -> Send Request -> My Instructors ->
 *       View Packages -> Buy Package -> Book Lesson -> My Lessons
 */

import type {
  StudentInstructor,
  InstructorRequest,
  InstructorPackage,
  PurchasedPackage,
  AvailableSlot,
  BookedLesson,
  Review,
} from '../../store/student/types';

// ─── Re-export types for convenience ──────────────────────────────────────────

export type {
  StudentInstructor,
  InstructorRequest,
  InstructorPackage,
  PurchasedPackage,
  AvailableSlot,
  BookedLesson,
  Review,
};

// ─── Conversation / Chat types (unchanged) ────────────────────────────────────

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

// ─── Student Profile ──────────────────────────────────────────────────────────

export const studentProfile = {
  id: 'STU-001',
  name: 'Alex Johnson',
  email: 'alex.johnson@email.com',
  phone: '+44 7700 123456',
  remainingHours: 14,
  totalHours: 30,
  completedLessons: 6,
  activeInstructor: 'James Mitchell',
  activeInstructorAvatar: 'JM',
  memberSince: '2025-12-01',
};

// ─── Instructors ──────────────────────────────────────────────────────────────

export const instructors: StudentInstructor[] = [
  {
    id: 'INS-001',
    name: 'James Mitchell',
    avatar: 'JM',
    rating: 4.9,
    reviewCount: 127,
    experience: '12 years',
    city: 'South London',
    bio: 'DVSA-approved instructor specialising in building confidence for nervous learners.',
    passRate: 94,
    transmissionType: 'Both',
    coveredPostcodes: ['SW1', 'SW3', 'SW5', 'SW7'],
    acceptingStudents: true,
    about:
      'DVSA-approved instructor with 12 years of experience. I specialise in building confidence for nervous learners and have an exceptional first-time pass rate. My lessons are structured, patient, and tailored to your pace.',
    yearsExperience: 12,
    reviews: [
      {
        id: 'REV-001',
        studentName: 'Emma T.',
        rating: 5,
        comment: 'James was incredibly patient and helped me pass first time! Highly recommend.',
        date: '2026-01-15',
      },
      {
        id: 'REV-002',
        studentName: 'Oliver K.',
        rating: 5,
        comment: 'Structured lessons with clear progress tracking. Best instructor in South London.',
        date: '2025-12-20',
      },
      {
        id: 'REV-003',
        studentName: 'Sophie R.',
        rating: 4,
        comment: 'Very professional and easy to get along with. Made me feel at ease from day one.',
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
    experience: '8 years',
    city: 'East London',
    bio: 'Friendly automatic-only instructor covering East London. DVSA Grade A.',
    passRate: 91,
    transmissionType: 'Automatic',
    coveredPostcodes: ['E1', 'E2', 'E3', 'E14'],
    acceptingStudents: true,
    about:
      'Friendly and dedicated automatic-only instructor covering East London. I focus on making you a safe, confident driver — not just someone who passes the test. DVSA Grade A.',
    yearsExperience: 8,
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
    experience: '6 years',
    city: 'North London',
    bio: 'Manual specialist with a relaxed teaching style and structured syllabus.',
    passRate: 88,
    transmissionType: 'Manual',
    coveredPostcodes: ['N1', 'N7', 'N19', 'NW5'],
    acceptingStudents: true,
    about:
      'Manual specialist based in North London. I believe mastering manual gives you complete control. Relaxed teaching style with a structured syllabus. Book a trial lesson today!',
    yearsExperience: 6,
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
    experience: '5 years',
    city: 'South East London',
    bio: 'Patient and thorough instructor with structured lesson plans.',
    passRate: 86,
    transmissionType: 'Automatic',
    coveredPostcodes: ['SE1', 'SE5', 'SE15', 'SE22'],
    acceptingStudents: false,
    about:
      'Patient and thorough instructor covering South East London. My structured lesson plans ensure steady progress. Currently fully booked but check back soon!',
    yearsExperience: 5,
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
    name: "Michael O'Brien",
    avatar: 'MO',
    rating: 4.9,
    reviewCount: 156,
    experience: '15 years',
    city: 'West London',
    bio: 'Premium driving instruction. 15 years experience, DVSA Grade A rated.',
    passRate: 96,
    transmissionType: 'Both',
    coveredPostcodes: ['W1', 'W2', 'W8', 'W11'],
    acceptingStudents: true,
    about:
      'Premium driving instruction in Central & West London. 15 years experience, DVSA Grade A rated. I offer both manual and automatic lessons with flexible scheduling.',
    yearsExperience: 15,
    reviews: [
      {
        id: 'REV-008',
        studentName: 'Jessica L.',
        rating: 5,
        comment: 'Michael is worth every penny. Incredibly professional and effective teaching style.',
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

// ─── Instructor Requests ──────────────────────────────────────────────────────

export const studentRequests: InstructorRequest[] = [
  {
    id: 'REQ-001',
    instructorId: 'INS-001',
    status: 'accepted',
    sentDate: '2026-02-10',
    responseDate: '2026-02-11',
    message: 'Welcome aboard, Alex! Feel free to browse my packages and book whenever you\'re ready.',
  },
  {
    id: 'REQ-002',
    instructorId: 'INS-002',
    status: 'pending',
    sentDate: '2026-02-22',
  },
  {
    id: 'REQ-003',
    instructorId: 'INS-004',
    status: 'rejected',
    sentDate: '2026-02-18',
    responseDate: '2026-02-19',
    message: 'Sorry, I\'m fully booked. Please try again in a few weeks!',
  },
];

// ─── Instructor Packages (keyed by instructor ID) ─────────────────────────────

export const instructorPackages: Record<string, InstructorPackage[]> = {
  'INS-001': [
    {
      id: 'PKG-001',
      instructorId: 'INS-001',
      name: 'Starter Pack',
      totalLessons: 5,
      price: 150,
      duration: '1 hour',
      description: 'Perfect for beginners. Covers basics, steering, and road positioning.',
    },
    {
      id: 'PKG-002',
      instructorId: 'INS-001',
      name: 'Confidence Builder',
      totalLessons: 10,
      price: 290,
      duration: '1.5 hours',
      description: 'Build real road confidence with dual carriageways, roundabouts, and city driving.',
      popular: true,
    },
    {
      id: 'PKG-003',
      instructorId: 'INS-001',
      name: 'Test Ready',
      totalLessons: 20,
      price: 540,
      duration: '2 hours',
      description: 'Intensive preparation for your driving test. Includes mock tests and manoeuvres.',
    },
    {
      id: 'PKG-004',
      instructorId: 'INS-001',
      name: 'Premium Complete',
      totalLessons: 30,
      price: 750,
      duration: '2 hours',
      description: 'Full learning journey from first lesson to test day. Best value for serious learners.',
      popular: true,
    },
  ],
  'INS-002': [
    {
      id: 'PKG-005',
      instructorId: 'INS-002',
      name: 'Auto Starter',
      totalLessons: 5,
      price: 160,
      duration: '1 hour',
      description: 'Automatic driving fundamentals. Perfect for first-time learners.',
    },
    {
      id: 'PKG-006',
      instructorId: 'INS-002',
      name: 'Auto Confidence',
      totalLessons: 10,
      price: 300,
      duration: '1.5 hours',
      description: 'Comprehensive automatic driving course with progressive difficulty.',
      popular: true,
    },
    {
      id: 'PKG-007',
      instructorId: 'INS-002',
      name: 'Auto Test Prep',
      totalLessons: 15,
      price: 420,
      duration: '2 hours',
      description: 'Focused test preparation with mock exams and route practice.',
    },
  ],
  'INS-003': [
    {
      id: 'PKG-008',
      instructorId: 'INS-003',
      name: 'Manual Basics',
      totalLessons: 5,
      price: 140,
      duration: '1 hour',
      description: 'Learn gear changes, clutch control, and road basics.',
    },
    {
      id: 'PKG-009',
      instructorId: 'INS-003',
      name: 'Manual Mastery',
      totalLessons: 15,
      price: 380,
      duration: '1.5 hours',
      description: 'Complete manual driving course from beginner to test-ready.',
      popular: true,
    },
  ],
  'INS-005': [
    {
      id: 'PKG-010',
      instructorId: 'INS-005',
      name: 'Premium Single',
      totalLessons: 1,
      price: 45,
      duration: '1 hour',
      description: 'Single premium lesson. Great for assessment or refresher.',
    },
    {
      id: 'PKG-011',
      instructorId: 'INS-005',
      name: 'Premium Starter',
      totalLessons: 5,
      price: 200,
      duration: '1 hour',
      description: 'Premium beginner package with personalised lesson plans.',
    },
    {
      id: 'PKG-012',
      instructorId: 'INS-005',
      name: 'Premium Intensive',
      totalLessons: 20,
      price: 680,
      duration: '2 hours',
      description: 'Intensive course with a premium instructor. Fast-track to your test.',
      popular: true,
    },
  ],
};

// ─── Pre-purchased Packages (demo data) ───────────────────────────────────────

export const purchasedPackages: PurchasedPackage[] = [
  {
    id: 'PP-001',
    packageId: 'PKG-002',
    instructorId: 'INS-001',
    packageName: 'Confidence Builder',
    purchaseDate: '2026-02-12',
    status: 'active',
    lessonsUsed: 4,
    totalLessons: 10,
    price: 290,
    duration: '1.5 hours',
  },
  {
    id: 'PP-002',
    packageId: 'PKG-001',
    instructorId: 'INS-001',
    packageName: 'Starter Pack',
    purchaseDate: '2026-01-15',
    status: 'exhausted',
    lessonsUsed: 5,
    totalLessons: 5,
    price: 150,
    duration: '1 hour',
  },
];

// ─── Instructor Availability ──────────────────────────────────────────────────

/** Generate 14 days of availability for an instructor */
export function generateAvailableSlots(instructorId: string): AvailableSlot[] {
  const slots: AvailableSlot[] = [];
  const today = new Date();

  const slotTemplates = [
    { startTime: '9:00 AM', endTime: '10:00 AM', duration: '1 hr' },
    { startTime: '10:30 AM', endTime: '11:30 AM', duration: '1 hr' },
    { startTime: '11:30 AM', endTime: '1:00 PM', duration: '1.5 hr' },
    { startTime: '1:30 PM', endTime: '2:30 PM', duration: '1 hr' },
    { startTime: '3:00 PM', endTime: '4:30 PM', duration: '1.5 hr' },
    { startTime: '4:30 PM', endTime: '5:30 PM', duration: '1 hr' },
    { startTime: '5:30 PM', endTime: '7:00 PM', duration: '1.5 hr' },
  ];

  for (let day = 1; day <= 14; day++) {
    const d = new Date(today);
    d.setDate(today.getDate() + day);

    // Sundays — no availability
    if (d.getDay() === 0) { continue; }

    const dateStr = d.toISOString().split('T')[0];

    slotTemplates.forEach((template, idx) => {
      // Simulate some slots being already booked
      const booked = (day === 2 && idx < 2) || (day === 5 && idx === 3);

      slots.push({
        id: `SLOT-${instructorId}-${dateStr}-${idx}`,
        instructorId,
        date: dateStr,
        startTime: template.startTime,
        endTime: template.endTime,
        duration: template.duration,
        booked,
      });
    });
  }

  return slots;
}

/** Generate available dates (for calendar strip) */
export interface BookingDate {
  date: Date;
  dateStr: string;
  dayName: string;
  dayNumber: number;
  monthShort: string;
  available: boolean;
}

export function generateAvailableDates(): BookingDate[] {
  const days: BookingDate[] = [];
  const today = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  for (let i = 1; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      date: d,
      dateStr: d.toISOString().split('T')[0],
      dayName: dayNames[d.getDay()],
      dayNumber: d.getDate(),
      monthShort: monthNames[d.getMonth()],
      available: d.getDay() !== 0,
    });
  }
  return days;
}

// ─── Booked Lessons ───────────────────────────────────────────────────────────

export const lessons: BookedLesson[] = [
  {
    id: 'LES-001',
    instructorId: 'INS-001',
    instructorName: 'James Mitchell',
    instructorAvatar: 'JM',
    packageId: 'PKG-002',
    packageName: 'Confidence Builder',
    date: '2026-02-28',
    time: '10:00 AM',
    duration: '1.5 hours',
    status: 'confirmed',
    location: 'SW1 Pick-up Point',
  },
  {
    id: 'LES-002',
    instructorId: 'INS-001',
    instructorName: 'James Mitchell',
    instructorAvatar: 'JM',
    packageId: 'PKG-002',
    packageName: 'Confidence Builder',
    date: '2026-03-02',
    time: '2:00 PM',
    duration: '1.5 hours',
    status: 'confirmed',
    location: 'SW3 Main Road',
  },
  {
    id: 'LES-003',
    instructorId: 'INS-001',
    instructorName: 'James Mitchell',
    instructorAvatar: 'JM',
    packageId: 'PKG-002',
    packageName: 'Confidence Builder',
    date: '2026-03-06',
    time: '11:00 AM',
    duration: '1.5 hours',
    status: 'pending',
    location: 'SW5 Test Centre',
  },
  {
    id: 'LES-004',
    instructorId: 'INS-001',
    instructorName: 'James Mitchell',
    instructorAvatar: 'JM',
    packageId: 'PKG-001',
    packageName: 'Starter Pack',
    date: '2026-02-20',
    time: '10:00 AM',
    duration: '1 hour',
    status: 'completed',
    location: 'SW1 Pick-up Point',
  },
  {
    id: 'LES-005',
    instructorId: 'INS-001',
    instructorName: 'James Mitchell',
    instructorAvatar: 'JM',
    packageId: 'PKG-001',
    packageName: 'Starter Pack',
    date: '2026-02-17',
    time: '9:00 AM',
    duration: '1 hour',
    status: 'completed',
    location: 'SW7 Roundabout Practice',
  },
  {
    id: 'LES-006',
    instructorId: 'INS-001',
    instructorName: 'James Mitchell',
    instructorAvatar: 'JM',
    packageId: 'PKG-001',
    packageName: 'Starter Pack',
    date: '2026-02-13',
    time: '3:00 PM',
    duration: '1 hour',
    status: 'completed',
    location: 'SW3 Dual Carriageway',
  },
  {
    id: 'LES-007',
    instructorId: 'INS-001',
    instructorName: 'James Mitchell',
    instructorAvatar: 'JM',
    packageId: 'PKG-001',
    packageName: 'Starter Pack',
    date: '2026-02-10',
    time: '11:00 AM',
    duration: '1 hour',
    status: 'cancelled',
    location: 'SW1 Pick-up Point',
    cancelledBy: 'instructor',
  },
  {
    id: 'LES-008',
    instructorId: 'INS-001',
    instructorName: 'James Mitchell',
    instructorAvatar: 'JM',
    packageId: 'PKG-001',
    packageName: 'Starter Pack',
    date: '2026-02-06',
    time: '2:00 PM',
    duration: '1 hour',
    status: 'cancelled',
    location: 'SW1 Pick-up Point',
    cancelledBy: 'student',
  },
];

// ─── Conversations (unchanged) ────────────────────────────────────────────────

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
    instructorName: "Michael O'Brien",
    instructorAvatar: 'MO',
    lastMessage: 'Your test preparation schedule is attached.',
    timestamp: 'Mon',
    unreadCount: 1,
  },
];

// ─── Chat Messages (unchanged) ────────────────────────────────────────────────

export const chatMessages: ChatMessage[] = [
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
