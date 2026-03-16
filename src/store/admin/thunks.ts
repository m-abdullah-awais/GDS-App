/**
 * GDS Driving School — Admin Async Thunks
 * ==========================================
 * Async operations that fetch/mutate data via Firebase services
 * and dispatch actions to update the admin Redux store.
 */

import type { Dispatch } from 'redux';
import {
  setStudents,
  setAdminInstructors,
  setTransactions,
  setConversations,
  setMessages,
  setAdminPackages,
  setAdminSettings,
  setDashboardStats,
  setDashboardData,
  approveStudent as approveStudentAction,
  rejectStudent as rejectStudentAction,
  suspendStudent as suspendStudentAction,
  activateStudent as activateStudentAction,
  deleteStudent as deleteStudentAction,
  approveInstructor as approveInstructorAction,
  rejectInstructor as rejectInstructorAction,
  suspendInstructor as suspendInstructorAction,
  activateInstructor as activateInstructorAction,
  transferPayment as transferPaymentAction,
  approvePackage as approvePackageAction,
  rejectPackage as rejectPackageAction,
  updatePackageCommission as updatePackageCommissionAction,
  deletePackage as deletePackageAction,
  updateSettings as updateSettingsAction,
  sendMessage as sendMessageAction,
} from './actions';

import * as adminService from '../../services/adminService';
import * as userService from '../../services/userService';
import * as messageService from '../../services/messageService';
import * as paymentService from '../../services/paymentService';

import {
  mapUserToAdminStudent,
  mapUserToAdminInstructor,
  mapPackageToAdminPackage,
  mapTransactionToAdminTransaction,
  mapMessagesToConversations,
  buildDashboardStats,
} from '../../utils/mappers';

import type { AdminSettings } from './types';

// ─── Load Admin Dashboard ────────────────────────────────────────────────────

/**
 * Load all initial data for the admin dashboard.
 *
 * Uses a SINGLE batched dispatch (SET_DASHBOARD_DATA) instead of 5 sequential
 * dispatches. This prevents 5 separate React re-render cycles that were blocking
 * the JS thread and causing the drawer animation to hang/crash.
 */
export const loadAdminDashboard = () => async (dispatch: Dispatch) => {
  try {
    // Keep limits LOW — every document crosses the native→JS bridge and
    // gets deserialized synchronously on the JS thread.
    // Split into two batches to reduce peak bridge pressure:
    // each batch deserializes ~30 docs instead of ~60 at once.
    const [allUsersStudents, allUsersInstructors] = await Promise.all([
      userService.getUsersByRole('student', 15),
      userService.getUsersByRole('instructor', 15),
    ]);

    // Yield so the UI thread stays responsive between fetches
    await new Promise(resolve => setTimeout(resolve, 0));

    const [transactions, pkgs] = await Promise.all([
      adminService.getAllTransactions(15),
      adminService.getAllPackagesForAdmin(15),
    ]);

    // Yield again before the CPU-bound mapping step
    await new Promise(resolve => setTimeout(resolve, 0));

    // Map to view models
    const studentVMs = allUsersStudents.map(u => mapUserToAdminStudent(u));
    const instructorVMs = allUsersInstructors.map(u => mapUserToAdminInstructor(u));
    const txnVMs = transactions.map(mapTransactionToAdminTransaction);
    const allPkgVMs = [
      ...(pkgs.available || []).map(p => mapPackageToAdminPackage(p)),
      ...(pkgs.pending || []).map(p => mapPackageToAdminPackage(p)),
    ];

    const pendingInstructors = instructorVMs.filter(i => i.approvalStatus === 'pending').length;
    const activeInstructors = instructorVMs.filter(i => i.accountStatus === 'active').length;

    const stats = buildDashboardStats({
      totalStudents: studentVMs.length,
      totalInstructors: instructorVMs.length,
      activeLessons: activeInstructors,
      pendingApprovals: pendingInstructors,
      monthlyRevenue: 0,
      pendingPayouts: 0,
    });

    // Yield to the JS thread so any in-progress animations (drawer open/close,
    // screen transitions) can complete before we trigger a heavy re-render.
    await new Promise(resolve => setTimeout(resolve, 0));

    dispatch(setDashboardData({
      students: studentVMs,
      instructors: instructorVMs,
      transactions: txnVMs,
      packages: allPkgVMs,
      dashboardStats: stats,
    }));
  } catch (error) {
    if (__DEV__) console.error('Failed to load admin dashboard:', error);
  }
};

// ─── Load Admin Settings ─────────────────────────────────────────────────────

