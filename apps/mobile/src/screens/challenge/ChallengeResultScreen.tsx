import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, ActivityIndicator } from 'react-native';
import Animated, {
  FadeInDown, FadeInUp,
  useSharedValue, useAnimatedStyle,
  withDelay, withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme/designSystem';
import { api } from '../../api/client';

export default function ChallengeResultScreen({ route, navigation }: any) {
  const { challengeId, myScore, total, result: initialResult } = route.params as {
    challengeId: string;
    myScore: number;
    total: number;
    result?: 'win' | 'lose' | 'draw';
  };

  const [result, setResult] = useState<'win' | 'lose' | 'draw' | 'pending'>(initialResult || 'pending');
  const [refreshing, setRefreshing] = useState(false);

  const scorePercent = total > 0 ? Math.round((myScore / total) * 100) : 0;

  const handleRefreshResult = async () => {
    setRefreshing(true);
    try {
      const res = await api.challenge.getOne(challengeId);
      const r = res.data?.result as 'win' | 'lose' | 'draw' | 'pending';
      if (r && r !== 'pending') setResult(r);
    } catch (e) {
      console.log('Could not refresh result', e);
    } finally {
      setRefreshing(false);
    }
  };

  const emojiMap: Record<string, string> = {
    win: '🏆',
    lose: '😔',
    draw: '🤝',
    pending: '⏳',
  };

  const titleMap: Record<string, string> = {
    win: 'You Won! 🎉',
    lose: 'Better Luck Next Time',
    draw: "It's a Draw!",
    pending: 'Score Submitted!',
  };

  const subtitleMap: Record<string, string> = {
    win: 'Coins transferred to your wallet! 🪙',
    lose: 'Your opponent was faster. Keep practicing!',
    draw: 'Coins returned to both players.',
    pending: 'Waiting for opponent to finish...',
  };

  const colorMap: Record<string, string> = {
    win: colors.secondary,
    lose: colors.error,
    draw: colors.primary,
    pending: colors.onSurfaceVariant,
  };

  const trophyScale = useSharedValue(0);
  useEffect(() => {
    trophyScale.value = withDelay(300, withSpring(1, { damping: 8, stiffness: 120 }));
  }, []);

  const trophyStyle = useAnimatedStyle(() => ({
    transform: [{ scale: trophyScale.value }],
  }));

  const handleShare = async () => {
    await Share.share({
      message: `I scored ${myScore}/${total} in a JebKharch 1v1 Challenge! Play and win real money at JebKharch app! 💰`,
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#070d1a', '#0a1728', '#070d1a']}
        style={StyleSheet.absoluteFill}
      />

      {/* Confetti-like gradient for win */}
      {result === 'win' && (
        <LinearGradient
          colors={[`${colors.secondary}15`, 'transparent']}
          style={StyleSheet.absoluteFill}
        />
      )}

      <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
        <Text style={styles.headerTitle}>Challenge Result</Text>
      </Animated.View>

      <View style={styles.content}>
        {/* Trophy / Result Emoji */}
        <Animated.View style={[styles.emojiContainer, trophyStyle]}>
          <Text style={styles.emoji}>{emojiMap[result]}</Text>
        </Animated.View>

        {/* Title */}
        <Animated.View entering={FadeInDown.delay(200)}>
          <Text style={[styles.title, { color: colorMap[result] }]}>
            {titleMap[result]}
          </Text>
          <Text style={styles.subtitle}>{subtitleMap[result]}</Text>
        </Animated.View>

        {/* Score Card */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.scoreCard}>
          <LinearGradient
            colors={[colors.surfaceElevated, colors.surfaceCard]}
            style={styles.scoreGradient}
          >
            <View style={styles.scoreRow}>
              <View style={styles.scoreBlock}>
                <Text style={styles.scoreNumber}>{myScore}</Text>
                <Text style={styles.scoreLabel}>Your Score</Text>
              </View>
              <View style={styles.scoreDivider} />
              <View style={styles.scoreBlock}>
                <Text style={styles.scoreNumber}>{total}</Text>
                <Text style={styles.scoreLabel}>Questions</Text>
              </View>
              <View style={styles.scoreDivider} />
              <View style={styles.scoreBlock}>
                <Text style={[styles.scoreNumber, { color: colorMap[result] }]}>
                  {scorePercent}%
                </Text>
                <Text style={styles.scoreLabel}>Accuracy</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Coin info */}
        {result !== 'pending' && (
          <Animated.View entering={FadeInDown.delay(400)} style={styles.coinInfoCard}>
            <Ionicons
              name={result === 'win' ? 'star' : result === 'draw' ? 'refresh-circle' : 'remove-circle'}
              size={20}
              color={colorMap[result]}
            />
            <Text style={[styles.coinInfoText, { color: colorMap[result] }]}>
              {result === 'win'
                ? '+200 coins added to your wallet!'
                : result === 'draw'
                ? '100 coins returned to your wallet.'
                : '100 coins entry fee lost.'}
            </Text>
          </Animated.View>
        )}

        {/* Refresh button for pending state */}
        {result === 'pending' && (
          <TouchableOpacity style={styles.refreshBtn} onPress={handleRefreshResult} disabled={refreshing}>
            {refreshing
              ? <ActivityIndicator size="small" color={colors.primary} />
              : <>
                  <Ionicons name="refresh-outline" size={16} color={colors.primary} />
                  <Text style={styles.refreshBtnText}>Check Result</Text>
                </>
            }
          </TouchableOpacity>
        )}
      </View>

      {/* Action Buttons */}
      <Animated.View entering={FadeInUp.delay(500)} style={styles.actions}>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Ionicons name="share-social-outline" size={18} color={colors.white} />
          <Text style={styles.shareBtnText}>Share Result</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.challengeAgainBtn}
          onPress={() => navigation.replace('ChallengeLobby')}
        >
          <Text style={styles.challengeAgainText}>Challenge Again ⚔️</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.homeBtn} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.homeBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingTop: spacing.xl * 2, paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md, alignItems: 'center',
  },
  headerTitle: { ...typography.headlineSm, color: colors.white },
  content: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: spacing.lg, gap: spacing.lg,
  },
  emojiContainer: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: colors.glassBorder,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5, shadowRadius: 12,
  },
  emoji: { fontSize: 48 },
  title: { ...typography.headlineMd, fontSize: 26, textAlign: 'center' },
  subtitle: {
    ...typography.bodyMd, color: colors.onSurfaceVariant,
    textAlign: 'center', marginTop: spacing.xs, lineHeight: 22,
  },
  scoreCard: {
    width: '100%', borderRadius: borderRadius.xxl,
    overflow: 'hidden', borderWidth: 1, borderColor: colors.glassBorder,
  },
  scoreGradient: { padding: spacing.lg },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  scoreBlock: { alignItems: 'center', gap: spacing.xs },
  scoreNumber: { ...typography.displayMd, color: colors.white, fontSize: 32 },
  scoreLabel: { ...typography.labelSm, color: colors.onSurfaceVariant },
  scoreDivider: {
    width: 1, height: 40, backgroundColor: colors.glassBorder,
  },
  coinInfoCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.surfaceCard, paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm, borderRadius: borderRadius.pill,
    borderWidth: 1, borderColor: colors.glassBorder,
  },
  coinInfoText: { ...typography.labelMd },
  actions: {
    paddingHorizontal: spacing.lg, paddingBottom: spacing.xl * 2, gap: spacing.sm,
  },
  shareBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, backgroundColor: colors.surfaceVariant,
    paddingVertical: 14, borderRadius: borderRadius.pill,
    borderWidth: 1, borderColor: colors.glassBorder,
  },
  shareBtnText: { ...typography.labelMd, color: colors.white },
  challengeAgainBtn: {
    backgroundColor: colors.primary, paddingVertical: 16,
    borderRadius: borderRadius.pill, alignItems: 'center',
  },
  challengeAgainText: { ...typography.labelMd, color: colors.onPrimary, fontSize: 16 },
  homeBtn: {
    paddingVertical: 12, alignItems: 'center',
  },
  homeBtnText: { ...typography.labelMd, color: colors.onSurfaceMuted },
  refreshBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill, borderWidth: 1, borderColor: colors.primary,
    minWidth: 130,
  },
  refreshBtnText: { ...typography.labelSm, color: colors.primary },
});
