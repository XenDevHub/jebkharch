import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../theme/designSystem';
import { api } from '../api/client';

export default function ReferralScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [referralData, setReferralData] = useState<any>(null);

  useEffect(() => {
    fetchReferral();
  }, []);

  const fetchReferral = async () => {
    try {
      const res = await api.referral.getMyCode();
      setReferralData(res.data);
    } catch (e) {
      console.log('Error fetching referral code', e);
    } finally {
      setLoading(false);
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
        <Text style={styles.headerTitle}>Refer & Earn</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Invite Friends, Get Free Coins!</Text>
          <Text style={styles.cardDesc}>
            Share your code. When a friend signs up using it, you both get 50 bonus coins instantly!
          </Text>

          <View style={styles.codeBox}>
            <Text style={styles.codeText}>{referralData?.code || 'ERROR'}</Text>
          </View>
          
          <TouchableOpacity style={styles.shareBtn} onPress={() => Alert.alert('Copied!', 'Referral code copied to clipboard.')}>
            <Ionicons name="copy-outline" size={20} color={colors.onPrimary} />
            <Text style={styles.shareBtnText}>Copy Code</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{referralData?.totalReferrals || 0}</Text>
            <Text style={styles.statLabel}>Friends Invited</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{referralData?.totalRewardEarned || 0}</Text>
            <Text style={styles.statLabel}>Coins Earned</Text>
          </View>
        </View>
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
  card: {
    backgroundColor: colors.surfaceCard, padding: spacing.lg, borderRadius: borderRadius.xl,
    borderWidth: 1, borderColor: colors.glassBorder, alignItems: 'center',
  },
  cardTitle: { ...typography.headlineSm, color: colors.white, marginBottom: spacing.xs },
  cardDesc: { ...typography.bodyMd, color: colors.onSurfaceVariant, textAlign: 'center', marginBottom: spacing.lg },
  codeBox: {
    backgroundColor: `${colors.primary}15`, paddingHorizontal: 30, paddingVertical: 15,
    borderRadius: borderRadius.md, borderWidth: 1, borderColor: `${colors.primary}40`,
    marginBottom: spacing.md,
  },
  codeText: { ...typography.displaySm, color: colors.primary, letterSpacing: 2 },
  shareBtn: {
    backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: borderRadius.pill, gap: 8,
  },
  shareBtnText: { ...typography.labelMd, color: colors.onPrimary },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statCard: {
    flex: 1, backgroundColor: colors.surfaceCard, padding: spacing.md,
    borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.glassBorder, alignItems: 'center',
  },
  statValue: { ...typography.headlineMd, color: colors.secondary },
  statLabel: { ...typography.labelSm, color: colors.onSurfaceVariant, marginTop: 4 },
});
