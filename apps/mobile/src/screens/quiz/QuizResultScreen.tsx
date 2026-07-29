// src/screens/quiz/QuizResultScreen.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
  FadeIn, FadeInDown, FadeInUp, ZoomIn,
  useSharedValue, useAnimatedStyle,
  withSpring, withRepeat, withSequence, withTiming,
  Easing,
} from 'react-native-reanimated';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme/designSystem';
import { Ionicons } from '@expo/vector-icons';
import AnimatedNumber from '../../components/AnimatedNumber';

type Props = NativeStackScreenProps<RootStackParamList, 'QuizResult'>;

const { width, height } = Dimensions.get('window');
const CONFETTI_COUNT = 20;

// Simple confetti particle using reanimated
function ConfettiParticle({ index }: { index: number }) {
  const translateY = useSharedValue(-20);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const rotate = useSharedValue(0);

  const COLORS = [colors.primary, colors.secondary, '#a78bfa', '#f87171', '#38bdf8'];
  const color = COLORS[index % COLORS.length];
  const startX = (Math.random() - 0.5) * width;
  const delay = Math.random() * 1200;
  const size = 6 + Math.random() * 6;
  const isCircle = index % 2 === 0;

  useEffect(() => {
    translateY.value = withTiming(height * 0.85, {
      duration: 2000 + Math.random() * 1000,
      easing: Easing.in(Easing.ease),
    });
    translateX.value = withSequence(
      withTiming(startX + (Math.random() - 0.5) * 60, { duration: 1500 }),
      withTiming(startX + (Math.random() - 0.5) * 120, { duration: 1000 })
    );
    rotate.value = withTiming(720 + Math.random() * 360, { duration: 2500 });
    opacity.value = withSequence(
      withTiming(1, { duration: 200 }),
      withTiming(1, { duration: 1800 }),
      withTiming(0, { duration: 500 })
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 0,
          left: width / 2,
          width: size,
          height: isCircle ? size : size * 2,
          borderRadius: isCircle ? size / 2 : 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

export default function QuizResultScreen({ route, navigation }: Props) {
  const { score, total, coinsEarned } = route.params;
  const isWinner = score > total / 2;
  const percentage = Math.round((score / total) * 100);

  const trophyScale = useSharedValue(0);
  const trophyRotate = useSharedValue(-15);
  const ringScale = useSharedValue(0.5);

  useEffect(() => {
    trophyScale.value = withSpring(1, { damping: 8, stiffness: 100 });
    trophyRotate.value = withSpring(0, { damping: 10 });
    ringScale.value = withSpring(1, { damping: 12 });

    if (isWinner) {
      setTimeout(() => {
        trophyScale.value = withRepeat(
          withSequence(
            withTiming(1.08, { duration: 900, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) })
          ),
          -1, false
        );
      }, 800);
    }
  }, []);

  const trophyStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: trophyScale.value },
      { rotate: `${trophyRotate.value}deg` },
    ],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringScale.value,
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isWinner ? ['#070d1a', '#071a0f', '#070d1a'] : ['#070d1a', '#1a0707', '#070d1a']}
        style={StyleSheet.absoluteFill}
      />

      {/* Confetti (winner only) */}
      {isWinner && Array.from({ length: CONFETTI_COUNT }).map((_, i) => (
        <ConfettiParticle key={i} index={i} />
      ))}

      <View style={styles.content}>
        {/* Trophy / Emoji */}
        <Animated.View entering={ZoomIn.delay(100).springify()} style={styles.iconArea}>
          <Animated.View style={[styles.ringOuter, ringStyle,
            { borderColor: isWinner ? `${colors.secondary}40` : `${colors.error}30` }
          ]} />
          <View style={[styles.ringInner,
            { backgroundColor: isWinner ? `${colors.secondary}15` : `${colors.error}10` }
          ]} />
          <Animated.Text style={[styles.trophyEmoji, trophyStyle]}>
            {isWinner ? '🏆' : '😔'}
          </Animated.Text>
        </Animated.View>

        {/* Title */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.titleArea}>
          <Text style={[styles.title, { color: isWinner ? colors.secondary : colors.error }]}>
            {isWinner ? 'Shabaash! 🎉' : 'Agli baar!'}
          </Text>
          <Text style={styles.subtitle}>
            {isWinner
              ? 'Tumne kamal kar diya!'
              : 'Practice karo aur wapas aao 💪'}
          </Text>
        </Animated.View>

        {/* Score card */}
        <Animated.View entering={FadeInUp.delay(400).springify()} style={styles.scoreCard}>
          <LinearGradient
            colors={[colors.surfaceElevated, colors.surfaceCard]}
            style={styles.scoreGradient}
          >
            {/* Score ring */}
            <View style={styles.scoreRingArea}>
              <View style={[styles.scoreRing,
                { borderColor: isWinner ? colors.primary : colors.error }
              ]}>
                <Text style={[styles.scorePct, { color: isWinner ? colors.primary : colors.error }]}>
                  {percentage}%
                </Text>
                <Text style={styles.scoreRingLabel}>Correct</Text>
              </View>
            </View>

            <View style={styles.scoreDivider} />

            <View style={styles.scoreDetails}>
              <View style={styles.scoreItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                <Text style={styles.scoreItemLabel}>Sahi Jawab</Text>
                <Text style={styles.scoreItemValue}>{score}/{total}</Text>
              </View>
              {isWinner && (
                <View style={styles.scoreItem}>
                  <Ionicons name="star" size={20} color={colors.secondary} />
                  <Text style={styles.scoreItemLabel}>Coins Kmaye</Text>
                  <AnimatedNumber
                    value={coinsEarned}
                    style={styles.coinsValue}
                    duration={1000}
                    suffix=" ⭐"
                  />
                </View>
              )}
            </View>
          </LinearGradient>
        </Animated.View>
      </View>

      {/* Action buttons */}
      <Animated.View entering={FadeInUp.delay(600)} style={styles.actions}>
        <TouchableOpacity
          style={styles.btnWrapper}
          activeOpacity={0.85}
          onPress={() => navigation.replace('Quiz', route.params as any)}
        >
          <LinearGradient
            colors={[colors.surfaceElevated, colors.surfaceCard]}
            style={[styles.btn, styles.btnSecondary]}
          >
            <Ionicons name="refresh" size={18} color={colors.onSurface} />
            <Text style={styles.btnSecondaryText}>Dobara Khelo</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnWrapper}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Home')}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryDim]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.btn}
          >
            <Ionicons name="home" size={18} color={colors.onPrimary} />
            <Text style={styles.btnText}>Home Jao</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View entering={FadeIn.delay(700)}>
        <TouchableOpacity
          style={styles.leaderboardBtn}
          onPress={() => navigation.navigate('Leaderboard')}
        >
          <Ionicons name="podium-outline" size={16} color={colors.primary} />
          <Text style={styles.leaderboardText}>Leaderboard dekho</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: spacing.xl, gap: spacing.xl,
  },
  iconArea: {
    width: 160, height: 160, justifyContent: 'center', alignItems: 'center',
  },
  ringOuter: {
    position: 'absolute', width: 160, height: 160, borderRadius: 80, borderWidth: 1,
  },
  ringInner: {
    position: 'absolute', width: 120, height: 120, borderRadius: 60,
  },
  trophyEmoji: { fontSize: 70, textAlign: 'center' },
  titleArea: { alignItems: 'center', gap: spacing.xs },
  title: { ...typography.displayMd, textAlign: 'center' },
  subtitle: { ...typography.bodyMd, color: colors.onSurfaceVariant, textAlign: 'center' },
  scoreCard: {
    width: '100%', borderRadius: borderRadius.xxl, overflow: 'hidden',
    borderWidth: 1, borderColor: colors.glassBorder,
  },
  scoreGradient: { padding: spacing.xl },
  scoreRingArea: { alignItems: 'center', marginBottom: spacing.lg },
  scoreRing: {
    width: 110, height: 110, borderRadius: 55, borderWidth: 3,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: colors.background,
  },
  scorePct: { ...typography.displayMd, fontSize: 28 },
  scoreRingLabel: { ...typography.labelSm, color: colors.onSurfaceVariant },
  scoreDivider: { height: 1, backgroundColor: colors.glassBorder, marginBottom: spacing.lg },
  scoreDetails: { gap: spacing.sm },
  scoreItem: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
  },
  scoreItemLabel: { ...typography.bodyMd, color: colors.onSurfaceVariant, flex: 1 },
  scoreItemValue: { ...typography.labelMd, color: colors.white },
  coinsValue: { ...typography.labelMd, color: colors.secondary },
  actions: {
    flexDirection: 'row', paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md, gap: spacing.sm,
  },
  btnWrapper: { flex: 1, borderRadius: borderRadius.pill, overflow: 'hidden' },
  btn: {
    flexDirection: 'row', height: 54,
    justifyContent: 'center', alignItems: 'center', gap: spacing.xs,
  },
  btnSecondary: { borderWidth: 1, borderColor: colors.glassBorder },
  btnText: { ...typography.labelMd, color: colors.onPrimary },
  btnSecondaryText: { ...typography.labelMd, color: colors.onSurface },
  leaderboardBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.xs, paddingBottom: spacing.xl,
  },
  leaderboardText: { ...typography.labelSm, color: colors.primary },
});
