/**
 * GDS Driving School — ChatScreen
 * ==================================
 *
 * Modern messaging UI with sent/received bubbles, timestamps,
 * and input bar. Professional and clean layout.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, type RouteProp } from '@react-navigation/native';
import type { StudentStackParamList } from '../../navigation/student/types';
import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';
import ScreenContainer from '../../components/ScreenContainer';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import * as messageService from '../../services/messageService';

type Route = RouteProp<StudentStackParamList, 'Chat'>;

// ─── Message Bubble ───────────────────────────────────────────────────────────

const MessageBubble = ({
  message,
  theme,
}: {
  message: ChatMessage;
  theme: AppTheme;
}) => {
  const isSent = message.sender === 'student';
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

interface ChatMessage {
  id: string;
  conversationId: string;
  text: string;
  sender: string;
  timestamp: string;
  sortKey: number;
}

const ChatScreen = () => {
  const route = useRoute<Route>();
  const { theme } = useTheme();
  const s = createStyles(theme);
  const flatListRef = useRef<FlatList>(null);
  const profile = useSelector((state: RootState) => state.auth.profile);
  const insets = useSafeAreaInsets();
  const justSentRef = useRef(false);

  // Header height (~56) + safe area top = total offset for KeyboardAvoidingView
  const keyboardOffset = Platform.OS === 'ios' ? insets.top + 56 : 0;

  const scrollToBottom = useCallback((animated = true) => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated }), 50);
  }, []);

  const [inputText, setInputText] = useState('');
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Load conversation messages from Firebase
  useEffect(() => {
    if (!profile?.uid || !route.params?.conversationId) return;
    setLoading(true);
    // conversationId is the other user's ID
    const otherUserId = route.params.conversationId;
    messageService.getConversation(profile.uid, otherUserId)
      .then(msgs => {
        const mapped: ChatMessage[] = msgs.map(m => {
          const ts = m.createdAt as any;
          const date = ts?.toDate ? ts.toDate() : ts?.seconds ? new Date(ts.seconds * 1000) : ts ? new Date(ts) : null;
          return {
            id: m.id,
            conversationId: otherUserId,
            text: m.content || (m as any).text || '',
            sender: m.sender_id === profile.uid ? 'student' : 'instructor',
            timestamp: date ? date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '',
            sortKey: date ? date.getTime() : 0,
          };
        });
        mapped.sort((a, b) => a.sortKey - b.sortKey);
        setLocalMessages(mapped);
      })
      .catch(err => console.error('Failed to load conversation:', err))
      .finally(() => setLoading(false));
  }, [profile?.uid, route.params?.conversationId]);

  // Set up real-time listener
  useEffect(() => {
    if (!profile?.uid || !route.params?.conversationId) return;
    const otherUserId = route.params.conversationId;
    const unsubscribe = messageService.onConversation(
      profile.uid,
      otherUserId,
      (msgs) => {
        const serverMessages: ChatMessage[] = msgs.map(m => {
          const ts = m.createdAt as any;
          const date = ts?.toDate ? ts.toDate() : ts?.seconds ? new Date(ts.seconds * 1000) : ts ? new Date(ts) : null;
          return {
            id: m.id,
            conversationId: otherUserId,
            text: m.content || (m as any).text || '',
            sender: m.sender_id === profile.uid ? 'student' : 'instructor',
            timestamp: date ? date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '',
            sortKey: date ? date.getTime() : 0,
          };
        });
        // Merge: keep optimistic local messages that aren't yet in server data
        setLocalMessages(prev => {
          const serverIds = new Set(serverMessages.map(m => m.id));
          const pendingLocal = prev.filter(m => m.id.startsWith('MSG-LOCAL-') && !serverIds.has(m.id));
          const merged = [...serverMessages, ...pendingLocal];
          merged.sort((a, b) => a.sortKey - b.sortKey);
          return merged;
        });
      },
    );
    return () => unsubscribe();
  }, [profile?.uid, route.params?.conversationId]);

  const handleSend = async () => {
    if (!inputText.trim() || !profile?.uid) return;

    const text = inputText.trim();
    const now = new Date();
    const newMessage: ChatMessage = {
      id: `MSG-LOCAL-${Date.now()}`,
      conversationId: route.params?.conversationId ?? '',
      text,
      sender: 'student',
      timestamp: now.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      sortKey: now.getTime(),
    };

    setLocalMessages(prev => [...prev, newMessage]);
    setInputText('');
    justSentRef.current = true;

    try {
      await messageService.sendMessage({
        senderId: profile.uid,
        receiverId: route.params?.conversationId ?? '',
        senderName: profile.full_name || '',
        receiverName: route.params?.instructorName || '',
        senderRole: 'student',
        receiverRole: 'instructor',
        content: text,
      });
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  return (
    <ScreenContainer showHeader title={route.params?.instructorName ?? ''}>
      <KeyboardAvoidingView
        style={s.container}
        behavior="padding"
        keyboardVerticalOffset={keyboardOffset}>
        {/* ── Messages ─────────────────────────────────────── */}
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
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
              <Text style={s.emptyIcon}>💬</Text>
              <Text style={s.emptyTitle}>Start the conversation</Text>
              <Text style={s.emptySubtitle}>
                Send a message to {route.params?.instructorName ?? ''}
              </Text>
            </View>
          }
        />
        )}

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
            <Text style={s.sendIcon}>➤</Text>
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
    sendIcon: {
      fontSize: 18,
      color: '#FFFFFF',
    },

    // Empty
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing['3xl'],
    },
    emptyIcon: {
      fontSize: 48,
      marginBottom: theme.spacing.md,
    },
    emptyTitle: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
    },
    emptySubtitle: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textTertiary,
      marginTop: theme.spacing.xxs,
      textAlign: 'center',
    },
  });

export default ChatScreen;
