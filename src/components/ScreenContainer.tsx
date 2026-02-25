import React, { ReactNode } from 'react';
import { StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Header, HeaderBackButton } from '@react-navigation/elements';

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
    backgroundColor = '#FFFFFF',
    showHeader = false,
    title,
    onBackPress,
}: ScreenContainerProps) => {
    const navigation = useNavigation();

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
        <SafeAreaView style={[styles.container, { backgroundColor }, style]} edges={edges}>
            {showHeader && (
                <Header
                    title={title ?? ''}
                    headerTintColor="#111827"
                    headerStyle={{ backgroundColor }}
                    headerTitleStyle={styles.headerTitle}
                    headerLeft={
                        canShowBack
                            ? props => (
                                <HeaderBackButton
                                    {...props}
                                    tintColor="#111827"
                                    backImage={({ tintColor }) => (
                                        <Text style={[styles.customBackIcon, { color: tintColor ?? '#111827' }]}>‹</Text>
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
        color: '#111827',
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
