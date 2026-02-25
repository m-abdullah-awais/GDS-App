/**
 * GDS Driving School — ChatScreen
 * ==================================
 *
 * Modern messaging UI with sent/received bubbles, timestamps,
 * and input bar. Professional and clean layout.
 */

import React, { useRef, useState } from 'react';
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
import { useRoute, type RouteProp } from '@react-navigation/native';
import type { StudentStackParamList } from '../../navigation/student/StudentStack';
import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';
import ScreenContainer from '../../components/ScreenContainer';
import { chatMessages, type ChatMessage } from '../../modules/student/mockData';

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

const ChatScreen = () => {
  const route = useRoute<Route>();
  const { theme } = useTheme();
  const s = createStyles(theme);
  const flatListRef = useRef<FlatList>(null);

  const [inputText, setInputText] = useState('');
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>(
    chatMessages.filter(m => m.conversationId === route.params.conversationId),
  );

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage: ChatMessage = {
      id: `MSG-LOCAL-${Date.now()}`,
      conversationId: route.params.conversationId,
      text: inputText.trim(),
      sender: 'student',
      timestamp: new Date().toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setLocalMessages(prev => [...prev, newMessage]);
    setInputText('');

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <ScreenContainer showHeader title={route.params.instructorName}>
      <KeyboardAvoidingView
        style={s.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        {/* ── Messages ─────────────────────────────────────── */}
        <FlatList
          ref={flatListRef}
          data={localMessages}
          keyExtractor={item => item.id}
          contentContainerStyle={s.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
          renderItem={({ item }) => (
            <MessageBubble message={item} theme={theme} />
          )}
          ListEmptyComponent={
            <View style={s.emptyState}>
              <Text style={s.emptyIcon}>💬</Text>
              <Text style={s.emptyTitle}>Start the conversation</Text>
              <Text style={s.emptySubtitle}>
                Send a message to {route.params.instructorName}
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
