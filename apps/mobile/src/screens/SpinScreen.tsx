import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../theme/designSystem';
import { api } from '../api/client';

export default function SpinScreen({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const [rewardTitle, setRewardTitle] = useState('');

  const handleSpin = async () => {
    setLoading(true);
    try {
      const res = await api.bonus.spinWheel();
      setRewardTitle(res.data.title);
      Alert.alert('Congratulations! 🎉', `You won: ${res.data.title}`);
    } catch (e: any) {
      Alert.alert('Oops!', e.response?.data?.message || 'Failed to spin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daily Spin</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.wheelCircle}>
          <Text style={{ fontSize: 60 }}>🎡</Text>
        </View>

        <Text style={styles.title}>Test Your Luck!</Text>
        <Text style={styles.desc}>Spin the wheel once a day to win Coins, Tournament Tickets, XP, or Streak Freezes!</Text>

        {rewardTitle ? (
          <View style={styles.rewardBox}>
            <Text style={styles.rewardText}>You won: {rewardTitle}</Text>
          </View>
        ) : null}

        <TouchableOpacity style={styles.spinBtn} onPress={handleSpin} disabled={loading}>
          {loading ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={styles.spinBtnText}>Spin Now</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 50, paddingHorizontal: spacing.md, paddingBottom: spacing.md,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.glassBorder
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 20, backgroundColor: colors.surfaceCard },
  headerTitle: { ...typography.headlineSm, color: colors.white },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  wheelCircle: { width: 150, height: 150, borderRadius: 75, backgroundColor: `${colors.primary}20`, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.xl },
  title: { ...typography.headlineMd, color: colors.white, marginBottom: spacing.sm },
  desc: { ...typography.bodyMd, color: colors.onSurfaceVariant, textAlign: 'center', marginBottom: spacing.xl },
  spinBtn: { backgroundColor: colors.primary, paddingHorizontal: 40, paddingVertical: 16, borderRadius: borderRadius.pill },
  spinBtnText: { ...typography.labelLg, color: colors.onPrimary },
  rewardBox: { backgroundColor: `${colors.secondary}20`, padding: spacing.md, borderRadius: borderRadius.md, marginBottom: spacing.xl, borderWidth: 1, borderColor: colors.secondary },
  rewardText: { ...typography.labelMd, color: colors.secondary },
});
