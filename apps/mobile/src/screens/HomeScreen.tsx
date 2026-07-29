// src/screens/HomeScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import Animated, {
  FadeInDown, FadeInRight,
  useSharedValue, useAnimatedStyle, withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../components/GlassCard';
import BottomNav from '../components/BottomNav';
import PulsingDot from '../components/PulsingDot';
import AnimatedNumber from '../components/AnimatedNumber';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/designSystem';
import { api } from '../api/client';

type Category = { id: string; name: string; icon: string; isPremium: boolean };

const FALLBACK_CATEGORIES = [
  { id: '1', name: 'General Knowledge', icon: 'earth', isPremium: false },
  { id: '2', name: 'Science', icon: 'flask', isPremium: false },
  { id: '3', name: 'History', icon: 'book', isPremium: false },
  { id: '4', name: 'Sports', icon: 'football', isPremium: false },
  { id: '5', name: 'Technology', icon: 'hardware-chip', isPremium: true },
  { id: '6', name: 'Geography', icon: 'globe', isPremium: false },
];

// Fixed tournament end time (2h45m from now for demo)
const TOURNAMENT_SECONDS = 2 * 60 * 60 + 45 * 60 + 10;

function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds);
  useEffect(() => {
    const t = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function HomeScreen({ navigation }: any) {
  const [categories, setCategories] = useState<Category[]>(FALLBACK_CATEGORIES);
  const [refreshing, setRefreshing] = useState(false);
  const [balance, setBalance] = useState(0);
  const [userName, setUserName] = useState('Player');
  const countdown = useCountdown(TOURNAMENT_SECONDS);

  const walletScale = useSharedValue(1);
  const walletStyle = useAnimatedStyle(() => ({
    transform: [{ scale: walletScale.value }],
  }));

  const fetchData = async () => {
    try {
      const [catRes, walletRes] = await Promise.all([
        api.quiz.getCategories(),
        api.wallet.getBalance(),
      ]);
      setCategories(catRes.data);
      setBalance(walletRes.data.balance);
    } catch {}
  };

  useEffect(() => { fetchData(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Top Bar ── */}
        <Animated.View entering={FadeInDown.delay(50)} style={styles.topBar}>
          <TouchableOpacity style={styles.userInfo} onPress={() => navigation.navigate('Profile')}>
            <LinearGradient
              colors={[`${colors.primary}40`, `${colors.primary}15`]}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
            <View>
              <Text style={styles.greeting}>Hey, {userName} 👋</Text>
              <Text style={styles.subGreeting}>Aaj jeetne ka plan hai? 🔥</Text>
            </View>
          </TouchableOpacity>

          <Animated.View style={walletStyle}>
            <TouchableOpacity
              style={styles.walletChip}
              onPress={() => {
                walletScale.value = withSpring(0.9, { damping: 10 }, () => {
                  walletScale.value = withSpring(1);
                });
                navigation.navigate('Wallet');
              }}
            >
              <Ionicons name="star" size={14} color={colors.secondary} />
              <AnimatedNumber
                value={balance}
                style={styles.walletText}
                duration={800}
              />
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        {/* ── Daily Challenge Banner ── */}
        <Animated.View entering={FadeInDown.delay(100)}>
          <TouchableOpacity activeOpacity={0.9} style={styles.dailyCard}>
            <LinearGradient
              colors={[`${colors.secondary}25`, `${colors.secondary}08`]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.dailyGradient}
            >
              <View style={styles.dailyLeft}>
                <View style={styles.dailyBadge}>
                  <Text style={styles.dailyBadgeText}>⚡ 2× COINS</Text>
                </View>
                <Text style={styles.dailyTitle}>Daily Challenge</Text>
                <Text style={styles.dailySubtitle}>Aaj ka special quiz — double rewards!</Text>
              </View>
              <Text style={{ fontSize: 44 }}>🎯</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Hero Banner ── */}
        <Animated.View entering={FadeInDown.delay(150)}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.heroBanner}
            onPress={() => navigation.navigate('Quiz', { categoryId: '1', categoryName: 'Mega Tech Quiz' })}
          >
            <LinearGradient
              colors={[colors.primaryDim, '#004d35', '#002a1e']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.heroGradient}
            >
              {/* Decorative circle */}
              <View style={styles.heroDecorCircle} />

              <View style={styles.heroContent}>
                <View style={styles.liveBadge}>
                  <PulsingDot color="#ff4757" size={7} />
                  <Text style={styles.liveText}>LIVE TOURNAMENT</Text>
                </View>

                <Text style={styles.heroTitle}>Mega Tech Quiz 🚀</Text>
                <Text style={styles.heroSubtitle}>Win up to 5,000 Coins!</Text>

                <View style={styles.heroMeta}>
                  <View style={styles.heroMetaItem}>
                    <Ionicons name="people" size={14} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.heroMetaText}>1,247 playing</Text>
                  </View>
                  <View style={styles.heroMetaDivider} />
                  <View style={styles.heroMetaItem}>
                    <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.heroMetaText}>{countdown}</Text>
                  </View>
                </View>

                <View style={styles.heroFooter}>
                  <TouchableOpacity
                    style={styles.playButton}
                    onPress={() => navigation.navigate('Quiz', { categoryId: '1', categoryName: 'Mega Tech Quiz' })}
                  >
                    <Text style={styles.playButtonText}>Join Now</Text>
                    <Ionicons name="arrow-forward" size={16} color={colors.onPrimary} />
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Quick Stats ── */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.statsRow}>
          {[
            { icon: 'trophy', color: colors.secondary, value: '12', label: 'Wins' },
            { icon: 'game-controller', color: colors.primary, value: '45', label: 'Played' },
            { icon: 'podium', color: '#a78bfa', value: '#14', label: 'Rank', onPress: () => navigation.navigate('Leaderboard') },
          ].map((stat, i) => (
            <TouchableOpacity
              key={i}
              style={styles.statCard}
              onPress={stat.onPress}
              activeOpacity={stat.onPress ? 0.75 : 1}
            >
              <View style={[styles.statIconBg, { backgroundColor: `${stat.color}20` }]}>
                <Ionicons name={stat.icon as any} size={18} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* ── Categories ── */}
        <Animated.View entering={FadeInDown.delay(250)} style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quiz Categories</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All →</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.grid}>
          {categories.map((cat, i) => (
            <GlassCard
              key={cat.id}
              title={cat.name}
              icon={cat.icon}
              isPremium={cat.isPremium}
              delay={i * 60}
              onPress={() => navigation.navigate('Quiz', { categoryId: cat.id, categoryName: cat.name })}
            />
          ))}
        </View>
      </ScrollView>

      <BottomNav active="Home" navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: {
    padding: spacing.md, paddingTop: spacing.xl + 10,
    paddingBottom: 100, gap: spacing.md,
  },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: `${colors.primary}60`,
  },
  avatarText: { ...typography.headlineSm, color: colors.primary },
  greeting: { ...typography.labelMd, fontSize: 16, color: colors.white },
  subGreeting: { ...typography.bodyMd, fontSize: 12, color: colors.onSurfaceVariant },
  walletChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: `${colors.secondary}15`,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: borderRadius.pill,
    borderWidth: 1, borderColor: `${colors.secondary}40`, gap: 6,
  },
  walletText: { ...typography.labelMd, color: colors.secondary, fontSize: 15 },
  // Daily card
  dailyCard: {
    borderRadius: borderRadius.xxl, overflow: 'hidden',
    borderWidth: 1, borderColor: `${colors.secondary}40`,
  },
  dailyGradient: {
    padding: spacing.md, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
  },
  dailyLeft: { gap: 4 },
  dailyBadge: {
    backgroundColor: `${colors.secondary}25`,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: borderRadius.sm, alignSelf: 'flex-start',
    borderWidth: 1, borderColor: `${colors.secondary}50`,
  },
  dailyBadgeText: { ...typography.labelSm, color: colors.secondary, fontSize: 10 },
  dailyTitle: { ...typography.labelMd, color: colors.white, fontSize: 16 },
  dailySubtitle: { ...typography.bodyMd, color: colors.onSurfaceVariant, fontSize: 12 },
  // Hero
  heroBanner: {
    borderRadius: borderRadius.xxl, overflow: 'hidden',
    ...shadows.neonGreen,
  },
  heroGradient: { padding: spacing.lg, overflow: 'hidden' },
  heroDecorCircle: {
    position: 'absolute', right: -40, top: -40,
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  heroContent: { gap: spacing.sm },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignSelf: 'flex-start', paddingHorizontal: 10,
    paddingVertical: 5, borderRadius: borderRadius.pill, gap: 6,
  },
  liveText: { ...typography.labelSm, color: '#fff', letterSpacing: 1.2 },
  heroTitle: { ...typography.displayMd, fontSize: 26, color: '#fff', lineHeight: 32 },
  heroSubtitle: { ...typography.bodyMd, color: 'rgba(255,255,255,0.75)' },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  heroMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heroMetaText: { ...typography.labelSm, color: 'rgba(255,255,255,0.75)' },
  heroMetaDivider: { width: 1, height: 12, backgroundColor: 'rgba(255,255,255,0.3)' },
  heroFooter: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: spacing.xs },
  playButton: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.primary, paddingHorizontal: 20,
    paddingVertical: 10, borderRadius: borderRadius.pill, gap: 6,
  },
  playButtonText: { ...typography.labelMd, color: colors.onPrimary },
  // Stats
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statCard: {
    flex: 1, alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    padding: spacing.sm, borderRadius: borderRadius.lg,
    borderWidth: 1, borderColor: colors.glassBorder, gap: 4,
  },
  statIconBg: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  statValue: { ...typography.headlineSm, fontSize: 18, color: colors.white },
  statLabel: { ...typography.labelSm, color: colors.onSurfaceVariant },
  // Section
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  sectionTitle: { ...typography.headlineSm, color: colors.white },
  seeAll: { ...typography.labelSm, color: colors.primary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
});
