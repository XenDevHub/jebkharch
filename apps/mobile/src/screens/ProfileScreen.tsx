// src/screens/ProfileScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors, typography, spacing } from '../theme/designSystem';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/client';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Profile'>;
};

export default function ProfileScreen({ navigation }: Props) {
  const [balance, setBalance] = useState<number>(0);
  const [phone, setPhone] = useState<string>('');

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const storedPhone = await AsyncStorage.getItem('user_phone');
      if (storedPhone) setPhone(storedPhone);

      const walletRes = await api.wallet.getBalance();
      if (walletRes.data?.balance !== undefined) {
        setBalance(walletRes.data.balance);
      }
    } catch (e) {
      console.log('Error fetching profile data', e);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.multiRemove(['auth_token', 'user_phone']);
            navigation.reset({
              index: 0,
              routes: [{ name: 'PhoneAuth' }],
            });
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* User Card */}
        <LinearGradient
          colors={[colors.primary, '#006b4b']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileCard}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{phone ? phone.slice(-2) : 'U'}</Text>
          </View>
          <Text style={styles.userName}>Player</Text>
          <Text style={styles.userPhone}>{phone || 'User'}</Text>

          <View style={styles.balanceBadge}>
            <Ionicons name="star" size={18} color={colors.secondary} />
            <Text style={styles.balanceText}>{balance} Coins</Text>
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.menuGroup}>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Wallet')}>
            <View style={[styles.menuIconContainer, { backgroundColor: `${colors.secondary}20` }]}>
              <Ionicons name="wallet-outline" size={22} color={colors.secondary} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>My Wallet & Withdraw</Text>
              <Text style={styles.menuSubtitle}>Check balance & request payout</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.onSurfaceVariant} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('WithdrawalHistory')}>
            <View style={[styles.menuIconContainer, { backgroundColor: '#f59e0b20' }]}>
              <Ionicons name="time-outline" size={22} color="#f59e0b" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Withdrawal History</Text>
              <Text style={styles.menuSubtitle}>View past payout requests and status</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.onSurfaceVariant} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Leaderboard')}>
            <View style={[styles.menuIconContainer, { backgroundColor: '#ff475720' }]}>
              <Ionicons name="trophy-outline" size={22} color="#ff4757" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Leaderboard & Ranks</Text>
              <Text style={styles.menuSubtitle}>Check global rankings and top players</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.onSurfaceVariant} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Home')}>
            <View style={[styles.menuIconContainer, { backgroundColor: `${colors.primary}20` }]}>
              <Ionicons name="game-controller-outline" size={22} color={colors.primary} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Play Games</Text>
              <Text style={styles.menuSubtitle}>Browse all active quiz categories</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Performance Stats</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Total Wins</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>45</Text>
              <Text style={styles.statLabel}>Games Played</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>#14</Text>
              <Text style={styles.statLabel}>Global Rank</Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#ff4757" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl * 2,
    paddingBottom: spacing.md,
  },
  backBtn: {
    padding: spacing.sm,
    backgroundColor: `${colors.surfaceVariant}50`,
    borderRadius: 12,
  },
  headerTitle: {
    ...typography.headlineMd,
    color: '#fff',
  },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing.xl * 2,
  },
  profileCard: {
    alignItems: 'center',
    padding: spacing.xl,
    borderRadius: 24,
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarText: {
    ...typography.displayLg,
    fontSize: 28,
    color: '#fff',
  },
  userName: {
    ...typography.headlineMd,
    color: '#fff',
    fontSize: 22,
  },
  userPhone: {
    ...typography.bodyLg,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: spacing.md,
  },
  balanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  balanceText: {
    ...typography.labelMd,
    color: colors.secondary,
    fontSize: 16,
  },
  menuGroup: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.surfaceVariant}40`,
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: `${colors.onSurface}10`,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    ...typography.labelMd,
    fontSize: 16,
    color: '#fff',
  },
  menuSubtitle: {
    ...typography.bodyLg,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  statsContainer: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.headlineMd,
    fontSize: 18,
    color: '#fff',
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statBox: {
    flex: 1,
    backgroundColor: `${colors.surfaceVariant}40`,
    padding: spacing.md,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${colors.onSurface}10`,
  },
  statValue: {
    ...typography.headlineMd,
    fontSize: 20,
    color: '#fff',
  },
  statLabel: {
    ...typography.bodyLg,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff475715',
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ff475740',
    gap: 8,
  },
  logoutText: {
    ...typography.labelMd,
    color: '#ff4757',
    fontSize: 16,
  },
});
