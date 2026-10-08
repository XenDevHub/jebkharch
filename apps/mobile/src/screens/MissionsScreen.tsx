import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../theme/designSystem';
import { api } from '../api/client';

export default function MissionsScreen({ navigation }: any) {
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    try {
      const res = await api.missions.getMissions();
      setMissions(res.data);
    } catch (e) {
      console.log('Error fetching missions', e);
    } finally {
      setLoading(false);
    }
  };

  const claimReward = async (id: string) => {
    try {
      const res = await api.missions.claimMission(id);
      Alert.alert('Success', `Claimed ${res.data.rewardCoins} coins!`);
      fetchMissions();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Could not claim reward.');
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
        <Text style={styles.headerTitle}>Missions & Achievements</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {missions.map((um) => {
          const m = um.mission;
          const isComplete = um.progress >= m.targetValue;
          const isClaimed = um.status === 'COMPLETED';

          return (
            <View key={um.id} style={styles.card}>
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
                  <View style={[styles.progressFill, { width: `${Math.min(100, (um.progress / m.targetValue) * 100)}%` }]} />
                </View>
                <Text style={styles.progressText}>{um.progress}/{m.targetValue}</Text>
              </View>

              <View style={styles.actionRow}>
                <Text style={styles.rewardText}>Reward: {m.rewardCoins} Coins {m.rewardTickets > 0 ? `+ ${m.rewardTickets} Ticket` : ''}</Text>
                {isClaimed ? (
                  <View style={styles.claimedBtn}>
                    <Text style={styles.claimedBtnText}>Claimed</Text>
                  </View>
                ) : isComplete ? (
                  <TouchableOpacity style={styles.claimBtn} onPress={() => claimReward(um.id)}>
                    <Text style={styles.claimBtnText}>Claim</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.pendingBtn}>
                    <Text style={styles.pendingBtnText}>In Progress</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
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
  card: { backgroundColor: colors.surfaceCard, borderRadius: borderRadius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.glassBorder },
  cardTop: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.sm },
  iconBox: { width: 50, height: 50, backgroundColor: `${colors.primary}20`, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1 },
  cardTitle: { ...typography.labelMd, color: colors.white, fontSize: 16 },
  cardDesc: { ...typography.bodySm, color: colors.onSurfaceVariant },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  progressBar: { flex: 1, height: 8, backgroundColor: `${colors.white}10`, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary },
  progressText: { ...typography.labelSm, color: colors.white },
  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rewardText: { ...typography.labelSm, color: colors.secondary },
  claimBtn: { backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 6, borderRadius: borderRadius.pill },
  claimBtnText: { ...typography.labelSm, color: colors.onPrimary },
  claimedBtn: { backgroundColor: `${colors.white}10`, paddingHorizontal: 16, paddingVertical: 6, borderRadius: borderRadius.pill },
  claimedBtnText: { ...typography.labelSm, color: colors.onSurfaceVariant },
  pendingBtn: { backgroundColor: 'transparent', paddingHorizontal: 16, paddingVertical: 6, borderRadius: borderRadius.pill, borderWidth: 1, borderColor: colors.glassBorder },
  pendingBtnText: { ...typography.labelSm, color: colors.onSurfaceVariant },
});
