// src/screens/LeaderboardScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors, typography, spacing } from '../theme/designSystem';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '../api/client';

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

  const renderItem = ({ item }: { item: LeaderboardItem }) => (
    <View style={[styles.rankItem, item.isCurrentUser && styles.currentUserRank]}>
      <Text style={styles.rankNumber}>#{item.rank}</Text>
      <Text style={styles.avatarIcon}>{item.avatar}</Text>
      <Text style={[styles.playerName, item.isCurrentUser && styles.currentUserName]}>
        {item.name}
      </Text>
      <View style={styles.scoreContainer}>
        <Ionicons name="star" size={14} color={colors.secondary} />
        <Text style={styles.playerScore}>{item.score.toLocaleString()} pts</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <View style={{ width: 40 }} />
      </View>

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
            <View>
              {/* Podium Header for Top 3 */}
              <LinearGradient
                colors={[colors.primary, '#006b4b']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.podiumCard}
              >
                <Text style={styles.podiumTitle}>Top Quiz Masters 🏆</Text>
                
                <View style={styles.podiumRow}>
                  {top3[1] && (
                    <View style={styles.podiumItem}>
                      <Text style={styles.podiumAvatar}>{top3[1].avatar}</Text>
                      <Text style={styles.podiumName} numberOfLines={1}>{top3[1].name}</Text>
                      <Text style={styles.podiumScore}>{top3[1].score}</Text>
                      <View style={[styles.podiumBlock, { height: 60, backgroundColor: '#94a3b8' }]}>
                        <Text style={styles.podiumRank}>#2</Text>
                      </View>
                    </View>
                  )}

                  {top3[0] && (
                    <View style={styles.podiumItem}>
                      <Text style={[styles.podiumAvatar, { fontSize: 40 }]}>{top3[0].avatar}</Text>
                      <Text style={[styles.podiumName, { fontWeight: '700' }]} numberOfLines={1}>{top3[0].name}</Text>
                      <Text style={styles.podiumScore}>{top3[0].score}</Text>
                      <View style={[styles.podiumBlock, { height: 80, backgroundColor: colors.secondary }]}>
                        <Text style={styles.podiumRank}>#1</Text>
                      </View>
                    </View>
                  )}

                  {top3[2] && (
                    <View style={styles.podiumItem}>
                      <Text style={styles.podiumAvatar}>{top3[2].avatar}</Text>
                      <Text style={styles.podiumName} numberOfLines={1}>{top3[2].name}</Text>
                      <Text style={styles.podiumScore}>{top3[2].score}</Text>
                      <View style={[styles.podiumBlock, { height: 45, backgroundColor: '#b45309' }]}>
                        <Text style={styles.podiumRank}>#3</Text>
                      </View>
                    </View>
                  )}
                </View>
              </LinearGradient>

              <Text style={styles.sectionHeaderTitle}>Global Rankings</Text>
            </View>
          }
        />
      )}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xl * 2,
  },
  podiumCard: {
    padding: spacing.lg,
    borderRadius: 24,
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  podiumTitle: {
    ...typography.headlineMd,
    color: '#fff',
    fontSize: 18,
    marginBottom: spacing.md,
  },
  podiumRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: spacing.md,
    width: '100%',
  },
  podiumItem: {
    flex: 1,
    alignItems: 'center',
  },
  podiumAvatar: {
    fontSize: 32,
    marginBottom: 4,
  },
  podiumName: {
    ...typography.labelMd,
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
  },
  podiumScore: {
    ...typography.bodyLg,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 6,
  },
  podiumBlock: {
    width: '100%',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  podiumRank: {
    ...typography.headlineMd,
    fontSize: 18,
    color: '#fff',
  },
  sectionHeaderTitle: {
    ...typography.headlineMd,
    fontSize: 18,
    color: '#fff',
    marginBottom: spacing.md,
  },
  rankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.surfaceVariant}40`,
    padding: spacing.md,
    borderRadius: 16,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: `${colors.onSurface}10`,
  },
  currentUserRank: {
    backgroundColor: `${colors.primary}25`,
    borderColor: colors.primary,
  },
  rankNumber: {
    ...typography.labelMd,
    fontSize: 16,
    color: colors.onSurfaceVariant,
    width: 36,
  },
  avatarIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  playerName: {
    ...typography.labelMd,
    fontSize: 15,
    color: '#fff',
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
    borderRadius: 12,
  },
  playerScore: {
    ...typography.labelMd,
    fontSize: 12,
    color: colors.secondary,
  },
});
