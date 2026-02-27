import React, { ReactNode } from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme';
import AppTopHeader from './AppTopHeader';

type ScreenContainerProps = {
    children: ReactNode;
    style?: StyleProp<ViewStyle>;
    edges?: Edge[];
    backgroundColor?: string;
    showHeader?: boolean;
    title?: string;
    onBackPress?: () => void;
};

const ScreenContainer = ({
    children,
    style,
    edges = ['bottom'],
    backgroundColor,
    showHeader = false,
    title,
    onBackPress,
}: ScreenContainerProps) => {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const resolvedBackgroundColor = backgroundColor ?? theme.colors.background;

    const handleBack = () => {
        if (onBackPress) {
            onBackPress();
            return;
        }

        if (navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    const canShowBack = navigation.canGoBack() || !!onBackPress;
    const parentNav = navigation.getParent();
    const canOpenDrawer = typeof (parentNav as any)?.openDrawer === 'function';

    const handleMenu = () => {
        (parentNav as any)?.openDrawer?.();
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: resolvedBackgroundColor }, style]} edges={edges}>
            {showHeader && (
                <AppTopHeader
                    title={title ?? ''}
                    leftAction={canShowBack ? 'back' : canOpenDrawer ? 'menu' : 'none'}
                    onLeftPress={canShowBack ? handleBack : canOpenDrawer ? handleMenu : undefined}
                    avatarText={title ?? 'GDS'}
                />
            )}
            {children}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default ScreenContainer;