export const loadAdminSettings = () => async (dispatch: Dispatch) => {
  try {
    const [commission, area, data] = await Promise.all([
      adminService.getCommissionSettings(),
      adminService.getAreaSettings(),
      adminService.getAdminDataSettings(),
    ]);

    const settings: AdminSettings = {
      lessonPricingDefault: commission?.defaultRate ?? 0,
      platformFees: commission?.platformFee ?? 0,
      emailNotifications: data?.emailNotifications ?? true,
      pushNotifications: data?.pushNotifications ?? true,
      smsAlerts: data?.smsAlerts ?? false,
    };
    dispatch(setAdminSettings(settings));
  } catch (error) {
    if (__DEV__) console.error('Failed to load admin settings:', error);
  }
};

// ─── Save Admin Settings ─────────────────────────────────────────────────────

export const saveAdminSettingsThunk = (
  settings: Partial<AdminSettings>,
) => async (dispatch: Dispatch) => {
  try {
    // Update commission-related fields
    if (settings.lessonPricingDefault !== undefined || settings.platformFees !== undefined) {
      await adminService.updateCommissionSettings({
        defaultRate: settings.lessonPricingDefault,
        platformFee: settings.platformFees,
      });
    }
    // Update notification-related fields
    if (
      settings.emailNotifications !== undefined ||
      settings.pushNotifications !== undefined ||
      settings.smsAlerts !== undefined
    ) {
      await adminService.updateAdminDataSettings({
        emailNotifications: settings.emailNotifications,
        pushNotifications: settings.pushNotifications,
        smsAlerts: settings.smsAlerts,
      });
    }
    dispatch(updateSettingsAction(settings));
  } catch (error) {
    if (__DEV__) console.error('Failed to save admin settings:', error);
    throw error;
  }
};

// ─── Student Actions ─────────────────────────────────────────────────────────

export const approveStudentThunk = (studentId: string) => async (dispatch: Dispatch) => {
  try {
    await adminService.approveStudent(studentId);
    dispatch(approveStudentAction(studentId));
  } catch (error) {
    if (__DEV__) console.error('Failed to approve student:', error);
    throw error;
  }
};

export const rejectStudentThunk = (studentId: string) => async (dispatch: Dispatch) => {
  try {
    await adminService.rejectStudent(studentId);
    dispatch(rejectStudentAction(studentId));
  } catch (error) {
    if (__DEV__) console.error('Failed to reject student:', error);
    throw error;
  }
};

export const suspendStudentThunk = (studentId: string) => async (dispatch: Dispatch) => {
  try {
    await adminService.suspendStudent(studentId);
    dispatch(suspendStudentAction(studentId));
  } catch (error) {
    if (__DEV__) console.error('Failed to suspend student:', error);
    throw error;
  }
};

export const activateStudentThunk = (studentId: string) => async (dispatch: Dispatch) => {
  try {
    await adminService.activateStudent(studentId);
    dispatch(activateStudentAction(studentId));
  } catch (error) {
    if (__DEV__) console.error('Failed to activate student:', error);
    throw error;
  }
};

export const deleteStudentThunk = (studentId: string) => async (dispatch: Dispatch) => {
  try {
    await adminService.deleteStudentUser(studentId);
    dispatch(deleteStudentAction(studentId));
  } catch (error) {
    if (__DEV__) console.error('Failed to delete student:', error);
    throw error;
  }
};

// ─── Instructor Actions ──────────────────────────────────────────────────────

export const approveInstructorThunk = (instructorId: string) => async (dispatch: Dispatch) => {
  try {
    await adminService.approveInstructor(instructorId);
    dispatch(approveInstructorAction(instructorId));
  } catch (error) {
    if (__DEV__) console.error('Failed to approve instructor:', error);
    throw error;
  }
};

export const rejectInstructorThunk = (
  instructorId: string,
  reason?: string,
) => async (dispatch: Dispatch) => {
  try {
    await adminService.rejectInstructor(instructorId, reason);
    dispatch(rejectInstructorAction(instructorId));
  } catch (error) {
    if (__DEV__) console.error('Failed to reject instructor:', error);
    throw error;
  }
};

export const suspendInstructorThunk = (instructorId: string) => async (dispatch: Dispatch) => {
  try {
    await adminService.suspendInstructor(instructorId);
    dispatch(suspendInstructorAction(instructorId));
  } catch (error) {
    if (__DEV__) console.error('Failed to suspend instructor:', error);
    throw error;
  }
};

