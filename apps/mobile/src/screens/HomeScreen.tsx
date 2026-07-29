// src/screens/HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../components/GlassCard';
import { colors, spacing, typography } from '../theme/designSystem';
import { api } from '../api/client';

type Category = {
  id: string;
  name: string;
  icon: string;
  isPremium: boolean;
};

// Fallback categories if API fails
const FALLBACK_CATEGORIES = [
  { id: '1', name: 'General Knowledge', icon: 'earth', isPremium: false },
  { id: '2', name: 'Science', icon: 'flask', isPremium: false },
  { id: '3', name: 'History', icon: 'book', isPremium: false },
  { id: '4', name: 'Sports', icon: 'football', isPremium: false },
  { id: '5', name: 'Technology', icon: 'hardware-chip', isPremium: true },
];

export default function HomeScreen({ navigation }: any) {
  const [categories, setCategories] = useState<Category[]>(FALLBACK_CATEGORIES);
  const [refreshing, setRefreshing] = useState(false);
  const [balance, setBalance] = useState(0);

  const fetchData = async () => {
    try {
      const [catRes, walletRes] = await Promise.all([
        api.quiz.getCategories(),
        api.wallet.getBalance()
      ]);
      setCategories(catRes.data);
      setBalance(walletRes.data.balance);
    } catch (e) {
      console.log('API Error', e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.userInfo} onPress={() => navigation.navigate('Profile')}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>R</Text>
            </View>
            <View>
              <Text style={styles.greeting}>Hey, Riduan 👋</Text>
              <Text style={styles.subGreeting}>Ready to win today?</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.walletChip} onPress={() => navigation.navigate('Wallet')}>
            <Ionicons name="wallet" size={16} color={colors.secondary} />
            <Text style={styles.walletText}>{balance}</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Banner */}
        <TouchableOpacity 
          activeOpacity={0.9} 
          style={styles.heroBanner}
          onPress={() => navigation.navigate('Quiz', { categoryId: '1', categoryName: 'Mega Tech Quiz' })}
        >
          <LinearGradient
            colors={[colors.primary, '#006b4b']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <View style={styles.heroContent}>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE TOURNAMENT</Text>
              </View>
              <Text style={styles.heroTitle}>Mega Tech Quiz</Text>
              <Text style={styles.heroSubtitle}>Win up to 5,000 Coins!</Text>
              
              <View style={styles.heroFooter}>
                <View style={styles.heroTimer}>
                  <Ionicons name="time-outline" size={16} color="#fff" />
                  <Text style={styles.heroTimerText}>Ends in 02:45:10</Text>
                </View>
                <TouchableOpacity 
                  style={styles.playButton}
                  onPress={() => navigation.navigate('Quiz', { categoryId: '1', categoryName: 'Mega Tech Quiz' })}
                >
                  <Text style={styles.playButtonText}>Join Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="trophy" size={20} color={colors.secondary} />
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Wins</Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="game-controller" size={20} color={colors.primary} />
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>45</Text>
              <Text style={styles.statLabel}>Played</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('Leaderboard')}>
            <Ionicons name="star" size={20} color="#ff4757" />
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>#14</Text>
              <Text style={styles.statLabel}>Rank</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.grid}>
          {categories.map((cat) => (
            <GlassCard 
              key={cat.id} 
              title={cat.name} 
              icon={cat.icon}
              isPremium={cat.isPremium}
              onPress={() => navigation.navigate('Quiz', { categoryId: cat.id, categoryName: cat.name })} 
            />
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
          <Ionicons name="home" size={22} color={colors.primary} />
          <Text style={[styles.navLabel, { color: colors.primary }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Leaderboard')}>
          <Ionicons name="trophy-outline" size={22} color={colors.onSurfaceVariant} />
          <Text style={styles.navLabel}>Rankings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Wallet')}>
          <Ionicons name="wallet-outline" size={22} color={colors.onSurfaceVariant} />
          <Text style={styles.navLabel}>Withdraw</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person-outline" size={22} color={colors.onSurfaceVariant} />
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: 100,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.primary}30`,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  avatarText: {
    ...typography.headlineMd,
    color: colors.primary,
  },
  greeting: {
    ...typography.labelMd,
    fontSize: 18,
    color: '#fff',
  },
  subGreeting: {
    ...typography.bodyLg,
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },
  walletChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.secondary}20`,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${colors.secondary}50`,
    gap: 6,
  },
  walletText: {
    ...typography.labelMd,
    color: colors.secondary,
  },
  heroBanner: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: spacing.xl,
    elevation: 5,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  heroGradient: {
    padding: spacing.lg,
  },
  heroContent: {
    gap: spacing.sm,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ff4757',
  },
  liveText: {
    ...typography.labelMd,
    fontSize: 10,
    color: '#fff',
    letterSpacing: 1,
  },
  heroTitle: {
    ...typography.displayLg,
    fontSize: 28,
    color: '#fff',
    lineHeight: 34,
  },
  heroSubtitle: {
    ...typography.bodyLg,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: spacing.sm,
  },
  heroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  heroTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroTimerText: {
    ...typography.labelMd,
    color: '#fff',
  },
  playButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  playButtonText: {
    ...typography.labelMd,
    color: colors.onPrimary,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.surfaceVariant}40`,
    padding: spacing.sm,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: `${colors.onSurface}10`,
    gap: spacing.sm,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    ...typography.labelMd,
    fontSize: 16,
    color: '#fff',
  },
  statLabel: {
    ...typography.bodyLg,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.headlineMd,
    fontSize: 20,
    color: '#fff',
  },
  seeAll: {
    ...typography.labelMd,
    color: colors.primary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  navLabel: {
    ...typography.labelMd,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
});
