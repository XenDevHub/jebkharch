// src/components/NetworkStatusBanner.tsx
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StatusBar,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../theme/designSystem';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export const NetworkStatusBanner: React.FC = () => {
  const { isOffline, isChecking, justReconnected, refresh } = useNetworkStatus();
  const translateY = useSharedValue(-120);

  const isVisible = isOffline || justReconnected;

  useEffect(() => {
    if (isVisible) {
      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 120,
      });
    } else {
      translateY.value = withTiming(-120, { duration: 300 });
    }
  }, [isVisible, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // Don't render anything if completely online and not recently reconnected
  if (!isVisible && translateY.value === -120) {
    return null;
  }

  const isSuccessState = !isOffline && justReconnected;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <LinearGradient
        colors={
          isSuccessState
            ? ['#003828', '#002218']
            : ['#381116', '#220b0e']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.innerCard,
          isSuccessState ? styles.cardSuccess : styles.cardOffline,
        ]}
      >
        {/* Left Icon with Pulse/Glow */}
        <View
          style={[
            styles.iconWrap,
            isSuccessState ? styles.iconWrapSuccess : styles.iconWrapOffline,
          ]}
        >
          <Ionicons
            name={isSuccessState ? 'checkmark-circle' : 'cloud-offline-outline'}
            size={18}
            color={isSuccessState ? colors.primary : colors.error}
          />
        </View>

        {/* Text Details */}
        <View style={styles.textWrap}>
          <Text style={styles.titleText}>
            {isSuccessState ? 'Internet Restored' : 'No Internet Connection'}
          </Text>
          <Text style={styles.subText} numberOfLines={1}>
            {isSuccessState
              ? 'Back online! Syncing latest scores...'
              : 'Please check your Wi-Fi or mobile data'}
          </Text>
        </View>

        {/* Retry Button (only when offline) */}
        {!isSuccessState && (
          <TouchableOpacity
            style={[styles.retryBtn, isChecking && styles.retryBtnDisabled]}
            onPress={refresh}
            disabled={isChecking}
            activeOpacity={0.7}
          >
            {isChecking ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <View style={styles.retryInner}>
                <Ionicons name="refresh-outline" size={13} color="#ffffff" />
                <Text style={styles.retryText}>Retry</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </LinearGradient>
    </Animated.View>
  );
};

const topOffset = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 6 : 14;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: topOffset,
    left: spacing.container,
    right: spacing.container,
    zIndex: 99999,
    elevation: 99,
  },
  innerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 10,
  },
  cardOffline: {
    borderColor: '#ff575755',
  },
  cardSuccess: {
    borderColor: '#00e5a060',
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  iconWrapOffline: {
    backgroundColor: '#ff575722',
  },
  iconWrapSuccess: {
    backgroundColor: '#00e5a022',
  },
  textWrap: {
    flex: 1,
  },
  titleText: {
    ...typography.labelSm,
    color: '#ffffff',
    fontWeight: '700',
  },
  subText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#cbd5e1',
    marginTop: 1,
  },
  retryBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: borderRadius.md,
    marginLeft: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  retryBtnDisabled: {
    opacity: 0.6,
  },
  retryInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  retryText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '600',
  },
});
