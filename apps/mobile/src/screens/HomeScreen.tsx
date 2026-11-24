// src/screens/HomeScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl, ActivityIndicator, Image, Alert,
} from 'react-native';
import Animated, {
  FadeInDown, FadeInRight,
  useSharedValue, useAnimatedStyle, withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import GlassCard from '../components/GlassCard';
import BottomNav from '../components/BottomNav';
import PulsingDot from '../components/PulsingDot';
import AnimatedNumber, { formatCompactNumber } from '../components/AnimatedNumber';
import LivesModal from '../components/LivesModal';
import StreakModal from '../components/StreakModal';
import TicketModal from '../components/TicketModal';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/designSystem';
import { api } from '../api/client';
import {
  useProfile, useCategories, useWalletBalance,
  useStreakStatus, useLives, useTickets, useTeams,
  useDailyChallengeStatus, QUERY_KEYS,
} from '../hooks/useAppData';
import { AdMobManager } from '../services/adMobService';
import { syncPushTokenWithBackend } from '../services/notificationService';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

type Category = { id: string; name: string; icon: string; isPremium: boolean };

const MAX_VISIBLE_CATEGORIES = 6;

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

// Isolated countdown component — only this text re-renders every second, NOT the whole HomeScreen
const TournamentCountdown = React.memo(function TournamentCountdown({
  initialSeconds,
  style,
}: {
  initialSeconds: number;
  style?: any;
}) {
  const [seconds, setSeconds] = useState(initialSeconds);
  React.useEffect(() => {
    const t = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return (
    <Text style={style}>
      {`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`}
    </Text>
  );
});

export default function HomeScreen({ navigation }: any) {
  const queryClient = useQueryClient();
  const { isOffline } = useNetworkStatus();

  // ── Cached queries — instant on revisit, background refresh ──
  const { data: profileData } = useProfile();
  const { data: categoriesData } = useCategories();
  const { data: balanceData } = useWalletBalance();
  const { data: streakData } = useStreakStatus();
  const { data: livesData } = useLives();
  const { data: ticketsData } = useTickets();
  const { data: teamsData = [] } = useTeams();
  const { data: dailyStatus } = useDailyChallengeStatus();

  // Find user clan & verified clans
  const myTeam = profileData?.team || (profileData?.teamId ? teamsData.find((t: any) => t.id === profileData.teamId) : null);
  const verifiedClans = teamsData.filter((t: any) => t.isVerified).slice(0, 3);
  const canPlayDaily = dailyStatus?.canPlay ?? true;

  // Derived values with safe fallbacks
  const categories: Category[] = categoriesData || FALLBACK_CATEGORIES;
  const balance = balanceData ?? 0;
  const userName = profileData?.name || 'Player';
  const streak = streakData?.currentStreak || 0;
  const tickets = ticketsData ?? (profileData?.tournamentTickets || 0);
  const lives = livesData?.lives ?? 5;
  const userStats = {
    wins: profileData?.stats?.challengesWon || 0,
    played: profileData?.stats?.totalQuizzes || 0,
    rank: profileData?.rank ? `#${profileData.rank}` : '#--',
  };

  const [refreshing, setRefreshing] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showLivesModal, setShowLivesModal] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);

  const startQuiz = (categoryId: string, categoryName: string) => {
    if (isOffline) {
      Alert.alert(
        'Internet Connection Nahi Hai 📡',
        'Quiz shuru karne ke liye active internet zaroori hai. Barah-e-karam apna Wi-Fi ya mobile data on karein.'
      );
      return;
    }
    if (lives <= 0) {
      setShowLivesModal(true);
      return;
    }
    navigation.navigate('Quiz', { categoryId, categoryName });
  };

  const handleDailyChallengePress = () => {
    if (isOffline) {
      Alert.alert(
        'Internet Connection Nahi Hai 📡',
        'Daily Challenge khelne ke liye active internet zaroori hai. Barah-e-karam apna Wi-Fi ya mobile data on karein.'
      );
      return;
    }
    if (!canPlayDaily) {
      Alert.alert(
        'Daily Challenge Mukammal! ✅',
        'Aapne aaj ka 2× Coins Daily Challenge pehle hi pura kar liya hai! Kal subah 12:00 AM par naya challenge milega.'
      );
      return;
    }
    const dailyCat = categories.find((c: any) => !c.isPremium) || categories[0];
    if (dailyCat) {
      if (lives <= 0) {
        setShowLivesModal(true);
        return;
      }
      navigation.navigate('Quiz', {
        categoryId: dailyCat.id,
        categoryName: `${dailyCat.name} (Daily Challenge 2×)`,
        isDailyChallenge: true,
      });
    }
  };

  // Sync push token with backend whenever Home is viewed
  React.useEffect(() => {
    syncPushTokenWithBackend();
  }, []);

  const [adActive, setAdActive] = useState(false);
  const [adCountdown, setAdCountdown] = useState(5);
  const [rewardAmount, setRewardAmount] = useState<number | null>(null);
  const [adLoading, setAdLoading] = useState(false);

  const walletScale = useSharedValue(1);
  const walletStyle = useAnimatedStyle(() => ({
    transform: [{ scale: walletScale.value }],
  }));

  const onRefresh = async () => {
    if (isOffline) {
      setRefreshing(false);
      return;
    }
    setRefreshing(true);
    // Invalidate all cached queries — triggers background refetch
    await queryClient.invalidateQueries();
    setRefreshing(false);
  };

  const watchAd = async () => {
    if (adLoading || adActive) return;

    // Check if real AdMob Rewarded Ad is loaded
    if (AdMobManager.isAdReady()) {
      AdMobManager.showRewardedAd(
        () => {
          // User earned reward
          triggerAdReward();
        },
        undefined,
        () => {
          // If AdMob fails, fallback to timer
          startAdTimerFallback();
        }
      );
      return;
    }

    // Fallback timer if AdMob isn't loaded yet
    startAdTimerFallback();
  };

  const startAdTimerFallback = () => {
    setAdCountdown(5);
    setAdActive(true);
    setRewardAmount(null);

    const interval = setInterval(() => {
      setAdCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          triggerAdReward();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const triggerAdReward = async () => {
    setAdLoading(true);
    try {
      const res = await api.ads.watch();
      const reward = res.data?.reward || 1;
      setRewardAmount(reward);
      // Refresh wallet balance in cache
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.walletBalance });
    } catch (e: any) {
      console.log('Error claiming ad reward', e);
      setAdActive(false);
    } finally {
      setAdLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Top Bar: Tier 1 (Profile & Quick Actions) ── */}
        <Animated.View entering={FadeInDown.delay(50)} style={styles.headerTier1}>
          <TouchableOpacity
            style={styles.userInfo}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.8}
          >
            <View style={styles.avatarWrapper}>
              <LinearGradient
                colors={[`${colors.primary}60`, `${colors.primary}20`]}
                style={styles.avatar}
              >
                {profileData?.avatarUrl ? (
                  <Image
                    source={{ uri: profileData.avatarUrl }}
                    style={styles.avatarImg}
                    resizeMode="cover"
                  />
                ) : (
                  <Text style={styles.avatarText}>
                    {userName.charAt(0).toUpperCase()}
                  </Text>
                )}
              </LinearGradient>
              <View style={styles.onlineDot} />
            </View>
            <View style={styles.userTextContainer}>
              <Text style={styles.greeting} numberOfLines={1}>Hey, {userName} 👋</Text>
              <Text style={styles.subGreeting}>Aaj jeetne ka plan hai? 🔥</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => navigation.navigate('Missions')}
              activeOpacity={0.8}
            >
              <Ionicons name="trophy-outline" size={19} color={colors.secondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => navigation.navigate('Profile')}
              activeOpacity={0.8}
            >
              <Ionicons name="settings-outline" size={19} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ── Top Bar: Tier 2 (Balanced 4-Chip Status HUD) ── */}
        <Animated.View entering={FadeInDown.delay(90)} style={styles.hudContainer}>
          {/* 1. ❤️ Lives */}
          <TouchableOpacity
            style={[styles.hudChip, { borderColor: 'rgba(244, 63, 94, 0.35)', backgroundColor: 'rgba(244, 63, 94, 0.1)' }]}
            onPress={() => setShowLivesModal(true)}
            activeOpacity={0.75}
          >
            <View style={styles.hudChipTop}>
              <Text style={styles.hudIcon}>❤️</Text>
              <Text style={[styles.hudValue, { color: '#f43f5e' }]}>{lives}/5</Text>
            </View>
            <Text style={styles.hudLabel}>Energy</Text>
          </TouchableOpacity>

          {/* 2. 🔥 Streak */}
          <TouchableOpacity
            style={[styles.hudChip, { borderColor: 'rgba(249, 115, 22, 0.35)', backgroundColor: 'rgba(249, 115, 22, 0.1)' }]}
            onPress={() => setShowStreakModal(true)}
            activeOpacity={0.75}
          >
            <View style={styles.hudChipTop}>
              <Text style={styles.hudIcon}>🔥</Text>
              <Text style={[styles.hudValue, { color: '#f97316' }]}>{streak}d</Text>
            </View>
            <Text style={styles.hudLabel}>Streak</Text>
          </TouchableOpacity>

          {/* 3. 🎟️ Tickets */}
          <TouchableOpacity
            style={[styles.hudChip, { borderColor: 'rgba(168, 85, 247, 0.35)', backgroundColor: 'rgba(168, 85, 247, 0.1)' }]}
            onPress={() => setShowTicketModal(true)}
            activeOpacity={0.75}
          >
            <View style={styles.hudChipTop}>
              <Text style={styles.hudIcon}>🎟️</Text>
              <Text style={[styles.hudValue, { color: '#c084fc' }]}>{formatCompactNumber(tickets)}</Text>
            </View>
            <Text style={styles.hudLabel}>Tickets</Text>
          </TouchableOpacity>

          {/* 4. ⭐ Coins */}
          <Animated.View style={[{ flex: 1 }, walletStyle]}>
            <TouchableOpacity
              style={[styles.hudChip, { borderColor: 'rgba(234, 179, 8, 0.35)', backgroundColor: 'rgba(234, 179, 8, 0.1)' }]}
              onPress={() => {
                walletScale.value = withSpring(0.9, { damping: 10 }, () => {
                  walletScale.value = withSpring(1);
                });
                navigation.navigate('Wallet');
              }}
              activeOpacity={0.75}
            >
              <View style={styles.hudChipTop}>
                <Ionicons name="star" size={13} color={colors.secondary} />
                <AnimatedNumber
                  value={balance}
                  style={styles.hudCoinsValue}
                  duration={800}
                  formatter={formatCompactNumber}
                />
              </View>
              <Text style={styles.hudLabel}>Coins</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        {/* ── Daily Spin & Missions ── */}
        <Animated.View entering={FadeInDown.delay(120)}>
          <View style={{ flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.lg, marginTop: spacing.md }}>
            <TouchableOpacity 
              style={[styles.actionCard, { flex: 1, backgroundColor: `${colors.primary}20`, borderColor: colors.primary }]}
              onPress={() => navigation.navigate('Spin')}
            >
              <Text style={{ fontSize: 24, marginBottom: 8 }}>🎡</Text>
              <Text style={styles.actionCardTitle}>Daily Spin</Text>
              <Text style={styles.actionCardDesc}>Free rewards</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionCard, { flex: 1, backgroundColor: `${colors.secondary}20`, borderColor: colors.secondary }]}
              onPress={() => navigation.navigate('Missions')}
            >
              <Text style={{ fontSize: 24, marginBottom: 8 }}>🎯</Text>
              <Text style={styles.actionCardTitle}>Missions</Text>
              <Text style={styles.actionCardDesc}>Earn Coins</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ── Daily Challenge Banner (Real 2× Coins) ── */}
        <Animated.View entering={FadeInDown.delay(100)}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.dailyCard}
            onPress={handleDailyChallengePress}
          >
            <LinearGradient
              colors={canPlayDaily ? [`${colors.secondary}25`, `${colors.secondary}08`] : ['rgba(16, 185, 129, 0.2)', 'rgba(16, 185, 129, 0.05)']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.dailyGradient}
            >
              <View style={styles.dailyLeft}>
                <View style={[styles.dailyBadge, !canPlayDaily && { backgroundColor: 'rgba(16, 185, 129, 0.2)', borderColor: 'rgba(16, 185, 129, 0.4)' }]}>
                  <Text style={[styles.dailyBadgeText, !canPlayDaily && { color: '#10b981' }]}>
                    {canPlayDaily ? '⚡ 2× COINS REWARD' : '✅ COMPLETED TODAY'}
                  </Text>
                </View>
                <Text style={styles.dailyTitle}>Daily Challenge</Text>
                <Text style={styles.dailySubtitle}>
                  {canPlayDaily
                    ? 'Aaj ka special quiz — jeeto double (2×) coins!'
                    : 'Aapne aaj ka challenge jeet liya! Kal naya challenge aayega.'}
                </Text>
              </View>
              <View style={{ alignItems: 'center', gap: 4 }}>
                <Text style={{ fontSize: 36 }}>{canPlayDaily ? '🎯' : '🏆'}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                  <Text style={{ ...typography.labelSm, color: canPlayDaily ? colors.secondary : '#10b981', fontSize: 11, fontWeight: '700' }}>
                    {canPlayDaily ? 'Play' : 'Done'}
                  </Text>
                  {canPlayDaily && <Ionicons name="arrow-forward" size={12} color={colors.secondary} />}
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Clan Battles & City Squads ── */}
        <Animated.View entering={FadeInDown.delay(120)}>
          <View style={styles.clanSection}>
            <View style={styles.clanHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 18 }}>⚔️</Text>
                <Text style={styles.clanSectionTitle}>Clans & City Squads</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Teams')} activeOpacity={0.7}>
                <Text style={styles.clanSeeAll}>View All ➔</Text>
              </TouchableOpacity>
            </View>

            {myTeam ? (
              // ── Active Clan Card ──
              <TouchableOpacity
                activeOpacity={0.88}
                style={styles.myClanCard}
                onPress={() => navigation.navigate('Teams')}
              >
                <LinearGradient
                  colors={['#064e3b', '#022c22', '#0f172a']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.myClanGradient}
                >
                  <View style={styles.myClanLeft}>
                    <View style={styles.clanAvatarBox}>
                      <Text style={{ fontSize: 22 }}>🛡️</Text>
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <Text style={styles.myClanName} numberOfLines={1}>{myTeam.name}</Text>
                        {myTeam.isVerified && (
                          <View style={styles.verifiedBadgeMini}>
                            <Ionicons name="checkmark-circle" size={11} color="#38bdf8" />
                            <Text style={styles.verifiedTextMini}>Official</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.myClanSub}>
                        👥 {myTeam._count?.members || 1} Members  •  Tap to view clan
                      </Text>
                    </View>
                  </View>
                  <View style={styles.clanScorePill}>
                    <Text style={styles.clanScorePillValue}>🏆 {myTeam.score || 0}</Text>
                    <Text style={styles.clanScorePillLabel}>Clan Pts</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              // ── Recruitment Banner with Verified Clans ──
              <TouchableOpacity
                activeOpacity={0.88}
                style={styles.recruitCard}
                onPress={() => navigation.navigate('Teams')}
              >
                <LinearGradient
                  colors={['rgba(14, 165, 233, 0.16)', 'rgba(6, 78, 59, 0.22)', 'rgba(15, 23, 42, 0.95)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.recruitGradient}
                >
                  <View style={styles.recruitTop}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.recruitPill}>
                        <Ionicons name="shield-checkmark" size={11} color="#38bdf8" />
                        <Text style={styles.recruitPillText}>OFFICIAL CITY SQUADS OPEN</Text>
                      </View>
                      <Text style={styles.recruitTitle}>Join Lahore, Karachi or Create Squad!</Text>
                      <Text style={styles.recruitDesc}>Play quizzes with teammates & pool points for city glory 🏆</Text>
                    </View>
                    <View style={styles.recruitArrowBox}>
                      <Ionicons name="arrow-forward" size={18} color="#38bdf8" />
                    </View>
                  </View>

                  {/* Verified Clans Chips Preview */}
                  <View style={styles.verifiedChipsRow}>
                    {(verifiedClans.length > 0 ? verifiedClans : [
                      { id: '1', name: 'Lahore Champions', score: 1240 },
                      { id: '2', name: 'Karachi Kings', score: 980 },
                    ]).map((t: any) => (
                      <View key={t.id} style={styles.verifiedChip}>
                        <Ionicons name="checkmark-circle" size={12} color="#38bdf8" />
                        <Text style={styles.verifiedChipName} numberOfLines={1}>{t.name}</Text>
                        <Text style={styles.verifiedChipScore}>🏆 {t.score || 0}</Text>
                      </View>
                    ))}
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {/* ── Hero Banner ── */}
        <Animated.View entering={FadeInDown.delay(150)}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.heroBanner}
            onPress={() => {
              const tournamentCat = categories.find((c: any) => !c.isPremium) || categories[0];
              if (tournamentCat) {
                startQuiz(tournamentCat.id, tournamentCat.name);
              }
            }}
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

                <Text style={styles.heroTitle}>
                  {(categories.find((c: any) => !c.isPremium) || categories[0])?.name || 'Mega Quiz'} 🚀
                </Text>
                <Text style={styles.heroSubtitle}>Win up to 5,000 Coins!</Text>

                <View style={styles.heroMeta}>
                  <View style={styles.heroMetaItem}>
                    <Ionicons name="people" size={14} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.heroMetaText}>1,247 playing</Text>
                  </View>
                  <View style={styles.heroMetaDivider} />
                  <View style={styles.heroMetaItem}>
                    <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.8)" />
                    <TournamentCountdown initialSeconds={TOURNAMENT_SECONDS} style={styles.heroMetaText} />
                  </View>
                </View>

                <View style={styles.heroFooter}>
                  <TouchableOpacity
                    style={styles.playButton}
                    onPress={() => {
                      const tournamentCat = categories.find((c: any) => !c.isPremium) || categories[0];
                      if (tournamentCat) {
                        startQuiz(tournamentCat.id, tournamentCat.name);
                      }
                    }}
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
            { icon: 'trophy', color: colors.secondary, value: String(userStats.wins), label: 'Wins' },
            { icon: 'game-controller', color: colors.primary, value: String(userStats.played), label: 'Played' },
            { icon: 'podium', color: '#a78bfa', value: userStats.rank, label: 'Rank', onPress: () => navigation.navigate('Leaderboard') },
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

        {/* ── Earn Extra Coins Banner ── */}
        <Animated.View entering={FadeInDown.delay(220)}>
          <TouchableOpacity activeOpacity={0.9} style={styles.adCard} onPress={watchAd}>
            <LinearGradient
              colors={[`${colors.primary}25`, `${colors.primary}08`]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.adGradient}
            >
              <View style={styles.adLeft}>
                <View style={styles.adBadge}>
                  <Text style={styles.adBadgeText}>📺 FREE COINS</Text>
                </View>
                <Text style={styles.adTitle}>Earn Extra Points</Text>
                <Text style={styles.adSubtitle}>Watch a sponsor video to get 1-3 free coins!</Text>
              </View>
              <Text style={{ fontSize: 44 }}>🎥</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Challenge a Friend Banner ── */}
        <Animated.View entering={FadeInDown.delay(240)}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.challengeCard}
            onPress={() => navigation.navigate('ChallengeLobby')}
          >
            <LinearGradient
              colors={['#7c3aed25', '#7c3aed08']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.challengeGradient}
            >
              <View style={styles.challengeLeft}>
                <View style={[styles.challengeBadge, { backgroundColor: '#7c3aed35', borderColor: '#7c3aed50' }]}>
                  <Text style={[styles.challengeBadgeText, { color: '#a78bfa' }]}>👥 1v1 BATTLE</Text>
                </View>
                <Text style={styles.challengeTitle}>Challenge Your Friend</Text>
                <Text style={styles.challengeSubtitle}>Play 1v1 battle. Entry 100 coins. Winner takes 200!</Text>
              </View>
              <Text style={{ fontSize: 44 }}>⚔️</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Categories ── */}
        <Animated.View entering={FadeInDown.delay(250)} style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quiz Categories</Text>
          {categories.length > MAX_VISIBLE_CATEGORIES && (
            <TouchableOpacity onPress={() => setShowAllCategories(!showAllCategories)}>
              <Text style={styles.seeAll}>
                {showAllCategories ? 'Show Less ←' : 'See All →'}
              </Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        <View style={styles.grid}>
          {(showAllCategories ? categories : categories.slice(0, MAX_VISIBLE_CATEGORIES)).map((cat, i) => (
            <GlassCard
              key={cat.id}
              title={cat.name}
              icon={cat.icon}
              isPremium={cat.isPremium}
              delay={i * 60}
              onPress={() => startQuiz(cat.id, cat.name)}
            />
          ))}
        </View>
      </ScrollView>

      <LivesModal
        visible={showLivesModal}
        lives={lives}
        nextRefillInSeconds={livesData?.nextRefillInSeconds || 0}
        onClose={() => setShowLivesModal(false)}
      />

      <StreakModal
        visible={showStreakModal}
        onClose={() => setShowStreakModal(false)}
      />

      <TicketModal
        visible={showTicketModal}
        onClose={() => setShowTicketModal(false)}
        onOpenTournaments={() => navigation.navigate('ChallengeLobby')}
      />

      <BottomNav active="Home" navigation={navigation} />

      {/* Ad Overlay Modal */}
      {adActive && (
        <View style={styles.adModalOverlay}>
          <View style={styles.adModalContent}>
            {rewardAmount === null ? (
              <View style={{ alignItems: 'center', gap: 15 }}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.adModalTitle}>Sponsor Ad Playing...</Text>
                <Text style={styles.adModalCountdown}>Reward in {adCountdown}s</Text>
              </View>
            ) : (
              <View style={{ alignItems: 'center', gap: 15 }}>
                <Text style={{ fontSize: 50 }}>🎉</Text>
                <Text style={styles.adModalTitle}>Reward Earned!</Text>
                <Text style={styles.adModalReward}>+{rewardAmount} Coins</Text>
                <TouchableOpacity
                  style={styles.adCloseBtn}
                  onPress={() => {
                    setAdActive(false);
                    setRewardAmount(null);
                  }}
                >
                  <Text style={styles.adCloseBtnText}>Awesome!</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: {
    padding: spacing.md, paddingTop: spacing.xl + 10,
    paddingBottom: 100, gap: spacing.md,
  },
  headerTier1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
    marginRight: spacing.sm,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: `${colors.primary}60`,
    overflow: 'hidden',
  },
  avatarImg: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  avatarText: { ...typography.headlineSm, color: colors.primary },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: colors.background,
  },
  userTextContainer: {
    flex: 1,
  },
  greeting: {
    ...typography.labelMd,
    fontSize: 16,
    color: colors.white,
    fontWeight: '700',
  },
  subGreeting: {
    ...typography.bodyMd,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  hudContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 6,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
  },
  hudChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 4,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  hudChipTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hudIcon: {
    fontSize: 13,
  },
  hudValue: {
    ...typography.labelMd,
    fontSize: 13,
    fontWeight: '800',
  },
  hudCoinsValue: {
    ...typography.labelMd,
    fontSize: 13,
    fontWeight: '800',
    color: colors.secondary,
  },
  hudLabel: {
    ...typography.labelSm,
    fontSize: 9,
    color: colors.onSurfaceVariant,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
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
  // Ad and Challenge cards
  adCard: {
    borderRadius: borderRadius.xxl, overflow: 'hidden',
    borderWidth: 1, borderColor: `${colors.primary}40`,
  },
  adGradient: {
    padding: spacing.md, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
  },
  adLeft: { gap: 4 },
  adBadge: {
    backgroundColor: `${colors.primary}25`,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: borderRadius.sm, alignSelf: 'flex-start',
    borderWidth: 1, borderColor: `${colors.primary}50`,
  },
  adBadgeText: { ...typography.labelSm, color: colors.primary, fontSize: 10 },
  adTitle: { ...typography.labelMd, color: colors.white, fontSize: 16 },
  adSubtitle: { ...typography.bodyMd, color: colors.onSurfaceVariant, fontSize: 12 },

  challengeCard: {
    borderRadius: borderRadius.xxl, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(124, 58, 237, 0.4)',
  },
  challengeGradient: {
    padding: spacing.md, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
  },
  challengeLeft: { gap: 4 },
  challengeBadge: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: borderRadius.sm, alignSelf: 'flex-start',
    borderWidth: 1,
  },
  challengeBadgeText: { ...typography.labelSm, fontSize: 10 },
  challengeTitle: { ...typography.labelMd, color: colors.white, fontSize: 16 },
  challengeSubtitle: { ...typography.bodyMd, color: colors.onSurfaceVariant, fontSize: 12 },

  // Ad modal overlay
  adModalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  adModalContent: {
    backgroundColor: colors.surfaceElevated,
    padding: spacing.xl,
    borderRadius: borderRadius.xxl,
    width: '80%',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.glassBorderBright,
  },
  adModalTitle: {
    ...typography.headlineSm,
    color: colors.white,
    textAlign: 'center',
  },
  adModalCountdown: {
    ...typography.bodyLg,
    color: colors.primary,
    fontWeight: '700',
  },
  adModalReward: {
    ...typography.displayMd,
    color: colors.secondary,
    textShadowColor: `${colors.secondary}40`,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  adCloseBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: borderRadius.pill,
    marginTop: 10,
  },
  adCloseBtnText: {
    ...typography.labelMd,
    color: colors.onPrimary,
  },
  actionCard: {
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCardTitle: {
    ...typography.labelMd,
    color: colors.white,
  },
  actionCardDesc: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },

  // ── Clan & Squads Home Styles ──
  clanSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xs,
  },
  clanHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs + 2,
  },
  clanSectionTitle: {
    ...typography.labelMd,
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  clanSeeAll: {
    ...typography.labelSm,
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  myClanCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.4)',
  },
  myClanGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  myClanLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
    minWidth: 0,
  },
  clanAvatarBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  myClanName: {
    ...typography.labelMd,
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  myClanSub: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    fontSize: 11,
    marginTop: 2,
  },
  clanScorePill: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.3)',
  },
  clanScorePillValue: {
    ...typography.labelSm,
    color: colors.secondary,
    fontWeight: '800',
    fontSize: 12,
  },
  clanScorePillLabel: {
    fontSize: 9,
    color: colors.onSurfaceMuted,
  },
  verifiedBadgeMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(56, 189, 248, 0.18)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  verifiedTextMini: {
    fontSize: 9,
    fontWeight: '700',
    color: '#38bdf8',
  },
  recruitCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  recruitGradient: {
    padding: spacing.md,
    gap: spacing.sm + 2,
  },
  recruitTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  recruitPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  recruitPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#38bdf8',
    letterSpacing: 0.5,
  },
  recruitTitle: {
    ...typography.labelMd,
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  recruitDesc: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    fontSize: 11,
    marginTop: 2,
  },
  recruitArrowBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
  },
  verifiedChipsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
    marginTop: 2,
  },
  verifiedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
  },
  verifiedChipName: {
    ...typography.labelSm,
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
    maxWidth: 120,
  },
  verifiedChipScore: {
    ...typography.labelSm,
    color: colors.secondary,
    fontSize: 10,
    fontWeight: '700',
  },
});
