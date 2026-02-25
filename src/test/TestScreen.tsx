import { StyleSheet, Text } from 'react-native'
import React from 'react'
import ScreenContainer from '../components/ScreenContainer'
import { useTheme } from '../theme'

const TestScreen = () => {
    const { theme } = useTheme()

    return (
        <ScreenContainer showHeader={true} title="Test Screen">
            <Text style={[styles.message, { color: theme.colors.textPrimary }]}>
                Theme is active here.
            </Text>
        </ScreenContainer>
    )
}

const styles = StyleSheet.create({
    message: {
        fontSize: 24,
        fontWeight: '700',
    },
})

export default TestScreen