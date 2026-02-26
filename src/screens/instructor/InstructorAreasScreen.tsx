/**
 * InstructorAreasScreen
 * ======================
 * Configure service areas and postcode selections.
 */

import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import { useTheme } from '../../theme';
import Button from '../../components/Button';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { AppTheme } from '../../constants/theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { InstructorStackParamList } from '../../navigation/instructor/InstructorStack';
import { areas as initialAreas, type Area, type Postcode } from '../../modules/instructor/mockData';

type Props = NativeStackScreenProps<InstructorStackParamList, 'Areas'>;

const InstructorAreasScreen = ({ navigation }: Props) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [areasData, setAreasData] = useState<Area[]>(
    initialAreas.map((a) => ({
      ...a,
      postcodes: a.postcodes.map((p) => ({ ...p })),
    })),
  );
  const [expandedAreaId, setExpandedAreaId] = useState<string | null>(
    initialAreas[0]?.id ?? null,
  );

  const togglePostcode = (areaId: string, postcodeId: string) => {
    setAreasData((prev) =>
      prev.map((area) =>
        area.id === areaId
          ? {
              ...area,
              postcodes: area.postcodes.map((pc) =>
                pc.id === postcodeId ? { ...pc, selected: !pc.selected } : pc,
              ),
            }
          : area,
      ),
    );
  };

  const handleSave = () => {
    Alert.alert('Success', 'Areas and postcodes saved successfully!', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  const renderPostcode = (postcode: Postcode, areaId: string) => (
    <Pressable
      key={postcode.id}
      style={[
        styles.postcodeChip,
        {
          borderColor: postcode.selected
            ? theme.colors.primary
            : theme.colors.border,
          backgroundColor: postcode.selected
            ? theme.colors.primaryLight
            : theme.colors.surface,
        },
      ]}
      onPress={() => togglePostcode(areaId, postcode.id)}
    >
      <View
        style={[
          styles.checkbox,
          {
            borderColor: postcode.selected
              ? theme.colors.primary
              : theme.colors.neutral400,
            backgroundColor: postcode.selected
              ? theme.colors.primary
              : 'transparent',
          },
        ]}
      >
        {postcode.selected && (
          <Ionicons name="checkmark" size={14} color={theme.colors.textInverse} />
        )}
      </View>
      <Text
        style={[
          styles.postcodeText,
          {
            color: postcode.selected
              ? theme.colors.primary
              : theme.colors.textPrimary,
          },
        ]}
      >
        {postcode.code}
      </Text>
    </Pressable>
  );

  const renderArea = ({ item }: { item: Area }) => {
    const isExpanded = expandedAreaId === item.id;
    const selectedCount = item.postcodes.filter((p) => p.selected).length;

    return (
      <View style={styles.areaCard}>
        <Pressable
          style={styles.areaHeader}
          onPress={() => setExpandedAreaId(isExpanded ? null : item.id)}
        >
          <View style={styles.areaHeaderLeft}>
            <Text style={styles.areaName}>{item.name}</Text>
            {selectedCount > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>
                  {selectedCount} selected
                </Text>
              </View>
            )}
          </View>
          <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={theme.colors.textTertiary} />
        </Pressable>

        {isExpanded && (
          <View style={styles.postcodesContainer}>
            <View style={styles.postcodesGrid}>
              {item.postcodes.map((pc) => renderPostcode(pc, item.id))}
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScreenContainer showHeader title="Configure Areas" onBackPress={() => navigation.goBack()}>
      <View style={styles.container}>
        <FlatList
          data={areasData}
          renderItem={renderArea}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.headerDescription}>
              Select the areas and postcodes where you offer driving lessons.
            </Text>
          }
          ListFooterComponent={<View style={{ height: 100 }} />}
        />

        <View style={styles.footer}>
          <Button
            title="Save Areas"
            onPress={handleSave}
            variant="primary"
            size="lg"
            fullWidth
          />
        </View>
      </View>
    </ScreenContainer>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    listContent: {
      padding: theme.spacing.md,
    },
    headerDescription: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.lg,
    },
    areaCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing.sm,
      overflow: 'hidden',
      ...theme.shadows.sm,
    },
    areaHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing.md,
    },
    areaHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: theme.spacing.xs,
    },
    areaName: {
      ...theme.typography.h4,
      color: theme.colors.textPrimary,
    },
    countBadge: {
      backgroundColor: theme.colors.primaryLight,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.full,
    },
    countBadgeText: {
      ...theme.typography.caption,
      color: theme.colors.primary,
    },
    expandIcon: {
      ...theme.typography.bodySmall,
      color: theme.colors.textTertiary,
    },
    postcodesContainer: {
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.divider,
      paddingTop: theme.spacing.sm,
    },
    postcodesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
    },
    postcodeChip: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      gap: theme.spacing.xs,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderWidth: 2,
      borderRadius: theme.borderRadius.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkmark: {
      color: theme.colors.textInverse,
      fontSize: 12,
      fontWeight: '700',
    },
    postcodeText: {
      ...theme.typography.buttonMedium,
    },
    footer: {
      padding: theme.spacing.md,
      paddingBottom: theme.spacing.xl,
      backgroundColor: theme.colors.background,
      borderTopWidth: 1,
      borderTopColor: theme.colors.divider,
    },
  });

export default InstructorAreasScreen;
