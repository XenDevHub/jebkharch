import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../theme/designSystem';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '../api/client';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS, useStreakStatus, useWalletBalance } from '../hooks/useAppData';

interface StreakModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function StreakModal({ visible, onClose }: StreakModalProps) {
  const queryClient = useQueryClient();
  const { data: streakData, isLoading } = useStreakStatus();
  const { data: balanceData } = useWalletBalance();
  const balance = balanceData ?? 0;

  const [claiming, setClaiming] = useState(false);
  const [buyingFreeze, setBuyingFreeze] = useState(false);

  const currentStreak = streakData?.currentStreak || 0;
  const longestStreak = streakData?.longestStreak || 0;
  const streakFreezes = streakData?.streakFreezes || 0;
  const claimedToday = streakData?.claimedToday || false;
  const rewardsSchedule = streakData?.rewardsSchedule || [10, 20, 30, 50, 75, 100, 200];
  
  // Calculate day in 7-day cycle (1..7)
  const currentDayInCycle = streakData?.currentDayInCycle || ((currentStreak % 7) || 1);
  const todayReward = rewardsSchedule[(currentDayInCycle - 1) % 7] || 10;

  // Handle claiming daily streak
  const handleClaimDaily = async () => {
    if (claimedToday) {
      return Alert.alert('Already Claimed', 'You have already claimed today’s streak bonus! Come back tomorrow.');
    }

    setClaiming(true);
    try {
      const res = await api.streak.claimDaily();
      const rewardCoins = res.data?.rewardCoins || todayReward;
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.streakStatus }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.walletBalance }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile }),
      ]);
      Alert.alert('Streak Extended! 🔥', `You received +${rewardCoins} coins! Keep your streak burning tomorrow!`);
    } catch (err: any) {
      Alert.alert('Claim Failed', err?.response?.data?.message || 'Could not claim daily streak');
    } finally {
      setClaiming(false);
    }
  };

  // Handle buying streak freeze
  const handleBuyFreeze = async () => {
    const cost = 200;
    if (balance < cost) {
      return Alert.alert('Insufficient Coins', `You need ${cost} coins to buy a Streak Freeze. Your balance is ${balance} coins.`);
    }

    setBuyingFreeze(true);
    try {
      await api.streak.buyFreeze();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.streakStatus }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.walletBalance }),
      ]);
      Alert.alert('Streak Freeze Acquired! 🧊', 'You now have extra protection. If you miss a day, your streak will be safely preserved!');
    } catch (err: any) {
      Alert.alert('Purchase Failed', err?.response?.data?.message || 'Could not buy streak freeze');
    } finally {
      setBuyingFreeze(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 20 }}>🔥</Text>
              <Text style={styles.title}>Daily Login Streak</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
            {/* Banner */}
            <LinearGradient
              colors={['#7c2d12', '#431407', '#0f172a']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.banner}
            >
              <View style={styles.streakBadge}>
                <Text style={{ fontSize: 36 }}>🔥</Text>
                <View>
                  <Text style={styles.streakCount}>{currentStreak} Days</Text>
                  <Text style={styles.streakSub}>
                    {claimedToday ? 'Streak active today!' : 'Keep the flame alive today!'}
                  </Text>
                </View>
              </View>

              <View style={styles.bannerStatsRow}>
                <View style={styles.bannerStatItem}>
                  <Text style={styles.bannerStatLabel}>Longest Streak</Text>
                  <Text style={styles.bannerStatValue}>{longestStreak} Days 🏆</Text>
                </View>
                <View style={styles.bannerStatDivider} />
                <View style={styles.bannerStatItem}>
                  <Text style={styles.bannerStatLabel}>Streak Freezes</Text>
                  <Text style={styles.bannerStatValue}>{streakFreezes} Active 🧊</Text>
                </View>
              </View>
            </LinearGradient>

            {/* 7-Day Rewards Schedule */}
            <Text style={styles.sectionTitle}>7-Day Reward Cycle</Text>
            <View style={styles.daysGrid}>
              {rewardsSchedule.map((coins: number, index: number) => {
                const dayNum = index + 1;
                const isPast = dayNum < currentDayInCycle || (dayNum === currentDayInCycle && claimedToday);
                const isCurrent = dayNum === currentDayInCycle && !claimedToday;
                const isBigReward = dayNum === 7;

                return (
                  <View
                    key={dayNum}
                    style={[
                      styles.dayBox,
                      isCurrent && styles.dayBoxCurrent,
                      isPast && styles.dayBoxPast,
                      isBigReward && styles.dayBoxBig,
                    ]}
                  >
                    <Text style={[styles.dayLabel, isCurrent && styles.dayLabelCurrent]}>
                      Day {dayNum}
                    </Text>
                    <Text style={{ fontSize: isBigReward ? 22 : 18, marginVertical: 3 }}>
                      {isPast ? '✅' : isBigReward ? '🎁' : '🪙'}
                    </Text>
                    <Text
                      style={[
                        styles.dayRewardText,
                        isCurrent && styles.dayRewardCurrent,
                        isBigReward && { color: colors.secondary },
                      ]}
                    >
                      +{coins}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Claim Action Button */}
            <TouchableOpacity
              style={[
                styles.claimBtn,
                claimedToday && styles.claimBtnDone,
              ]}
              onPress={handleClaimDaily}
              disabled={claimedToday || claiming}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  claimedToday
                    ? ['#334155', '#1e293b']
                    : ['#f97316', '#ea580c']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.claimGradient}
              >
                {claiming ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <>
                    <Text style={{ fontSize: 18 }}>{claimedToday ? '✅' : '🔥'}</Text>
                    <Text style={styles.claimBtnText}>
                      {claimedToday
                        ? 'Claimed Today! Next reward tomorrow'
                        : `Claim Day ${currentDayInCycle} Bonus (+${todayReward} Coins)`}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Streak Freeze Section */}
            <View style={styles.freezeCard}>
              <View style={styles.freezeHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                  <Text style={{ fontSize: 24 }}>🧊</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.freezeTitle}>Streak Freeze</Text>
                    <Text style={styles.freezeDesc}>
                      Missed playing yesterday? A freeze protects your streak so it doesn't reset to zero!
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.freezeActionRow}>
                <View style={styles.freezeCountBadge}>
                  <Text style={styles.freezeCountText}>{streakFreezes} Equipped</Text>
                </View>

                <TouchableOpacity
                  style={styles.buyFreezeBtn}
                  onPress={handleBuyFreeze}
                  disabled={buyingFreeze}
                  activeOpacity={0.8}
                >
                  {buyingFreeze ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <>
                      <Ionicons name="cart-outline" size={16} color={colors.white} />
                      <Text style={styles.buyFreezeText}>Buy (200 🪙)</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  card: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: spacing.lg,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.labelLg,
    fontSize: 18,
    color: colors.white,
    fontWeight: '700',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  banner: {
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.35)',
    marginBottom: spacing.md,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  streakCount: {
    ...typography.headlineMd,
    fontSize: 24,
    color: colors.white,
    fontWeight: '800',
  },
  streakSub: {
    ...typography.bodyMd,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  bannerStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
  bannerStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  bannerStatLabel: {
    ...typography.labelSm,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.65)',
  },
  bannerStatValue: {
    ...typography.labelMd,
    fontSize: 13,
    color: colors.white,
    fontWeight: '700',
    marginTop: 2,
  },
  bannerStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  sectionTitle: {
    ...typography.labelMd,
    fontSize: 13,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.md,
  },
  dayBox: {
    width: '23%',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: borderRadius.md,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  dayBoxCurrent: {
    backgroundColor: 'rgba(249, 115, 22, 0.18)',
    borderColor: '#f97316',
    borderWidth: 1.5,
  },
  dayBoxPast: {
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    borderColor: 'rgba(34, 197, 94, 0.35)',
  },
  dayBoxBig: {
    width: '27%',
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    borderColor: 'rgba(234, 179, 8, 0.4)',
  },
  dayLabel: {
    ...typography.labelSm,
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  dayLabelCurrent: {
    color: '#f97316',
    fontWeight: '700',
  },
  dayRewardText: {
    ...typography.labelSm,
    fontSize: 11,
    color: colors.white,
    fontWeight: '600',
  },
  dayRewardCurrent: {
    color: '#f97316',
    fontWeight: '700',
  },
  claimBtn: {
    borderRadius: borderRadius.pill,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  claimBtnDone: {
    opacity: 0.85,
  },
  claimGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
  },
  claimBtnText: {
    ...typography.labelMd,
    fontSize: 14,
    color: colors.white,
    fontWeight: '700',
  },
  freezeCard: {
    backgroundColor: 'rgba(14, 165, 233, 0.08)',
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.25)',
  },
  freezeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  freezeTitle: {
    ...typography.labelMd,
    fontSize: 14,
    color: colors.white,
    fontWeight: '700',
  },
  freezeDesc: {
    ...typography.bodySm,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.65)',
    marginTop: 2,
    lineHeight: 15,
  },
  freezeActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  freezeCountBadge: {
    backgroundColor: 'rgba(14, 165, 233, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
  },
  freezeCountText: {
    ...typography.labelSm,
    fontSize: 11,
    color: '#38bdf8',
    fontWeight: '600',
  },
  buyFreezeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0284c7',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: borderRadius.pill,
  },
  buyFreezeText: {
    ...typography.labelSm,
    fontSize: 12,
    color: colors.white,
    fontWeight: '700',
  },
});
