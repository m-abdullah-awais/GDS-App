/**
 * FeedbackModal — Instructor Lesson Feedback (Redesigned)
 * =========================================================
 *
 * Full‑screen modal for instructors to give detailed lesson feedback.
 *   - 54 driving skills as compact toggleable pills (3‑column grid)
 *   - Per‑skill 5‑level assessment in dedicated card section
 *   - Search + selected counter
 *   - Notes textarea
 *   - Feedback summary
 *   - Lesson cancellation with confirmation
 */

import React, { useMemo, useState, useCallback } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme';
import type { AppTheme } from '../../constants/theme';
import {
  DRIVING_SKILLS,
  SKILL_LEVELS,
  type SkillFeedback,
  type FeedbackAction,
} from '../../constants/drivingSkills';
import type { InstructorLesson } from '../../modules/instructor/mockData';

// ─── Props ──────────────────────────────────────────────────────────────────

export interface FeedbackModalProps {
  lesson: InstructorLesson | null;
  onClose: () => void;
  onSubmit: (data: {
    action: FeedbackAction;
    skills: SkillFeedback[];
    notes: string;
  }) => void;
}

// ─── Layout Constants ───────────────────────────────────────────────────────

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BODY_PAD = 16;
const CHIP_COLUMNS = 3;
const CHIP_GAP = 8;
const CHIP_WIDTH =
  (SCREEN_WIDTH - BODY_PAD * 2 - CHIP_GAP * (CHIP_COLUMNS - 1)) / CHIP_COLUMNS;

