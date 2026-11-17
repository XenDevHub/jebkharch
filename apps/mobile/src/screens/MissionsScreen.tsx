import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../theme/designSystem';
import { api } from '../api/client';

export default function MissionsScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<'missions' | 'achievements'>('missions');
  const [missions, setMissions] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [missionsRes, achRes] = await Promise.all([
        api.missions.getMissions(),
        api.missions.getAchievements(),
      ]);
      setMissions(missionsRes.data || []);
      setAchievements(achRes.data || []);
    } catch (e) {
      console.log('Error fetching missions/achievements', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const claimReward = async (id: string) => {
    try {
      const res = await api.missions.claimMission(id);
      Alert.alert('Mubarak!', `Aap ko ${res.data.rewardCoins} coins reward mila!`);
      fetchData();
    } catch (e: any) {
      Alert.alert('Notice', e.response?.data?.message || 'Reward claim nahi ho saka.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const claimableCount = missions.filter(
    (um) => um.progress >= um.mission.targetValue && um.status !== 'COMPLETED'
  ).length;

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Missions & Achievements</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'missions' && styles.tabBtnActive]}
          onPress={() => setActiveTab('missions')}
        >
          <Text style={[styles.tabText, activeTab === 'missions' && styles.tabTextActive]}>
            🎯 Missions {claimableCount > 0 ? `(${claimableCount} Ready)` : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'achievements' && styles.tabBtnActive]}
          onPress={() => setActiveTab('achievements')}
        >
          <Text style={[styles.tabText, activeTab === 'achievements' && styles.tabTextActive]}>
            🏆 Achievements ({unlockedCount}/{achievements.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {activeTab === 'missions' ? (
          missions.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyEmoji}>🎯</Text>
              <Text style={styles.emptyTitle}>Koi active mission nahi hai</Text>
              <Text style={styles.emptyDesc}>Naye missions jald hi dastyab honge!</Text>
            </View>
          ) : (
            missions.map((um) => {
              const m = um.mission;
              const isComplete = um.progress >= m.targetValue;
              const isClaimed = um.status === 'COMPLETED';

              return (
                <View key={um.id} style={[styles.card, isComplete && !isClaimed && styles.cardHighlight]}>
                  <View style={styles.cardTop}>
                    <View style={styles.iconBox}>
                      <Text style={{ fontSize: 24 }}>{m.icon || '🎯'}</Text>
                    </View>
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardTitle}>{m.title}</Text>
                      <Text style={styles.cardDesc}>{m.description}</Text>
                    </View>
                  </View>

                  <View style={styles.progressRow}>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${Math.min(100, (um.progress / m.targetValue) * 100)}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {um.progress}/{m.targetValue}
                    </Text>
                  </View>

                  <View style={styles.actionRow}>
                    <Text style={styles.rewardText}>
                      Reward: +{m.rewardCoins} Coins {m.rewardTickets > 0 ? `+ ${m.rewardTickets} Ticket` : ''}
                    </Text>
                    {isClaimed ? (
                      <View style={styles.claimedBtn}>
                        <Text style={styles.claimedBtnText}>Claimed ✅</Text>
                      </View>
                    ) : isComplete ? (
                      <TouchableOpacity style={styles.claimBtn} onPress={() => claimReward(um.id)}>
                        <Text style={styles.claimBtnText}>Claim Reward</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.pendingBtn}>
                        <Text style={styles.pendingBtnText}>In Progress</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })
          )
        ) : achievements.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>🏆</Text>
            <Text style={styles.emptyTitle}>Koi achievements nahi hain</Text>
            <Text style={styles.emptyDesc}>Quiz khel kar achievements unlock karein!</Text>
          </View>
        ) : (
          achievements.map((a) => {
            return (
              <View
                key={a.id}
                style={[styles.card, a.unlocked ? styles.achievementUnlockedCard : styles.achievementLockedCard]}
              >
                <View style={styles.cardTop}>
                  <View style={[styles.iconBox, a.unlocked ? styles.iconBoxUnlocked : styles.iconBoxLocked]}>
                    <Text style={{ fontSize: 26 }}>{a.icon || '🏆'}</Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={styles.cardTitle}>{a.title}</Text>
                      {a.unlocked ? (
                        <View style={styles.badgeUnlocked}>
                          <Text style={styles.badgeUnlockedText}>Unlocked</Text>
                        </View>
                      ) : (
                        <View style={styles.badgeLocked}>
                          <Text style={styles.badgeLockedText}>Locked 🔒</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.cardDesc}>{a.description}</Text>
                  </View>
                </View>

                <View style={styles.actionRow}>
                  <Text style={[styles.rewardText, a.unlocked && { color: colors.secondary }]}>
                    Reward: +{a.rewardCoins} Coins
                  </Text>
                  {a.unlocked && a.unlockedAt ? (
                    <Text style={styles.unlockedDateText}>
                      Earned {new Date(a.unlockedAt).toLocaleDateString()}
                    </Text>
                  ) : null}
                </View>
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
    paddingTop: 50, paddingHorizontal: spacing.md, paddingBottom: spacing.sm,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.glassBorder
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 20, backgroundColor: colors.surfaceCard },
  headerTitle: { ...typography.headlineSm, color: colors.white },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  tabBtnActive: {
    backgroundColor: `${colors.primary}25`,
    borderColor: colors.primary,
  },
  tabText: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.primary,
  },
  content: { padding: spacing.md, gap: spacing.md },
  card: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassBorder
  },
  cardHighlight: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  achievementUnlockedCard: {
    borderColor: `${colors.secondary}50`,
    backgroundColor: `${colors.secondary}08`,
  },
  achievementLockedCard: {
    opacity: 0.7,
  },
  cardTop: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.sm },
  iconBox: {
    width: 52,
    height: 52,
    backgroundColor: `${colors.primary}20`,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  iconBoxUnlocked: {
    backgroundColor: `${colors.secondary}25`,
  },
  iconBoxLocked: {
    backgroundColor: `${colors.white}10`,
  },
  cardInfo: { flex: 1, justifyContent: 'center' },
  cardTitle: { ...typography.labelMd, color: colors.white, fontSize: 16 },
  cardDesc: { ...typography.bodySm, color: colors.onSurfaceVariant, marginTop: 2 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  progressBar: { flex: 1, height: 8, backgroundColor: `${colors.white}10`, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary },
  progressText: { ...typography.labelSm, color: colors.white },
  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  rewardText: { ...typography.labelSm, color: colors.secondary, fontWeight: '600' },
  claimBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: borderRadius.pill,
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 3,
  },
  claimBtnText: { ...typography.labelSm, color: colors.onPrimary, fontWeight: '700' },
  claimedBtn: { backgroundColor: `${colors.white}10`, paddingHorizontal: 16, paddingVertical: 6, borderRadius: borderRadius.pill },
  claimedBtnText: { ...typography.labelSm, color: colors.onSurfaceVariant },
  pendingBtn: {
    backgroundColor: 'transparent',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: colors.glassBorder
  },
  pendingBtnText: { ...typography.labelSm, color: colors.onSurfaceVariant },
  badgeUnlocked: {
    backgroundColor: `${colors.secondary}20`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: `${colors.secondary}60`,
  },
  badgeUnlockedText: {
    fontSize: 11,
    color: colors.secondary,
    fontWeight: '700',
  },
  badgeLocked: {
    backgroundColor: `${colors.white}08`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
  },
  badgeLockedText: {
    fontSize: 11,
    color: colors.onSurfaceMuted,
  },
  unlockedDateText: {
    fontSize: 11,
    color: colors.onSurfaceMuted,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    ...typography.headlineSm,
    color: colors.white,
    marginBottom: 6,
  },
  emptyDesc: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
  },
});
