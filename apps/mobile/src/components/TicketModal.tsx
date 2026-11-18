import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../theme/designSystem';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '../api/client';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS, useTickets, useWalletBalance } from '../hooks/useAppData';
import { AdMobManager } from '../services/adMobService';

interface TicketModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenTournaments?: () => void;
}

export default function TicketModal({ visible, onClose, onOpenTournaments }: TicketModalProps) {
  const queryClient = useQueryClient();
  const { data: ticketsCount = 0 } = useTickets();
  const { data: balance = 0 } = useWalletBalance();

  const [claimingDaily, setClaimingDaily] = useState(false);
  const [watchingAd, setWatchingAd] = useState(false);
  const [buyingCoins, setBuyingCoins] = useState(false);

  // Claim Daily Free Ticket
  const handleClaimDaily = async () => {
    setClaimingDaily(true);
    try {
      await api.tickets.claimFreeDaily();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tickets }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile }),
      ]);
      Alert.alert('Free Ticket Claimed! 🎟️', '1 Daily Tournament Ticket added to your wallet!');
    } catch (err: any) {
      Alert.alert('Already Claimed', err?.response?.data?.message || 'Daily free ticket already claimed today.');
    } finally {
      setClaimingDaily(false);
    }
  };

  // Watch Rewarded Ad for Ticket
  const handleWatchAd = () => {
    setWatchingAd(true);
    AdMobManager.showRewardedAd(
      async () => {
        try {
          await api.tickets.buyTicket('REWARDED_AD');
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tickets }),
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile }),
          ]);
          Alert.alert('Ticket Granted! 🎟️', '+1 Tournament Ticket added!');
        } catch (err: any) {
          Alert.alert('Error', err?.response?.data?.message || 'Could not claim ticket from ad');
        } finally {
          setWatchingAd(false);
        }
      },
      () => {
        setWatchingAd(false);
      },
      () => {
        setWatchingAd(false);
        Alert.alert('Ad Loading', 'Rewarded video is still preparing. Please retry in a few moments.');
      }
    );
  };

  // Buy Ticket with Coins
  const handleBuyWithCoins = async () => {
    const cost = 500;
    if (balance < cost) {
      return Alert.alert(
        'Insufficient Coins',
        `A tournament ticket costs ${cost} coins. You currently have ${balance} coins. Play quizzes or watch ads to earn more!`
      );
    }

    setBuyingCoins(true);
    try {
      await api.tickets.buyTicket('BOUGHT_COINS');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tickets }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.walletBalance }),
      ]);
      Alert.alert('Purchase Successful! 🎟️', '1 Tournament Ticket purchased for 500 coins!');
    } catch (err: any) {
      Alert.alert('Purchase Failed', err?.response?.data?.message || 'Failed to purchase ticket.');
    } finally {
      setBuyingCoins(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 20 }}>🎟️</Text>
              <Text style={styles.title}>Tournament Tickets</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
            {/* Balance Banner */}
            <LinearGradient
              colors={['#581c87', '#3b0764', '#0f172a']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.banner}
            >
              <View style={styles.bannerRow}>
                <View style={styles.ticketIconBox}>
                  <Text style={{ fontSize: 36 }}>🎟️</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.balanceNumber}>{ticketsCount} Tickets</Text>
                  <Text style={styles.balanceSub}>
                    Mega Tournament & Weekend Cash Cup entry passes
                  </Text>
                </View>
              </View>
            </LinearGradient>

            <Text style={styles.infoText}>
              Regular quizzes only consume ❤️ Lives. High-stakes Mega Tournaments with big cash prizes require 🎟️ Tickets to join!
            </Text>

            {/* Action 1: Free Daily Claim */}
            <View style={styles.actionCard}>
              <View style={styles.actionLeft}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(168, 85, 247, 0.18)' }]}>
                  <Text style={{ fontSize: 20 }}>🎁</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionTitle}>Daily Free Ticket</Text>
                  <Text style={styles.actionDesc}>Free gift once every 24 hours</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.claimBtn}
                onPress={handleClaimDaily}
                disabled={claimingDaily}
                activeOpacity={0.8}
              >
                {claimingDaily ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.claimBtnText}>Claim</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Action 2: Watch Ad */}
            <View style={styles.actionCard}>
              <View style={styles.actionLeft}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(236, 72, 153, 0.18)' }]}>
                  <Ionicons name="play-circle" size={22} color="#ec4899" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionTitle}>Watch Video</Text>
                  <Text style={styles.actionDesc}>Watch a sponsored ad for +1 ticket</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.claimBtn, { backgroundColor: '#ec4899' }]}
                onPress={handleWatchAd}
                disabled={watchingAd}
                activeOpacity={0.8}
              >
                {watchingAd ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.claimBtnText}>Watch</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Action 3: Buy with Coins */}
            <View style={styles.actionCard}>
              <View style={styles.actionLeft}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(234, 179, 8, 0.18)' }]}>
                  <Text style={{ fontSize: 20 }}>🪙</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionTitle}>Buy with Coins</Text>
                  <Text style={styles.actionDesc}>500 Coins = 1 Tournament Ticket</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.claimBtn, { backgroundColor: '#ca8a04' }]}
                onPress={handleBuyWithCoins}
                disabled={buyingCoins}
                activeOpacity={0.8}
              >
                {buyingCoins ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.claimBtnText}>500 🪙</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Tournaments CTA */}
            {onOpenTournaments && (
              <TouchableOpacity
                style={styles.tournamentsCTA}
                onPress={() => {
                  onClose();
                  onOpenTournaments();
                }}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#7c3aed', '#4f46e5']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.tournamentsGradient}
                >
                  <Text style={{ fontSize: 18 }}>🏆</Text>
                  <Text style={styles.tournamentsText}>Browse Active Mega Tournaments</Text>
                  <Ionicons name="arrow-forward" size={16} color={colors.white} />
                </LinearGradient>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  card: {
    width: '100%',
    maxHeight: '88%',
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: spacing.lg,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.labelLg,
    fontSize: 18,
    color: colors.white,
    fontWeight: '700',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  banner: {
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.35)',
    marginBottom: spacing.sm,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  ticketIconBox: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceNumber: {
    ...typography.headlineMd,
    fontSize: 22,
    color: colors.white,
    fontWeight: '800',
  },
  balanceSub: {
    ...typography.bodySm,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 2,
    lineHeight: 15,
  },
  infoText: {
    ...typography.bodySm,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    lineHeight: 17,
    marginVertical: spacing.sm,
    paddingHorizontal: 2,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: borderRadius.xl,
    padding: spacing.sm + 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: spacing.sm,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
    marginRight: spacing.sm,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTitle: {
    ...typography.labelMd,
    fontSize: 14,
    color: colors.white,
    fontWeight: '700',
  },
  actionDesc: {
    ...typography.bodySm,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 1,
  },
  claimBtn: {
    backgroundColor: '#9333ea',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: borderRadius.pill,
    minWidth: 78,
    alignItems: 'center',
    justifyContent: 'center',
  },
  claimBtnText: {
    ...typography.labelSm,
    fontSize: 12,
    color: colors.white,
    fontWeight: '700',
  },
  tournamentsCTA: {
    borderRadius: borderRadius.pill,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  tournamentsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
  },
  tournamentsText: {
    ...typography.labelMd,
    fontSize: 13,
    color: colors.white,
    fontWeight: '700',
  },
});
