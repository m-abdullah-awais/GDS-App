import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
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
    onLogout,
    ...props
}) => {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const insets = useSafeAreaInsets();

    // Track whether there is hidden content below the fold
    const [hasMoreBelow, setHasMoreBelow] = useState(false);
    const scrollViewHeight = useRef(0);
    const contentHeight = useRef(0);
    const currentOffset = useRef(0);

    // Bouncing animation for the chevron
    const bounceAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!hasMoreBelow) return;
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(bounceAnim, { toValue: 6, duration: 500, useNativeDriver: true }),
                Animated.timing(bounceAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
            ]),
        );
        loop.start();
        return () => loop.stop();
    }, [hasMoreBelow, bounceAnim]);

    const checkMoreBelow = useCallback(() => {
        const remaining = contentHeight.current - scrollViewHeight.current - currentOffset.current;
        setHasMoreBelow(remaining > 8);
    }, []);

    const handleScroll = useCallback((e: any) => {
        currentOffset.current = e.nativeEvent.contentOffset.y;
        checkMoreBelow();
    }, [checkMoreBelow]);

    const handleContentSizeChange = useCallback((_: number, h: number) => {
        contentHeight.current = h;
        checkMoreBelow();
    }, [checkMoreBelow]);

    const handleLayout = useCallback((e: any) => {
        scrollViewHeight.current = e.nativeEvent.layout.height;
        checkMoreBelow();
    }, [checkMoreBelow]);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* ── Fixed profile header ───────────────────── */}
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

            <View style={styles.divider} />

            {/* ── Scrollable drawer items ────────────────── */}
            <View style={styles.scrollWrapper}>
                <DrawerContentScrollView
                    {...props}
                    contentContainerStyle={styles.scrollContent}
                    style={styles.scrollView}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    onContentSizeChange={handleContentSizeChange}
                    onLayout={handleLayout}
                    contentInsetAdjustmentBehavior="never"
                    automaticallyAdjustContentInsets={false}>
                    <DrawerItemList {...props} />
                </DrawerContentScrollView>

                {/* Fade + bouncing chevron hint */}
                {hasMoreBelow && (
                    <View style={styles.fadeOverlay} pointerEvents="none">
                        <Animated.View style={{ transform: [{ translateY: bounceAnim }] }}>
                            <Ionicons
                                name="chevron-down"
                                size={18}
                                color={theme.colors.textSecondary}
                            />
                        </Animated.View>
                    </View>
                )}
            </View>

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
            marginTop: 0,
        },
        scrollWrapper: {
            flex: 1,
            position: 'relative',
        },
        scrollContent: {
            paddingTop: 0,
            paddingBottom: theme.spacing.sm,
        },
        fadeOverlay: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 48,
            backgroundColor: theme.colors.background + 'CC', // ~80% opaque
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingBottom: 6,
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
