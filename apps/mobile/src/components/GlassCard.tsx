// src/components/GlassCard.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/designSystem';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

type GlassCardProps = {
  title: string;
  icon?: string;
  onPress?: () => void;
  isPremium?: boolean;
  delay?: number;
};

// Check if the icon is an emoji (non-ASCII) or an Ionicons name
const isEmoji = (str?: string) => {
  if (!str) return false;
  // Ionicons names are ASCII-only lowercase strings like 'football', 'flask'
  return !/^[a-z0-9-]+$/.test(str);
};

export default function GlassCard({ title, icon, onPress, isPremium }: GlassCardProps) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.93, { damping: 15, stiffness: 300 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 250 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.wrapper, animatedStyle]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={styles.touchable}
      >
        <LinearGradient
          colors={
            isPremium
              ? [`${colors.secondary}22`, `${colors.surfaceCard}dd`]
              : [`${colors.primary}18`, `${colors.surfaceCard}dd`]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.card,
            isPremium ? styles.premiumBorder : styles.normalBorder,
          ]}
        >
          {/* Top glow line */}
          <View
            style={[
              styles.topGlow,
              { backgroundColor: isPremium ? colors.secondary : colors.primary },
            ]}
          />

          <View style={styles.iconContainer}>
            <View
              style={[
                styles.iconBg,
                { backgroundColor: isPremium ? `${colors.secondary}20` : `${colors.primary}20` },
              ]}
            >
              {icon && isEmoji(icon) ? (
                <Text style={{ fontSize: 24 }}>{icon}</Text>
              ) : icon ? (
                <Ionicons
                  name={icon as any}
                  size={24}
                  color={isPremium ? colors.secondary : colors.primary}
                />
              ) : (
                <Text style={{ fontSize: 24 }}>🎯</Text>
              )}
            </View>
            {isPremium && (
              <View style={styles.proBadge}>
                <Ionicons name="star" size={9} color={colors.onSecondary} />
                <Text style={styles.proBadgeText}>PRO</Text>
              </View>
            )}
          </View>

          <Text style={styles.title} numberOfLines={2}>{title}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '48%',
    marginBottom: spacing.md,
  },
  touchable: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  card: {
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    height: 118,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  normalBorder: {
    borderColor: colors.neonBorder,
  },
  premiumBorder: {
    borderColor: `${colors.secondary}50`,
  },
  topGlow: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 1,
    borderRadius: 1,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.labelMd,
    fontSize: 14,
    color: colors.onSurface,
    lineHeight: 20,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 2,
  },
  proBadgeText: {
    ...typography.labelSm,
    fontSize: 9,
    color: colors.onSecondary,
  },
});
