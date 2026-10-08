import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../theme/designSystem';
import { api } from '../api/client';

export default function TeamsScreen({ navigation }: any) {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTeamName, setNewTeamName] = useState('');

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const res = await api.team.getTeams();
      setTeams(res.data.data);
    } catch (e) {
      console.log('Error fetching teams', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return Alert.alert('Error', 'Enter a team name');
    try {
      await api.team.createTeam(newTeamName, 'A new powerful clan!');
      Alert.alert('Success', 'Team created! 🏆');
      setNewTeamName('');
      fetchTeams();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to create team');
    }
  };

  const handleJoinTeam = async (id: string) => {
    try {
      await api.team.joinTeam(id);
      Alert.alert('Success', 'Joined the team! 🤝');
      fetchTeams();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to join team');
    }
  };

  const handleLeaveTeam = async () => {
    try {
      await api.team.leaveTeam();
      Alert.alert('Success', 'Left the team.');
      fetchTeams();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to leave team');
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
        <Text style={styles.headerTitle}>Clans & Teams</Text>
        <TouchableOpacity onPress={handleLeaveTeam} style={styles.leaveBtn}>
          <Ionicons name="exit-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.createCard}>
          <Text style={styles.createTitle}>Create a New Team</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Team Name (e.g. Lahore Legends)"
              placeholderTextColor={colors.onSurfaceMuted}
              value={newTeamName}
              onChangeText={setNewTeamName}
            />
            <TouchableOpacity style={styles.createBtn} onPress={handleCreateTeam}>
              <Text style={styles.createBtnText}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Top Teams</Text>
        {teams.map((t, idx) => (
          <View key={t.id} style={styles.teamCard}>
            <View style={styles.rankBox}>
              <Text style={styles.rankText}>#{idx + 1}</Text>
            </View>
            <View style={styles.teamInfo}>
              <Text style={styles.teamName}>{t.name}</Text>
              <Text style={styles.teamScore}>Score: {t.score} 🏆  •  {t._count?.members || 0} Members</Text>
            </View>
            <TouchableOpacity style={styles.joinBtn} onPress={() => handleJoinTeam(t.id)}>
              <Text style={styles.joinBtnText}>Join</Text>
            </TouchableOpacity>
          </View>
        ))}
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
  leaveBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 20, backgroundColor: `${colors.error}15` },
  headerTitle: { ...typography.headlineSm, color: colors.white },
  content: { padding: spacing.md, gap: spacing.md },
  createCard: { backgroundColor: colors.surfaceCard, padding: spacing.md, borderRadius: borderRadius.xl, borderWidth: 1, borderColor: colors.glassBorder },
  createTitle: { ...typography.labelMd, color: colors.white, marginBottom: spacing.sm },
  inputRow: { flexDirection: 'row', gap: spacing.sm },
  input: { flex: 1, backgroundColor: `${colors.surfaceVariant}80`, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, color: colors.white, borderWidth: 1, borderColor: colors.glassBorder },
  createBtn: { backgroundColor: colors.primary, justifyContent: 'center', paddingHorizontal: spacing.md, borderRadius: borderRadius.md },
  createBtnText: { ...typography.labelMd, color: colors.onPrimary },
  sectionTitle: { ...typography.headlineSm, color: colors.white, marginTop: spacing.md },
  teamCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceCard, padding: spacing.md, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.glassBorder },
  rankBox: { width: 40, height: 40, backgroundColor: `${colors.secondary}20`, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  rankText: { ...typography.labelMd, color: colors.secondary },
  teamInfo: { flex: 1 },
  teamName: { ...typography.labelMd, color: colors.white, fontSize: 16 },
  teamScore: { ...typography.bodySm, color: colors.onSurfaceVariant, marginTop: 2 },
  joinBtn: { backgroundColor: `${colors.primary}20`, paddingHorizontal: 16, paddingVertical: 8, borderRadius: borderRadius.pill },
  joinBtnText: { ...typography.labelSm, color: colors.primary },
});
