/**
 * GDS Driving School — Admin Reducer
 * =====================================
 */

import {
  students,
  instructors,
  transactions,
  conversations,
  chatMessages,
  defaultSettings,
  dashboardStats,
  adminPackages,
} from '../../modules/admin/mockData';

import {
  type AdminState,
  type AdminAction,
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
} from './types';

const initialState: AdminState = {
  students,
  instructors,
  transactions,
  conversations,
  messages: chatMessages,
  packages: adminPackages,
  settings: defaultSettings,
  dashboardStats,
};

const adminReducer = (state = initialState, action: AdminAction): AdminState => {
  switch (action.type) {
    // ─── Student Actions ────────────────────────────────────────────────
    case APPROVE_STUDENT:
      return {
        ...state,
        students: state.students.map(s =>
          s.id === action.payload.studentId
            ? { ...s, approvalStatus: 'approved' as const }
            : s,
        ),
        dashboardStats: {
          ...state.dashboardStats,
          pendingApprovals: Math.max(0, state.dashboardStats.pendingApprovals - 1),
        },
      };

    case REJECT_STUDENT:
      return {
        ...state,
        students: state.students.map(s =>
          s.id === action.payload.studentId
            ? { ...s, approvalStatus: 'rejected' as const, accountStatus: 'inactive' as const }
            : s,
        ),
        dashboardStats: {
          ...state.dashboardStats,
          pendingApprovals: Math.max(0, state.dashboardStats.pendingApprovals - 1),
        },
      };

    case SUSPEND_STUDENT:
      return {
        ...state,
        students: state.students.map(s =>
          s.id === action.payload.studentId
            ? { ...s, accountStatus: 'suspended' as const }
            : s,
        ),
      };

    case ACTIVATE_STUDENT:
      return {
        ...state,
        students: state.students.map(s =>
          s.id === action.payload.studentId
            ? { ...s, accountStatus: 'active' as const }
            : s,
        ),
      };

    case DELETE_STUDENT:
      return {
        ...state,
        students: state.students.filter(s => s.id !== action.payload.studentId),
        dashboardStats: {
          ...state.dashboardStats,
          totalStudents: state.dashboardStats.totalStudents - 1,
        },
      };

    // ─── Instructor Actions ─────────────────────────────────────────────
    case APPROVE_INSTRUCTOR:
      return {
        ...state,
        instructors: state.instructors.map(i =>
          i.id === action.payload.instructorId
            ? { ...i, approvalStatus: 'approved' as const }
            : i,
        ),
        dashboardStats: {
          ...state.dashboardStats,
          pendingApprovals: Math.max(0, state.dashboardStats.pendingApprovals - 1),
        },
      };

    case REJECT_INSTRUCTOR:
      return {
        ...state,
        instructors: state.instructors.map(i =>
          i.id === action.payload.instructorId
            ? { ...i, approvalStatus: 'rejected' as const, accountStatus: 'inactive' as const }
            : i,
        ),
        dashboardStats: {
          ...state.dashboardStats,
          pendingApprovals: Math.max(0, state.dashboardStats.pendingApprovals - 1),
        },
      };

    case SUSPEND_INSTRUCTOR:
      return {
        ...state,
        instructors: state.instructors.map(i =>
          i.id === action.payload.instructorId
            ? { ...i, accountStatus: 'suspended' as const }
            : i,
        ),
      };

    case ACTIVATE_INSTRUCTOR:
      return {
        ...state,
        instructors: state.instructors.map(i =>
          i.id === action.payload.instructorId
            ? { ...i, accountStatus: 'active' as const }
            : i,
        ),
      };

    // ─── Payment Actions ────────────────────────────────────────────────
    case TRANSFER_PAYMENT: {
      const { instructorId, amount } = action.payload;
      const instructor = state.instructors.find(i => i.id === instructorId);
      const newTransaction = {
        id: `TXN${String(state.transactions.length + 1).padStart(3, '0')}`,
        instructorId,
        instructorName: instructor?.name ?? 'Unknown',
        amount,
        date: new Date().toISOString().split('T')[0],
        status: 'paid' as const,
        method: 'Stripe Transfer',
        description: `Payment transfer - ${instructor?.name}`,
      };

      return {
        ...state,
        instructors: state.instructors.map(i =>
          i.id === instructorId
            ? { ...i, pendingPayment: 0, earningsTotal: i.earningsTotal }
            : i,
        ),
        transactions: [newTransaction, ...state.transactions.map(t =>
          t.instructorId === instructorId && t.status === 'pending'
            ? { ...t, status: 'paid' as const }
            : t,
        )],
        dashboardStats: {
          ...state.dashboardStats,
          pendingPayouts: Math.max(0, state.dashboardStats.pendingPayouts - amount),
        },
      };
    }

    // ─── Message Actions ────────────────────────────────────────────────
    case SEND_MESSAGE: {
      const { conversationId, text } = action.payload;
      const newMessage = {
        id: `MSG${String(state.messages.length + 1).padStart(3, '0')}`,
        conversationId,
        senderId: 'ADMIN',
        senderType: 'admin' as const,
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        seen: false,
      };

      return {
        ...state,
        messages: [...state.messages, newMessage],
        conversations: state.conversations.map(c =>
          c.id === conversationId
            ? { ...c, lastMessage: text, timestamp: 'Just now' }
            : c,
        ),
      };
    }

    case MARK_CONVERSATION_RESOLVED:
      return {
        ...state,
        conversations: state.conversations.map(c =>
          c.id === action.payload.conversationId
            ? { ...c, status: 'resolved' as const, unreadCount: 0 }
            : c,
        ),
      };

    case MARK_CONVERSATION_READ:
      return {
        ...state,
        conversations: state.conversations.map(c =>
          c.id === action.payload.conversationId
            ? { ...c, status: 'read' as const, unreadCount: 0 }
            : c,
        ),
      };

    // ─── Settings Actions ───────────────────────────────────────────────
    case UPDATE_SETTINGS:
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };

    // ─── Package Actions ────────────────────────────────────────────────
    case APPROVE_PACKAGE:
      return {
        ...state,
        packages: state.packages.map(p =>
          p.id === action.payload.packageId
            ? { ...p, status: 'approved' as const }
            : p,
        ),
      };

    case REJECT_PACKAGE:
      return {
        ...state,
        packages: state.packages.map(p =>
          p.id === action.payload.packageId
            ? { ...p, status: 'rejected' as const }
            : p,
        ),
      };

    case UPDATE_PACKAGE_COMMISSION:
      return {
        ...state,
        packages: state.packages.map(p =>
          p.id === action.payload.packageId
            ? { ...p, commissionPercentage: action.payload.commissionPercentage }
            : p,
        ),
      };

    case DELETE_PACKAGE:
      return {
        ...state,
        packages: state.packages.filter(p => p.id !== action.payload.packageId),
      };

    default:
      return state;
  }
};

export default adminReducer;
