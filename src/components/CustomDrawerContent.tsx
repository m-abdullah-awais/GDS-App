import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
    DrawerContentScrollView,
    DrawerItemList,
    type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { useTheme } from '../theme';
import type { AppTheme } from '../constants/theme';

interface CustomDrawerContentProps extends DrawerContentComponentProps {
    /** Display name shown under the avatar */
    userName: string;
    /** Email shown below the name */
    userEmail: string;
    /** Role label shown as a badge (e.g. "Student", "Instructor", "Admin") */
    roleLabel: string;
}

const getInitials = (value: string) =>
    value
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(word => word[0]?.toUpperCase())
        .join('') || 'GD';

const CustomDrawerContent: React.FC<CustomDrawerContentProps> = ({
    userName,
    userEmail,
    roleLabel,
    ...props
}) => {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    return (
        <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContent}>
            {/* ── Profile header ─────────────────────────── */}
            <View style={styles.profileSection}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{getInitials(userName)}</Text>
                </View>

                <Text style={styles.userName} numberOfLines={1}>
                    {userName}
                </Text>
                <Text style={styles.userEmail} numberOfLines={1}>
                    {userEmail}
                </Text>

                <View style={styles.roleBadge}>
                    <Text style={styles.roleBadgeText}>{roleLabel}</Text>
                </View>
            </View>

            {/* ── Divider ────────────────────────────────── */}
            <View style={styles.divider} />

            {/* ── Default drawer items ───────────────────── */}
            <DrawerItemList {...props} />
        </DrawerContentScrollView>
    );
};

const createStyles = (theme: AppTheme) =>
    StyleSheet.create({
        scrollContent: {
            flex: 1,
        },
        profileSection: {
            alignItems: 'center',
            paddingTop: theme.spacing.lg,
            paddingBottom: theme.spacing.md,
            paddingHorizontal: theme.spacing.md,
        },
        avatar: {
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: theme.colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: theme.spacing.sm,
            ...theme.shadows.md,
        },
        avatarText: {
            ...theme.typography.h2,
            color: theme.colors.textInverse,
            fontWeight: '700',
        },
        userName: {
            ...theme.typography.h3,
            color: theme.colors.textPrimary,
            fontWeight: '600',
            textAlign: 'center',
        },
        userEmail: {
            ...theme.typography.caption,
            color: theme.colors.textSecondary,
            marginTop: 2,
            textAlign: 'center',
        },
        roleBadge: {
            marginTop: theme.spacing.xs,
            paddingHorizontal: theme.spacing.sm,
            paddingVertical: 4,
            borderRadius: theme.borderRadius.full,
            backgroundColor: theme.colors.primaryLight,
        },
        roleBadgeText: {
            ...theme.typography.caption,
            color: theme.colors.primary,
            fontWeight: '600',
        },
        divider: {
            height: 1,
            backgroundColor: theme.colors.border,
            marginHorizontal: theme.spacing.md,
            marginBottom: theme.spacing.xs,
        },
    });

export default CustomDrawerContent;
