// src/screens/HomeScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import GlassCard from '../components/GlassCard';
import { colors, spacing, typography } from '../theme/designSystem';

const categories = [
  'General Knowledge',
  'Science',
  'History',
  'Sports',
  'Music',
  'Movies',
];

export default function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Jeb Kharch</Text>
        <Text style={styles.subtitle}>Play Smart. Win Real.</Text>
      </View>
      <View style={styles.grid}>
        {categories.map((cat) => (
          <GlassCard key={cat} title={cat} onPress={() => { /* TODO: navigate */ }} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.displayLg,
    color: colors.onPrimary,
  },
  subtitle: {
    ...typography.bodyLg,
    color: colors.onSurfaceVariant,
    marginTop: spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
});
