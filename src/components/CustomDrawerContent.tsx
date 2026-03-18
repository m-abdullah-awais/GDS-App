import React, { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import {
    DrawerContentScrollView,
    DrawerItemList,
    type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import type { AppTheme } from '../constants/theme';

interface CustomDrawerContentProps extends DrawerContentComponentProps {
    /** Display name shown under the avatar */
    userName: string;
    /** Email shown below the name */
    userEmail: string;
    /** Role label shown as a badge (e.g. "Student", "Instructor", "Admin") */
    roleLabel: string;
    /** Profile image URL — shown instead of initials when available */
    avatarImageUrl?: string;
    /** Called when the user taps the Logout button */
    onLogout?: () => void;
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
    avatarImageUrl,
    onLogout,
    ...drawerProps
}) => {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const insets = useSafeAreaInsets();
    const [imgError, setImgError] = useState(false);
    const hasImage = avatarImageUrl && avatarImageUrl.length > 0 && !imgError;

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* ── Fixed profile header ───────────────────── */}
            <View style={styles.profileSection}>
                {hasImage ? (
                    <Image
                        source={{ uri: avatarImageUrl }}
                        style={styles.avatarImage}
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{getInitials(userName)}</Text>
                    </View>
                )}

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

            <View style={styles.divider} />

            {/* ── Scrollable drawer items ────────────────── */}
            <DrawerContentScrollView
                {...drawerProps}
                contentContainerStyle={styles.scrollContent}
                style={styles.scrollView}>
                <DrawerItemList {...drawerProps} />
            </DrawerContentScrollView>

            {/* ── Fixed logout at bottom ─────────────────── */}
            {onLogout ? (
                <>
                    <View style={styles.divider} />
                    <Pressable
                        style={({ pressed }) => [
                            styles.logoutButton,
                            pressed && styles.logoutButtonPressed,
                        ]}
                        onPress={onLogout}>
                        <Ionicons name="log-out-outline" size={20} color={styles.logoutText.color} />
                        <Text style={styles.logoutText}>Logout</Text>
                    </Pressable>
                </>
            ) : null}

            <View style={{ height: insets.bottom }} />
        </View>
    );
};

const createStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        scrollView: {
            flex: 1,
        },
        scrollContent: {
            paddingTop: 0,
            paddingBottom: theme.spacing.sm,
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
        avatarImage: {
            width: 72,
            height: 72,
            borderRadius: 36,
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
        logoutButton: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: theme.spacing.md + 4,
            paddingVertical: theme.spacing.md,
            gap: theme.spacing.sm,
        },
        logoutButtonPressed: {
            backgroundColor: theme.colors.errorLight ?? theme.colors.primaryLight,
        },
        logoutText: {
            ...theme.typography.bodyMedium,
            color: theme.colors.error,
            fontWeight: '600',
        },
    });

export default CustomDrawerContent;
