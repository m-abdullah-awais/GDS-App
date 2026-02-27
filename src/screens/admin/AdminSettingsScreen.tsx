/**
 * GDS Driving School — AdminSettingsScreen
 * ==========================================
 * Platform settings: commission, pricing, notifications, theme toggle.
 */

import React, { useCallback, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme';
import type { ColorSchemePreference } from '../../theme';
import type { AppTheme } from '../../constants/theme';
import type { RootState } from '../../store';
import type { AdminSettings } from '../../store/admin/types';
import { updateSettings } from '../../store/admin/actions';
import { SectionHeader, useToast } from '../../components/admin';

const APPEARANCE_OPTIONS: { label: string; value: ColorSchemePreference }[] = [
  { label: 'Light', value: 'light' },
  { label: 'System', value: 'system' },
  { label: 'Dark', value: 'dark' },
];

const AdminSettingsScreen = () => {
  const { theme, colorScheme, setColorScheme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const settings = useSelector((state: RootState) => state.admin.settings);

  const [localSettings, setLocalSettings] = useState<AdminSettings>(settings);
  const [saving, setSaving] = useState(false);

  const hasChanges = useMemo(
    () => JSON.stringify(localSettings) !== JSON.stringify(settings),
    [localSettings, settings],
  );

  const updateField = useCallback(
    <K extends keyof AdminSettings>(key: K, value: AdminSettings[K]) => {
      setLocalSettings(prev => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleSave = useCallback(() => {
    setSaving(true);
    setTimeout(() => {
      dispatch(updateSettings(localSettings));
      showToast('success', 'Settings saved successfully');
      setSaving(false);
    }, 800);
  }, [localSettings, dispatch, showToast]);

  const handleReset = useCallback(() => {
    setLocalSettings(settings);
    showToast('info', 'Changes discarded');
  }, [settings, showToast]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      {/* Pricing */}
      <SectionHeader title="Pricing" />
      <View style={styles.card}>
        <SettingsNumberRow
          label="Default Lesson Price"
          value={localSettings.lessonPricingDefault}
            prefix={'£'}
          onChangeValue={v => updateField('lessonPricingDefault', v)}
          theme={theme}
          icon="pricetag-outline"
        />
        <SettingsNumberRow
          label="Platform Fees"
          value={localSettings.platformFees}
            prefix={'£'}
          onChangeValue={v => updateField('platformFees', v)}
          theme={theme}
          icon="card-outline"
          last
        />
      </View>

      {/* Notifications */}
      <SectionHeader title="Notifications" />
      <View style={styles.card}>
        <SettingsToggleRow
          label="Email Notifications"
          value={localSettings.emailNotifications}
          onToggle={v => updateField('emailNotifications', v)}
          theme={theme}
          icon="mail-outline"
        />
        <SettingsToggleRow
          label="Push Notifications"
          value={localSettings.pushNotifications}
          onToggle={v => updateField('pushNotifications', v)}
          theme={theme}
          icon="notifications-outline"
        />
        <SettingsToggleRow
          label="SMS Alerts"
          value={localSettings.smsAlerts}
          onToggle={v => updateField('smsAlerts', v)}
          theme={theme}
          icon="chatbox-outline"
          last
        />
      </View>

      {/* Appearance */}
      <SectionHeader title="Appearance" />
      <View style={styles.card}>
        <View style={styles.settingsRow}>
          <View style={styles.settingsRowLeft}>
            <Ionicons
              name="color-palette-outline"
              size={18}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.settingsLabel}>Theme</Text>
          </View>
        </View>
        <View style={styles.segmented}>
          {APPEARANCE_OPTIONS.map(opt => {
            const isActive = colorScheme === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.segmentBtn, isActive && styles.segmentBtnActive]}
                onPress={() => setColorScheme(opt.value)}>
                <Text
                  style={[styles.segmentText, isActive && styles.segmentTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Save / Discard */}
      {hasChanges && (
        <View style={styles.actionBar}>
          <TouchableOpacity style={styles.discardBtn} onPress={handleReset}>
            <Text style={styles.discardText}>Discard</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            disabled={saving}>
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="checkmark-outline" size={18} color="#fff" />
                <Text style={styles.saveText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* App Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>GDS Driving School Admin</Text>
        <Text style={styles.infoVersion}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
};

/* ── Sub-components ─────────────────────────────────────────────── */

const SettingsNumberRow = ({
  label,
  value,
  prefix,
  suffix,
  onChangeValue,
  theme,
  icon,
  last,
}: {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  onChangeValue: (v: number) => void;
  theme: AppTheme;
  icon: string;
  last?: boolean;
}) => {
  const handleChange = (text: string) => {
    const num = parseFloat(text.replace(/[^0-9.]/g, ''));
    if (!isNaN(num)) onChangeValue(num);
    if (text === '') onChangeValue(0);
  };

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: theme.spacing.md,
          borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth,
          borderBottomColor: theme.colors.divider,
        },
      ]}>
      <Ionicons name={icon} size={18} color={theme.colors.textSecondary} />
      <Text
        style={{
          ...theme.typography.bodyMedium,
          color: theme.colors.textPrimary,
          flex: 1,
          marginLeft: theme.spacing.sm,
        }}>
        {label}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.colors.surfaceSecondary,
          borderRadius: theme.borderRadius.md,
          borderWidth: 1,
          borderColor: theme.colors.border,
          paddingHorizontal: theme.spacing.sm,
        }}>
        {prefix && (
          <Text style={{ ...theme.typography.bodySmall, color: theme.colors.textTertiary }}>
            {prefix}
          </Text>
        )}
        <TextInput
          value={String(value)}
          onChangeText={handleChange}
          keyboardType="numeric"
          style={{
            ...theme.typography.bodyMedium,
            color: theme.colors.textPrimary,
            paddingVertical: 6,
            minWidth: 50,
            textAlign: 'right',
          }}
        />
        {suffix && (
          <Text style={{ ...theme.typography.bodySmall, color: theme.colors.textTertiary }}>
            {suffix}
          </Text>
        )}
      </View>
    </View>
  );
};

const SettingsToggleRow = ({
  label,
  value,
  onToggle,
  theme,
  icon,
  last,
}: {
  label: string;
  value: boolean;
  onToggle: (v: boolean) => void;
  theme: AppTheme;
  icon: string;
  last?: boolean;
}) => (
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
    }}>
    <Ionicons name={icon} size={18} color={theme.colors.textSecondary} />
    <Text
      style={{
        ...theme.typography.bodyMedium,
        color: theme.colors.textPrimary,
        flex: 1,
        marginLeft: theme.spacing.sm,
      }}>
      {label}
    </Text>
    <Switch
      value={value}
      onValueChange={onToggle}
      trackColor={{
        false: theme.colors.neutral300,
        true: theme.colors.primary + '60',
      }}
      thumbColor={value ? theme.colors.primary : theme.colors.neutral100}
    />
  </View>
);

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background },
    content: { padding: theme.spacing.md, paddingBottom: theme.spacing['4xl'] },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      ...theme.shadows.sm,
    },
    settingsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
    },
    settingsRowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: theme.spacing.sm,
    },
    settingsLabel: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
    },
    segmented: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surfaceSecondary,
      borderRadius: theme.borderRadius.md,
      padding: 3,
      marginBottom: theme.spacing.md,
    },
    segmentBtn: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      alignItems: 'center',
      borderRadius: theme.borderRadius.md - 2,
    },
    segmentBtnActive: {
      backgroundColor: theme.colors.surface,
      ...theme.shadows.sm,
    },
    segmentText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textTertiary,
      fontWeight: '500',
    },
    segmentTextActive: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    actionBar: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    discardBtn: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    discardText: {
      ...theme.typography.buttonMedium,
      color: theme.colors.textSecondary,
    },
    saveBtn: {
      flex: 2,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.primary,
    },
    saveText: {
      ...theme.typography.buttonMedium,
      color: '#fff',
      fontWeight: '600',
    },
    infoCard: {
      alignItems: 'center',
      paddingVertical: theme.spacing['2xl'],
    },
    infoTitle: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textTertiary,
    },
    infoVersion: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginTop: 4,
    },
  });

export default AdminSettingsScreen;
