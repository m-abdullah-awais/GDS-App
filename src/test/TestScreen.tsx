import { View, Text } from 'react-native'
import React from 'react'
import ScreenContainer from '../components/ScreenContainer'

const TestScreen = () => {
    return (
        <ScreenContainer showHeader={true} title="Test Screen">
            <Text style={{ fontSize: 24, fontWeight: 'bold' }}></Text>
        </ScreenContainer>
    )
}

export default TestScreen