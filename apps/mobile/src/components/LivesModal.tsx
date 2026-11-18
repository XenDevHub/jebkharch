import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../theme/designSystem';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '../api/client';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../hooks/useAppData';
import { AdMobManager } from '../services/adMobService';

interface LivesModalProps {
  visible: boolean;
  lives: number;
  nextRefillInSeconds: number;
  onClose: () => void;
}

export default function LivesModal({
  visible,
  lives,
  nextRefillInSeconds,
  onClose,
}: LivesModalProps) {
  const queryClient = useQueryClient();
  const [secondsLeft, setSecondsLeft] = useState(nextRefillInSeconds);
  const [watchingAd, setWatchingAd] = useState(false);
  const [refillingCoins, setRefillingCoins] = useState(false);

  useEffect(() => {
    setSecondsLeft(nextRefillInSeconds);
  }, [nextRefillInSeconds]);

  // Countdown timer
  useEffect(() => {
    if (lives >= 5 || secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lives });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [lives, secondsLeft]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const missingLives = Math.max(0, 5 - lives);
  const coinCost = missingLives * 10;

  // Watch Rewarded Ad for 1 Life
  const handleWatchAd = () => {
    if (lives >= 5) {
      return Alert.alert('Full Energy', 'You already have maximum 5 hearts! ❤️');
    }

    setWatchingAd(true);
    AdMobManager.showRewardedAd(
      async () => {
        // User finished watching ad
        try {
          await api.bonus.watchAd('REWARDED', 'life');
          await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lives });
          Alert.alert('Energy Restored! ❤️', '+1 Life added to your account!');
        } catch (err: any) {
          Alert.alert('Error', err?.response?.data?.message || 'Could not claim life');
        } finally {
          setWatchingAd(false);
        }
      },
      () => {
        setWatchingAd(false);
      },
      (err) => {
        setWatchingAd(false);
        Alert.alert('Ad Unavailable', 'Rewarded ad is still loading. Please try again in a few moments.');
      }
    );
  };

  // Refill All with Coins
  const handleRefillCoins = async () => {
    if (lives >= 5) {
      return Alert.alert('Full Energy', 'You already have maximum 5 hearts! ❤️');
    }

    setRefillingCoins(true);
    try {
      await api.bonus.refillWithCoins();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lives }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.walletBalance }),
      ]);
      Alert.alert('Refill Complete! 🎉', 'Your lives have been fully restored to 5/5!');
      onClose();
    } catch (err: any) {
      Alert.alert('Insufficient Coins', err?.response?.data?.message || 'Failed to refill lives');
    } finally {
      setRefillingCoins(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Game Energy & Lives</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>

          {/* Hearts Display */}
          <LinearGradient
            colors={['#831843', '#500724', '#0f172a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heartsBox}
          >
            <View style={styles.heartsRow}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Text key={i} style={[styles.heartIcon, i > lives && styles.heartEmpty]}>
                  {i <= lives ? '❤️' : '🤍'}
                </Text>
              ))}
            </View>
            <Text style={styles.livesCountText}>{lives} / 5 Lives</Text>

            {lives < 5 && secondsLeft > 0 ? (
              <View style={styles.timerPill}>
                <Ionicons name="time-outline" size={14} color="#f472b6" />
                <Text style={styles.timerText}>Next life in: {formatTimer(secondsLeft)}</Text>
              </View>
            ) : lives >= 5 ? (
              <Text style={styles.fullEnergyText}>⚡ Full Energy Ready to Play!</Text>
            ) : null}
          </LinearGradient>

          <Text style={styles.infoText}>
            Each quiz match consumes 1 ❤️ life. Lives auto-refill 1 heart every 30 minutes, or you can restore them instantly below!
          </Text>

          {/* Action 1: Watch Ad for Free Life */}
          <TouchableOpacity
            style={[styles.adBtn, (lives >= 5 || watchingAd) && { opacity: 0.6 }]}
            onPress={handleWatchAd}
            disabled={lives >= 5 || watchingAd}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#10b981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.btnGradient}
            >
              {watchingAd ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <>
                  <Ionicons name="play-circle" size={20} color={colors.white} />
                  <Text style={styles.btnText}>Watch Ad for +1 Life</Text>
                  <View style={styles.freeBadge}>
                    <Text style={styles.freeBadgeText}>FREE</Text>
                  </View>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Action 2: Refill All with Coins */}
          {lives < 5 && (
            <TouchableOpacity
              style={[styles.coinBtn, refillingCoins && { opacity: 0.6 }]}
              onPress={handleRefillCoins}
              disabled={refillingCoins}
              activeOpacity={0.8}
            >
              {refillingCoins ? (
                <ActivityIndicator size="small" color={colors.secondary} />
              ) : (
                <>
                  <Ionicons name="star" size={18} color={colors.secondary} />
                  <Text style={styles.coinBtnText}>
                    Refill All to 5 ({coinCost} Coins)
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.dismissBtn} onPress={onClose}>
            <Text style={styles.dismissBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.headlineSm,
    fontSize: 18,
    color: colors.white,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartsBox: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(244, 114, 182, 0.3)',
    marginBottom: spacing.md,
  },
  heartsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  heartIcon: {
    fontSize: 28,
  },
  heartEmpty: {
    opacity: 0.4,
  },
  livesCountText: {
    ...typography.headlineSm,
    fontSize: 20,
    color: colors.white,
    marginTop: 4,
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(244, 114, 182, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(244, 114, 182, 0.4)',
  },
  timerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#f472b6',
  },
  fullEnergyText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#34d399',
    marginTop: spacing.sm,
  },
  infoText: {
    fontSize: 12,
    color: colors.onSurfaceMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  adBtn: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  btnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  btnText: {
    ...typography.labelMd,
    color: colors.white,
    fontWeight: '800',
    fontSize: 14,
  },
  freeBadge: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  freeBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#000',
  },
  coinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.3)',
    gap: 8,
    marginBottom: spacing.sm,
  },
  coinBtnText: {
    ...typography.labelMd,
    color: colors.secondary,
    fontWeight: '700',
    fontSize: 13,
  },
  dismissBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  dismissBtnText: {
    fontSize: 12,
    color: colors.onSurfaceMuted,
  },
});
