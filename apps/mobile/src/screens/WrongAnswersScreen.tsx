import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../theme/designSystem';
import { api } from '../api/client';

export default function WrongAnswersScreen({ navigation }: any) {
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.wrongAnswers.getBank();
      setAnswers(res.data || []);
    } catch (e) {
      console.log('Error fetching wrong answers', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const markMastered = async (id: string) => {
    try {
      await api.wrongAnswers.markMastered(id);
      Alert.alert('Zabardast! 🎉', 'Sawal ko master mark kar diya gaya hai!');
      setAnswers((prev) => prev.filter((a) => a.id !== id));
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Update nahi ho saka.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Learn from Mistakes</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={colors.primary} />}
      >
        {answers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 48, marginBottom: spacing.sm }}>🧠</Text>
            <Text style={styles.emptyTitle}>Koi Ghalti Nahi Mili!</Text>
            <Text style={styles.emptySubtitle}>
              Aapke paas review karne ke liye koi ghalat sawal nahi hai. Quizzes khelein aur seekhte rahein!
            </Text>
          </View>
        ) : (
          answers.map((wa) => {
            const q = wa.question;
            const correctOpt = q.correctAnswer; // 'A' | 'B' | 'C' | 'D'
            return (
              <View key={wa.id} style={styles.card}>
                <Text style={styles.questionText}>{q.questionText}</Text>

                {/* Options List */}
                <View style={styles.optionsList}>
                  {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                    const optText = q[`option${optKey}`];
                    if (!optText) return null;
                    const isCorrectOpt = optKey === correctOpt;
                    return (
                      <View
                        key={optKey}
                        style={[
                          styles.optionItem,
                          isCorrectOpt && styles.optionItemCorrect,
                        ]}
                      >
                        <View style={[styles.optionKeyBadge, isCorrectOpt && styles.optionKeyBadgeCorrect]}>
                          <Text style={[styles.optionKeyText, isCorrectOpt && styles.optionKeyTextCorrect]}>
                            {optKey}
                          </Text>
                        </View>
                        <Text style={[styles.optionContentText, isCorrectOpt && styles.optionContentTextCorrect]}>
                          {optText}
                        </Text>
                        {isCorrectOpt && (
                          <Ionicons name="checkmark-circle" size={18} color={colors.secondary} style={{ marginLeft: 'auto' }} />
                        )}
                      </View>
                    );
                  })}
                </View>

                {/* Explanation */}
                {q.explanation ? (
                  <View style={styles.explanationBox}>
                    <Text style={styles.explanationText}>💡 {q.explanation}</Text>
                  </View>
                ) : null}

                {/* Master Button */}
                <TouchableOpacity style={styles.masterBtn} onPress={() => markMastered(wa.id)}>
                  <Ionicons name="checkmark-done" size={20} color={colors.onPrimary} />
                  <Text style={styles.masterBtnText}>Samajh Gaya (Mark as Mastered)</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 50, paddingHorizontal: spacing.md, paddingBottom: spacing.md,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.glassBorder,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 20, backgroundColor: colors.surfaceCard },
  headerTitle: { ...typography.headlineSm, color: colors.white },
  content: { padding: spacing.md, gap: spacing.md },
  emptyContainer: { padding: spacing.xl, alignItems: 'center', marginTop: 60 },
  emptyTitle: { ...typography.headlineSm, color: colors.white, marginBottom: spacing.xs },
  emptySubtitle: { ...typography.bodyMd, color: colors.onSurfaceVariant, textAlign: 'center', lineHeight: 22 },
  card: { backgroundColor: colors.surfaceCard, padding: spacing.md, borderRadius: borderRadius.xl, borderWidth: 1, borderColor: colors.glassBorder, gap: spacing.sm },
  questionText: { ...typography.labelMd, color: colors.white, fontSize: 16, lineHeight: 22 },
  optionsList: { gap: 6, marginVertical: spacing.xs },
  optionItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: `${colors.surfaceVariant}50`,
    paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.glassBorder,
    gap: spacing.sm,
  },
  optionItemCorrect: {
    backgroundColor: `${colors.secondary}15`,
    borderColor: `${colors.secondary}60`,
  },
  optionKeyBadge: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center', alignItems: 'center',
  },
  optionKeyBadgeCorrect: {
    backgroundColor: colors.secondary,
  },
  optionKeyText: { ...typography.labelSm, color: colors.onSurfaceVariant, fontSize: 12 },
  optionKeyTextCorrect: { color: colors.onSecondary, fontWeight: '700' },
  optionContentText: { ...typography.bodyMd, color: colors.onSurface, flex: 1, fontSize: 14 },
  optionContentTextCorrect: { color: colors.secondary, fontWeight: '600' },
  explanationBox: {
    backgroundColor: `${colors.primary}10`,
    padding: spacing.sm, borderRadius: borderRadius.md,
    borderWidth: 1, borderColor: `${colors.primary}30`,
  },
  explanationText: { ...typography.bodySm, color: colors.onSurfaceVariant, lineHeight: 18 },
  masterBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primary, paddingVertical: 12,
    borderRadius: borderRadius.pill, gap: 8, marginTop: spacing.xs,
  },
  masterBtnText: { ...typography.labelMd, color: colors.onPrimary, fontWeight: '600' },
});
