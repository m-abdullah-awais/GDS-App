/**
 * GDS Driving School — System Config Domain Types
 * ==================================================
 * Maps to `systemSettings`, `adminData` collections.
 */

/** `systemSettings/commission` document. */
export interface CommissionSettings {
  id: string;
  commissionRate: number;
}

/** `systemSettings/areaSettings` document. */
export interface AreaSettings {
  id: string;
  activeAreas: string[];
}

/** `adminData/settings` document. */
export interface AdminDataSettings {
  id: string;
  commissionRate?: number;
  [key: string]: unknown;
}

/** `instructorApplications` collection. */
export interface InstructorApplication {
  id: string;
  instructor_id: string;
  instructor_name: string;
  instructor_email: string;
  phone?: string;
  address?: string;
  postcode?: string;
  car_transmission?: string;
  about_me?: string;
  status: 'pending';
  submitted_at?: import('@react-native-firebase/firestore').FirebaseFirestoreTypes.Timestamp;
  badge_url?: string;     // base64 data URL
  insurance_url?: string; // base64 data URL
  profile_picture_url?: string; // base64 data URL
  reviewed_by?: string | null;
  reviewed_at?: import('@react-native-firebase/firestore').FirebaseFirestoreTypes.Timestamp | null;
  admin_notes?: string;
}

/** `timetables` collection. */
export interface Timetable {
  id: string; // typically instructorId
  slots?: Array<{
    day: string;
    startTime: string;
    endTime: string;
    available: boolean;
  }>;
  [key: string]: unknown;
}

/** `analyticsEvents` collection. */
export interface AnalyticsEvent {
  id: string;
  eventName: string;
  eventParams?: Record<string, unknown>;
  userId?: string;
  userRole?: string;
  timestamp?: import('@react-native-firebase/firestore').FirebaseFirestoreTypes.Timestamp;
  date?: string; // YYYY-MM-DD
}
