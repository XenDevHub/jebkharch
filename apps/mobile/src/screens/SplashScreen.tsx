// src/screens/SplashScreen.tsx
import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  ZoomIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors, typography, spacing } from '../theme/designSystem';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Splash'>;
};

function FloatingLogo() {
  const translateY = useSharedValue(0);
  const glowScale = useSharedValue(1);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: 0.3,
  }));

  return (
    <Animated.View entering={ZoomIn.delay(300).springify()} style={styles.logoContainer}>
      {/* Outer glow ring */}
      <Animated.View style={[styles.glowRing, glowStyle]} />
      {/* Inner glow ring */}
      <View style={styles.innerRing} />
      <Animated.Text style={[styles.logoEmoji, floatStyle]}>💰</Animated.Text>
    </Animated.View>
  );
}

export default function SplashScreen({ navigation }: Props) {
  useEffect(() => {
    const checkState = async () => {
      await new Promise(resolve => setTimeout(resolve, 2500));
      try {
        const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
        const token = await AsyncStorage.getItem('accessToken');
        if (!hasSeenOnboarding) {
          navigation.replace('Onboarding');
        } else if (token) {
          navigation.replace('Home');
        } else {
          navigation.replace('PhoneAuth');
        }
      } catch {
        navigation.replace('PhoneAuth');
      }
    };
    checkState();
  }, [navigation]);

  return (
    <Animated.View style={styles.container} entering={FadeIn} exiting={FadeOut}>
      <LinearGradient
        colors={['#070d1a', '#0b1a2e', '#070d1a']}
        style={StyleSheet.absoluteFill}
      />

      {/* Radial glow in center */}
      <View style={styles.centerGlow} />

      <FloatingLogo />

      <Animated.View entering={FadeInDown.delay(600)} style={styles.textContainer}>
        <Text style={styles.title}>Jeb Kharch</Text>
        <View style={styles.taglineRow}>
          <View style={styles.taglineLine} />
          <Text style={styles.subtitle}>Play Smart. Win Real.</Text>
          <View style={styles.taglineLine} />
        </View>
      </Animated.View>

      <Animated.View entering={FadeIn.delay(1200)} style={styles.bottomDots}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={[styles.dot, i === 1 && styles.dotActive]}
          />
        ))}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  centerGlow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: `${colors.primary}08`,
    top: '50%',
    left: '50%',
    marginTop: -150,
    marginLeft: -150,
  },
  logoContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  glowRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: `${colors.primary}25`,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  innerRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${colors.primary}15`,
    borderWidth: 1,
    borderColor: `${colors.primary}60`,
  },
  logoEmoji: {
    fontSize: 56,
  },
  textContainer: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.displayLg,
    color: colors.primary,
    letterSpacing: 2,
    textShadowColor: `${colors.primary}80`,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  taglineLine: {
    width: 30,
    height: 1,
    backgroundColor: colors.onSurfaceMuted,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    letterSpacing: 1,
  },
  bottomDots: {
    position: 'absolute',
    bottom: 60,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.onSurfaceMuted,
  },
  dotActive: {
    width: 20,
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
});
