import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../theme/designSystem';
import { api } from '../api/client';

// Voice Quiz — reads the question aloud using expo-speech
// Requires: expo install expo-speech

let Speech: any = null;
try {
  Speech = require('expo-speech');
} catch (e) {
  // expo-speech not installed
}

export default function VoiceQuizScreen({ navigation }: any) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [phase, setPhase] = useState<'select' | 'play' | 'result'>('select');

  useEffect(() => {
    api.quiz.getCategories().then((res) => {
      setCategories(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const speakText = (text: string) => {
    if (!Speech) return;
    setSpeaking(true);
    Speech.speak(text, {
      language: 'en-US',
      pitch: 1.0,
      rate: 0.9,
      onDone: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };

  const startVoiceQuiz = async (categoryId: string) => {
    try {
      setLoading(true);
      const res = await api.quiz.startSession(categoryId);
      setSessionId(res.data.sessionId);
      setQuestions(res.data.questions);
      setCurrentIdx(0);
      setScore(0);
      setPhase('play');
      // Read first question aloud
      const q = res.data.questions[0];
      speakText(`Question 1. ${q.text}. Option A: ${q.options[0].text}. Option B: ${q.options[1].text}. Option C: ${q.options[2].text}. Option D: ${q.options[3].text}`);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to start quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (optionId: string) => {
    if (!sessionId) return;
    const q = questions[currentIdx];
    await api.quiz.submitAnswer(sessionId, q.id, optionId);
    if (optionId === q.correctAnswer) {
      setScore(s => s + 1);
      speakText('Correct!');
    } else {
      speakText(`Wrong. The correct answer was ${q.correctAnswer}.`);
    }

    await new Promise(r => setTimeout(r, 1500));

    if (currentIdx + 1 >= questions.length) {
      await api.quiz.completeSession(sessionId);
      setPhase('result');
      speakText(`Quiz complete! You got ${score + (optionId === q.correctAnswer ? 1 : 0)} out of ${questions.length} correct.`);
    } else {
      const nextQ = questions[currentIdx + 1];
      setCurrentIdx(i => i + 1);
      speakText(`Question ${currentIdx + 2}. ${nextQ.text}. Option A: ${nextQ.options[0].text}. Option B: ${nextQ.options[1].text}. Option C: ${nextQ.options[2].text}. Option D: ${nextQ.options[3].text}`);
    }
  };

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Voice Quiz 🎙️</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {phase === 'select' && (
          <>
            <Text style={styles.sectionTitle}>Pick a Category</Text>
            <Text style={styles.desc}>
              {Speech ? 'Questions will be read aloud for you to answer.' : '⚠️ expo-speech not available. Text mode only.'}
            </Text>
            {categories.map((cat) => (
              <TouchableOpacity key={cat.id} style={styles.catCard} onPress={() => startVoiceQuiz(cat.id)}>
                <Text style={{ fontSize: 28 }}>{cat.icon || '🎯'}</Text>
                <Text style={styles.catName}>{cat.name}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceMuted} />
              </TouchableOpacity>
            ))}
          </>
        )}

        {phase === 'play' && questions.length > 0 && (
          <>
            <View style={styles.questionCard}>
              <Text style={styles.progressText}>{currentIdx + 1} / {questions.length}</Text>
              <Text style={styles.questionText}>{questions[currentIdx].text}</Text>
              {speaking && (
                <View style={styles.speakingBadge}>
                  <Ionicons name="volume-high" size={16} color={colors.primary} />
                  <Text style={{ ...typography.labelSm, color: colors.primary }}> Speaking...</Text>
                </View>
              )}
              <TouchableOpacity onPress={() => speakText(questions[currentIdx].text)} style={styles.replayBtn}>
                <Ionicons name="refresh" size={16} color={colors.white} />
                <Text style={styles.replayBtnText}>Replay Question</Text>
              </TouchableOpacity>
            </View>

            {questions[currentIdx].options.map((opt: any) => (
              <TouchableOpacity key={opt.id} style={styles.optionBtn} onPress={() => handleAnswer(opt.id)}>
                <View style={styles.optionBadge}><Text style={styles.optionBadgeText}>{opt.id}</Text></View>
                <Text style={styles.optionText}>{opt.text}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {phase === 'result' && (
          <View style={styles.resultCard}>
            <Text style={{ fontSize: 48 }}>{score >= questions.length / 2 ? '🏆' : '📚'}</Text>
            <Text style={styles.resultTitle}>Quiz Complete!</Text>
            <Text style={styles.resultScore}>{score} / {questions.length}</Text>
            <TouchableOpacity style={styles.restartBtn} onPress={() => setPhase('select')}>
              <Text style={styles.restartBtnText}>Play Again</Text>
            </TouchableOpacity>
          </View>
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
  sectionTitle: { ...typography.headlineSm, color: colors.white },
  desc: { ...typography.bodyMd, color: colors.onSurfaceVariant },
  catCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surfaceCard, padding: spacing.md,
    borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.glassBorder,
  },
  catName: { ...typography.labelMd, color: colors.white, flex: 1 },
  questionCard: {
    backgroundColor: colors.surfaceCard, padding: spacing.lg, borderRadius: borderRadius.xl,
    borderWidth: 1, borderColor: colors.glassBorder,
  },
  progressText: { ...typography.labelSm, color: colors.onSurfaceVariant, marginBottom: spacing.xs },
  questionText: { ...typography.headlineSm, color: colors.white, fontSize: 18, lineHeight: 28 },
  speakingBadge: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  replayBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.md,
    backgroundColor: `${colors.primary}20`, paddingHorizontal: spacing.md, paddingVertical: 8,
    borderRadius: borderRadius.pill, alignSelf: 'flex-start',
  },
  replayBtnText: { ...typography.labelSm, color: colors.white },
  optionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surfaceCard, padding: spacing.md,
    borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.glassBorder,
  },
  optionBadge: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: `${colors.primary}20`, justifyContent: 'center', alignItems: 'center',
  },
  optionBadgeText: { ...typography.labelMd, color: colors.primary },
  optionText: { ...typography.bodyMd, color: colors.white, flex: 1 },
  resultCard: { alignItems: 'center', padding: spacing.xl, gap: spacing.md },
  resultTitle: { ...typography.headlineMd, color: colors.white },
  resultScore: { ...typography.displaySm, color: colors.secondary },
  restartBtn: {
    backgroundColor: colors.primary, paddingHorizontal: 40, paddingVertical: 14,
    borderRadius: borderRadius.pill, marginTop: spacing.md,
  },
  restartBtnText: { ...typography.labelLg, color: colors.onPrimary },
});
