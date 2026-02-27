/**
 * GDS Driving School — Toast System
 * ====================================
 * Custom toast notification context with animated slide-in from top.
 */

import React, { createContext, useContext, useState, useCallback, useRef, useMemo } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export const useToast = () => useContext(ToastContext);

const TOAST_DURATION = 3000;

const getToastIcon = (type: ToastType): string => {
  switch (type) {
    case 'success': return 'checkmark-circle';
    case 'error': return 'close-circle';
    case 'warning': return 'warning';
    case 'info': return 'information-circle';
  }
};

const getToastColor = (type: ToastType, theme: AppTheme): string => {
  switch (type) {
    case 'success': return theme.colors.success;
    case 'error': return theme.colors.error;
    case 'warning': return theme.colors.warning;
    case 'info': return theme.colors.info;
  }
};

const getToastBg = (type: ToastType, theme: AppTheme): string => {
  switch (type) {
    case 'success': return theme.colors.successLight;
    case 'error': return theme.colors.errorLight;
    case 'warning': return theme.colors.warningLight;
    case 'info': return theme.colors.infoLight;
  }
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const animatedValues = useRef<Map<string, Animated.Value>>(new Map());

  const dynamicStyles = useMemo(() => ({
    container: {
      position: 'absolute' as const,
      top: insets.top + 8,
      left: 16,
      right: 16,
      zIndex: 9999,
      elevation: 9999,
    },
  }), [insets.top]);

  const removeToast = useCallback((id: string) => {
    const anim = animatedValues.current.get(id);
    if (anim) {
      Animated.timing(anim, {
        toValue: -120,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
        animatedValues.current.delete(id);
      });
    }
  }, []);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const animValue = new Animated.Value(-120);
    animatedValues.current.set(id, animValue);

    setToasts(prev => [...prev, { id, type, message }]);

    Animated.spring(animValue, {
      toValue: 0,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();

    setTimeout(() => removeToast(id), TOAST_DURATION);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <View style={dynamicStyles.container} pointerEvents="box-none">
        {toasts.map(toast => {
          const anim = animatedValues.current.get(toast.id);
          const accentColor = getToastColor(toast.type, theme);
          const bgColor = getToastBg(toast.type, theme);

          return (
            <Animated.View
              key={toast.id}
              style={[
                styles.toast,
                {
                  backgroundColor: bgColor,
                  borderLeftColor: accentColor,
                  transform: [{ translateY: anim ?? new Animated.Value(-120) }],
                  ...theme.shadows.lg,
                },
              ]}>
              <Ionicons name={getToastIcon(toast.type)} size={22} color={accentColor} />
              <Text
                style={[
                  styles.toastText,
                  { color: theme.colors.textPrimary, ...theme.typography.bodyMedium },
                ]}
                numberOfLines={2}>
                {toast.message}
              </Text>
              <Pressable onPress={() => removeToast(toast.id)} hitSlop={8}>
                <Ionicons name="close" size={18} color={theme.colors.textTertiary} />
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderLeftWidth: 4,
    marginBottom: 8,
    gap: 12,
  },
  toastText: {
    flex: 1,
  },
});
