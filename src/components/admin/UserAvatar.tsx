/**
 * GDS Driving School — UserAvatar Component
 * ============================================
 * Avatar that lazily fetches the user's profile image by ID.
 * Shows initials while loading, then displays the image once fetched.
 * Results are cached in-memory so repeated renders don't re-fetch.
 */

import React, { useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';
import type { AppTheme } from '../../constants/theme';
import { getUserById } from '../../services/userService';

interface UserAvatarProps {
  userId: string;
  name: string;
  size?: number;
  theme: AppTheme;
  backgroundColor?: string;
}

const getInitials = (value: string): string =>
  value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word[0]?.toUpperCase())
    .join('') || '';

// In-memory cache to avoid re-fetching avatars for the same user
const avatarCache = new Map<string, string | null>();

const UserAvatar: React.FC<UserAvatarProps> = ({
  userId,
  name,
  size = 44,
  theme,
  backgroundColor,
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(
    avatarCache.get(userId) ?? null,
  );
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!userId || avatarCache.has(userId)) return;
    let cancelled = false;

    getUserById(userId)
      .then(user => {
        if (cancelled) return;
        const url = user?.profile_picture_url || user?.profileImage || null;
        avatarCache.set(userId, url);
        setImageUrl(url);
      })
      .catch(() => {
        if (!cancelled) avatarCache.set(userId, null);
      });

    return () => { cancelled = true; };
  }, [userId]);

  const hasImage = imageUrl && imageUrl.length > 0 && !imgError;
  const displayText = getInitials(name);

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

export default UserAvatar;
