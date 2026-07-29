import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { colors, typography, spacing } from '../../theme/designSystem';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type Props = NativeStackScreenProps<RootStackParamList, 'QuizResult'>;

export default function QuizResultScreen({ route, navigation }: Props) {
  const { score, total, coinsEarned } = route.params;
  const isWinner = score > (total / 2);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons 
          name={isWinner ? "trophy" : "sad-outline"} 
          size={120} 
          color={isWinner ? '#f1c40f' : colors.onSurfaceVariant} 
          style={styles.icon}
        />
        
        <Text style={styles.title}>
          {isWinner ? 'Congratulations!' : 'Better luck next time'}
        </Text>
        
        <Text style={styles.subtitle}>
          You scored {score} out of {total}
        </Text>

        {isWinner && (
          <LinearGradient
            colors={[`${colors.secondary}40`, `${colors.surfaceVariant}40`]}
            style={styles.rewardCard}
          >
            <Text style={styles.rewardLabel}>You Earned</Text>
            <View style={styles.rewardValueContainer}>
              <Ionicons name="star" size={24} color={colors.secondary} />
              <Text style={styles.rewardValue}>{coinsEarned} Coins</Text>
            </View>
          </LinearGradient>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.homeButton} 
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.homeButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  icon: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.displayLg,
    fontSize: 32,
    color: '#fff',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodyLg,
    fontSize: 18,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.xl * 2,
  },
  rewardCard: {
    width: '100%',
    padding: spacing.xl,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: `${colors.secondary}50`,
    alignItems: 'center',
  },
  rewardLabel: {
    ...typography.bodyLg,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.sm,
  },
  rewardValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rewardValue: {
    ...typography.displayLg,
    fontSize: 28,
    color: colors.secondary,
  },
  footer: {
    padding: spacing.xl,
    paddingBottom: spacing.xl * 2,
  },
  homeButton: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeButtonText: {
    ...typography.labelMd,
    fontSize: 16,
    color: colors.onPrimary,
  }
});
