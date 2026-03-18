/**
 * GDS Driving School — InstructorChatScreen
 * ============================================
 *
 * Modern messaging UI with sent/received bubbles, timestamps,
 * and input bar. Mirrors StudentChatScreen for instructor flow.
 */

import React, { useRef, useState, useEffect } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useRoute, type RouteProp } from '@react-navigation/native';
import type { InstructorStackParamList } from '../../navigation/instructor/InstructorStack';
import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';
import ScreenContainer from '../../components/ScreenContainer';
import { useSelector } from 'react-redux';
import * as messageService from '../../services/messageService';

interface InstructorChatMessage {
  id: string;
  conversationId: string;
  text: string;
  sender: 'student' | 'instructor';
  timestamp: string;
  sortKey: number;
}

type Route = RouteProp<InstructorStackParamList, 'Chat'>;

// ─── Message Bubble ───────────────────────────────────────────────────────────

const MessageBubble = ({
  message,
  theme,
}: {
  message: InstructorChatMessage;
  theme: AppTheme;
}) => {
  const isSent = message.sender === 'instructor';
  const s = bubbleStyles(theme);

  return (
    <View style={[s.bubbleRow, isSent ? s.bubbleRowSent : s.bubbleRowReceived]}>
      <View
        style={[
          s.bubble,
          isSent ? s.bubbleSent : s.bubbleReceived,
        ]}>
        <Text
          style={[
            s.bubbleText,
            isSent ? s.bubbleTextSent : s.bubbleTextReceived,
          ]}>
          {message.text}
        </Text>
        <Text
          style={[
            s.timestamp,
            isSent ? s.timestampSent : s.timestampReceived,
          ]}>
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
      color: '#FFFFFF',
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
      color: 'rgba(255,255,255,0.6)',
      textAlign: 'right',
    },
    timestampReceived: {
      color: theme.colors.textTertiary,
    },
  });

// ─── Component ────────────────────────────────────────────────────────────────

const InstructorChatScreen = () => {
  const route = useRoute<Route>();
  const { theme } = useTheme();
  const s = createStyles(theme);
  const flatListRef = useRef<FlatList>(null);
  const authProfile = useSelector((state: any) => state.auth.profile);
  const insets = useSafeAreaInsets();
  const keyboardOffset = Platform.OS === 'ios' ? insets.top + 56 : 0;
  const justSentRef = useRef(false);

  const [inputText, setInputText] = useState('');
  const [localMessages, setLocalMessages] = useState<InstructorChatMessage[]>([]);

  // Load messages and subscribe to real-time updates
  useEffect(() => {
    const peerId = route.params.conversationId;
    if (!authProfile?.uid || !peerId) return;

    const mapMessages = (msgs: any[]): InstructorChatMessage[] => {
      const mapped = msgs.map((m: any) => {
        const ts = m.createdAt;
        const date = ts?.toDate ? ts.toDate() : ts?.seconds ? new Date(ts.seconds * 1000) : ts ? new Date(ts) : null;
        return {
          id: m.id,
          conversationId: peerId,
          text: m.content || '',
          sender: (m.sender_id === authProfile.uid ? 'instructor' : 'student') as 'instructor' | 'student',
          timestamp: date ? date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '',
          sortKey: date ? date.getTime() : 0,
        };
      });
      mapped.sort((a, b) => a.sortKey - b.sortKey);
      return mapped;
    };

    // Initial load
    messageService.getConversation(authProfile.uid, peerId)
      .then((msgs: any[]) => setLocalMessages(mapMessages(msgs)))
      .catch(() => {});

    // Real-time listener — merge with pending optimistic messages
    const unsub = messageService.onConversation(authProfile.uid, peerId, (msgs: any[]) => {
      const serverMessages = mapMessages(msgs);
      setLocalMessages(prev => {
        const serverIds = new Set(serverMessages.map(m => m.id));
        const pendingLocal = prev.filter(m => m.id.startsWith('MSG-LOCAL-') && !serverIds.has(m.id));
        const merged = [...serverMessages, ...pendingLocal];
        merged.sort((a, b) => a.sortKey - b.sortKey);
        return merged;
      });
    });
    return unsub;
  }, [authProfile?.uid, route.params.conversationId]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const text = inputText.trim();
    const now = new Date();

    // Optimistic: show message immediately
    const optimistic: InstructorChatMessage = {
      id: `MSG-LOCAL-${Date.now()}`,
      conversationId: route.params.conversationId,
      text,
      sender: 'instructor',
      timestamp: now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      sortKey: now.getTime(),
    };
    setLocalMessages(prev => [...prev, optimistic]);
    setInputText('');
    justSentRef.current = true;

    try {
      await messageService.sendMessage({
        senderId: authProfile?.uid,
        receiverId: route.params.conversationId,
        senderName: authProfile?.full_name || 'Instructor',
        receiverName: route.params.studentName || '',
        senderRole: 'instructor',
        receiverRole: 'student',
        content: text,
      });
    } catch (e) {
      console.warn('Failed to send message', e);
    }
  };

  return (
    <ScreenContainer showHeader title={route.params.studentName}>
      <KeyboardAvoidingView
        style={s.container}
        behavior="padding"
        keyboardVerticalOffset={keyboardOffset}>
        {/* ── Messages ─────────────────────────────────────── */}
        <FlatList
          ref={flatListRef}
          data={localMessages}
          keyExtractor={item => item.id}
          contentContainerStyle={s.messageList}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => {
            const shouldAnimate = justSentRef.current;
            justSentRef.current = false;
            flatListRef.current?.scrollToEnd({ animated: shouldAnimate });
          }}
          renderItem={({ item }) => (
            <MessageBubble message={item} theme={theme} />
          )}
          ListEmptyComponent={
            <View style={s.emptyState}>
              <Ionicons
                name="chatbubble-outline"
                size={48}
                color={theme.colors.textTertiary}
              />
              <Text style={s.emptyTitle}>Start the conversation</Text>
              <Text style={s.emptySubtitle}>
                Send a message to {route.params.studentName}
              </Text>
            </View>
          }
        />

        {/* ── Input Bar ────────────────────────────────────── */}
        <View style={s.inputBar}>
          <View style={s.inputContainer}>
            <TextInput
              style={s.textInput}
              placeholder="Type a message..."
              placeholderTextColor={theme.colors.placeholder}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
          </View>
          <Pressable
            style={[
              s.sendButton,
              !inputText.trim() && s.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim()}>
            <Ionicons name="send" size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    messageList: {
      paddingVertical: theme.spacing.md,
      flexGrow: 1,
    },

    // Input Bar
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

    // Empty
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing['3xl'],
    },
    emptyTitle: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
      marginTop: theme.spacing.md,
    },
    emptySubtitle: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textTertiary,
      marginTop: theme.spacing.xxs,
      textAlign: 'center',
    },
  });

export default InstructorChatScreen;
