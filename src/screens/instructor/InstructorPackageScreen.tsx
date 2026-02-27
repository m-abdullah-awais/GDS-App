/**
 * InstructorPackageScreen
 * ==============================
 * Package management screen (CRUD) for instructor packages.
 */

import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme';
import Button from '../../components/Button';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { AppTheme } from '../../constants/theme';
import {
  instructorPackages,
  type InstructorPackage,
  type ApprovalStatus,
} from '../../modules/instructor/mockData';

const COMMISSION_PERCENTAGE = 15;

const InstructorPackageScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [packages, setPackages] = useState<InstructorPackage[]>(
    [...instructorPackages].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPackage, setEditingPackage] = useState<InstructorPackage | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [lessonCount, setLessonCount] = useState('');
  const [price, setPrice] = useState('');

  const stats = useMemo(() => {
    return {
      total: packages.length,
      approved: packages.filter(p => p.status === 'approved').length,
      pending: packages.filter(p => p.status === 'pending').length,
      rejected: packages.filter(p => p.status === 'rejected').length,
    };
  }, [packages]);

  const isFormValid = useMemo(() => {
    return (
      title.trim().length >= 2 &&
      description.trim().length >= 10 &&
      Number(lessonCount) > 0 &&
      Number(price) > 0
    );
  }, [title, description, lessonCount, price]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setLessonCount('');
    setPrice('');
    setEditingPackage(null);
  };

  const openCreateModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (pkg: InstructorPackage) => {
    setEditingPackage(pkg);
    setTitle(pkg.title);
    setDescription(pkg.description);
    setLessonCount(String(pkg.lessonCount));
    setPrice(String(pkg.price));
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!isFormValid) {
      Alert.alert('Incomplete', 'Please fill in all fields correctly.');
      return;
    }

    if (editingPackage) {
      setPackages(prev =>
        prev.map(pkg =>
          pkg.id === editingPackage.id
            ? {
                ...pkg,
                title: title.trim(),
                description: description.trim(),
                lessonCount: Number(lessonCount),
                price: Number(price),
                status: 'pending',
              }
            : pkg,
        ),
      );
      Alert.alert('Updated', 'Package updated and sent for re-approval.');
    } else {
      const newPackage: InstructorPackage = {
        id: `PKG-${String(Date.now()).slice(-6)}`,
        title: title.trim(),
        description: description.trim(),
        lessonCount: Number(lessonCount),
        price: Number(price),
        commissionPercentage: COMMISSION_PERCENTAGE,
        status: 'pending',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setPackages(prev => [newPackage, ...prev]);
      Alert.alert('Created', 'Package created and sent for approval.');
    }

    setModalVisible(false);
    resetForm();
  };

  const handleDelete = (pkg: InstructorPackage) => {
    Alert.alert(
      'Delete Package',
      `Are you sure you want to delete "${pkg.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setPackages(prev => prev.filter(item => item.id !== pkg.id)),
        },
      ],
    );
  };

  const getStatusStyle = (status: ApprovalStatus) => {
    if (status === 'approved') {
      return { bg: theme.colors.successLight, text: theme.colors.success, label: 'Approved' };
    }
    if (status === 'rejected') {
      return { bg: theme.colors.errorLight, text: theme.colors.error, label: 'Rejected' };
    }
    return { bg: theme.colors.warningLight, text: theme.colors.warning, label: 'Pending' };
  };

  return (
    <ScreenContainer showHeader title="Manage Packages">
      <View style={styles.flex}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.statsRow}>
            <View style={[styles.statsCard, { backgroundColor: '#2F6BFF' }]}>
              <Text style={styles.statsValue}>{stats.total}</Text>
              <Text style={styles.statsLabel}>Total</Text>
            </View>
            <View style={[styles.statsCard, { backgroundColor: '#1FBF5B' }]}>
              <Text style={styles.statsValue}>{stats.approved}</Text>
              <Text style={styles.statsLabel}>Approved</Text>
            </View>
            <View style={[styles.statsCard, { backgroundColor: '#F97316' }]}>
              <Text style={styles.statsValue}>{stats.pending}</Text>
              <Text style={styles.statsLabel}>Pending</Text>
            </View>
            <View style={[styles.statsCard, { backgroundColor: '#EF4444' }]}>
              <Text style={styles.statsValue}>{stats.rejected}</Text>
              <Text style={styles.statsLabel}>Rejected</Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <Text style={styles.sectionTitle}>Your Packages</Text>
            <Button
              title="New Package"
              size="sm"
              onPress={openCreateModal}
              leftIcon={<Ionicons name="add" size={16} color={theme.colors.textInverse} />}
            />
          </View>

          <View style={styles.listContainer}>
            {packages.map(pkg => {
              const status = getStatusStyle(pkg.status);
              return (
                <View key={pkg.id} style={styles.packageCard}>
                  <View style={styles.packageTopRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.packageTitle}>{pkg.title}</Text>
                      <Text style={styles.packageDate}>Created {pkg.createdAt}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                      <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
                    </View>
                  </View>

                  <Text style={styles.packageDescription}>{pkg.description}</Text>

                  <View style={styles.packageMetaRow}>
                    <Text style={styles.metaText}>{pkg.lessonCount} lessons</Text>
                    <Text style={styles.metaText}>£{pkg.price}</Text>
                    <Text style={styles.metaText}>{pkg.commissionPercentage}% commission</Text>
                  </View>

                  <View style={styles.actionsRow}>
                    <Button
                      title="Edit"
                      variant="outline"
                      size="sm"
                      onPress={() => openEditModal(pkg)}
                      style={styles.actionBtn}
                    />
                    <Button
                      title="Delete"
                      variant="destructive"
                      size="sm"
                      onPress={() => handleDelete(pkg)}
                      style={styles.actionBtn}
                    />
                  </View>
                </View>
              );
            })}

            {packages.length === 0 && (
              <View style={styles.emptyCard}>
                <Ionicons name="cube-outline" size={40} color={theme.colors.textTertiary} />
                <Text style={styles.emptyTitle}>No packages yet</Text>
                <Text style={styles.emptySub}>Create your first package to get started.</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{editingPackage ? 'Edit Package' : 'Create Package'}</Text>

            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Package Title</Text>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="e.g. Starter Pack"
                  placeholderTextColor={theme.colors.placeholder}
                  style={styles.input}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Describe what this package includes..."
                  placeholderTextColor={theme.colors.placeholder}
                  style={[styles.input, styles.textArea]}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Number of Lessons</Text>
                <TextInput
                  value={lessonCount}
                  onChangeText={setLessonCount}
                  placeholder="e.g. 10"
                  placeholderTextColor={theme.colors.placeholder}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Price (£)</Text>
                <TextInput
                  value={price}
                  onChangeText={setPrice}
                  placeholder="e.g. 290"
                  placeholderTextColor={theme.colors.placeholder}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>

              <View style={styles.commissionCard}>
                <Text style={styles.commissionLabel}>Platform Commission</Text>
                <Text style={styles.commissionValue}>{COMMISSION_PERCENTAGE}%</Text>
              </View>
            </ScrollView>

            <View style={styles.modalActionsRow}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
                style={styles.actionBtn}
              />
              <Button
                title={editingPackage ? 'Update' : 'Create'}
                onPress={handleSave}
                disabled={!isFormValid}
                style={styles.actionBtn}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScreenContainer>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    contentContainer: {
      padding: theme.spacing.md,
      paddingBottom: theme.spacing['3xl'],
    },
    statsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
    statsCard: {
      flexBasis: '47%',
      flexGrow: 1,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.md,
      ...theme.shadows.md,
    },
    statsValue: {
      ...theme.typography.h2,
      color: theme.colors.textInverse,
    },
    statsLabel: {
      ...theme.typography.caption,
      color: 'rgba(255,255,255,0.9)',
      marginTop: 2,
    },
    actionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    sectionTitle: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
      flex: 1,
    },
    listContainer: {
      gap: theme.spacing.sm,
    },
    packageCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      ...theme.shadows.md,
    },
    packageTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
    packageTitle: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
    },
    packageDate: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginTop: 2,
    },
    statusBadge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.full,
    },
    statusText: {
      ...theme.typography.caption,
      fontWeight: '600',
    },
    packageDescription: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.sm,
    },
    packageMetaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.md,
      marginTop: theme.spacing.sm,
    },
    metaText: {
      ...theme.typography.caption,
      color: theme.colors.textPrimary,
      fontWeight: '600',
    },
    actionsRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.md,
    },
    actionBtn: {
      flex: 1,
    },
    emptyCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing['2xl'],
      alignItems: 'center',
      ...theme.shadows.md,
    },
    emptyTitle: {
      ...theme.typography.h4,
      color: theme.colors.textPrimary,
      marginTop: theme.spacing.sm,
    },
    emptySub: {
      ...theme.typography.bodySmall,
      color: theme.colors.textTertiary,
      marginTop: theme.spacing.xxs,
      textAlign: 'center',
    },
    formGroup: {
      marginBottom: theme.spacing.lg,
    },
    label: {
      ...theme.typography.label,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.sm + 2,
      paddingVertical: Platform.OS === 'ios' ? 13 : 11,
      ...theme.typography.input,
      color: theme.colors.textPrimary,
      backgroundColor: theme.colors.surface,
    },
    textArea: {
      minHeight: 100,
      paddingTop: theme.spacing.sm,
    },
    commissionCard: {
      backgroundColor: theme.colors.surfaceSecondary,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    commissionLabel: {
      ...theme.typography.label,
      color: theme.colors.textSecondary,
    },
    commissionValue: {
      ...theme.typography.h2,
      color: theme.colors.primary,
      marginTop: theme.spacing.xxs,
    },
    commissionNote: {
      ...theme.typography.bodySmall,
      color: theme.colors.textTertiary,
      marginTop: theme.spacing.xxs,
    },
    // Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.colors.overlay,
      justifyContent: 'flex-end',
    },
    modalSheet: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      width: '100%',
      ...theme.shadows.lg,
      maxHeight: '90%',
    },
    modalTitle: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.md,
    },
    modalActionsRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },
  });

export default InstructorPackageScreen;
