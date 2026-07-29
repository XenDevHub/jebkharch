// src/screens/wallet/WithdrawalHistoryScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { colors, typography, spacing, borderRadius } from '../../theme/designSystem';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '../../api/client';
import PulsingDot from '../../components/PulsingDot';

type WithdrawalItem = {
  id: string;
  amount: number;
  account: string;
  status: string;
  createdAt: string;
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'WithdrawalHistory'>;
};

export default function WithdrawalHistoryScreen({ navigation }: Props) {
  const [history, setHistory] = useState<WithdrawalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async () => {
    try {
      const res = await api.wallet.getWithdrawalHistory();
      if (res.data) {
        setHistory(res.data);
      }
    } catch (e) {
      console.log('Error fetching history', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const totalWithdrawn = history
    .filter(i => i.status === 'COMPLETED')
    .reduce((sum, item) => sum + item.amount, 0);

  const pendingAmount = history
    .filter(i => i.status === 'PENDING')
    .reduce((sum, item) => sum + item.amount, 0);

  const renderItem = ({ item, index }: { item: WithdrawalItem; index: number }) => {
    const formattedDate = new Date(item.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const isPending = item.status === 'PENDING';

    return (
      <Animated.View entering={FadeInDown.delay(index * 60).springify().damping(15)} style={styles.cardWrapper}>
        <LinearGradient
          colors={[`${colors.surfaceVariant}60`, colors.surfaceCard]}
          style={styles.card}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: isPending ? `${colors.warning}15` : `${colors.primary}15` }]}>
              <Ionicons
                name={isPending ? "time" : "checkmark-circle"}
                size={20}
                color={isPending ? colors.warning : colors.primary}
              />
            </View>
            <View style={styles.info}>
              <Text style={styles.amountText}>{item.amount} Coins</Text>
              <Text style={styles.accountText}>Easypaisa: {item.account}</Text>
            </View>
            <View style={[styles.badge, isPending ? styles.pendingBadge : styles.completedBadge]}>
              {isPending && <PulsingDot color={colors.warning} size={6} />}
              <Text style={[styles.badgeText, isPending ? styles.pendingText : styles.completedText]}>
                {item.status}
              </Text>
            </View>
          </View>
          <View style={styles.cardFooter}>
            <Text style={styles.dateText}>{formattedDate}</Text>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#070d1a', '#091520', '#070d1a']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <Animated.View entering={FadeInDown.delay(50)} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Withdrawal History</Text>
        <View style={{ width: 40 }} />
      </Animated.View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListHeaderComponent={
            <Animated.View entering={FadeInDown.delay(100)} style={styles.summaryContainer}>
              <LinearGradient
                colors={[`${colors.primary}20`, `${colors.surfaceVariant}40`]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.summaryCard}
              >
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Withdrawn</Text>
                  <Text style={styles.summaryValue}>{totalWithdrawn} Coins</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Pending Requests</Text>
                  <Text style={[styles.summaryValue, { color: colors.warning }]}>{pendingAmount} Coins</Text>
                </View>
              </LinearGradient>
              <Text style={styles.sectionHeaderTitle}>Past Transactions</Text>
            </Animated.View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBg}>
                <Ionicons name="receipt-outline" size={40} color={colors.onSurfaceMuted} />
              </View>
              <Text style={styles.emptyText}>No withdrawal history found</Text>
              <Text style={styles.emptySubtext}>Your requested payouts will appear here.</Text>
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
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  summaryContainer: {
    marginBottom: spacing.md,
  },
  summaryCard: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.neonBorder,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    fontSize: 11,
    marginBottom: 4,
  },
  summaryValue: {
    ...typography.headlineSm,
    color: colors.primary,
    fontSize: 18,
  },
  summaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.glassBorderBright,
  },
  sectionHeaderTitle: {
    ...typography.headlineSm,
    color: colors.white,
    fontSize: 16,
    marginBottom: spacing.xs,
  },
  cardWrapper: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  card: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
  },
  amountText: {
    ...typography.labelMd,
    fontSize: 16,
    color: colors.white,
  },
  accountText: {
    ...typography.bodyMd,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.pill,
    gap: 6,
  },
  pendingBadge: {
    backgroundColor: `${colors.warning}15`,
    borderWidth: 1,
    borderColor: `${colors.warning}40`,
  },
  completedBadge: {
    backgroundColor: `${colors.primary}15`,
    borderWidth: 1,
    borderColor: `${colors.primary}40`,
  },
  badgeText: {
    ...typography.labelSm,
    fontSize: 11,
  },
  pendingText: {
    color: colors.warning,
  },
  completedText: {
    color: colors.primary,
  },
  cardFooter: {
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    alignItems: 'flex-end',
  },
  dateText: {
    ...typography.labelSm,
    fontSize: 11,
    color: colors.onSurfaceMuted,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.xs,
  },
  emptyIconBg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.headlineSm,
    fontSize: 16,
    color: colors.white,
  },
  emptySubtext: {
    ...typography.bodyMd,
    fontSize: 13,
    color: colors.onSurfaceMuted,
  },
});
