/**
 * GDS Driving School — Shared Avatar Component
 * ===============================================
 * Initials-based avatar circle with themed styling.
 * Uses useTheme() internally for consistency with all other components.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme';

interface AvatarProps {
  initials: string;
  size?: number;
  backgroundColor?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  initials,
  size = 44,
  backgroundColor,
}) => {
  const { theme } = useTheme();

  return (
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
};

export default Avatar;
