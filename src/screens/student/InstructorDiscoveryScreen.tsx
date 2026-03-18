/**
 * GDS Driving School — InstructorDiscoveryScreen (Search by Postcode)
 *
 * Students search for instructors by entering their postcode.
 * Only instructors covering that postcode area are shown.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { StudentStackParamList } from '../../navigation/student/types';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppTopHeader from '../../components/AppTopHeader';
import { InstructorCard } from '../../components/student';
import {
  searchInstructors,
  getRequestStatus,
} from '../../services/instructorService';
import Ionicons from 'react-native-vector-icons/Ionicons';

type Nav = NativeStackNavigationProp<StudentStackParamList>;

const InstructorDiscoveryScreen = () => {
  const navigation = useNavigation<Nav>();
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const s = useMemo(() => createStyles(theme), [theme]);

  // Defer heavy render until navigation animation completes
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      requestAnimationFrame(() => setReady(true));
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // Redux
  const instructors = useSelector((state: RootState) => state.student.instructors || []);
  const requests = useSelector((state: RootState) => state.student.requests || []);
  const purchasedPackages = useSelector((state: RootState) => state.student.purchasedPackages || []);
  const searchLoading = useSelector((state: RootState) => state.student.searchLoading);
  const studentId = useSelector((state: RootState) => state.auth.profile?.uid);
  const studentName = useSelector((state: RootState) => (state.auth.profile as any)?.full_name);
  const studentEmail = useSelector((state: RootState) => state.auth.profile?.email);

  // Local state
  const [postcode, setPostcode] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Pulse animation for loading skeleton
  const pulseAnim = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    if (!isSearching) return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [isSearching, pulseAnim]);

  // Animation for search bar focus
  const focusAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, focusAnim]);

  const searchBarBorderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.border, theme.colors.primary],
  });

  const searchBarShadowOpacity = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.15],
  });

  // Filtered results — only search by postcode
  const filtered = useMemo(() => {
    if (!hasSearched || postcode.trim().length === 0) return [];
    return searchInstructors(instructors, { postcode: postcode.trim() });
  }, [instructors, postcode, hasSearched]);

  // Handlers
  const handleSearch = useCallback(async () => {
    const pc = postcode.trim();
    if (pc.length === 0) return;
    Keyboard.dismiss();
    setIsSearching(true);

    try {
      // Fetch/refresh instructors from Firebase so we have latest data
      const { searchInstructorsThunk } = require('../../store/student/thunks');
      await (dispatch as any)(searchInstructorsThunk());
    } catch (_e) {
      // thunk already logs error — proceed with whatever data we have in store
    } finally {
      setHasSearched(true);
      setIsSearching(false);
    }
  }, [postcode, dispatch]);

  const handleClear = useCallback(() => {
    setPostcode('');
    setHasSearched(false);
    setIsSearching(false);
    inputRef.current?.focus();
  }, []);

  const handlePostcodeChange = useCallback((text: string) => {
    setPostcode(text.toUpperCase());
    if (text.trim().length === 0) {
      setHasSearched(false);
    }
  }, []);

  const handleSendRequest = useCallback(
    async (instructorId: string) => {
      if (!studentId) return;
      setSendingId(instructorId);
      try {
        const { sendInstructorRequestThunk } = require('../../store/student/thunks');
        await (dispatch as any)(sendInstructorRequestThunk(studentId, instructorId, studentName, studentEmail));
      } catch (_e) {
        // thunk already logs error
      } finally {
        setSendingId(null);
      }
    },
    [dispatch, studentId, studentName, studentEmail],
  );

  const getActiveCount = useCallback((instructorId: string) => {
    return purchasedPackages.filter(
      (p: any) => p.instructorId === instructorId && p.status === 'active',
    ).length;
  }, [purchasedPackages]);

  // ─── Skeleton Card for loading state ─────────────────
  const renderSkeletonCard = (index: number) => (
    <View key={index} style={s.cardWrapper}>
      <View style={s.skeletonCard}>
        {/* Header row */}
        <View style={s.skeletonHeader}>
          <Animated.View style={[s.skeletonAvatar, { opacity: pulseAnim }]} />
          <View style={s.skeletonHeaderInfo}>
            <Animated.View style={[s.skeletonLine, s.skeletonLineName, { opacity: pulseAnim }]} />
            <Animated.View style={[s.skeletonLine, s.skeletonLineRating, { opacity: pulseAnim }]} />
            <Animated.View style={[s.skeletonLine, s.skeletonLineMeta, { opacity: pulseAnim }]} />
          </View>
        </View>
        {/* Bio lines */}
        <Animated.View style={[s.skeletonLine, s.skeletonLineBio, { opacity: pulseAnim }]} />
        <Animated.View style={[s.skeletonLine, s.skeletonLineBioShort, { opacity: pulseAnim }]} />
        {/* CTA button */}
        <Animated.View style={[s.skeletonButton, { opacity: pulseAnim }]} />
      </View>
    </View>
  );

  // Loading state (initial navigation defer)
  if (!ready) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['bottom']}>
        <AppTopHeader
          title="Find Instructor"
          leftAction="back"
          onLeftPress={() => navigation.canGoBack() && navigation.goBack()}
          avatarText={studentName || 'GDS'}
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.screen} edges={['bottom']}>
      <AppTopHeader
        title="Find Instructor"
        leftAction="back"
        onLeftPress={() => navigation.canGoBack() && navigation.goBack()}
        avatarText={studentName || 'GDS'}
      />

      {/* Search Section */}
      <View style={s.searchSection}>
        <Text style={s.searchTitle}>Search by Postcode</Text>
        <Text style={s.searchSubtitle}>
          Enter your postcode to find driving instructors in your area
        </Text>

        <Animated.View
          style={[
            s.searchBar,
            {
              borderColor: searchBarBorderColor,
              shadowOpacity: searchBarShadowOpacity,
            },
          ]}>
          <View style={s.searchIconContainer}>
            <Ionicons name="location-outline" size={22} color={theme.colors.primary} />
          </View>
          <TextInput
            ref={inputRef}
            style={s.searchInput}
            placeholder="e.g. NE1, M1, SW1A"
            placeholderTextColor={theme.colors.placeholder}
            value={postcode}
            onChangeText={handlePostcodeChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoCapitalize="characters"
            autoCorrect={false}
            editable={!isSearching}
          />
          {postcode.length > 0 && !isSearching && (
            <Pressable onPress={handleClear} style={s.clearButton} hitSlop={8}>
              <Ionicons name="close-circle" size={20} color={theme.colors.textTertiary} />
            </Pressable>
          )}
          <Pressable
            style={[
              s.searchButton,
              (postcode.trim().length === 0 || isSearching) && s.searchButtonDisabled,
            ]}
            onPress={handleSearch}
            disabled={postcode.trim().length === 0 || isSearching}>
            {isSearching ? (
              <ActivityIndicator size="small" color={theme.colors.textTertiary} />
            ) : (
              <Ionicons
                name="search"
                size={20}
                color={
                  postcode.trim().length === 0
                    ? theme.colors.textTertiary
                    : theme.colors.textInverse
                }
              />
            )}
          </Pressable>
        </Animated.View>
      </View>

      {/* ─── States: Initial / Loading / No Results / Results ─── */}

      {isSearching ? (
        /* Loading state — skeleton cards */
        <View style={s.loadingContainer}>
          <View style={s.loadingHeader}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={s.loadingText}>
              Searching instructors near <Text style={s.loadingPostcode}>{postcode}</Text>...
            </Text>
          </View>
          {[0, 1, 2].map(renderSkeletonCard)}
        </View>
      ) : !hasSearched ? (
        /* Initial state — no search yet */
        <View style={s.initialState}>
          <View style={s.illustrationCircle}>
            <Ionicons name="map-outline" size={48} color={theme.colors.primary} />
          </View>
          <Text style={s.initialTitle}>Find Your Instructor</Text>
          <Text style={s.initialSubtitle}>
            Enter your postcode above to discover qualified driving instructors who cover your area
          </Text>
          <View style={s.featureList}>
            <View style={s.featureItem}>
              <View style={s.featureDot}>
                <Ionicons name="checkmark" size={12} color={theme.colors.textInverse} />
              </View>
              <Text style={s.featureText}>Search by your postcode</Text>
            </View>
            <View style={s.featureItem}>
              <View style={s.featureDot}>
                <Ionicons name="checkmark" size={12} color={theme.colors.textInverse} />
              </View>
              <Text style={s.featureText}>View instructor profiles & ratings</Text>
            </View>
            <View style={s.featureItem}>
              <View style={s.featureDot}>
                <Ionicons name="checkmark" size={12} color={theme.colors.textInverse} />
              </View>
              <Text style={s.featureText}>Send a request to connect</Text>
            </View>
          </View>
        </View>
      ) : filtered.length === 0 ? (
        /* No results */
        <View style={s.emptyState}>
          <View style={s.emptyIconCircle}>
            <Ionicons name="search-outline" size={40} color={theme.colors.textTertiary} />
          </View>
          <Text style={s.emptyTitle}>No Instructors Found</Text>
          <Text style={s.emptySubtitle}>
            No instructors currently cover the postcode "{postcode}".{'\n'}Try a nearby postcode or check back later.
          </Text>
          <Pressable style={s.tryAgainButton} onPress={handleClear}>
            <Ionicons name="refresh-outline" size={18} color={theme.colors.primary} />
            <Text style={s.tryAgainText}>Try Another Postcode</Text>
          </Pressable>
        </View>
      ) : (
        /* Results list */
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={4}
          maxToRenderPerBatch={4}
          windowSize={5}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <View style={s.resultsHeader}>
              <View style={s.resultsCountRow}>
                <Ionicons name="people-outline" size={16} color={theme.colors.primary} />
                <Text style={s.resultCount}>
                  {filtered.length} instructor{filtered.length !== 1 ? 's' : ''} found near{' '}
                  <Text style={s.resultPostcode}>{postcode}</Text>
                </Text>
              </View>
            </View>
          }
          renderItem={({ item }) => {
            const reqStatus = getRequestStatus(requests, item.id);
            const activeCount = getActiveCount(item.id);
            return (
              <View style={s.cardWrapper}>
                <InstructorCard
                  instructor={item}
                  requestStatus={reqStatus}
                  onViewProfile={() => navigation.navigate('InstructorProfile', { instructorId: item.id })}
                  onSendRequest={() => handleSendRequest(item.id)}
                  onViewPackages={() => navigation.navigate('PackageListing', { instructorId: item.id })}
                  activePackagesCount={activeCount}
                  loading={sendingId === item.id}
                />
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background },

    // ─── Search Section ───────────────────────────────
    searchSection: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
    },
    searchTitle: {
      ...theme.typography.h2,
      color: theme.colors.textPrimary,
      marginBottom: 4,
    },
    searchSubtitle: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 2,
      borderColor: theme.colors.border,
      height: 56,
      paddingLeft: theme.spacing.sm,
      paddingRight: 4,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 8,
      elevation: 3,
    },
    searchIconContainer: {
      width: 36,
      height: 36,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.sm,
    },
    searchInput: {
      flex: 1,
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: '600',
      letterSpacing: 1,
      padding: 0,
    },
    clearButton: {
      padding: theme.spacing.xs,
    },
    searchButton: {
      width: 44,
      height: 44,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 4,
    },
    searchButtonDisabled: {
      backgroundColor: theme.colors.surfaceSecondary,
    },

    // ─── Loading State ────────────────────────────────
    loadingContainer: {
      flex: 1,
      paddingTop: theme.spacing.xs,
    },
    loadingHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      marginBottom: theme.spacing.xs,
    },
    loadingText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },
    loadingPostcode: {
      fontWeight: '700',
      color: theme.colors.primary,
    },

    // ─── Skeleton Card ────────────────────────────────
    skeletonCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    skeletonHeader: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    skeletonAvatar: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: theme.colors.surfaceSecondary,
    },
    skeletonHeaderInfo: {
      flex: 1,
      gap: 8,
      paddingTop: 4,
    },
    skeletonLine: {
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.surfaceSecondary,
    },
    skeletonLineName: {
      width: '60%',
      height: 14,
    },
    skeletonLineRating: {
      width: '40%',
      height: 10,
    },
    skeletonLineMeta: {
      width: '70%',
      height: 10,
    },
    skeletonLineBio: {
      width: '100%',
      height: 10,
      marginTop: theme.spacing.sm,
    },
    skeletonLineBioShort: {
      width: '75%',
      height: 10,
      marginTop: 6,
    },
    skeletonButton: {
      width: '100%',
      height: 38,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surfaceSecondary,
      marginTop: theme.spacing.sm,
    },

    // ─── Initial State (no search yet) ────────────────
    initialState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing['2xl'],
      paddingBottom: theme.spacing['3xl'],
    },
    illustrationCircle: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: theme.colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.lg,
    },
    initialTitle: {
      ...theme.typography.h2,
      color: theme.colors.textPrimary,
      textAlign: 'center',
      marginBottom: theme.spacing.xs,
    },
    initialSubtitle: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: theme.spacing.xl,
    },
    featureList: {
      gap: theme.spacing.sm,
      alignSelf: 'stretch',
      paddingHorizontal: theme.spacing.md,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    featureDot: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    featureText: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
    },

    // ─── Empty State (no results) ─────────────────────
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing['2xl'],
      paddingBottom: theme.spacing['3xl'],
    },
    emptyIconCircle: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: theme.colors.surfaceSecondary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.lg,
    },
    emptyTitle: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
      textAlign: 'center',
      marginBottom: theme.spacing.xs,
    },
    emptySubtitle: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textTertiary,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: theme.spacing.lg,
    },
    tryAgainButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.full,
      borderWidth: 1.5,
      borderColor: theme.colors.primary,
    },
    tryAgainText: {
      ...theme.typography.buttonMedium,
      color: theme.colors.primary,
    },

    // ─── Results List ─────────────────────────────────
    resultsHeader: {
      paddingHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    resultsCountRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    resultCount: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },
    resultPostcode: {
      fontWeight: '700',
      color: theme.colors.primary,
    },
    cardWrapper: {
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    listContent: {
      paddingTop: theme.spacing.xs,
      paddingBottom: theme.spacing['3xl'],
    },
  });

export default InstructorDiscoveryScreen;
