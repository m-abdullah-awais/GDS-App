/**
 * GDS Driving School — Admin Action Creators
 * =============================================
 */

import {
  APPROVE_STUDENT,
  REJECT_STUDENT,
  SUSPEND_STUDENT,
  ACTIVATE_STUDENT,
  DELETE_STUDENT,
  APPROVE_INSTRUCTOR,
  REJECT_INSTRUCTOR,
  SUSPEND_INSTRUCTOR,
  ACTIVATE_INSTRUCTOR,
  TRANSFER_PAYMENT,
  SEND_MESSAGE,
  MARK_CONVERSATION_RESOLVED,
  MARK_CONVERSATION_READ,
  UPDATE_SETTINGS,
  APPROVE_PACKAGE,
  REJECT_PACKAGE,
  UPDATE_PACKAGE_COMMISSION,
  DELETE_PACKAGE,
  type AdminSettings,
} from './types';

// ─── Student Actions ──────────────────────────────────────────────────────────

export const approveStudent = (studentId: string) => ({
  type: APPROVE_STUDENT as typeof APPROVE_STUDENT,
  payload: { studentId },
});

export const rejectStudent = (studentId: string) => ({
  type: REJECT_STUDENT as typeof REJECT_STUDENT,
  payload: { studentId },
});

export const suspendStudent = (studentId: string) => ({
  type: SUSPEND_STUDENT as typeof SUSPEND_STUDENT,
  payload: { studentId },
});

export const activateStudent = (studentId: string) => ({
  type: ACTIVATE_STUDENT as typeof ACTIVATE_STUDENT,
  payload: { studentId },
});

export const deleteStudent = (studentId: string) => ({
  type: DELETE_STUDENT as typeof DELETE_STUDENT,
  payload: { studentId },
});

// ─── Instructor Actions ───────────────────────────────────────────────────────

export const approveInstructor = (instructorId: string) => ({
  type: APPROVE_INSTRUCTOR as typeof APPROVE_INSTRUCTOR,
  payload: { instructorId },
});

export const rejectInstructor = (instructorId: string) => ({
  type: REJECT_INSTRUCTOR as typeof REJECT_INSTRUCTOR,
  payload: { instructorId },
});

export const suspendInstructor = (instructorId: string) => ({
  type: SUSPEND_INSTRUCTOR as typeof SUSPEND_INSTRUCTOR,
  payload: { instructorId },
});

export const activateInstructor = (instructorId: string) => ({
  type: ACTIVATE_INSTRUCTOR as typeof ACTIVATE_INSTRUCTOR,
  payload: { instructorId },
});

// ─── Payment Actions ──────────────────────────────────────────────────────────

export const transferPayment = (instructorId: string, amount: number) => ({
  type: TRANSFER_PAYMENT as typeof TRANSFER_PAYMENT,
  payload: { instructorId, amount },
});

// ─── Message Actions ──────────────────────────────────────────────────────────

export const sendMessage = (conversationId: string, text: string) => ({
  type: SEND_MESSAGE as typeof SEND_MESSAGE,
  payload: { conversationId, text },
});

export const markConversationResolved = (conversationId: string) => ({
  type: MARK_CONVERSATION_RESOLVED as typeof MARK_CONVERSATION_RESOLVED,
  payload: { conversationId },
});

export const markConversationRead = (conversationId: string) => ({
  type: MARK_CONVERSATION_READ as typeof MARK_CONVERSATION_READ,
  payload: { conversationId },
});

// ─── Settings Actions ─────────────────────────────────────────────────────────

export const updateSettings = (settings: Partial<AdminSettings>) => ({
  type: UPDATE_SETTINGS as typeof UPDATE_SETTINGS,
  payload: settings,
});

// ─── Package Actions ──────────────────────────────────────────────────────────

export const approvePackage = (packageId: string) => ({
  type: APPROVE_PACKAGE as typeof APPROVE_PACKAGE,
  payload: { packageId },
});

export const rejectPackage = (packageId: string) => ({
  type: REJECT_PACKAGE as typeof REJECT_PACKAGE,
  payload: { packageId },
});

export const updatePackageCommission = (packageId: string, commissionPercentage: number) => ({
  type: UPDATE_PACKAGE_COMMISSION as typeof UPDATE_PACKAGE_COMMISSION,
  payload: { packageId, commissionPercentage },
});

export const deletePackage = (packageId: string) => ({
  type: DELETE_PACKAGE as typeof DELETE_PACKAGE,
  payload: { packageId },
});
