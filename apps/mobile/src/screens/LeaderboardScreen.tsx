// src/screens/LeaderboardScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors, typography, spacing, borderRadius } from '../theme/designSystem';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '../api/client';
import BottomNav from '../components/BottomNav';

type LeaderboardItem = {
  rank: number;
  name: string;
  score: number;
  avatar: string;
  isCurrentUser?: boolean;
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Leaderboard'>;
};

function PodiumBlock({ height, color, rank, label }: { height: number; color: string; rank: string; label?: string }) {
  const hAnim = useSharedValue(0);

  useEffect(() => {
    hAnim.value = withSpring(height, { damping: 14, stiffness: 90 });
  }, [height]);

  const animStyle = useAnimatedStyle(() => ({
    height: hAnim.value,
  }));

  return (
    <Animated.View style={[styles.podiumBlock, { backgroundColor: color }, animStyle]}>
      <Text style={styles.podiumRank}>{rank}</Text>
    </Animated.View>
  );
}

export default function LeaderboardScreen({ navigation }: Props) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaderboard = async () => {
    try {
      const res = await api.user.getLeaderboard();
      if (res.data) {
        setLeaderboard(res.data);
      }
    } catch (e) {
      console.log('Error fetching leaderboard', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLeaderboard();
  };

  const top3 = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  const renderItem = ({ item, index }: { item: LeaderboardItem; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 40).springify().damping(15)}>
      <View style={[styles.rankItem, item.isCurrentUser && styles.currentUserRank]}>
        <Text style={[styles.rankNumber, item.rank <= 3 && { color: colors.secondary }]}>
          #{item.rank}
        </Text>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarIcon}>{item.avatar || '👤'}</Text>
        </View>
        <Text style={[styles.playerName, item.isCurrentUser && styles.currentUserName]} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.scoreContainer}>
          <Ionicons name="star" size={14} color={colors.secondary} />
          <Text style={styles.playerScore}>{item.score.toLocaleString()} pts</Text>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#070d1a', '#0d162a', '#070d1a']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <Animated.View entering={FadeInDown.delay(50)} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <View style={{ width: 40 }} />
      </Animated.View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={remaining}
          keyExtractor={(item) => item.rank.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListHeaderComponent={
            <Animated.View entering={FadeInDown.delay(100)}>
              {/* Podium Header for Top 3 */}
              <LinearGradient
                colors={[colors.primaryDim, '#004d35', '#002a1e']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.podiumCard}
              >
                <Text style={styles.podiumTitle}>Top Quiz Masters 🏆</Text>

                <View style={styles.podiumRow}>
                  {/* #2 Player */}
                  {top3[1] && (
                    <View style={styles.podiumItem}>
                      <Text style={styles.podiumAvatar}>{top3[1].avatar || '🥈'}</Text>
                      <Text style={styles.podiumName} numberOfLines={1}>{top3[1].name}</Text>
                      <Text style={styles.podiumScore}>{top3[1].score} pts</Text>
                      <PodiumBlock height={65} color={colors.silver} rank="#2" />
                    </View>
                  )}

                  {/* #1 Player */}
                  {top3[0] && (
                    <View style={styles.podiumItem}>
                      <View style={styles.crownBadge}>
                        <Text style={{ fontSize: 20 }}>👑</Text>
                      </View>
                      <Text style={[styles.podiumAvatar, { fontSize: 38 }]}>{top3[0].avatar || '🥇'}</Text>
                      <Text style={[styles.podiumName, { fontWeight: '700', color: colors.secondary }]} numberOfLines={1}>
                        {top3[0].name}
                      </Text>
                      <Text style={[styles.podiumScore, { color: colors.white }]}>{top3[0].score} pts</Text>
                      <PodiumBlock height={90} color={colors.gold} rank="#1" />
                    </View>
                  )}

                  {/* #3 Player */}
                  {top3[2] && (
                    <View style={styles.podiumItem}>
                      <Text style={styles.podiumAvatar}>{top3[2].avatar || '🥉'}</Text>
                      <Text style={styles.podiumName} numberOfLines={1}>{top3[2].name}</Text>
                      <Text style={styles.podiumScore}>{top3[2].score} pts</Text>
                      <PodiumBlock height={50} color={colors.bronze} rank="#3" />
                    </View>
                  )}
                </View>
              </LinearGradient>

              <Text style={styles.sectionHeaderTitle}>Global Rankings</Text>
            </Animated.View>
          }
        />
      )}

      <BottomNav active="Leaderboard" navigation={navigation} />
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  podiumCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.xxl,
    marginBottom: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    overflow: 'hidden',
  },
  podiumTitle: {
    ...typography.headlineSm,
    color: colors.white,
    fontSize: 18,
    marginBottom: spacing.lg,
  },
  podiumRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: spacing.sm,
    width: '100%',
  },
  podiumItem: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  crownBadge: {
    position: 'absolute',
    top: -24,
    zIndex: 10,
  },
  podiumAvatar: {
    fontSize: 32,
    marginBottom: 4,
  },
  podiumName: {
    ...typography.labelSm,
    fontSize: 12,
    color: colors.white,
    textAlign: 'center',
    width: '100%',
  },
  podiumScore: {
    ...typography.labelSm,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.75)',
    marginBottom: 8,
  },
  podiumBlock: {
    width: '100%',
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  podiumRank: {
    ...typography.headlineSm,
    fontSize: 18,
    color: colors.onPrimary,
  },
  sectionHeaderTitle: {
    ...typography.headlineSm,
    fontSize: 16,
    color: colors.white,
    marginBottom: spacing.md,
  },
  rankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  currentUserRank: {
    backgroundColor: `${colors.primary}20`,
    borderColor: colors.primary,
  },
  rankNumber: {
    ...typography.labelMd,
    fontSize: 15,
    color: colors.onSurfaceVariant,
    width: 36,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  avatarIcon: {
    fontSize: 18,
  },
  playerName: {
    ...typography.labelMd,
    fontSize: 14,
    color: colors.white,
    flex: 1,
  },
  currentUserName: {
    color: colors.primary,
    fontWeight: '700',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.pill,
  },
  playerScore: {
    ...typography.labelSm,
    fontSize: 12,
    color: colors.secondary,
  },
});
