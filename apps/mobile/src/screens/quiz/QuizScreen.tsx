// src/screens/quiz/QuizScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Animated, {
  FadeInRight, FadeOutLeft, FadeInDown,
  useSharedValue, useAnimatedStyle,
  withTiming, withSpring, withSequence, withRepeat,
  Easing, interpolate, Extrapolation,
} from 'react-native-reanimated';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { colors, typography, spacing, borderRadius } from '../../theme/designSystem';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import { QUERY_KEYS } from '../../hooks/useAppData';

type Props = NativeStackScreenProps<RootStackParamList, 'Quiz'>;

const QUESTION_TIME = 15;

const LOADING_TIPS = [
  'Har sahi jawab pe milte hain coins! 🏆',
  'Jaldi jawab dene par milta hai streak bonus! 🔥',
  'Galat jawab se ghabrana nahi, seekhte raho! 💡',
  'Leaderboard pe aane ke liye daily khelo! ⚡',
];

function QuizLoadingView({ categoryName }: { categoryName: string }) {
  const pulseScale = useSharedValue(1);
  const rotateVal = useSharedValue(0);
  const glowOpacity = useSharedValue(0.4);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withSpring(1.15, { damping: 6, stiffness: 100 }),
        withSpring(1, { damping: 8, stiffness: 120 })
      ),
      -1,
      true
    );

    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.85, { duration: 1000 }),
        withTiming(0.3, { duration: 1000 })
      ),
      -1,
      true
    );

    rotateVal.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(8, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    const interval = setInterval(() => {
      setTipIndex((i) => (i + 1) % LOADING_TIPS.length);
    }, 2400);

    return () => clearInterval(interval);
  }, []);

  const iconAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: pulseScale.value },
      { rotate: `${rotateVal.value}deg` },
    ],
  }));

  const glowAnimStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: pulseScale.value * 1.25 }],
  }));

  return (
    <View style={styles.loadingContainer}>
      <LinearGradient
        colors={['#060c18', '#0c1b33', '#060c18']}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.loadingCard}>
        {/* Glowing Aura Ring */}
        <Animated.View style={[styles.loadingGlowCircle, glowAnimStyle]} />

        {/* Animated Badge */}
        <Animated.View style={[styles.loadingIconWrap, iconAnimStyle]}>
          <LinearGradient
            colors={[`${colors.primary}50`, `${colors.primary}15`]}
            style={styles.loadingIconBg}
          >
            <Text style={{ fontSize: 52 }}>⚡</Text>
          </LinearGradient>
        </Animated.View>

        {/* Category Pill */}
        <View style={styles.loadingCategoryBadge}>
          <Text style={{ fontSize: 13 }}>📚</Text>
          <Text style={styles.loadingCategoryText}>{categoryName}</Text>
        </View>

        {/* Title */}
        <Text style={styles.loadingMainTitle}>Taiyyar Ho Jao!</Text>
        <Text style={styles.loadingSubtitle}>Questions load ho rahe hain</Text>

        {/* Meta Info */}
        <View style={styles.loadingMetaRow}>
          <View style={styles.loadingMetaPill}>
            <Ionicons name="help-circle-outline" size={14} color={colors.primary} />
            <Text style={styles.loadingMetaText}>10 Questions</Text>
          </View>
          <View style={styles.loadingMetaPill}>
            <Ionicons name="time-outline" size={14} color={colors.secondary} />
            <Text style={styles.loadingMetaText}>15s Per Question</Text>
          </View>
        </View>

        <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: spacing.md }} />

        {/* Dynamic Tip */}
        <View style={styles.loadingTipWrap}>
          <Text style={styles.loadingTipLabel}>PRO TIP</Text>
          <Text style={styles.loadingTipText}>{LOADING_TIPS[tipIndex]}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

