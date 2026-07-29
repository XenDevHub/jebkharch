// src/screens/wallet/WithdrawalHistoryScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { colors, typography, spacing } from '../../theme/designSystem';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../api/client';

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

  const renderItem = ({ item }: { item: WithdrawalItem }) => {
    const formattedDate = new Date(item.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const isPending = item.status === 'PENDING';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconBox}>
            <Ionicons name="wallet" size={20} color={colors.secondary} />
          </View>
          <View style={styles.info}>
            <Text style={styles.amountText}>{item.amount} Coins</Text>
            <Text style={styles.accountText}>Easypaisa: {item.account}</Text>
          </View>
          <View style={[styles.badge, isPending ? styles.pendingBadge : styles.completedBadge]}>
            <Text style={[styles.badgeText, isPending ? styles.pendingText : styles.completedText]}>
              {item.status}
            </Text>
          </View>
        </View>
        <Text style={styles.dateText}>{formattedDate}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Withdrawal History</Text>
        <View style={{ width: 40 }} />
      </View>

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
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={48} color={colors.onSurfaceVariant} />
              <Text style={styles.emptyText}>No withdrawal history found</Text>
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
    gap: spacing.md,
  },
  card: {
    backgroundColor: `${colors.surfaceVariant}40`,
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: `${colors.onSurface}10`,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.secondary}20`,
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
    color: '#fff',
  },
  accountText: {
    ...typography.bodyLg,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingBadge: {
    backgroundColor: '#f59e0b20',
  },
  completedBadge: {
    backgroundColor: '#10b98120',
  },
  badgeText: {
    ...typography.labelMd,
    fontSize: 11,
  },
  pendingText: {
    color: '#f59e0b',
  },
  completedText: {
    color: '#10b981',
  },
  dateText: {
    ...typography.bodyLg,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    textAlign: 'right',
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
    gap: spacing.sm,
  },
  emptyText: {
    ...typography.bodyLg,
    color: colors.onSurfaceVariant,
  },
});
