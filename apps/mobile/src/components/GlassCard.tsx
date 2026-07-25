// src/components/GlassCard.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography } from '../theme/designSystem';

type GlassCardProps = {
  title: string;
  onPress?: () => void;
};

export default function GlassCard({ title, onPress }: GlassCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.wrapper}>
      <LinearGradient
        colors={[`${colors.primary}33`, `${colors.surfaceVariant}33` as any]}
        style={styles.card}
      >
        <Text style={styles.title}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    minWidth: 120,
    maxWidth: '48%',
    marginBottom: spacing.sm,
  } as ViewStyle,
  card: {
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: `${colors.onSurface}22`,
    // Note: backdropFilter works on web; on native it's ignored but the gradient gives a glass look.
  } as ViewStyle,
  title: {
    ...typography.bodyLg,
    color: colors.onPrimary,
    textAlign: 'center',
  } as TextStyle,
});
