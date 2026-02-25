/**
 * GDS Driving School — StudentMessagesScreen
 * =============================================
 *
 * Conversation list with avatar, message preview, unread badges.
 * Tapping navigates to ChatScreen.
 */

import React from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { StudentStackParamList } from '../../navigation/student/StudentStack';
import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';
import ScreenContainer from '../../components/ScreenContainer';
import { conversations, type Conversation } from '../../modules/student/mockData';

type Nav = NativeStackNavigationProp<StudentStackParamList>;

// ─── Avatar ───────────────────────────────────────────────────────────────────

const Avatar = ({
  initials,
  size = 48,
  theme,
}: {
  initials: string;
  size?: number;
  theme: AppTheme;
}) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    }}>
    <Text
      style={[
        theme.typography.buttonSmall,
        { color: theme.colors.textInverse, fontSize: size * 0.36 },
      ]}>
      {initials}
    </Text>
  </View>
);

// ─── Conversation Row ─────────────────────────────────────────────────────────

const ConversationRow = ({
  conversation,
  theme,
  onPress,
}: {
  conversation: Conversation;
  theme: AppTheme;
  onPress: () => void;
}) => {
  const s = rowStyles(theme);
  const hasUnread = conversation.unreadCount > 0;

  return (
    <Pressable
      style={({ pressed }) => [s.row, pressed && s.rowPressed]}
      onPress={onPress}>
      <Avatar
        initials={conversation.instructorAvatar}
        size={48}
        theme={theme}
      />
      <View style={s.content}>
        <View style={s.topRow}>
          <Text
            style={[s.name, hasUnread && s.nameBold]}
            numberOfLines={1}>
            {conversation.instructorName}
          </Text>
          <Text style={[s.time, hasUnread && s.timeBold]}>
            {conversation.timestamp}
          </Text>
        </View>
        <View style={s.bottomRow}>
          <Text
            style={[s.preview, hasUnread && s.previewBold]}
            numberOfLines={1}>
            {conversation.lastMessage}
          </Text>
          {hasUnread && (
            <View style={s.unreadBadge}>
              <Text style={s.unreadText}>{conversation.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
};

const rowStyles = (theme: AppTheme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    rowPressed: {
      backgroundColor: theme.colors.pressed,
    },
    content: {
      flex: 1,
      marginLeft: theme.spacing.sm,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    name: {
      ...theme.typography.bodyLarge,
      color: theme.colors.textPrimary,
      flex: 1,
    },
    nameBold: {
      fontWeight: '700',
    },
    time: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginLeft: theme.spacing.xs,
    },
    timeBold: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    bottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 2,
    },
    preview: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      flex: 1,
    },
    previewBold: {
      color: theme.colors.textPrimary,
      fontWeight: '500',
    },
    unreadBadge: {
      backgroundColor: theme.colors.primary,
      minWidth: 22,
      height: 22,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 6,
      marginLeft: theme.spacing.xs,
    },
    unreadText: {
      ...theme.typography.caption,
      color: theme.colors.textInverse,
      fontWeight: '700',
      fontSize: 11,
    },
  });

// ─── Component ────────────────────────────────────────────────────────────────

const StudentMessagesScreen = () => {
  const navigation = useNavigation<Nav>();
  const { theme } = useTheme();
  const s = createStyles(theme);

  return (
    <ScreenContainer showHeader title="Messages">
      <FlatList
        data={conversations}
        keyExtractor={item => item.id}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={s.separator} />}
        renderItem={({ item }) => (
          <ConversationRow
            conversation={item}
            theme={theme}
            onPress={() =>
              navigation.navigate('Chat', {
                conversationId: item.id,
                instructorName: item.instructorName,
              })
            }
          />
        )}
        ListEmptyComponent={
          <View style={s.emptyState}>
            <Text style={s.emptyIcon}>💬</Text>
            <Text style={s.emptyTitle}>No conversations yet</Text>
            <Text style={s.emptySubtitle}>
              Start a conversation with an instructor
            </Text>
          </View>
        }
      />
    </ScreenContainer>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    listContent: {
      paddingTop: theme.spacing.xs,
      paddingBottom: theme.spacing['3xl'],
    },
    separator: {
      height: 1,
      backgroundColor: theme.colors.divider,
      marginLeft: theme.spacing.md + 48 + theme.spacing.sm,
      marginRight: theme.spacing.md,
    },

    // Empty
    emptyState: {
      alignItems: 'center',
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
    },
  });

export default StudentMessagesScreen;