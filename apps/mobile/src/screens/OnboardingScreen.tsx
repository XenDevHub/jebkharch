// src/screens/OnboardingScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
  FadeInRight,
  FadeOutLeft,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors, typography, spacing, borderRadius } from '../theme/designSystem';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;
};

const SLIDES = [
  {
    id: 1,
    title: 'Play Quizzes',
    description: 'Test your knowledge across multiple categories.\nFrom History to Sports, we have it all!',
    icon: 'game-controller',
    emoji: '🎮',
    accent: colors.primary,
    accentDim: `${colors.primary}20`,
    gradientStart: '#070d1a',
    gradientEnd: '#0a1f1a',
  },
  {
    id: 2,
    title: 'Earn Coins',
    description: 'Win quizzes and earn coins.\nThe smarter you play, the more you win.',
    icon: 'trophy',
    emoji: '🏆',
    accent: colors.secondary,
    accentDim: `${colors.secondary}20`,
    gradientStart: '#070d1a',
    gradientEnd: '#1a1200',
  },
  {
    id: 3,
    title: 'Withdraw Cash',
    description: 'Convert your coins to real money and\nwithdraw instantly via Easypaisa.',
    icon: 'wallet',
    emoji: '💸',
    accent: '#a78bfa',
    accentDim: '#a78bfa20',
    gradientStart: '#070d1a',
    gradientEnd: '#100a1f',
  },
];

const { width } = Dimensions.get('window');

export default function OnboardingScreen({ navigation }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const buttonScale = useSharedValue(1);

  const handleNext = async () => {
    buttonScale.value = withSpring(0.92, { damping: 12 }, () => {
      buttonScale.value = withSpring(1, { damping: 10 });
    });

    if (currentIndex < SLIDES.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      navigation.replace('PhoneAuth');
    }
  };

  const slide = SLIDES[currentIndex];

  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[slide.gradientStart as any, slide.gradientEnd as any]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View
        key={slide.id}
        entering={FadeInRight.springify().damping(18)}
        exiting={FadeOutLeft.duration(200)}
        style={styles.slideContainer}
      >
        {/* Illustration */}
        <View style={styles.illustrationArea}>
          {/* Outer ring */}
          <View style={[styles.outerRing, { borderColor: `${slide.accent}30` }]} />
          {/* Middle ring */}
          <View style={[styles.middleRing, { borderColor: `${slide.accent}50`, backgroundColor: `${slide.accent}08` }]} />
          {/* Inner circle */}
          <LinearGradient
            colors={[`${slide.accent}30`, `${slide.accent}10`]}
            style={[styles.innerCircle]}
          >
            <Text style={styles.emoji}>{slide.emoji}</Text>
          </LinearGradient>

          {/* Decorative dots */}
          <View style={[styles.decorDot, styles.decorDot1, { backgroundColor: slide.accent }]} />
          <View style={[styles.decorDot, styles.decorDot2, { backgroundColor: slide.accent }]} />
          <View style={[styles.decorDot, styles.decorDot3, { backgroundColor: slide.accent }]} />
        </View>

        <Animated.View entering={FadeInDown.delay(100)} style={styles.textArea}>
          <Text style={[styles.title, { color: slide.accent }]}>{slide.title}</Text>
          <Text style={styles.description}>{slide.description}</Text>
        </Animated.View>
      </Animated.View>

      {/* Footer */}
      <View style={styles.footer}>
        {/* Dots pagination */}
        <View style={styles.pagination}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index
                  ? [styles.activeDot, { backgroundColor: slide.accent, width: 28 }]
                  : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        <Animated.View style={btnStyle}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={handleNext}
            style={styles.buttonWrapper}
          >
            <LinearGradient
              colors={[slide.accent, `${slide.accent}aa`] as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Text style={[styles.buttonText, { color: '#070d1a' }]}>
                {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#070d1a" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {currentIndex < SLIDES.length - 1 && (
          <TouchableOpacity
            onPress={async () => {
              await AsyncStorage.setItem('hasSeenOnboarding', 'true');
              navigation.replace('PhoneAuth');
            }}
            style={styles.skipBtn}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  slideContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    paddingTop: spacing.xxl,
  },
  illustrationArea: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xxl,
    position: 'relative',
  },
  outerRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
  },
  middleRing: {
    position: 'absolute',
    width: 168,
    height: 168,
    borderRadius: 84,
    borderWidth: 1,
  },
  innerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 56,
  },
  decorDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.8,
  },
  decorDot1: { top: 20, right: 30 },
  decorDot2: { bottom: 30, left: 15 },
  decorDot3: { top: 60, left: 10, width: 5, height: 5, borderRadius: 2.5 },
  textArea: {
    alignItems: 'center',
    gap: spacing.md,
  },
  title: {
    ...typography.displayMd,
    textAlign: 'center',
  },
  description: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
    gap: spacing.md,
  },
  pagination: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    borderRadius: 3,
  },
  inactiveDot: {
    width: 6,
    backgroundColor: colors.surfaceVariant,
  },
  buttonWrapper: {
    borderRadius: borderRadius.pill,
    overflow: 'hidden',
    width: width - spacing.xl * 2,
  },
  button: {
    flexDirection: 'row',
    height: 58,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  buttonText: {
    ...typography.labelMd,
    fontSize: 17,
  },
  skipBtn: {
    paddingVertical: spacing.xs,
  },
  skipText: {
    ...typography.bodyMd,
    color: colors.onSurfaceMuted,
  },
});
