// src/screens/ProfileScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput, RefreshControl, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors, typography, spacing, borderRadius } from '../theme/designSystem';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import BottomNav from '../components/BottomNav';
import AnimatedNumber from '../components/AnimatedNumber';
import AvatarPickerModal from '../components/AvatarPickerModal';
import { useProfile, useWalletBalance, useInvalidateQueries, QUERY_KEYS } from '../hooks/useAppData';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Profile'>;
};

export default function ProfileScreen({ navigation }: Props) {
  const queryClient = useQueryClient();
  const { invalidateProfile } = useInvalidateQueries();

  // ── Cached queries — instant display, no loading flash ──
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: balance } = useWalletBalance();

  const [phone, setPhone] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);

  const handleSelectAvatar = async (avatarUrl: string) => {
    setSavingAvatar(true);
    try {
      await api.user.updateProfile({ avatarUrl });
      invalidateProfile();
      setShowAvatarModal(false);
      Alert.alert('Success', 'Avatar updated! Looking sharp! ✨');
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to update avatar');
    } finally {
      setSavingAvatar(false);
    }
  };

  // Sync edit fields when profile loads
  React.useEffect(() => {
    if (profile) {
      setEditName(profile.name || '');
      setEditEmail(profile.email || '');
    }
  }, [profile]);

  React.useEffect(() => {
    AsyncStorage.getItem('user_phone').then(p => { if (p) setPhone(p); });
  }, []);

  const handleSave = async () => {
    if (!editName.trim()) {
      Alert.alert('Validation Error', 'Name cannot be empty 😅');
      return;
    }
    try {
      await api.user.updateProfile({
        name: editName,
        email: editEmail || undefined,
      });
      Alert.alert('Success', 'Profile updated successfully! 🎉');
      setIsEditing(false);
      invalidateProfile(); // refresh cache
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Update failed');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile });
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.walletBalance });
    setRefreshing(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out from Jeb Kharch?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user_phone', 'hasSeenOnboarding']);
            queryClient.clear(); // Clear all cached data on logout
            navigation.reset({
              index: 0,
              routes: [{ name: 'PhoneAuth' }],
            });
          },
        },
      ]
    );
  };

  const displayName = profile?.name || 'Player';
  const displayBalance = balance ?? profile?.coins ?? 0;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#070d1a', '#0a1728', '#070d1a']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutHeaderBtn}>
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* User Card */}
        <View>
          <LinearGradient
            colors={[colors.primaryDim, '#004d35', '#002a1e']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileCard}
          >
            <TouchableOpacity
              style={styles.avatarGlowRing}
              onPress={() => setShowAvatarModal(true)}
              activeOpacity={0.8}
            >
              <View style={styles.avatar}>
                {profile?.avatarUrl ? (
                  <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} resizeMode="cover" />
                ) : (
                  <Text style={styles.avatarText}>
                    {(editName || displayName).charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>
              <View style={styles.avatarEditBadge}>
                <Ionicons name="camera" size={12} color={colors.white} />
              </View>
            </TouchableOpacity>

            {isEditing ? (
              <View style={styles.editForm}>
                <TextInput
                  style={styles.editInput}
                  placeholder="Enter Name"
                  placeholderTextColor={colors.onSurfaceMuted}
                  value={editName}
                  onChangeText={setEditName}
                />
                <TextInput
                  style={styles.editInput}
                  placeholder="Enter Email (Optional)"
                  placeholderTextColor={colors.onSurfaceMuted}
                  value={editEmail}
                  onChangeText={setEditEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <View style={styles.editBtnRow}>
                  <TouchableOpacity style={styles.editCancelBtn} onPress={() => setIsEditing(false)}>
                    <Text style={styles.editCancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.editSaveBtn} onPress={handleSave}>
                    <Text style={styles.editSaveBtnText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={{ alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.userName}>{displayName}</Text>
                  <TouchableOpacity onPress={() => setIsEditing(true)}>
                    <Ionicons name="create-outline" size={18} color={colors.primary} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.userPhone}>{phone || '+92 300 0000000'}</Text>
                {profile?.email ? <Text style={styles.userEmail}>{profile.email}</Text> : null}
                {profile?.team ? (
                  <TouchableOpacity
                    style={styles.clanProfilePill}
                    onPress={() => navigation.navigate('Teams' as any)}
                  >
                    <Ionicons name="shield-checkmark" size={13} color="#34d399" />
                    <Text style={styles.clanProfilePillText}>Clan: {profile.team.name} • {profile.team.score} 🏆</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            )}

            <View style={styles.balanceBadge}>
              <Ionicons name="star" size={16} color={colors.secondary} />
              <AnimatedNumber value={displayBalance} style={styles.balanceText} suffix=" Coins" duration={800} />
            </View>
          </LinearGradient>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Performance Stats</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={{ fontSize: 20 }}>🏆</Text>
              <AnimatedNumber value={profile?.stats?.challengeWinRate || 0} style={styles.statValue} suffix="%" duration={400} />
              <Text style={styles.statLabel}>Challenge Win Rate</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={{ fontSize: 20 }}>🎯</Text>
              <AnimatedNumber value={(profile?.stats?.totalQuizzes || 0) + (profile?.stats?.totalChallenges || 0)} style={styles.statValue} duration={400} />
              <Text style={styles.statLabel}>Games Played</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={{ fontSize: 20 }}>🏅</Text>
              <AnimatedNumber value={profile?.stats?.accuracy || 0} style={styles.statValue} suffix="%" duration={400} />
              <Text style={styles.statLabel}>Accuracy</Text>
            </View>
          </View>
        </View>

        {/* Quick Menu Actions */}
        <View style={styles.menuGroup}>
          <Text style={styles.sectionTitle}>Account Menu</Text>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Wallet')}>
            <View style={[styles.menuIconContainer, { backgroundColor: `${colors.secondary}20` }]}>
              <Ionicons name="wallet" size={20} color={colors.secondary} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>My Wallet & Withdraw</Text>
              <Text style={styles.menuSubtitle}>Check balance & request Easypaisa payout</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('WithdrawalHistory')}>
            <View style={[styles.menuIconContainer, { backgroundColor: `${colors.primary}20` }]}>
              <Ionicons name="time" size={20} color={colors.primary} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Withdrawal History</Text>
              <Text style={styles.menuSubtitle}>View past payout requests and status</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Leaderboard')}>
            <View style={[styles.menuIconContainer, { backgroundColor: '#a78bfa20' }]}>
              <Ionicons name="trophy" size={20} color="#a78bfa" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Leaderboard & Rankings</Text>
              <Text style={styles.menuSubtitle}>Check top players and your rank</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Missions')}>
            <View style={[styles.menuIconContainer, { backgroundColor: `${colors.secondary}20` }]}>
              <Ionicons name="star" size={20} color={colors.secondary} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Missions & Achievements</Text>
              <Text style={styles.menuSubtitle}>Complete tasks to earn rewards</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Spin')}>
            <View style={[styles.menuIconContainer, { backgroundColor: '#8b5cf620' }]}>
              <Ionicons name="gift" size={20} color="#8b5cf6" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Daily Spin Wheel</Text>
              <Text style={styles.menuSubtitle}>Spin once a day for free rewards</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('VoiceQuiz')}>
            <View style={[styles.menuIconContainer, { backgroundColor: '#06b6d420' }]}>
              <Ionicons name="mic" size={20} color="#06b6d4" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Voice Quiz 🎙️</Text>
              <Text style={styles.menuSubtitle}>Listen to questions & answer</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Referral')}>
            <View style={[styles.menuIconContainer, { backgroundColor: `${colors.primary}20` }]}>
              <Ionicons name="people" size={20} color={colors.primary} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Refer & Earn</Text>
              <Text style={styles.menuSubtitle}>Invite friends for bonus coins</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Teams')}>
            <View style={[styles.menuIconContainer, { backgroundColor: '#f59e0b20' }]}>
              <Ionicons name="shield-half" size={20} color="#f59e0b" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Clans & Teams</Text>
              <Text style={styles.menuSubtitle}>Join a team and compete</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('WrongAnswers')}>
            <View style={[styles.menuIconContainer, { backgroundColor: `${colors.error}20` }]}>
              <Ionicons name="book" size={20} color={colors.error} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Learn From Mistakes</Text>
              <Text style={styles.menuSubtitle}>Review and master missed questions</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={async () => {
            Alert.alert(
              'Buy Streak Freeze',
              'Use 200 Coins to buy a streak freeze? It will automatically protect your streak if you miss a day.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Buy (200 🪙)', onPress: async () => {
                  try {
                    await api.streak.buyFreeze();
                    Alert.alert('Zabardast! 🧊', 'Streak freeze khareed liya gaya hai!');
                    invalidateProfile();
                  } catch (e: any) {
                    Alert.alert('Error', e.response?.data?.message || 'Failed to buy freeze');
                  }
                } },
              ]
            );
          }}>
            <View style={[styles.menuIconContainer, { backgroundColor: '#38bdf820' }]}>
              <Ionicons name="snow" size={20} color="#38bdf8" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Streak Freeze</Text>
              <Text style={styles.menuSubtitle}>
                {profile?.streakFreezes !== undefined
                  ? `${profile.streakFreezes} Freeze Available 🧊 • Tap to buy`
                  : 'Buy freeze to protect your streak'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceMuted} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
            <Text style={styles.logoutText}>Log Out Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <AvatarPickerModal
        visible={showAvatarModal}
        currentAvatarUrl={profile?.avatarUrl}
        onSelect={handleSelectAvatar}
        onClose={() => setShowAvatarModal(false)}
        saving={savingAvatar}
      />

      <BottomNav active="Profile" navigation={navigation} />
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl * 2,
    paddingBottom: spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.headlineSm,
    color: colors.white,
  },
  logoutHeaderBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${colors.error}15`,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${colors.error}30`,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 110,
    gap: spacing.lg,
  },
  profileCard: {
    alignItems: 'center',
    padding: spacing.xl,
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  avatarGlowRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${colors.primary}25`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  avatar: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 66,
    height: 66,
    borderRadius: 33,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.primary,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#002a1e',
  },
  clanProfilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
    marginTop: 4,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  clanProfilePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34d399',
  },
  avatarText: {
    ...typography.headlineSm,
    fontSize: 24,
    color: colors.primary,
  },
  userName: {
    ...typography.headlineSm,
    color: colors.white,
    fontSize: 20,
  },
  userPhone: {
    ...typography.bodyMd,
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    marginBottom: spacing.md,
  },
  balanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: borderRadius.pill,
    gap: 8,
    borderWidth: 1,
    borderColor: `${colors.secondary}40`,
  },
  balanceText: {
    ...typography.labelMd,
    color: colors.secondary,
    fontSize: 15,
  },
  menuGroup: {
    gap: spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  menuIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    ...typography.labelMd,
    fontSize: 15,
    color: colors.white,
  },
  menuSubtitle: {
    ...typography.bodyMd,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  statsContainer: {
    gap: spacing.xs,
  },
  sectionTitle: {
    ...typography.headlineSm,
    fontSize: 16,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.surfaceCard,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    gap: 4,
  },
  statValue: {
    ...typography.headlineSm,
    fontSize: 18,
    color: colors.white,
  },
  statLabel: {
    ...typography.labelSm,
    fontSize: 10,
    color: colors.onSurfaceVariant,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${colors.error}15`,
    padding: spacing.md,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: `${colors.error}40`,
    gap: 8,
  },
  logoutText: {
    ...typography.labelMd,
    color: colors.error,
    fontSize: 15,
  },
  userEmail: {
    ...typography.bodyMd,
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  editForm: {
    width: '100%',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  editInput: {
    backgroundColor: `${colors.surfaceVariant}80`,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.white,
    ...typography.bodyMd,
  },
  editBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  editCancelBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
    backgroundColor: `${colors.white}10`,
  },
  editCancelBtnText: {
    ...typography.labelSm,
    color: colors.white,
  },
  editSaveBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.primary,
  },
  editSaveBtnText: {
    ...typography.labelSm,
    color: colors.onPrimary,
  },
});
