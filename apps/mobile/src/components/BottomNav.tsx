// src/components/BottomNav.tsx
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors, typography, spacing } from '../theme/designSystem';

type NavItem = {
  key: string;
  label: string;
  icon: string;
  activeIcon: string;
};

const NAV_ITEMS: NavItem[] = [
  { key: 'Home', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
  { key: 'Leaderboard', label: 'Rankings', icon: 'trophy-outline', activeIcon: 'trophy' },
  { key: 'Wallet', label: 'Wallet', icon: 'wallet-outline', activeIcon: 'wallet' },
  { key: 'Profile', label: 'Profile', icon: 'person-outline', activeIcon: 'person' },
];

type Props = {
  active: string;
  navigation: any;
};

export default function BottomNav({ active, navigation }: Props) {
  return (
    <View style={styles.container}>
      {/* Glow line at top */}
      <View style={styles.glowLine} />

      <View style={styles.navRow}>
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.key;
          return (
            <NavButton
              key={item.key}
              item={item}
              isActive={isActive}
              onPress={() => {
                if (!isActive) navigation.navigate(item.key);
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

function NavButton({
  item,
  isActive,
  onPress,
}: {
  item: NavItem;
  isActive: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const bgOpacity = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    bgOpacity.value = withTiming(isActive ? 1 : 0, { duration: 200 });
  }, [isActive]);

  const handlePress = () => {
    scale.value = withSpring(0.85, { damping: 10 }, () => {
      scale.value = withSpring(1, { damping: 10 });
    });
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pillStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
    transform: [{ scaleX: bgOpacity.value * 1 + (1 - bgOpacity.value) * 0.3 }],
  }));

  return (
    <TouchableOpacity
      style={styles.navItem}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Animated.View style={animatedStyle}>
        <Animated.View style={[styles.activePill, pillStyle]} />
        <View style={styles.iconWrapper}>
          <Ionicons
            name={(isActive ? item.activeIcon : item.icon) as any}
            size={22}
            color={isActive ? colors.primary : colors.onSurfaceMuted}
          />
          <Text style={[styles.label, isActive && styles.labelActive]}>
            {item.label}
          </Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
  },
  glowLine: {
    height: 1,
    backgroundColor: colors.neonBorder,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  iconWrapper: {
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  activePill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primaryGlow,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neonBorder,
  },
  label: {
    ...typography.labelSm,
    color: colors.onSurfaceMuted,
    fontSize: 10,
  },
  labelActive: {
    color: colors.primary,
  },
});