export const activateInstructorThunk = (instructorId: string) => async (dispatch: Dispatch) => {
  try {
    await adminService.reactivateInstructor(instructorId);
    dispatch(activateInstructorAction(instructorId));
  } catch (error) {
    if (__DEV__) console.error('Failed to activate instructor:', error);
    throw error;
  }
};

// ─── Package Actions ─────────────────────────────────────────────────────────

export const approvePackageThunk = (packageId: string) => async (dispatch: Dispatch) => {
  try {
    await adminService.approvePendingPackage(packageId);
    dispatch(approvePackageAction(packageId));
  } catch (error) {
    if (__DEV__) console.error('Failed to approve package:', error);
    throw error;
  }
};

export const rejectPackageThunk = (
  packageId: string,
  reason?: string,
) => async (dispatch: Dispatch) => {
  try {
    await adminService.rejectPendingPackage(packageId, reason);
    dispatch(rejectPackageAction(packageId));
  } catch (error) {
    if (__DEV__) console.error('Failed to reject package:', error);
    throw error;
  }
};

export const updatePackageCommissionThunk = (
  packageId: string,
  commissionPercentage: number,
) => async (dispatch: Dispatch) => {
  try {
    await adminService.updatePackageCommission(packageId, commissionPercentage);
    dispatch(updatePackageCommissionAction(packageId, commissionPercentage));
  } catch (error) {
    if (__DEV__) console.error('Failed to update package commission:', error);
    throw error;
  }
};

export const deletePackageThunk = (packageId: string) => async (dispatch: Dispatch) => {
  try {
    await adminService.deleteAvailablePackage(packageId);
    dispatch(deletePackageAction(packageId));
  } catch (error) {
    if (__DEV__) console.error('Failed to delete package:', error);
    throw error;
  }
};

// ─── Payment Actions ─────────────────────────────────────────────────────────

export const transferPaymentThunk = (
  instructorId: string,
  amount: number,
) => async (dispatch: Dispatch) => {
  try {
    await paymentService.processInstructorPayout({
      instructorId,
      amount,
    });
    dispatch(transferPaymentAction(instructorId, amount));
  } catch (error) {
    if (__DEV__) console.error('Failed to transfer payment:', error);
    throw error;
  }
};

// ─── Message Actions ─────────────────────────────────────────────────────────

/**
 * Load conversations for admin.
 */
export const loadAdminConversations = (adminId: string) => async (dispatch: Dispatch) => {
  try {
    const messages = await messageService.getMessagesForUser(adminId);
    const convos = mapMessagesToConversations(messages, adminId);
    dispatch(setConversations(convos));
  } catch (error) {
    if (__DEV__) console.error('Failed to load admin conversations:', error);
  }
};

/**
 * Load messages for a specific conversation.
 */
export const loadConversationMessages = (
  userId1: string,
  userId2: string,
) => async (dispatch: Dispatch) => {
  try {
    const messages = await messageService.getConversation(userId1, userId2);
    const mapped = messages.map(m => ({
      id: m.id,
      conversationId: `${m.senderId}-${m.recipientId || m.recipient_id || ''}`,
      senderId: m.senderId || m.sender_id || '',
      senderType: (m.senderRole === 'admin' ? 'admin' : 'instructor') as 'admin' | 'instructor',
      text: m.content || m.text || '',
      timestamp: m.createdAt
        ? new Date(m.createdAt as any).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '',
      seen: m.read ?? false,
    }));
    dispatch(setMessages(mapped));
  } catch (error) {
    if (__DEV__) console.error('Failed to load conversation messages:', error);
  }
};

/**
 * Send a message from admin.
 */
export const sendAdminMessageThunk = (
  conversationId: string,
  recipientId: string,
  text: string,
) => async (dispatch: Dispatch, getState: () => any) => {
  try {
    const adminId = getState().auth?.profile?.uid ?? '';
    await messageService.sendMessage({
      senderId: adminId,
      receiverId: recipientId,
      content: text,
      senderRole: 'admin',
    });
    dispatch(sendMessageAction(conversationId, text));
  } catch (error) {
    if (__DEV__) console.error('Failed to send admin message:', error);
    throw error;
  }
};

// ─── Real-time Listeners ─────────────────────────────────────────────────────

/**
 * Subscribe to all user changes in real-time.
 * Returns unsubscribe function.
 */
export const subscribeToAllUsers = () => (dispatch: Dispatch) => {
  return adminService.onAllUsers((users) => {
    const students = users.filter(u => u.role === 'student').map(mapUserToAdminStudent);
    const instructors = users.filter(u => u.role === 'instructor').map(mapUserToAdminInstructor);
    dispatch(setStudents(students));
    dispatch(setAdminInstructors(instructors));
  });
};
