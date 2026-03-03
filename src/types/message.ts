/**
 * GDS Driving School — Message Domain Types
 * ============================================
 * Maps to `messages`, `adminMessages`, `notifications` collections.
 */

import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

/** `messages` collection (general messaging between users). */
export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  sender_name?: string;
  receiver_name?: string;
  sender_role?: string;
  receiver_role?: string;
  subject?: string;
  content: string;
  read: boolean;
  archived?: boolean;
  createdAt?: FirebaseFirestoreTypes.Timestamp;
  updated_at?: FirebaseFirestoreTypes.Timestamp;
}

/** `adminMessages` collection (contact forms + operational messages). */
export interface AdminMessage {
  id: string;

  // Contact form style
  sender_id?: string;
  sender_name?: string;
  sender_email?: string;
  sender_role?: string;
  subject?: string;
  message?: string;

  // Operational messages
  receiver_id?: string;
  content?: string;
  messageType?: string;

  read?: boolean;
  createdAt?: FirebaseFirestoreTypes.Timestamp;
  updated_at?: FirebaseFirestoreTypes.Timestamp;
}

/** `notifications` collection. */
export interface Notification {
  id: string;
  targetRole?: string;
  targetAudience?: string;
  isActive?: boolean;
  title?: string;
  body?: string;
  content?: string;
  createdAt?: FirebaseFirestoreTypes.Timestamp;
}

/** `suggestions` collection. */
export interface Suggestion {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  category?: string;
  message: string;
  status: 'pending' | 'reviewed' | 'implemented' | 'rejected';
  createdAt?: FirebaseFirestoreTypes.Timestamp;
  updated_at?: FirebaseFirestoreTypes.Timestamp;
}
