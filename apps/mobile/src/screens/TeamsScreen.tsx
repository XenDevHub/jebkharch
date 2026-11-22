import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../theme/designSystem';
import { api } from '../api/client';
import { LinearGradient } from 'expo-linear-gradient';

export default function TeamsScreen({ navigation }: any) {
  const [teams, setTeams] = useState<any[]>([]);
  const [myTeam, setMyTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newTeamName, setNewTeamName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [teamsRes, profileRes] = await Promise.all([
        api.team.getTeams(),
        api.user.getProfile().catch(() => null),
      ]);
      setTeams(teamsRes.data?.data || []);
      if (profileRes?.data?.team) {
        setMyTeam(profileRes.data.team);
      } else if (profileRes?.data?.teamId) {
        const found = (teamsRes.data?.data || []).find((t: any) => t.id === profileRes.data.teamId);
        setMyTeam(found || null);
      } else {
        setMyTeam(null);
      }
    } catch (e) {
      console.log('Error loading teams data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return Alert.alert('Error', 'Please enter a team name');
    if (myTeam) {
      return Alert.alert('Already in Clan', 'You are already in a clan. Leave your current clan first to create a new one.');
    }
    setCreating(true);
    try {
      await api.team.createTeam(newTeamName.trim(), 'Competitive Quiz Squad');
      Alert.alert('Success', 'Clan created successfully! 🏆');
      setNewTeamName('');
      loadData();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to create team');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinTeam = async (id: string, name: string) => {
    if (myTeam) {
      return Alert.alert('Already in Clan', `You are already a member of "${myTeam.name}". Leave it first to join "${name}".`);
    }
    try {
      await api.team.joinTeam(id);
      Alert.alert('Success', `Joined "${name}"! 🤝`);
      loadData();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to join team');
    }
  };

  const handleLeaveTeam = async () => {
    if (!myTeam) return;
    Alert.alert(
      'Leave Clan',
      `Are you sure you want to leave "${myTeam.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.team.leaveTeam();
              setMyTeam(null);
              Alert.alert('Success', 'You have left the clan.');
              loadData();
            } catch (e: any) {
              Alert.alert('Error', e.response?.data?.message || 'Failed to leave team');
            }
          },
        },
      ]
    );
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
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Clans & Teams</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* My Clan Status Card */}
        {myTeam ? (
          <LinearGradient
            colors={['#064e3b', '#022c22', '#0f172a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.myClanCard}
          >
            <View style={styles.myClanHeader}>
              <View style={styles.myClanBadge}>
                <Ionicons name="shield-checkmark" size={16} color="#34d399" />
                <Text style={styles.myClanBadgeText}>YOUR ACTIVE CLAN</Text>
              </View>
              <TouchableOpacity onPress={handleLeaveTeam} style={styles.leaveBtnSmall}>
                <Ionicons name="exit-outline" size={14} color={colors.error} />
                <Text style={styles.leaveBtnText}>Leave</Text>
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <Text style={styles.myClanName}>{myTeam.name}</Text>
              {myTeam.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#38bdf8" />
                  <Text style={styles.verifiedText}>Official</Text>
                </View>
              )}
            </View>
            <Text style={styles.myClanDesc}>{myTeam.description || 'Competing for top leaderboard rank'}</Text>

            <View style={styles.myClanStatsRow}>
              <View style={styles.myClanStatItem}>
                <Text style={styles.myClanStatLabel}>Clan Score</Text>
                <Text style={styles.myClanStatValue}>🏆 {myTeam.score || 0}</Text>
              </View>
              <View style={styles.myClanDivider} />
              <View style={styles.myClanStatItem}>
                <Text style={styles.myClanStatLabel}>Members</Text>
                <Text style={styles.myClanStatValue}>👥 {myTeam._count?.members ?? 1}</Text>
              </View>
            </View>
          </LinearGradient>
        ) : (
          <View style={styles.noClanCard}>
            <Ionicons name="shield-outline" size={32} color="#f59e0b" style={{ alignSelf: 'center', marginBottom: 6 }} />
            <Text style={styles.noClanTitle}>You haven't joined a Clan yet!</Text>
            <Text style={styles.noClanSubtitle}>
              Join a clan below to pool your quiz points with teammates and win season rewards!
            </Text>
          </View>
        )}

        {/* Create Clan Card */}
        {!myTeam && (
          <View style={styles.createCard}>
            <Text style={styles.createTitle}>🛡️ Create Your Own Clan</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Clan Name (e.g. Lahore Legends)"
                placeholderTextColor={colors.onSurfaceMuted}
                value={newTeamName}
                onChangeText={setNewTeamName}
                maxLength={30}
              />
              <TouchableOpacity
                style={[styles.createBtn, creating && { opacity: 0.6 }]}
                onPress={handleCreateTeam}
                disabled={creating}
              >
                <Text style={styles.createBtnText}>{creating ? '...' : 'Create'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Top Leaderboard Clans */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🏆 Top Clans Leaderboard</Text>
          <Text style={styles.sectionCount}>{teams.length} Clans</Text>
        </View>

        {teams.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No clans created yet. Be the first to create one!</Text>
          </View>
        ) : (
          teams.map((t, idx) => {
            const isMyTeam = myTeam?.id === t.id;
            return (
              <View key={t.id} style={[styles.teamCard, isMyTeam && styles.myTeamCardBorder]}>
                <View style={[styles.rankBox, idx === 0 && styles.rankGold, idx === 1 && styles.rankSilver, idx === 2 && styles.rankBronze]}>
                  <Text style={[styles.rankText, idx < 3 && styles.rankTopText]}>#{idx + 1}</Text>
                </View>

                <View style={styles.teamInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <Text style={styles.teamName}>{t.name}</Text>
                    {t.isVerified && (
                      <View style={styles.verifiedBadge}>
                        <Ionicons name="checkmark-circle" size={13} color="#38bdf8" />
                        <Text style={styles.verifiedText}>Official</Text>
                      </View>
                    )}
                    {isMyTeam && (
                      <View style={styles.activePill}>
                        <Text style={styles.activePillText}>You</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.teamScore}>
                    Score: {t.score ?? 0} 🏆  •  {t._count?.members || 1} Members
                  </Text>
                </View>

                {isMyTeam ? (
                  <View style={styles.joinedBadge}>
                    <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                    <Text style={styles.joinedBadgeText}>Joined</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.joinBtn, myTeam && { opacity: 0.4 }]}
                    onPress={() => handleJoinTeam(t.id, t.name)}
                  >
                    <Text style={styles.joinBtnText}>Join</Text>
                  </TouchableOpacity>
                )}
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
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: 40 },

  // My Clan Card
  myClanCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
    shadowColor: '#10b981',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  myClanHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  myClanBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(52, 211, 153, 0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  myClanBadgeText: { fontSize: 10, fontWeight: '700', color: '#34d399', letterSpacing: 0.5 },
  leaveBtnSmall: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(239, 68, 68, 0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  leaveBtnText: { fontSize: 11, fontWeight: '600', color: colors.error },
  myClanName: { fontSize: 20, fontWeight: '800', color: colors.white, marginTop: 4 },
  myClanDesc: { fontSize: 12, color: colors.onSurfaceMuted, marginTop: 2 },
  myClanStatsRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  myClanStatItem: { flex: 1, alignItems: 'center' },
  myClanStatLabel: { fontSize: 10, color: colors.onSurfaceMuted, textTransform: 'uppercase', fontWeight: '600' },
  myClanStatValue: { fontSize: 16, fontWeight: '800', color: colors.white, marginTop: 2 },
  myClanDivider: { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.1)' },

  // No clan
  noClanCard: { backgroundColor: colors.surfaceCard, padding: spacing.md, borderRadius: borderRadius.xl, borderWidth: 1, borderColor: colors.glassBorder, textAlign: 'center' },
  noClanTitle: { ...typography.labelMd, color: colors.white, textAlign: 'center' },
  noClanSubtitle: { fontSize: 12, color: colors.onSurfaceMuted, textAlign: 'center', marginTop: 4, lineHeight: 16 },

  // Create
  createCard: { backgroundColor: colors.surfaceCard, padding: spacing.md, borderRadius: borderRadius.xl, borderWidth: 1, borderColor: colors.glassBorder },
  createTitle: { ...typography.labelMd, color: colors.white, marginBottom: spacing.sm },
  inputRow: { flexDirection: 'row', gap: spacing.sm },
  input: { flex: 1, backgroundColor: `${colors.surfaceVariant}80`, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, color: colors.white, borderWidth: 1, borderColor: colors.glassBorder, fontSize: 13 },
  createBtn: { backgroundColor: colors.primary, justifyContent: 'center', paddingHorizontal: spacing.md, borderRadius: borderRadius.md },
  createBtnText: { ...typography.labelMd, color: colors.onPrimary, fontWeight: '700' },

  // Section Header
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  sectionTitle: { ...typography.labelMd, color: colors.white, fontSize: 15 },
  sectionCount: { fontSize: 12, color: colors.onSurfaceMuted },

  emptyCard: { padding: spacing.xl, alignItems: 'center', backgroundColor: colors.surfaceCard, borderRadius: borderRadius.lg },
  emptyText: { color: colors.onSurfaceMuted, fontSize: 12, textAlign: 'center' },

  // Team list
  teamCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceCard, padding: spacing.md, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.glassBorder },
  myTeamCardBorder: { borderColor: 'rgba(52, 211, 153, 0.4)', backgroundColor: 'rgba(6, 78, 59, 0.2)' },
  rankBox: { width: 38, height: 38, backgroundColor: `${colors.secondary}15`, borderRadius: 19, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  rankGold: { backgroundColor: 'rgba(234, 179, 8, 0.25)' },
  rankSilver: { backgroundColor: 'rgba(148, 163, 184, 0.25)' },
  rankBronze: { backgroundColor: 'rgba(202, 138, 4, 0.25)' },
  rankText: { fontSize: 13, fontWeight: '700', color: colors.secondary },
  rankTopText: { color: colors.white, fontWeight: '800' },
  teamInfo: { flex: 1 },
  teamName: { ...typography.labelMd, color: colors.white, fontSize: 15 },
  teamScore: { ...typography.bodySm, color: colors.onSurfaceVariant, marginTop: 2, fontSize: 12 },
  activePill: { backgroundColor: '#10b981', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6 },
  activePillText: { color: '#000', fontSize: 9, fontWeight: '800' },
  joinBtn: { backgroundColor: `${colors.primary}25`, borderWidth: 1, borderColor: colors.primary, paddingHorizontal: 16, paddingVertical: 7, borderRadius: borderRadius.pill },
  joinBtnText: { ...typography.labelSm, color: colors.primary, fontWeight: '700' },
  joinedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: borderRadius.pill },
  joinedBadgeText: { color: '#10b981', fontSize: 11, fontWeight: '700' },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#38bdf8',
    letterSpacing: 0.3,
  },
});
