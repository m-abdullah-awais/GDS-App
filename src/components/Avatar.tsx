/**
 * GDS Driving School — Shared Avatar Component
 * ===============================================
 * Shows a profile image if available, otherwise falls back to
 * initials-based avatar circle with themed styling.
 */

import React, { useState } from 'react';
import { Image, Text, View } from 'react-native';
import { useTheme } from '../theme';

interface AvatarProps {
  /** Initials string or a full name to derive initials from */
  initials: string;
  /** Optional full name (used to derive initials if `initials` isn't 1-2 chars) */
  name?: string;
  /** Profile image URL — shown instead of initials when available */
  imageUrl?: string;
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
  imageUrl,
  size = 44,
  backgroundColor,
}) => {
  const { theme } = useTheme();
  const [imgError, setImgError] = useState(false);

  // Check if we have a valid image URL to display
  const hasImage = imageUrl && imageUrl.length > 0 && !imgError;

  // Derive display initials
  const isValidInitials = /^[A-Za-z]{1,2}$/.test(initials);
  const displayText = isValidInitials
    ? initials.toUpperCase()
    : getInitials(name || initials);

  if (hasImage) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: backgroundColor ?? theme.colors.surface,
        }}
        onError={() => setImgError(true)}
      />
    );
  }

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