// ─── Component ──────────────────────────────────────────────────────────────

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  lesson,
  onClose,
  onSubmit,
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // ── State ──────────────────────────────────────────
  const [selectedSkills, setSelectedSkills] = useState<SkillFeedback[]>([]);
  const [notes, setNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCancelWarning, setShowCancelWarning] = useState(false);

  // ── Derived ────────────────────────────────────────
  const filteredSkills = useMemo(() => {
    if (!searchQuery.trim()) return [...DRIVING_SKILLS];
    const q = searchQuery.toLowerCase();
    return DRIVING_SKILLS.filter((s) => s.toLowerCase().includes(q));
  }, [searchQuery]);

  const canSubmit = selectedSkills.length > 0 && notes.trim().length > 0;

  // ── Handlers ───────────────────────────────────────

  const resetState = useCallback(() => {
    setSelectedSkills([]);
    setNotes('');
    setSearchQuery('');
    setIsSubmitting(false);
    setShowCancelWarning(false);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  const handleSkillToggle = useCallback((skill: string) => {
    setSelectedSkills((prev) => {
      const exists = prev.find((s) => s.skill === skill);
      if (exists) return prev.filter((s) => s.skill !== skill);
      return [...prev, { skill, rating: 3 }];
    });
  }, []);

  const handleRatingChange = useCallback((skill: string, rating: number) => {
    setSelectedSkills((prev) =>
      prev.map((s) => (s.skill === skill ? { ...s, rating } : s)),
    );
  }, []);

  const handleSubmit = useCallback(() => {
    if (!canSubmit) {
      Alert.alert(
        'Incomplete Feedback',
        'Please select at least one skill and add notes before submitting.',
      );
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSubmit({ action: 'submit', skills: selectedSkills, notes: notes.trim() });
      resetState();
    }, 600);
  }, [canSubmit, selectedSkills, notes, onSubmit, resetState]);

  const handleLessonCancelled = useCallback(() => {
    setShowCancelWarning(true);
  }, []);

  const handleConfirmCancellation = useCallback(() => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowCancelWarning(false);
      onSubmit({ action: 'lesson_cancelled', skills: [], notes: '' });
      resetState();
    }, 600);
  }, [onSubmit, resetState]);

  // ── Bail if no lesson ──────────────────────────────
  if (!lesson) return null;
  const duration = lesson.duration || '1 hour';

  // ─────────────────────────────────────────────────────
  //  R E N D E R
  // ─────────────────────────────────────────────────────

  return (
    <>
      {/* ═══════════════ Main Modal ═══════════════ */}
      <Modal
        visible={!!lesson}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={handleClose}
      >
        <SafeAreaView style={styles.safe}>
          {/* ─── Header ─────────────────────────── */}
          <View style={styles.header}>
            <Pressable onPress={handleClose} style={styles.closeBtn} hitSlop={8}>
              <Ionicons name="close" size={20} color={theme.colors.textPrimary} />
            </Pressable>
            <Text style={styles.headerTitle}>Lesson Feedback</Text>
            <View style={{ width: 36 }} />
          </View>

          {/* ─── Body ───────────────────────────── */}
          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* ── Student Card ──────────────────── */}
            <View style={styles.studentCard}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{lesson.studentAvatar}</Text>
              </View>
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{lesson.studentName}</Text>
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={12} color={theme.colors.textTertiary} />
                    <Text style={styles.metaText}>{lesson.date}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={12} color={theme.colors.textTertiary} />
                    <Text style={styles.metaText}>{lesson.time}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="hourglass-outline" size={12} color={theme.colors.textTertiary} />
                    <Text style={styles.metaText}>{duration}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* ── Skills Section ────────────────── */}
            <Text style={styles.sectionTitle}>
              Skills Covered <Text style={styles.required}>*</Text>
            </Text>
            <Text style={styles.sectionHint}>
              Tap to select all skills covered in this lesson
            </Text>

            {/* Search bar */}
            <View style={styles.searchBar}>
              <Ionicons name="search" size={15} color={theme.colors.textTertiary} />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search skills..."
                placeholderTextColor={theme.colors.placeholder}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')} hitSlop={6}>
                  <Ionicons name="close-circle" size={15} color={theme.colors.textTertiary} />
                </Pressable>
              )}
            </View>

            {/* Selected counter badge */}
            {selectedSkills.length > 0 && (
              <View style={styles.counterRow}>
                <View style={styles.counterBadge}>
                  <Text style={styles.counterBadgeNum}>{selectedSkills.length}</Text>
                </View>
                <Text style={styles.counterLabel}>
                  skill{selectedSkills.length !== 1 ? 's' : ''} selected
                </Text>
              </View>
            )}

            {/* Skill pills — 3 column grid */}
            <View style={styles.pillGrid}>
              {filteredSkills.map((skill) => {
                const isSelected = !!selectedSkills.find((s) => s.skill === skill);
                return (
                  <Pressable
                    key={skill}
                    onPress={() => handleSkillToggle(skill)}
                    style={[styles.pill, isSelected && styles.pillOn]}
                  >
                    {isSelected && (
                      <Ionicons name="checkmark" size={13} color="#FFF" />
                    )}
                    <Text
                      style={[styles.pillText, isSelected && styles.pillTextOn]}
                      numberOfLines={2}
                    >
                      {skill}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {filteredSkills.length === 0 && (
              <View style={styles.emptyWrap}>
                <Ionicons name="search" size={18} color={theme.colors.textTertiary} />
                <Text style={styles.emptyMsg}>No skills matching "{searchQuery}"</Text>
              </View>
            )}

            {/* ── Level Assessment ──────────────── */}
            {selectedSkills.length > 0 && (
              <View style={styles.assessSection}>
                <Text style={styles.sectionTitle}>Skill Levels</Text>
                <Text style={styles.sectionHint}>
                  Rate each skill from 1 (Introduced) to 5 (Independent)
                </Text>

                {selectedSkills.map((sf) => {
                  const activeLvl = SKILL_LEVELS.find((l) => l.value === sf.rating);
                  return (
                    <View key={sf.skill} style={styles.assessCard}>
                      {/* Skill name + remove btn */}
                      <View style={styles.assessTop}>
                        <Text style={styles.assessName} numberOfLines={1}>
                          {sf.skill}
                        </Text>
                        <Pressable onPress={() => handleSkillToggle(sf.skill)} hitSlop={8}>
                          <Ionicons name="close" size={15} color={theme.colors.textTertiary} />
                        </Pressable>
                      </View>

                      {/* 5 level buttons in a row */}
                      <View style={styles.lvlRow}>
                        {SKILL_LEVELS.map((lvl) => {
                          const on = sf.rating === lvl.value;
                          return (
                            <Pressable
                              key={lvl.value}
                              onPress={() => handleRatingChange(sf.skill, lvl.value)}
                              style={[
                                styles.lvlBtn,
                                on && {
                                  backgroundColor: lvl.color + '22',
                                  borderColor: lvl.color,
                                },
                              ]}
                            >
                              <View
                                style={[
                                  styles.lvlDot,
                                  { backgroundColor: lvl.color },
                                  on && styles.lvlDotOn,
                                ]}
                              />
                              <Text style={[styles.lvlNum, on && { color: lvl.color, fontWeight: '800' }]}>
                                {lvl.value}
                              </Text>
                              <Text
                                style={[styles.lvlLabel, on && { color: theme.colors.textPrimary, fontWeight: '600' }]}
                                numberOfLines={1}
                              >
                                {lvl.label}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>

                      {/* Description of active level */}
                      {activeLvl && (
                        <Text style={styles.assessDesc}>
                          <Text style={{ color: activeLvl.color, fontWeight: '700' }}>
                            {activeLvl.label}
                          </Text>
                          {' — '}
                          {activeLvl.description}
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>
            )}

            {/* ── Level Legend ───────────────────── */}
            <View style={styles.legend}>
              <Text style={styles.legendHeading}>
                <Ionicons name="information-circle-outline" size={13} color={theme.colors.textSecondary} />
                {'  '}Skill Level Guide
              </Text>
              <View style={styles.legendRow}>
                {SKILL_LEVELS.map((lv) => (
                  <View key={lv.value} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: lv.color }]} />
                    <Text style={styles.legendNum}>{lv.value}</Text>
                    <Text style={styles.legendName}>{lv.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* ── Notes ─────────────────────────── */}
            <Text style={styles.sectionTitle}>
              Notes & Comments <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Detailed feedback about performance, areas for improvement, and next lesson focus..."
              placeholderTextColor={theme.colors.placeholder}
              style={styles.notesInput}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <Text style={styles.notesCaption}>
              This feedback will be visible to the student.
            </Text>

            {/* ── Summary ───────────────────────── */}
            {selectedSkills.length > 0 && (
              <View style={styles.summary}>
                <View style={styles.summaryHead}>
                  <Ionicons name="clipboard-outline" size={15} color={theme.colors.primary} />
                  <Text style={styles.summaryHeadText}>Feedback Summary</Text>
                </View>
                <View style={styles.summaryLine} />
                {selectedSkills.map((sf) => {
                  const ld = SKILL_LEVELS.find((l) => l.value === sf.rating);
                  return (
                    <View key={sf.skill} style={styles.summaryItem}>
                      <Text style={styles.summarySkill} numberOfLines={1}>
                        {sf.skill}
                      </Text>
                      <View style={styles.summaryTag}>
                        <View style={[styles.summaryTagDot, { backgroundColor: ld?.color ?? theme.colors.primary }]} />
                        <Text style={[styles.summaryTagText, { color: ld?.color ?? theme.colors.textPrimary }]}>
                          {ld?.label}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Bottom spacer */}
            <View style={{ height: 110 }} />
          </ScrollView>

          {/* ─── Footer ─────────────────────────── */}
          <View style={styles.footer}>
            <View style={styles.footerTopRow}>
              <Pressable onPress={handleClose} style={styles.fBtnOutline}>
                <Text style={styles.fBtnOutlineText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleSubmit}
                disabled={isSubmitting || !canSubmit}
                style={[
                  styles.fBtnPrimary,
                  (!canSubmit || isSubmitting) && styles.fBtnDisabled,
                ]}
              >
                <Ionicons name="send" size={14} color="#FFF" />
                <Text style={styles.fBtnPrimaryText}>
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Text>
              </Pressable>
            </View>
            <Pressable
              onPress={handleLessonCancelled}
              disabled={isSubmitting}
              style={[styles.fBtnDanger, isSubmitting && styles.fBtnDisabled]}
            >
              <Ionicons name="close-circle-outline" size={15} color="#FFF" />
              <Text style={styles.fBtnDangerText}>Mark Lesson as Cancelled</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>

      {/* ═══════════════ Cancellation Warning ═══════════════ */}
      <Modal
        visible={showCancelWarning}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCancelWarning(false)}
      >
        <View style={styles.wOverlay}>
          <View style={styles.wCard}>
            <View style={styles.wHeader}>
              <View style={styles.wIcon}>
                <Ionicons name="warning" size={20} color="#FFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.wTitle}>Cancel Lesson?</Text>
                <Text style={styles.wSub}>This action cannot be undone.</Text>
              </View>
            </View>

            <View style={styles.wBody}>
              <Text style={styles.wBodyText}>
                By cancelling this lesson you acknowledge:
              </Text>
              {[
                `The student will be refunded ${duration}`,
                'The student receives 2 additional hours as compensation',
                'The student will be notified of the cancellation',
                'You are responsible for organising compensation hours',
              ].map((txt, i) => (
                <View key={i} style={styles.wBullet}>
                  <View style={styles.wDot} />
                  <Text style={styles.wBulletText}>{txt}</Text>
                </View>
              ))}
            </View>

            <View style={styles.wActions}>
              <Pressable
                onPress={() => setShowCancelWarning(false)}
                style={styles.wBack}
              >
                <Text style={styles.wBackText}>Go Back</Text>
              </Pressable>
              <Pressable
                onPress={handleConfirmCancellation}
                disabled={isSubmitting}
                style={[styles.wConfirm, isSubmitting && styles.fBtnDisabled]}
              >
                <Text style={styles.wConfirmText}>
                  {isSubmitting ? 'Processing...' : 'Confirm'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

// ═══════════════════════════════════════════════════════
//  S T Y L E S
// ═══════════════════════════════════════════════════════

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    /* ── Layout ─────────────────────── */
    safe: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },

    /* ── Header ─────────────────────── */
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 52,
      paddingHorizontal: BODY_PAD,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
      backgroundColor: theme.colors.surface,
    },
    closeBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceSecondary,
    },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
    },

    /* ── Body ───────────────────────── */
    body: { flex: 1 },
    bodyContent: { padding: BODY_PAD },

    /* ── Student Card ───────────────── */
    studentCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: 14,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.colors.divider,
    },
    avatarCircle: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontSize: 13,
      fontWeight: '700',
      color: '#FFF',
    },
    studentInfo: { flex: 1, marginLeft: 12 },
    studentName: {
      ...theme.typography.h4,
      color: theme.colors.textPrimary,
      fontWeight: '700',
    },
    metaRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 4,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    metaText: {
      fontSize: 10,
      color: theme.colors.textTertiary,
      fontWeight: '500',
    },

    /* ── Section ────────────────────── */
    sectionTitle: {
      ...theme.typography.h4,
      color: theme.colors.textPrimary,
      fontWeight: '700',
      marginBottom: 2,
    },
    sectionHint: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginBottom: 12,
    },
    required: {
      color: theme.colors.error,
      fontWeight: '700',
    },

    /* ── Search Bar ─────────────────── */
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: 10,
      height: 38,
      marginBottom: 10,
      gap: 6,
    },
    searchInput: {
      flex: 1,
      fontSize: 12,
      color: theme.colors.textPrimary,
      paddingVertical: 0,
    },

    /* ── Counter ────────────────────── */
    counterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      marginBottom: 10,
    },
    counterBadge: {
      backgroundColor: theme.colors.primary,
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 5,
    },
    counterBadgeNum: {
      fontSize: 10,
      fontWeight: '800',
      color: '#FFF',
    },
    counterLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.primary,
    },

    /* ── Pills (3‑col grid) ─────────── */
    pillGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: CHIP_GAP,
      marginBottom: 16,
    },
    pill: {
      width: CHIP_WIDTH,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 9,
      paddingHorizontal: 8,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      gap: 4,
    },
    pillOn: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    pillText: {
      flex: 1,
      fontSize: 10,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      lineHeight: 14,
    },
    pillTextOn: {
      color: '#FFF',
    },

    /* ── Empty ──────────────────────── */
    emptyWrap: {
      alignItems: 'center',
      paddingVertical: 20,
      gap: 6,
    },
    emptyMsg: {
      fontSize: 12,
      color: theme.colors.textTertiary,
    },

    /* ── Assessment Section ─────────── */
    assessSection: { marginBottom: 16 },
    assessCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.divider,
      padding: 12,
      marginBottom: 8,
    },
    assessTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    assessName: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
      fontWeight: '700',
      flex: 1,
      marginRight: 8,
    },
    assessDesc: {
      fontSize: 10,
      color: theme.colors.textTertiary,
      marginTop: 8,
      lineHeight: 15,
    },

    /* ── Level Buttons ──────────────── */
    lvlRow: { flexDirection: 'row', gap: 5 },
    lvlBtn: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 7,
      paddingHorizontal: 2,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceSecondary,
      gap: 2,
    },
    lvlDot: { width: 8, height: 8, borderRadius: 4 },
    lvlDotOn: { width: 10, height: 10, borderRadius: 5 },
    lvlNum: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.textSecondary,
    },
    lvlLabel: {
      fontSize: 7,
      fontWeight: '500',
      color: theme.colors.textTertiary,
      textAlign: 'center',
    },

    /* ── Legend ──────────────────────── */
    legend: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.divider,
      padding: 10,
      marginBottom: 20,
    },
    legendHeading: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginBottom: 8,
    },
    legendRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    legendItem: { alignItems: 'center', gap: 2 },
    legendDot: { width: 8, height: 8, borderRadius: 4 },
    legendNum: {
      fontSize: 11,
      fontWeight: '800',
      color: theme.colors.textPrimary,
    },
    legendName: {
      fontSize: 8,
      fontWeight: '600',
      color: theme.colors.textTertiary,
    },

    /* ── Notes ──────────────────────── */
    notesInput: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: 12,
      paddingTop: 10,
      paddingBottom: 10,
      minHeight: 90,
      fontSize: 13,
      color: theme.colors.textPrimary,
      backgroundColor: theme.colors.surface,
    },
    notesCaption: {
      fontSize: 10,
      color: theme.colors.textTertiary,
      marginTop: 4,
      marginBottom: 20,
    },

    /* ── Summary ────────────────────── */
    summary: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.divider,
      padding: 14,
    },
    summaryHead: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      marginBottom: 8,
    },
    summaryHeadText: {
      ...theme.typography.h4,
      color: theme.colors.textPrimary,
      fontWeight: '700',
    },
    summaryLine: {
      height: 1,
      backgroundColor: theme.colors.divider,
      marginBottom: 6,
    },
    summaryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 4,
    },
    summarySkill: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      flex: 1,
      marginRight: 8,
    },
    summaryTag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    summaryTagDot: { width: 7, height: 7, borderRadius: 4 },
    summaryTagText: { fontSize: 10, fontWeight: '700' },

    /* ── Footer ─────────────────────── */
    footer: {
      paddingHorizontal: BODY_PAD,
      paddingTop: 10,
      paddingBottom: 14,
      gap: 8,
      borderTopWidth: 1,
      borderTopColor: theme.colors.divider,
      backgroundColor: theme.colors.surface,
    },
    footerTopRow: {
      flexDirection: 'row',
      gap: 10,
    },
    fBtnOutline: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      height: 44,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    fBtnOutlineText: {
      ...theme.typography.buttonMedium,
      color: theme.colors.textPrimary,
    },
    fBtnPrimary: {
      flex: 2,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: 44,
      gap: 6,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.primary,
    },
    fBtnPrimaryText: {
      ...theme.typography.buttonMedium,
      color: '#FFF',
    },
    fBtnDanger: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: 36,
      gap: 6,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.error,
      opacity: 0.9,
    },
    fBtnDangerText: {
      fontSize: 11,
      fontWeight: '600',
      color: '#FFF',
    },
    fBtnDisabled: { opacity: 0.4 },

    /* ── Cancel Warning Modal ──────── */
    wOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    wCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      width: '100%',
      maxWidth: 380,
      overflow: 'hidden',
    },
    wHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      gap: 12,
    },
    wIcon: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: theme.colors.error,
      alignItems: 'center',
      justifyContent: 'center',
    },
    wTitle: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
    },
    wSub: {
      fontSize: 11,
      color: theme.colors.textTertiary,
      marginTop: 2,
    },
    wBody: { paddingHorizontal: 16, paddingBottom: 14 },
    wBodyText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginBottom: 8,
    },
    wBullet: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
      marginBottom: 5,
    },
    wDot: {
      width: 5,
      height: 5,
      borderRadius: 3,
      backgroundColor: theme.colors.error,
      marginTop: 5,
    },
    wBulletText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      flex: 1,
      lineHeight: 17,
    },
    wActions: {
      flexDirection: 'row',
      gap: 10,
      padding: 14,
      borderTopWidth: 1,
      borderTopColor: theme.colors.divider,
    },
    wBack: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      height: 40,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surfaceSecondary,
    },
    wBackText: {
      ...theme.typography.buttonMedium,
      color: theme.colors.textPrimary,
    },
    wConfirm: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      height: 40,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.error,
    },
    wConfirmText: {
      ...theme.typography.buttonMedium,
      color: '#FFF',
    },
  });

export default FeedbackModal;
