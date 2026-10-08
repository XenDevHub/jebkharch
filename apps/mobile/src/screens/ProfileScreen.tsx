// src/screens/ProfileScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors, typography, spacing, borderRadius } from '../theme/designSystem';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/client';
import BottomNav from '../components/BottomNav';
import AnimatedNumber from '../components/AnimatedNumber';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Profile'>;
};

export default function ProfileScreen({ navigation }: Props) {
  const [balance, setBalance] = useState<number>(0);
  const [phone, setPhone] = useState<string>('');
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const storedPhone = await AsyncStorage.getItem('user_phone');
      if (storedPhone) setPhone(storedPhone);

      const profileRes = await api.user.getProfile();
      if (profileRes.data) {
        setProfile(profileRes.data);
        setEditName(profileRes.data.name || '');
        setEditEmail(profileRes.data.email || '');
        setBalance(profileRes.data.coins);
      }
    } catch (e) {
      console.log('Error fetching profile data', e);
    }
  };

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
      fetchProfileData();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Update failed');
    }
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
      <LinearGradient colors={['#070d1a', '#0a1728', '#070d1a']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <Animated.View entering={FadeInDown.delay(50)} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutHeaderBtn}>
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <LinearGradient
            colors={[colors.primaryDim, '#004d35', '#002a1e']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileCard}
          >
            <View style={styles.avatarGlowRing}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {editName ? editName.charAt(0).toUpperCase() : 'P'}
                </Text>
              </View>
            </View>

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
                  <Text style={styles.userName}>{profile?.name || 'Player'}</Text>
                  <TouchableOpacity onPress={() => setIsEditing(true)}>
                    <Ionicons name="create-outline" size={18} color={colors.primary} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.userPhone}>{phone || '+92 300 0000000'}</Text>
                {profile?.email ? <Text style={styles.userEmail}>{profile.email}</Text> : null}
              </View>
            )}

            <View style={styles.balanceBadge}>
              <Ionicons name="star" size={16} color={colors.secondary} />
              <AnimatedNumber value={balance} style={styles.balanceText} suffix=" Coins" duration={800} />
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Quick Stats */}
        <Animated.View entering={FadeInDown.delay(150)} style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Performance Stats</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={{ fontSize: 20 }}>🏆</Text>
              <AnimatedNumber value={profile?.stats?.challengeWinRate || 0} style={styles.statValue} suffix="%" duration={600} />
              <Text style={styles.statLabel}>Challenge Win Rate</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={{ fontSize: 20 }}>🎯</Text>
              <AnimatedNumber value={(profile?.stats?.totalQuizzes || 0) + (profile?.stats?.totalChallenges || 0)} style={styles.statValue} duration={600} />
              <Text style={styles.statLabel}>Games Played</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={{ fontSize: 20 }}>🏅</Text>
              <AnimatedNumber value={profile?.stats?.accuracy || 0} style={styles.statValue} suffix="%" duration={600} />
              <Text style={styles.statLabel}>Accuracy</Text>
            </View>
          </View>
        </Animated.View>

        {/* Quick Menu Actions */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.menuGroup}>
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
        </Animated.View>

        {/* Logout Button */}
        <Animated.View entering={FadeInDown.delay(250)}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
            <Text style={styles.logoutText}>Log Out Account</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

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
