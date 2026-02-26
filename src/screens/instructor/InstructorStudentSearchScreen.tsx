/**
 * InstructorStudentSearchScreen
 * ==============================
 * Search students by name or postcode and send requests.
 */

import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import { useTheme } from '../../theme';
import Button from '../../components/Button';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { AppTheme } from '../../constants/theme';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import type { InstructorTabsParamList } from '../../navigation/instructor/InstructorTabs';
import {
  searchableStudents,
  type InstructorStudent,
} from '../../modules/instructor/mockData';

type Props = DrawerScreenProps<InstructorTabsParamList, 'Find Students'>;

const InstructorStudentSearchScreen = ({ navigation }: Props) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

  const filteredStudents = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return searchableStudents;
    return searchableStudents.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.postcode.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  const handleSendRequest = (studentId: string) => {
    setSentRequests((prev) => new Set(prev).add(studentId));
    Alert.alert('Request Sent', 'Your request has been sent to the student.');
  };

  const renderStudent = ({ item }: { item: InstructorStudent }) => {
    const isRequestSent = sentRequests.has(item.id);
    return (
      <View style={styles.studentCard}>
        <View style={styles.studentHeader}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{item.avatar}</Text>
          </View>
          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>{item.name}</Text>
            <Text style={styles.studentPostcode}>Postcode: {item.postcode}</Text>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <Button
            title={isRequestSent ? 'Request Sent' : 'Send Request'}
            onPress={() => handleSendRequest(item.id)}
            disabled={isRequestSent}
            variant={isRequestSent ? 'secondary' : 'primary'}
            size="sm"
            fullWidth
          />
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer showHeader title="Find Students" onBackPress={() => navigation.goBack()}>
      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color={theme.colors.textTertiary} style={{ marginRight: theme.spacing.xs }} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by name or postcode..."
            placeholderTextColor={theme.colors.placeholder}
            style={styles.searchInput}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.colors.textTertiary} />
            </Pressable>
          )}
        </View>
      </View>

      <FlatList
        data={filteredStudents}
        renderItem={renderStudent}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={theme.colors.textTertiary} />
            <Text style={styles.emptyText}>No students found</Text>
          </View>
        }
      />
    </ScreenContainer>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    searchSection: {
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceSecondary,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: theme.spacing.sm,
    },
    searchIcon: {
      fontSize: 16,
      marginRight: theme.spacing.xs,
    },
    searchInput: {
      flex: 1,
      ...theme.typography.input,
      color: theme.colors.textPrimary,
      paddingVertical: 12,
    },
    clearButton: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textTertiary,
      padding: theme.spacing.xxs,
    },
    listContent: {
      padding: theme.spacing.md,
      gap: theme.spacing.sm,
      paddingBottom: theme.spacing['3xl'],
    },
    studentCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadows.sm,
    },
    studentHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatarCircle: {
      width: 48,
      height: 48,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      ...theme.typography.buttonLarge,
      color: theme.colors.primary,
    },
    studentInfo: {
      flex: 1,
      marginLeft: theme.spacing.sm,
    },
    studentName: {
      ...theme.typography.h4,
      color: theme.colors.textPrimary,
    },
    studentPostcode: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    cardFooter: {
      marginTop: theme.spacing.sm,
      paddingTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.divider,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: theme.spacing['4xl'],
    },
    emptyIcon: {
      fontSize: 48,
      marginBottom: theme.spacing.md,
    },
    emptyText: {
      ...theme.typography.bodyLarge,
      color: theme.colors.textTertiary,
    },
  });

export default InstructorStudentSearchScreen;
