// src/components/GlassCard.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography } from '../theme/designSystem';
import { Ionicons } from '@expo/vector-icons';

type GlassCardProps = {
  title: string;
  icon?: string;
  onPress?: () => void;
  isPremium?: boolean;
};

export default function GlassCard({ title, icon, onPress, isPremium }: GlassCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.wrapper}>
      <LinearGradient
        colors={[
          isPremium ? `${colors.secondary}25` : `${colors.primary}20`, 
          `${colors.surfaceVariant}40`
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.card, 
          isPremium && styles.premiumBorder
        ]}
      >
        <View style={styles.iconContainer}>
          {icon && <Ionicons name={icon as any} size={28} color={isPremium ? colors.secondary : colors.primary} />}
          {isPremium && (
            <View style={styles.proBadge}>
              <Ionicons name="star" size={10} color={colors.onSecondary} />
            </View>
          )}
        </View>
        <Text style={styles.title}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '48%',
    marginBottom: spacing.md,
  },
  card: {
    padding: spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${colors.onSurface}15`,
    height: 110,
    justifyContent: 'space-between',
  },
  premiumBorder: {
    borderColor: `${colors.secondary}50`,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    ...typography.labelMd,
    fontSize: 16,
    color: '#ffffff',
  },
  proBadge: {
    backgroundColor: colors.secondary,
    padding: 4,
    borderRadius: 8,
  }
});
