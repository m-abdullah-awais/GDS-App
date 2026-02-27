/**
 * GDS Driving School — Avatar Component
 * ========================================
 * Initials-based avatar circle with themed styling.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { AppTheme } from '../../constants/theme';

interface AvatarProps {
  initials: string;
  size?: number;
  theme: AppTheme;
  backgroundColor?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  initials,
  size = 44,
  theme,
  backgroundColor,
}) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: backgroundColor ?? theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    }}>
    <Text
      style={{
        ...theme.typography.buttonSmall,
        color: theme.colors.textInverse,
        fontSize: size * 0.36,
      }}>
      {initials}
    </Text>
  </View>
);

export default Avatar;
