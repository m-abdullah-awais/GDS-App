/**
 * GDS Driving School — AdminInstructorMessagesScreen
 * ====================================================
 * Conversation list for admin ↔ instructor messaging.
 * Opens dedicated AdminChat screen on row tap.
 */

import React, { useCallback, useMemo } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';
import type { RootState } from '../../store';
import type { Conversation } from '../../store/admin/types';
import { markConversationRead } from '../../store/admin/actions';
import type { AdminStackParamList } from '../../navigation/admin/AdminStack';
import {
  Avatar,
  EmptyState,
} from '../../components/admin';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

const ConversationRow = ({
  item,
  theme,
  onPress,
}: {
  item: Conversation;
  theme: AppTheme;
  onPress: () => void;
}) => {
  const s = rowStyles(theme);
  const hasUnread = item.unreadCount > 0;

  return (
    <Pressable style={({ pressed }) => [s.row, pressed && s.rowPressed]} onPress={onPress}>
      <Avatar initials={item.instructorAvatar} size={48} theme={theme} />
      <View style={s.content}>
        <View style={s.topRow}>
          <Text style={[s.name, hasUnread && s.nameBold]} numberOfLines={1}>
            {item.instructorName}
          </Text>
          <Text style={[s.time, hasUnread && s.timeBold]}>{item.timestamp}</Text>
        </View>
        <View style={s.bottomRow}>
          <Text style={[s.preview, hasUnread && s.previewBold]} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          {hasUnread && (
            <View style={s.unreadBadge}>
              <Text style={s.unreadText}>{item.unreadCount}</Text>
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
      gap: 2,
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

const AdminInstructorMessagesScreen = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useDispatch();
  const navigation = useNavigation<Nav>();

  const conversations = useSelector((state: RootState) => state.admin.conversations);

  const sortedConvos = useMemo(
    () => [...conversations].sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    [conversations],
  );

  const openConversation = useCallback((convo: Conversation) => {
    if (convo.unreadCount > 0) {
      dispatch(markConversationRead(convo.id));
    }

    navigation.getParent<Nav>()?.navigate('AdminChat', {
      conversationId: convo.id,
      instructorName: convo.instructorName,
    });
  }, [dispatch, navigation]);

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
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <ConversationRow item={item} theme={theme} onPress={() => openConversation(item)} />
          )}
        />
      )}
    </View>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background },
    listContent: {
      paddingTop: theme.spacing.xs,
      paddingBottom: theme.spacing['4xl'],
    },
    separator: {
      height: 1,
      backgroundColor: theme.colors.divider,
      marginLeft: theme.spacing.md + 48 + theme.spacing.sm,
      marginRight: theme.spacing.md,
    },
  });

export default AdminInstructorMessagesScreen;
