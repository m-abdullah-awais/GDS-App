/**
 * GDS Driving School — AdminInstructorChatScreen
 * ===============================================
 * Dedicated chat screen for admin ↔ instructor conversations.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ScreenContainer from '../../components/ScreenContainer';
import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';
import type { RootState } from '../../store';
import type { ChatMessage } from '../../store/admin/types';
import {
  sendMessage,
  markConversationRead,
  markConversationResolved,
} from '../../store/admin/actions';
import { ConfirmModal, StatusBadge, useToast } from '../../components/admin';
import type { AdminStackParamList } from '../../navigation/admin/AdminStack';

type Nav = NativeStackNavigationProp<AdminStackParamList>;
type ChatRoute = RouteProp<AdminStackParamList, 'AdminChat'>;

const MessageBubble = ({
  message,
  theme,
}: {
  message: ChatMessage;
  theme: AppTheme;
}) => {
  const isSent = message.senderType === 'admin';
  const styles = bubbleStyles(theme);

  return (
    <View style={[styles.bubbleRow, isSent ? styles.bubbleRowSent : styles.bubbleRowReceived]}>
      <View style={[styles.bubble, isSent ? styles.bubbleSent : styles.bubbleReceived]}>
        <Text style={[styles.bubbleText, isSent ? styles.bubbleTextSent : styles.bubbleTextReceived]}>
          {message.text}
        </Text>
        <Text style={[styles.timestamp, isSent ? styles.timestampSent : styles.timestampReceived]}>
          {message.timestamp}
        </Text>
      </View>
    </View>
  );
};

const bubbleStyles = (theme: AppTheme) =>
  StyleSheet.create({
    bubbleRow: {
      paddingHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.xs,
    },
    bubbleRowSent: {
      alignItems: 'flex-end',
    },
    bubbleRowReceived: {
      alignItems: 'flex-start',
    },
    bubble: {
      maxWidth: '78%',
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.sm,
      paddingBottom: theme.spacing.xs,
    },
    bubbleSent: {
      backgroundColor: theme.colors.primary,
      borderBottomRightRadius: 4,
    },
    bubbleReceived: {
      backgroundColor: theme.colors.surface,
      borderBottomLeftRadius: 4,
      ...theme.shadows.sm,
    },
    bubbleText: {
      ...theme.typography.bodyMedium,
      lineHeight: 22,
    },
    bubbleTextSent: {
      color: theme.colors.textInverse,
    },
    bubbleTextReceived: {
      color: theme.colors.textPrimary,
    },
    timestamp: {
      ...theme.typography.caption,
      fontSize: 10,
      marginTop: theme.spacing.xxs,
    },
    timestampSent: {
      color: 'rgba(255,255,255,0.65)',
      textAlign: 'right',
    },
    timestampReceived: {
      color: theme.colors.textTertiary,
    },
  });

const AdminInstructorChatScreen = () => {
  const route = useRoute<ChatRoute>();
  const navigation = useNavigation<Nav>();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const listRef = useRef<FlatList>(null);

  const [replyText, setReplyText] = useState('');
  const [resolveModal, setResolveModal] = useState(false);

  const conversation = useSelector((state: RootState) =>
    state.admin.conversations.find(c => c.id === route.params.conversationId),
  );

  const messages = useSelector((state: RootState) =>
    state.admin.messages
      .filter(m => m.conversationId === route.params.conversationId)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp)),
  );

  useEffect(() => {
    if (conversation?.unreadCount && conversation.unreadCount > 0) {
      dispatch(markConversationRead(conversation.id));
    }
  }, [conversation, dispatch]);

  const handleSend = useCallback(() => {
    if (!replyText.trim()) return;
    dispatch(sendMessage(route.params.conversationId, replyText.trim()));
    setReplyText('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }, [dispatch, route.params.conversationId, replyText]);

  const handleResolve = useCallback(() => {
    if (!conversation) return;
    dispatch(markConversationResolved(conversation.id));
    showToast('success', 'Conversation marked as resolved');
    setResolveModal(false);
  }, [conversation, dispatch, showToast]);

  return (
    <ScreenContainer
      showHeader
      title={route.params.instructorName}
      onBackPress={() => navigation.goBack()}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <View style={styles.metaRow}>
          {conversation ? <StatusBadge status={conversation.status} /> : null}
          {conversation?.status !== 'resolved' && (
            <Pressable style={styles.resolveBtn} onPress={() => setResolveModal(true)}>
              <Ionicons name="checkmark-done-outline" size={16} color={theme.colors.success} />
              <Text style={styles.resolveBtnText}>Resolve</Text>
            </Pressable>
          )}
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item }) => <MessageBubble message={item} theme={theme} />}
        />

        {conversation?.status !== 'resolved' && (
          <View style={styles.inputBar}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Type a message..."
                placeholderTextColor={theme.colors.placeholder}
                value={replyText}
                onChangeText={setReplyText}
                multiline
                maxLength={500}
              />
            </View>
            <Pressable
              style={[styles.sendButton, !replyText.trim() && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!replyText.trim()}>
              <Ionicons name="send" size={18} color={theme.colors.textInverse} />
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>

      <ConfirmModal
        visible={resolveModal}
        title="Resolve Conversation"
        message={`Mark conversation with ${route.params.instructorName} as resolved?`}
        icon="checkmark-done-outline"
        variant="success"
        confirmLabel="Resolve"
        onConfirm={handleResolve}
        onCancel={() => setResolveModal(false)}
      />
    </ScreenContainer>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: { flex: 1 },
    metaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.xs,
    },
    resolveBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.successLight,
    },
    resolveBtnText: {
      ...theme.typography.caption,
      color: theme.colors.success,
      fontWeight: '600',
    },
    messageList: {
      paddingVertical: theme.spacing.md,
      flexGrow: 1,
    },
    inputBar: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.divider,
      gap: theme.spacing.xs,
    },
    inputContainer: {
      flex: 1,
      backgroundColor: theme.colors.surfaceSecondary,
      borderRadius: theme.borderRadius.xl,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: Platform.OS === 'ios' ? theme.spacing.sm : theme.spacing.xxs,
      maxHeight: 120,
    },
    textInput: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
      padding: 0,
      maxHeight: 100,
    },
    sendButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendButtonDisabled: {
      backgroundColor: theme.colors.disabled,
    },
  });

export default AdminInstructorChatScreen;
