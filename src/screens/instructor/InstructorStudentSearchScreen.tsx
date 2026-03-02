/**
 * InstructorStudentSearchScreen
 * ==============================
 * Search students by name or postcode and send requests.
 */

import React, { useMemo, useState, useCallback } from 'react';
import {
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
import type { InstructorStudent } from '../../types/instructor-views';
import { useSelector, useDispatch } from 'react-redux';
import { userService } from '../../services';
import { useToast } from '../../components/admin';

type Props = DrawerScreenProps<InstructorTabsParamList, 'Find Students'>;

const InstructorStudentSearchScreen = ({ navigation }: Props) => {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<InstructorStudent[]>([]);
  const authProfile = useSelector((state: any) => state.auth.profile);
  const dispatch = useDispatch<any>();

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setResults([]);
      return;
    }
    try {
      const users = await userService.searchStudentsByQuery(query.trim());
      setResults(users.map((u: any) => ({
        id: u.id || u.uid,
        name: u.full_name || '',
        avatar: (u.full_name || '').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || 'ST',
        postcode: u.postcode || '',
        email: u.email || '',
        phone: u.phone || '',
        lessonsCompleted: 0,
        totalLessons: 0,
      })));
    } catch (e) {
      console.warn('Search failed', e);
    }
  }, []);

  const filteredStudents = results;

  const handleSendRequest = async (studentId: string) => {
    try {
      const { requestService } = require('../../services');
      await requestService.sendStudentInstructorRequest({
        studentId,
        instructorId: authProfile?.uid,
        studentName: results.find(s => s.id === studentId)?.name || '',
        initiatedBy: 'instructor',
      });
      setSentRequests((prev) => new Set(prev).add(studentId));
      showToast('success', 'Your request has been sent to the student.');
    } catch (e) {
      showToast('error', 'Failed to send request.');
    }
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
            onChangeText={handleSearch}
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
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      ...theme.shadows.md,
    },
    studentHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatarCircle: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      ...theme.typography.buttonLarge,
      color: theme.colors.textInverse,
    },
    studentInfo: {
      flex: 1,
      marginLeft: theme.spacing.sm,
    },
    studentName: {
      ...theme.typography.h3,
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
