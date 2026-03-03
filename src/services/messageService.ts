/**
 * GDS Driving School — Message Service
 * ========================================
 * Firestore operations for `messages` collection.
 *
 * IMPORTANT: Security rules deny `list` on messages.
 * All queries MUST filter by sender_id or receiver_id.
 */

import { db } from '../config/firebase';
import { Collections, fromQuerySnapshot, serverTimestamp } from '../utils/mappers';
import type { Message } from '../types';

const toMillis = (value: unknown): number => {
  if (!value) {
    return 0;
  }

  const maybeTimestamp = value as { toMillis?: () => number; toDate?: () => Date };
  if (typeof maybeTimestamp.toMillis === 'function') {
    return maybeTimestamp.toMillis();
  }

  if (typeof maybeTimestamp.toDate === 'function') {
    return maybeTimestamp.toDate().getTime();
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
};

const sortByCreatedAtDesc = (messages: Message[]): Message[] => {
  return [...messages].sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
};

const sortByCreatedAtAsc = (messages: Message[]): Message[] => {
  return [...messages].sort((a, b) => toMillis(a.createdAt) - toMillis(b.createdAt));
};

/**
 * Get messages where current user is participant (sender or receiver).
 * Performs two queries due to security rule constraints.
 */
export const getMessagesForUser = async (userId: string): Promise<Message[]> => {
  const [sentSnapshot, receivedSnapshot] = await Promise.all([
    db
      .collection(Collections.MESSAGES)
      .where('sender_id', '==', userId)
      .get(),
    db
      .collection(Collections.MESSAGES)
      .where('receiver_id', '==', userId)
      .get(),
  ]);

  const map = new Map<string, Message>();
  for (const doc of [...sentSnapshot.docs, ...receivedSnapshot.docs]) {
    if (!map.has(doc.id)) {
      map.set(doc.id, { id: doc.id, ...doc.data() } as Message);
    }
  }

  const messages = sortByCreatedAtDesc(Array.from(map.values()));
  console.log('[Firebase][READ][MessageService] getMessagesForUser', {
    userId,
    count: messages.length,
    data: messages,
  });
  return messages;
};

/**
 * Get conversation messages between two users.
 */
export const getConversation = async (
  userId1: string,
  userId2: string,
): Promise<Message[]> => {
  // Messages sent by user1 to user2
  const sent = await db
    .collection(Collections.MESSAGES)
    .where('sender_id', '==', userId1)
    .where('receiver_id', '==', userId2)
    .get();

  // Messages sent by user2 to user1
  const received = await db
    .collection(Collections.MESSAGES)
    .where('sender_id', '==', userId2)
    .where('receiver_id', '==', userId1)
    .get();

  const all = [
    ...fromQuerySnapshot<Message>(sent),
    ...fromQuerySnapshot<Message>(received),
  ];

  const messages = sortByCreatedAtAsc(all);
  console.log('[Firebase][READ][MessageService] getConversation', {
    userId1,
    userId2,
    count: messages.length,
    data: messages,
  });
  return messages;
};

/**
 * Send a message.
 */
export const sendMessage = async (data: {
  senderId: string;
  receiverId: string;
  senderName?: string;
  receiverName?: string;
  senderRole?: string;
  receiverRole?: string;
  content: string;
  subject?: string;
}): Promise<string> => {
  const ref = await db.collection(Collections.MESSAGES).add({
    sender_id: data.senderId,
    receiver_id: data.receiverId,
    sender_name: data.senderName ?? '',
    receiver_name: data.receiverName ?? '',
    sender_role: data.senderRole ?? '',
    receiver_role: data.receiverRole ?? '',
    content: data.content,
    subject: data.subject ?? '',
    read: false,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

/**
 * Mark a message as read.
 */
export const markMessageRead = async (messageId: string): Promise<void> => {
  await db.collection(Collections.MESSAGES).doc(messageId).update({
    read: true,
    updated_at: serverTimestamp(),
  });
};

/**
 * Real-time listener for messages received by a user.
 * Filtered by receiver_id to comply with security rules.
 */
export const onReceivedMessages = (
  userId: string,
  callback: (messages: Message[]) => void,
): (() => void) => {
  return db
    .collection(Collections.MESSAGES)
    .where('receiver_id', '==', userId)
    .onSnapshot(
      (snapshot) => callback(sortByCreatedAtDesc(fromQuerySnapshot<Message>(snapshot))),
    );
};

/**
 * Real-time listener for a conversation between two users.
 */
export const onConversation = (
  currentUserId: string,
  otherUserId: string,
  callback: (messages: Message[]) => void,
): (() => void) => {
  // Listen to messages sent by current user to other user
  const unsub1 = db
    .collection(Collections.MESSAGES)
    .where('sender_id', '==', currentUserId)
    .where('receiver_id', '==', otherUserId)
    .onSnapshot((snapshot) => {
      // Re-fetch full conversation on any change
      getConversation(currentUserId, otherUserId).then(callback);
    });

  const unsub2 = db
    .collection(Collections.MESSAGES)
    .where('sender_id', '==', otherUserId)
    .where('receiver_id', '==', currentUserId)
    .onSnapshot(() => {
      getConversation(currentUserId, otherUserId).then(callback);
    });

  return () => {
    unsub1();
    unsub2();
  };
};
