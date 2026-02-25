import React, { ReactNode } from 'react';
import { StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Header, HeaderBackButton } from '@react-navigation/elements';
import { useTheme } from '../theme';

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

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: resolvedBackgroundColor }, style]} edges={edges}>
            {showHeader && (
                <Header
                    title={title ?? ''}
                    headerTintColor={theme.colors.textPrimary}
                    headerStyle={{ backgroundColor: resolvedBackgroundColor }}
                    headerTitleStyle={[styles.headerTitle, { color: theme.colors.textPrimary }]}
                    headerLeft={
                        canShowBack
                            ? props => (
                                <HeaderBackButton
                                    {...props}
                                    tintColor={theme.colors.textPrimary}
                                    backImage={({ tintColor }) => (
                                        <Text style={[styles.customBackIcon, { color: tintColor ?? theme.colors.textPrimary }]}>‹</Text>
                                    )}
                                    onPress={handleBack}
                                />
                            )
                            : undefined
                    }
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
    headerTitle: {
        fontSize: 17,
        fontWeight: '600',
    },
    customBackIcon: {
        fontSize: 28,
        lineHeight: 28,
        marginLeft: 2,
        marginRight: 8,
    },
});

export default ScreenContainer;
