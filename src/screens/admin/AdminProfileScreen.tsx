import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ScreenContainer from '../../components/ScreenContainer';
import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';

const ADMIN_PROFILE = {
  name: 'Platform Admin',
  role: 'System Administrator',
  email: 'admin@gdsplatform.com',
  phone: '+44 7000 000000',
  location: 'London, UK',
};

const AdminProfileScreen = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <ScreenContainer showHeader title="Profile">
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AD</Text>
          </View>
          <View style={styles.heroInfo}>
            <Text style={styles.name}>{ADMIN_PROFILE.name}</Text>
            <Text style={styles.role}>{ADMIN_PROFILE.role}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <View style={styles.row}>
            <Ionicons name="mail-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.value}>{ADMIN_PROFILE.email}</Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="call-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.value}>{ADMIN_PROFILE.phone}</Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="location-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.value}>{ADMIN_PROFILE.location}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Access</Text>
          <View style={styles.pillRow}>
            <View style={[styles.pill, { backgroundColor: theme.colors.successLight }]}>
              <Text style={[styles.pillText, { color: theme.colors.success }]}>Full Permissions</Text>
            </View>
            <View style={[styles.pill, { backgroundColor: theme.colors.infoLight }]}>
              <Text style={[styles.pillText, { color: theme.colors.info }]}>Live Session</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    screen: { flex: 1 },
    content: {
      padding: theme.spacing.md,
      paddingBottom: theme.spacing['4xl'],
      gap: theme.spacing.md,
    },
    heroCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      ...theme.shadows.md,
    },
    avatar: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      ...theme.typography.h2,
      color: theme.colors.textInverse,
      fontWeight: '700',
    },
    heroInfo: { flex: 1 },
    name: {
      ...theme.typography.h2,
      color: theme.colors.textPrimary,
    },
    role: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    sectionTitle: {
      ...theme.typography.h4,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.sm,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    value: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
      flex: 1,
    },
    pillRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    pill: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.full,
    },
    pillText: {
      ...theme.typography.caption,
      fontWeight: '600',
    },
  });

export default AdminProfileScreen;
