// src/screens/challenge/ChallengePlayScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Animated, {
  FadeInRight, FadeOutLeft,
  useSharedValue, useAnimatedStyle,
  withTiming, withSpring, withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme/designSystem';
import { api } from '../../api/client';

const QUESTION_TIME = 15;

export default function ChallengePlayScreen({ route, navigation }: any) {
  const { challengeId } = route.params;
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null); // 'A', 'B', 'C', 'D'
  const [processing, setProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Animation values
  const progressAnim = useSharedValue(0);
  const timerAnim = useSharedValue(1);
  const scoreScale = useSharedValue(1);

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    if (!loading && questions.length > 0 && !processing) {
      startTimer();
    }
    return () => stopTimer();
  }, [currentIndex, loading, processing]);

  const loadQuestions = async () => {
    try {
      const res = await api.challenge.getQuestions(challengeId);
      setQuestions(res.data);
      progressAnim.value = withTiming(1 / res.data.length, { duration: 500 });
    } catch (err) {
      console.log('Error loading challenge questions', err);
    } finally {
      setLoading(false);
    }
  };

  const startTimer = () => {
    stopTimer();
    setTimeLeft(QUESTION_TIME);
    timerAnim.value = 1;
    timerAnim.value = withTiming(0, { duration: QUESTION_TIME * 1000, easing: Easing.linear });

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          stopTimer();
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleTimeout = () => {
    if (processing) return;
    setProcessing(true);
    setStreak(0);
    // Find the correct answer from backend structure if we had it, but here we just mock that option A is correct for timeout fallback, or simply proceed
    // We'll mark it as wrong since the timer ran out
    setTimeout(() => goNext(), 1200);
  };

  const handleSelectOption = (optionId: string, correctAns: string) => {
    if (processing) return;
    stopTimer();
    setSelectedOption(optionId);
    setCorrectAnswer(correctAns);
    setProcessing(true);

    const correct = optionId === correctAns;
    if (correct) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
      scoreScale.value = withSequence(
        withSpring(1.3, { damping: 8 }),
        withSpring(1, { damping: 10 })
      );
    } else {
      setStreak(0);
    }
    setTimeout(() => goNext(), 1100);
  };

  const goNext = async () => {
    const nextIdx = currentIndex + 1;
    if (nextIdx < questions.length) {
      setCurrentIndex(nextIdx);
      setSelectedOption(null);
      setCorrectAnswer(null);
      setProcessing(false);
      timerAnim.value = 1;
      progressAnim.value = withTiming((nextIdx + 1) / questions.length, { duration: 400 });
    } else {
      // Finished all questions, submit final score to backend!
      setLoading(true);
      try {
        const submitRes = await api.challenge.submit(challengeId, score);
        const waiting: boolean = submitRes.data?.waiting ?? true;

        if (!waiting) {
          // Both players submitted — fetch result immediately
          const resultRes = await api.challenge.getOne(challengeId);
          const result = resultRes.data?.result as 'win' | 'lose' | 'draw' | 'pending' | undefined;
          navigation.replace('ChallengeResult', {
            challengeId,
            myScore: score,
            total: questions.length,
            result: (result === 'pending' || !result) ? undefined : result,
          });
        } else {
          // Opponent hasn't submitted yet — navigate to result screen as "pending"
          navigation.replace('ChallengeResult', {
            challengeId,
            myScore: score,
            total: questions.length,
          });
        }
      } catch (err) {
        console.log('Error submitting challenge score', err);
        navigation.replace('ChallengeResult', { challengeId, myScore: score, total: questions.length });
      }
    }
  };

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.value * 100}%`,
  }));

  const timerStyle = useAnimatedStyle(() => ({
    width: `${timerAnim.value * 100}%`,
  }));

  const timerColor = timeLeft <= 5 ? colors.error : timeLeft <= 10 ? colors.secondary : colors.primary;

  const streakStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scoreScale.value }],
  }));

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Questions load ho rahi hain...</Text>
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 48 }}>😕</Text>
        <Text style={styles.loadingText}>Challenge questions missing</Text>
        <TouchableOpacity style={styles.goBackBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.goBackText}>Wapas Jao</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <View style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, progressStyle]} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Ionicons name="close" size={20} color={colors.onSurfaceVariant} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.categoryName}>1v1 Battle Quiz</Text>
          <Text style={styles.questionCount}>{currentIndex + 1} / {questions.length}</Text>
        </View>

        {/* Streak badge */}
        <Animated.View style={[styles.streakBadge, streakStyle]}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.streakText}>{streak}</Text>
        </Animated.View>
      </View>

      {/* Timer bar */}
      <View style={styles.timerTrack}>
        <Animated.View style={[styles.timerFill, timerStyle, { backgroundColor: timerColor }]} />
      </View>
      <View style={styles.timerLabelRow}>
        <Ionicons name="time-outline" size={13} color={timerColor} />
        <Text style={[styles.timerLabel, { color: timerColor }]}>{timeLeft}s</Text>
      </View>

      {/* Question */}
      <Animated.View
        key={currentIndex}
        entering={FadeInRight.duration(300).springify().damping(18)}
        exiting={FadeOutLeft.duration(200)}
        style={styles.questionCard}
      >
        <LinearGradient
          colors={[colors.surfaceElevated, colors.surfaceCard]}
          style={styles.questionGradient}
        >
          <View style={styles.questionNumberBadge}>
            <Text style={styles.questionNumberText}>Q{currentIndex + 1}</Text>
          </View>
          <Text style={styles.questionText}>{currentQ.text}</Text>
        </LinearGradient>
      </Animated.View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {currentQ.options.map((opt: any, i: number) => {
          const isSelected = selectedOption === opt.id;
          const isCorrectAns = opt.id === correctAnswer;
          let bgColors: [string, string] = [`${colors.surfaceVariant}80`, colors.surfaceCard];
          let borderColor = colors.glassBorder;

          if (processing) {
            if (isSelected) {
              if (optionIdCorrect(selectedOption, currentQ.correctAnswer)) {
                bgColors = [`${colors.primary}40`, `${colors.primary}20`];
                borderColor = colors.primary;
              } else {
                bgColors = [`${colors.error}40`, `${colors.error}20`];
                borderColor = colors.error;
              }
            } else if (isCorrectAns) {
              // Highlight the correct one if user got it wrong
              bgColors = [`${colors.primary}40`, `${colors.primary}10`];
              borderColor = `${colors.primary}80`;
            }
          }

          return (
            <TouchableOpacity
              key={opt.id}
              onPress={() => handleSelectOption(opt.id, currentQ.correctAnswer)}
              disabled={processing}
              activeOpacity={0.8}
              style={styles.optionTouch}
            >
              <LinearGradient
                colors={bgColors}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[styles.optionCard, { borderColor }]}
              >
                <View style={styles.optionLetter}>
                  <Text style={styles.optionLetterText}>
                    {['A', 'B', 'C', 'D'][i]}
                  </Text>
                </View>
                <Text style={styles.optionText}>{opt.text}</Text>
                {processing && isSelected && optionIdCorrect(selectedOption, currentQ.correctAnswer) && (
                  <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                )}
                {processing && isSelected && !optionIdCorrect(selectedOption, currentQ.correctAnswer) && (
                  <Ionicons name="close-circle" size={22} color={colors.error} />
                )}
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const optionIdCorrect = (selected: string | null, correct: string) => {
  return selected?.toUpperCase() === correct?.toUpperCase();
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: colors.background, gap: spacing.md,
  },
  loadingText: { ...typography.bodyMd, color: colors.onSurfaceVariant },
  goBackBtn: {
    backgroundColor: colors.surfaceVariant, paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm, borderRadius: borderRadius.pill,
  },
  goBackText: { ...typography.labelMd, color: colors.white },
  progressTrack: { height: 3, backgroundColor: colors.surfaceVariant },
  progressFill: {
    height: '100%', backgroundColor: colors.primary,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, shadowRadius: 4,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.sm,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center', alignItems: 'center',
  },
  headerCenter: { alignItems: 'center' },
  categoryName: { ...typography.labelSm, color: colors.onSurfaceVariant },
  questionCount: { ...typography.labelMd, color: colors.white, fontSize: 16 },
  streakBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: `${colors.secondary}20`,
    paddingHorizontal: spacing.sm, paddingVertical: 4,
    borderRadius: borderRadius.pill, gap: 4,
    borderWidth: 1, borderColor: `${colors.secondary}40`,
  },
  streakEmoji: { fontSize: 14 },
  streakText: { ...typography.labelMd, color: colors.secondary },
  timerTrack: {
    height: 4, backgroundColor: colors.surfaceVariant,
    marginHorizontal: spacing.lg, borderRadius: 2,
  },
  timerFill: { height: '100%', borderRadius: 2 },
  timerLabelRow: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: spacing.lg, marginTop: 4,
  },
  timerLabel: { ...typography.labelSm },
  questionCard: {
    marginHorizontal: spacing.lg, marginTop: spacing.md,
    borderRadius: borderRadius.xxl, overflow: 'hidden',
    borderWidth: 1, borderColor: colors.glassBorder,
  },
  questionGradient: { padding: spacing.xl, minHeight: 140, justifyContent: 'center' },
  questionNumberBadge: {
    backgroundColor: `${colors.primary}20`, borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm, paddingVertical: 3,
    alignSelf: 'flex-start', marginBottom: spacing.md,
    borderWidth: 1, borderColor: colors.neonBorder,
  },
  questionNumberText: { ...typography.labelSm, color: colors.primary },
  questionText: { ...typography.headlineSm, color: colors.white, lineHeight: 28 },
  optionsContainer: {
    flex: 1, paddingHorizontal: spacing.lg,
    paddingTop: spacing.md, gap: spacing.sm, justifyContent: 'center',
  },
  optionTouch: { borderRadius: borderRadius.lg, overflow: 'hidden' },
  optionCard: {
    flexDirection: 'row', alignItems: 'center',
    padding: spacing.md, borderRadius: borderRadius.lg,
    borderWidth: 1.5, gap: spacing.sm,
  },
  optionLetter: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center', alignItems: 'center',
  },
  optionLetterText: { ...typography.labelSm, color: colors.onSurfaceVariant },
  optionText: { ...typography.bodyMd, color: colors.white, flex: 1 },
});
