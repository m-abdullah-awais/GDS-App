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
  name?: string;
  size?: number;
  backgroundColor?: string;
}

const getInitials = (value: string): string =>
  value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word[0]?.toUpperCase())
    .join('') || '';

const Avatar: React.FC<AvatarProps> = ({
  initials,
  name,
  size = 44,
  backgroundColor,
}) => {
  const { theme } = useTheme();

  // Use initials if they look like actual initials (1-2 uppercase letters),
  // otherwise derive from name, or from initials as a name fallback
  const isValidInitials = /^[A-Za-z]{1,2}$/.test(initials);
  const displayText = isValidInitials
    ? initials.toUpperCase()
    : getInitials(name || initials);

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
        {displayText}
      </Text>
    </View>
  );
};

export default Avatar;