export default function QuizScreen({ route, navigation }: Props) {
  const { categoryId, categoryName } = route.params;
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [revealedCorrectAnswer, setRevealedCorrectAnswer] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [streak, setStreak] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Animation values
  const progressAnim = useSharedValue(0);
  const timerAnim = useSharedValue(1);
  const scoreScale = useSharedValue(1);

  useEffect(() => { startQuiz(); }, []);

  useEffect(() => {
    if (!loading && questions.length > 0 && !processing) {
      startTimer();
    }
    return () => stopTimer();
  }, [currentIndex, loading, processing]);

  const startTimer = () => {
    stopTimer();
    setTimeLeft(QUESTION_TIME);
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

  const handleTimeout = async () => {
    if (processing || !sessionId || questions.length === 0) return;
    setProcessing(true);
    setIsCorrect(false);
    setStreak(0);
    try {
      await api.quiz.submitAnswer(sessionId, questions[currentIndex].id, 'timeout');
    } catch {}
    setTimeout(() => goNext(), 1200);
  };

  const startQuiz = async () => {
    try {
      const res = await api.quiz.startSession(categoryId);
      setSessionId(res.data.sessionId);
      setQuestions(res.data.questions);
      progressAnim.value = withTiming(1 / res.data.questions.length, { duration: 500 });
      // Invalidate lives & wallet queries so energy & coins update immediately
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lives });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.walletBalance });
    } catch (err: any) {
      console.log(err);
      const msg = err?.response?.data?.message || 'Quiz shuru nahi ho saki. Dobara koshish karein.';
      setErrorMessage(msg);
    } finally { setLoading(false); }
  };

  const handleSelectOption = async (optionId: string) => {
    if (processing || !sessionId) return;
    stopTimer();
    setSelectedOption(optionId);
    setProcessing(true);
    try {
      const res = await api.quiz.submitAnswer(sessionId, questions[currentIndex].id, optionId);
      const correct = res.data.isCorrect ?? res.data.correct ?? false;
      const correctAns = res.data.correctAnswer;
      setIsCorrect(correct);
      if (correctAns) {
        setRevealedCorrectAnswer(correctAns);
      }
      if (correct) {
        setStreak(s => s + 1);
        scoreScale.value = withSequence(
          withSpring(1.3, { damping: 8 }),
          withSpring(1, { damping: 10 })
        );
      } else {
        setStreak(0);
      }
      setTimeout(() => goNext(), 1200);
    } catch {
      setProcessing(false);
    }
  };

  const goNext = async () => {
    const nextIdx = currentIndex + 1;
    if (nextIdx < questions.length) {
      setCurrentIndex(nextIdx);
      setSelectedOption(null);
      setIsCorrect(null);
      setRevealedCorrectAnswer(null);
      setProcessing(false);
      timerAnim.value = 1;
      progressAnim.value = withTiming((nextIdx + 1) / questions.length, { duration: 400 });
    } else {
      try {
        const res = await api.quiz.completeSession(sessionId!);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.walletBalance });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile });
        navigation.replace('QuizResult', {
          score: res.data.score,
          total: res.data.total,
          coinsEarned: res.data.coinsEarned,
          categoryId,
          categoryName,
        });
      } catch {
        navigation.replace('QuizResult', {
          score: 0,
          total: questions.length,
          coinsEarned: 0,
          categoryId,
          categoryName,
        });
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
    return <QuizLoadingView categoryName={categoryName} />;
  }

  if (questions.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 48 }}>😕</Text>
        <Text style={styles.loadingText}>{errorMessage || 'Quiz load nahi hui'}</Text>
        <TouchableOpacity
          style={[styles.goBackBtn, { backgroundColor: colors.primary, marginBottom: 12 }]}
          onPress={() => { setLoading(true); setErrorMessage(null); startQuiz(); }}
        >
          <Text style={[styles.goBackText, { color: '#fff' }]}>🔄 Dobara Koshish Karein</Text>
        </TouchableOpacity>
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
          <Text style={styles.categoryName}>{categoryName}</Text>
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
          const isRevealedCorrect = revealedCorrectAnswer === opt.id;
          let bgColors: [string, string] = [`${colors.surfaceVariant}80`, colors.surfaceCard];
          let borderColor = colors.glassBorder;
          let letterBg = colors.surfaceVariant;
          let letterColor = colors.onSurfaceVariant;

          if (isSelected) {
            if (isCorrect === true) {
              bgColors = [`${colors.primary}45`, `${colors.primary}20`];
              borderColor = colors.primary;
              letterBg = colors.primary;
              letterColor = colors.onPrimary;
            } else if (isCorrect === false) {
              bgColors = [`${colors.error}45`, `${colors.error}20`];
              borderColor = colors.error;
              letterBg = colors.error;
              letterColor = colors.white;
            } else {
              // Immediately show selected state while API response is in-flight
              bgColors = [`${colors.primary}35`, `${colors.primary}15`];
              borderColor = colors.primary;
              letterBg = `${colors.primary}80`;
              letterColor = colors.white;
            }
          } else if (isRevealedCorrect && isCorrect === false) {
            // Highlight the true correct answer when user picked the wrong one
            bgColors = [`${colors.primary}40`, `${colors.primary}18`];
            borderColor = colors.primary;
            letterBg = colors.primary;
            letterColor = colors.onPrimary;
          }

          return (
            <TouchableOpacity
              key={opt.id}
              onPress={() => handleSelectOption(opt.id)}
              disabled={processing}
              activeOpacity={0.8}
              style={styles.optionTouch}
            >
              <LinearGradient
                colors={bgColors}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[
                  styles.optionCard,
                  { borderColor },
                  isSelected && styles.optionCardSelected,
                ]}
              >
                <View style={[styles.optionLetter, { backgroundColor: letterBg }]}>
                  <Text style={[styles.optionLetterText, { color: letterColor }]}>
                    {['A', 'B', 'C', 'D'][i]}
                  </Text>
                </View>
                <Text style={[styles.optionText, isSelected && { color: colors.white, fontWeight: '600' }]}>
                  {opt.text}
                </Text>
                {isSelected && isCorrect === null && (
                  <ActivityIndicator size="small" color={colors.primary} />
                )}
                {((isSelected && isCorrect === true) || (isRevealedCorrect && isCorrect === false)) && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                )}
                {isSelected && isCorrect === false && (
                  <Ionicons name="close-circle" size={24} color={colors.error} />
                )}
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

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
  optionCardSelected: {
    borderWidth: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  optionLetter: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center', alignItems: 'center',
  },
  optionLetterText: { ...typography.labelSm, color: colors.onSurfaceVariant },
  optionText: { ...typography.bodyMd, color: colors.white, flex: 1 },

  // Loading Screen Styles
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingCard: {
    width: '100%',
    alignItems: 'center',
    padding: spacing.xl,
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: colors.glassBorderBright,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    gap: spacing.sm,
  },
  loadingGlowCircle: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    top: 40,
    backgroundColor: `${colors.primary}25`,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 30,
    elevation: 8,
  },
  loadingIconWrap: {
    marginBottom: spacing.xs,
  },
  loadingIconBg: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: `${colors.primary}70`,
  },
  loadingCategoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: borderRadius.pill,
    backgroundColor: `${colors.secondary}20`,
    borderWidth: 1,
    borderColor: `${colors.secondary}50`,
    marginTop: spacing.xs,
  },
  loadingCategoryText: {
    ...typography.labelSm,
    color: colors.secondary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loadingMainTitle: {
    ...typography.headlineMd,
    color: colors.white,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  loadingSubtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  loadingMetaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  loadingMetaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  loadingMetaText: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    fontSize: 11,
  },
  loadingTipWrap: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: `${colors.surfaceVariant}90`,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    width: '100%',
    gap: 4,
  },
  loadingTipLabel: {
    ...typography.labelSm,
    color: colors.primary,
    fontWeight: '800',
    letterSpacing: 1.2,
    fontSize: 10,
  },
  loadingTipText: {
    ...typography.bodySm,
    color: colors.white,
    textAlign: 'center',
    fontSize: 12,
  },
});
