/**
 * GDS Driving School — AdminInstructorMessagesScreen
 * ====================================================
 * Conversation list + chat thread for admin ↔ instructor messaging.
 */

import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';
import type { RootState } from '../../store';
import type { Conversation, ChatMessage } from '../../store/admin/types';
import {
  sendMessage,
  markConversationRead,
  markConversationResolved,
} from '../../store/admin/actions';
import {
  Avatar,
  StatusBadge,
  EmptyState,
  ConfirmModal,
  useToast,
} from '../../components/admin';

const AdminInstructorMessagesScreen = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const conversations = useSelector((state: RootState) => state.admin.conversations);
  const messages = useSelector((state: RootState) => state.admin.messages);

  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null);
  const [replyText, setReplyText] = useState('');
  const [resolveModal, setResolveModal] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const sortedConvos = useMemo(
    () => [...conversations].sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    [conversations],
  );

  const activeMessages = useMemo(() => {
    if (!activeConvo) return [];
    return messages
      .filter(m => m.conversationId === activeConvo.id)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }, [messages, activeConvo]);

  const selectConvo = useCallback(
    (convo: Conversation) => {
      setActiveConvo(convo);
      setReplyText('');
      if (convo.unreadCount > 0) {
        dispatch(markConversationRead(convo.id));
      }
    },
    [dispatch],
  );

  const handleSend = useCallback(() => {
    if (!activeConvo || !replyText.trim()) return;
    dispatch(sendMessage(activeConvo.id, replyText.trim()));
    setReplyText('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [activeConvo, replyText, dispatch]);

  const handleResolve = useCallback(() => {
    if (!activeConvo) return;
    dispatch(markConversationResolved(activeConvo.id));
    showToast('success', 'Conversation marked as resolved');
    setResolveModal(false);
    setActiveConvo(null);
  }, [activeConvo, dispatch, showToast]);

  // If a conversation is selected, show the chat view
  if (activeConvo) {
    return (
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}>
        {/* Chat Header */}
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => setActiveConvo(null)} style={styles.backBtn}>
            <Ionicons name="arrow-back-outline" size={22} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Avatar initials={activeConvo.instructorAvatar} size={36} theme={theme} />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.chatHeaderName}>{activeConvo.instructorName}</Text>
            <StatusBadge status={activeConvo.status} />
          </View>
          {activeConvo.status !== 'resolved' && (
            <TouchableOpacity
              style={styles.resolveBtn}
              onPress={() => setResolveModal(true)}>
              <Ionicons name="checkmark-done-outline" size={16} color={theme.colors.success} />
              <Text style={styles.resolveBtnText}>Resolve</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}>
          {activeMessages.map(msg => (
            <View
              key={msg.id}
              style={[
                styles.bubble,
                msg.senderType === 'admin' ? styles.bubbleAdmin : styles.bubbleInstructor,
              ]}>
              <Text
                style={[
                  styles.bubbleText,
                  msg.senderType === 'admin' ? styles.bubbleTextAdmin : styles.bubbleTextInstructor,
                ]}>
                {msg.text}
              </Text>
              <Text
                style={[
                  styles.bubbleTime,
                  msg.senderType === 'admin'
                    ? { color: 'rgba(255,255,255,0.6)' }
                    : { color: theme.colors.textTertiary },
                ]}>
                {msg.timestamp}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Reply Input */}
        {activeConvo.status !== 'resolved' && (
          <View style={styles.inputBar}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              placeholderTextColor={theme.colors.placeholder}
              value={replyText}
              onChangeText={setReplyText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                !replyText.trim() && styles.sendBtnDisabled,
              ]}
              disabled={!replyText.trim()}
              onPress={handleSend}>
              <Ionicons
                name="send-outline"
                size={20}
                color={replyText.trim() ? '#fff' : theme.colors.disabled}
              />
            </TouchableOpacity>
          </View>
        )}

        <ConfirmModal
          visible={resolveModal}
          title="Resolve Conversation"
          message={`Mark conversation with ${activeConvo.instructorName} as resolved?`}
          icon="checkmark-done-outline"
          variant="success"
          confirmLabel="Resolve"
          onConfirm={handleResolve}
          onCancel={() => setResolveModal(false)}
        />
      </KeyboardAvoidingView>
    );
  }

  // Conversation list view
  return (
    <View style={styles.screen}>
      {sortedConvos.length === 0 ? (
        <EmptyState
          icon="chatbubbles-outline"
          title="No conversations"
          subtitle="Instructor messages will appear here."
        />
      ) : (
        <FlatList
          data={sortedConvos}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.convoCard,
                item.unreadCount > 0 && styles.convoCardUnread,
              ]}
              activeOpacity={0.7}
              onPress={() => selectConvo(item)}>
              <Avatar initials={item.instructorAvatar} size={44} theme={theme} />
              <View style={styles.convoInfo}>
                <View style={styles.convoTopRow}>
                  <Text style={styles.convoName}>{item.instructorName}</Text>
                  <Text style={styles.convoTime}>{item.timestamp}</Text>
                </View>
                <View style={styles.convoBottomRow}>
                  <Text style={styles.convoMessage} numberOfLines={1}>
                    {item.lastMessage}
                  </Text>
                  {item.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{item.unreadCount}</Text>
                    </View>
                  )}
                </View>
                <StatusBadge status={item.status} />
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background },
    listContent: { padding: theme.spacing.md, gap: theme.spacing.sm, paddingBottom: theme.spacing['4xl'] },
    convoCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.md,
      ...theme.shadows.sm,
    },
    convoCardUnread: {
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.primary,
    },
    convoInfo: { flex: 1, gap: 4 },
    convoTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    convoName: { ...theme.typography.bodyMedium, color: theme.colors.textPrimary, fontWeight: '600' },
    convoTime: { ...theme.typography.caption, color: theme.colors.textTertiary },
    convoBottomRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    convoMessage: { ...theme.typography.bodySmall, color: theme.colors.textSecondary, flex: 1 },
    unreadBadge: {
      backgroundColor: theme.colors.primary,
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 6,
    },
    unreadText: {
      ...theme.typography.caption,
      color: '#fff',
      fontWeight: '700',
      fontSize: 11,
    },

    // Chat view
    chatHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      gap: 8,
    },
    backBtn: { padding: 4 },
    chatHeaderName: { ...theme.typography.bodyMedium, color: theme.colors.textPrimary, fontWeight: '600' },
    resolveBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.successLight,
    },
    resolveBtnText: { ...theme.typography.caption, color: theme.colors.success, fontWeight: '600' },

    messagesContainer: { flex: 1 },
    messagesContent: {
      padding: theme.spacing.md,
      gap: theme.spacing.sm,
      paddingBottom: theme.spacing['2xl'],
    },
    bubble: {
      maxWidth: '78%',
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.lg,
      marginBottom: 4,
    },
    bubbleAdmin: {
      alignSelf: 'flex-end',
      backgroundColor: theme.colors.primary,
      borderBottomRightRadius: 4,
    },
    bubbleInstructor: {
      alignSelf: 'flex-start',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderBottomLeftRadius: 4,
    },
    bubbleText: {
      ...theme.typography.bodySmall,
    },
    bubbleTextAdmin: { color: '#fff' },
    bubbleTextInstructor: { color: theme.colors.textPrimary },
    bubbleTime: {
      ...theme.typography.caption,
      fontSize: 10,
      marginTop: 4,
      textAlign: 'right',
    },

    inputBar: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      padding: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      gap: 8,
    },
    textInput: {
      flex: 1,
      ...theme.typography.bodySmall,
      color: theme.colors.textPrimary,
      backgroundColor: theme.colors.surfaceSecondary,
      borderRadius: theme.borderRadius.lg,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      maxHeight: 100,
    },
    sendBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendBtnDisabled: {
      backgroundColor: theme.colors.surfaceSecondary,
    },
  });

export default AdminInstructorMessagesScreen;
