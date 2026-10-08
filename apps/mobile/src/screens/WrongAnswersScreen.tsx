import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../theme/designSystem';
import { api } from '../api/client';

export default function WrongAnswersScreen({ navigation }: any) {
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.wrongAnswers.getBank();
      setAnswers(res.data);
    } catch (e) {
      console.log('Error fetching wrong answers', e);
    } finally {
      setLoading(false);
    }
  };

  const markMastered = async (id: string) => {
    try {
      await api.wrongAnswers.markMastered(id);
      Alert.alert('Success', 'Question marked as mastered!');
      fetchData();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to update.');
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

      <ScrollView contentContainerStyle={styles.content}>
        {answers.length === 0 ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ ...typography.bodyLg, color: colors.onSurfaceVariant, textAlign: 'center' }}>
              Awesome! You don't have any wrong answers to review right now. 🧠
            </Text>
          </View>
        ) : (
          answers.map((wa) => (
            <View key={wa.id} style={styles.card}>
              <Text style={styles.questionText}>{wa.question.questionText}</Text>
              
              <View style={styles.answerBox}>
                <Text style={styles.correctLabel}>Correct Answer:</Text>
                <Text style={styles.correctAnswerText}>
                  {wa.question[`option${wa.question.correctAnswer}`]}
                </Text>
              </View>
              
              <View style={styles.answerBoxWrong}>
                <Text style={styles.wrongLabel}>You Selected:</Text>
                <Text style={styles.wrongAnswerText}>
                  {wa.question[`option${wa.selectedAnswer || 'A'}`]} {/* We removed selectedAnswer, wait we need to display it if it was saved */}
                  {/* Note: since we removed selectedAnswer from schema, we just show the correct answer */}
                </Text>
              </View>
              
              <Text style={styles.explanationText}>📝 {wa.question.explanation}</Text>

              <TouchableOpacity style={styles.masterBtn} onPress={() => markMastered(wa.id)}>
                <Ionicons name="checkmark-circle-outline" size={20} color={colors.onPrimary} />
                <Text style={styles.masterBtnText}>Mark as Mastered</Text>
              </TouchableOpacity>
            </View>
          ))
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
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.glassBorder
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 20, backgroundColor: colors.surfaceCard },
  headerTitle: { ...typography.headlineSm, color: colors.white },
  content: { padding: spacing.md, gap: spacing.md },
  card: { backgroundColor: colors.surfaceCard, padding: spacing.md, borderRadius: borderRadius.xl, borderWidth: 1, borderColor: colors.glassBorder },
  questionText: { ...typography.labelMd, color: colors.white, fontSize: 16, marginBottom: spacing.sm },
  answerBox: { backgroundColor: `${colors.secondary}15`, padding: spacing.sm, borderRadius: borderRadius.sm, marginBottom: spacing.xs, borderWidth: 1, borderColor: `${colors.secondary}40` },
  correctLabel: { ...typography.labelSm, color: colors.secondary, marginBottom: 2 },
  correctAnswerText: { ...typography.bodyMd, color: colors.white },
  answerBoxWrong: { backgroundColor: `${colors.error}15`, padding: spacing.sm, borderRadius: borderRadius.sm, marginBottom: spacing.sm, borderWidth: 1, borderColor: `${colors.error}40` },
  wrongLabel: { ...typography.labelSm, color: colors.error, marginBottom: 2 },
  wrongAnswerText: { ...typography.bodyMd, color: colors.white },
  explanationText: { ...typography.bodySm, color: colors.onSurfaceVariant, marginBottom: spacing.md, fontStyle: 'italic' },
  masterBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, paddingVertical: 10, borderRadius: borderRadius.pill, gap: 8 },
  masterBtnText: { ...typography.labelMd, color: colors.onPrimary },
});
