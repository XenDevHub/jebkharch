// src/screens/auth/PhoneAuthScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, Dimensions,
} from 'react-native';
import Animated, {
  FadeInDown, FadeInUp,
  useSharedValue, useAnimatedStyle,
  withRepeat, withSequence, withTiming,
  withSpring, Easing,
} from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { colors, typography, spacing, borderRadius } from '../../theme/designSystem';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../api/client';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PhoneAuth'>;
};

const { height } = Dimensions.get('window');

function FloatingCoin() {
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-12, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.sin) })
      ), -1, false
    );
    rotate.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(8, { duration: 2000, easing: Easing.inOut(Easing.sin) })
      ), -1, false
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <Animated.View style={[styles.coinContainer, style]}>
      <LinearGradient
        colors={[`${colors.primary}40`, `${colors.primary}15`]}
        style={styles.coinGradient}
      >
        <Text style={styles.coinEmoji}>💰</Text>
      </LinearGradient>
      {/* Glow shadow */}
      <View style={styles.coinGlow} />
    </Animated.View>
  );
}

export default function PhoneAuthScreen({ navigation }: Props) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);

  const borderAnim = useSharedValue(0);
  const errorShake = useSharedValue(0);

  useEffect(() => {
    borderAnim.value = withTiming(focused ? 1 : 0, { duration: 250 });
  }, [focused]);

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: error
      ? colors.error
      : borderAnim.value === 1
      ? colors.primary
      : colors.glassBorder,
    shadowOpacity: borderAnim.value * 0.4,
  }));

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: errorShake.value }],
  }));

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      setError('Valid phone number dilen na bhai 😅');
      errorShake.value = withSequence(
        withTiming(-10, { duration: 60 }),
        withTiming(10, { duration: 60 }),
        withTiming(-8, { duration: 60 }),
        withTiming(8, { duration: 60 }),
        withTiming(0, { duration: 60 })
      );
      return;
    }
    setError('');
    setLoading(true);
    try {
      const cleanPhone = phone.startsWith('0') ? phone : `0${phone}`;
      await api.auth.requestOtp(cleanPhone);
      navigation.navigate('OtpVerify', { phone: cleanPhone });
    } catch (err: any) {
      setError(err.response?.data?.message || 'OTP pathate pareni, try koro again');
      errorShake.value = withSequence(
        withTiming(-10, { duration: 60 }), withTiming(10, { duration: 60 }),
        withTiming(-8, { duration: 60 }), withTiming(8, { duration: 60 }),
        withTiming(0, { duration: 60 })
      );
    } finally {
      setLoading(false);
    }
  };

  const canSend = phone.length >= 10 && !loading;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#070d1a', '#091520', '#070d1a']}
        style={StyleSheet.absoluteFill}
      />

      {/* Top decorative gradient */}
      <LinearGradient
        colors={[`${colors.primary}15`, 'transparent']}
        style={styles.topDecor}
      />

      <View style={styles.content}>
        {/* Logo area */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.logoArea}>
          <FloatingCoin />
          <Text style={styles.appName}>Jeb Kharch</Text>
          <Text style={styles.tagline}>Pakistan ka #1 Quiz App</Text>
        </Animated.View>

        {/* Card */}
        <Animated.View entering={FadeInUp.delay(300).springify().damping(16)} style={styles.card}>
          <Text style={styles.cardTitle}>Sign In</Text>
          <Text style={styles.cardSubtitle}>
            Apna number dalo, hum OTP bhejenge 📲
          </Text>

          {/* Phone input */}
          <Animated.View style={[styles.inputWrapper, borderStyle, shakeStyle]}>
            <View style={styles.prefixBox}>
              <Text style={styles.flagText}>🇵🇰</Text>
              <Text style={styles.prefixText}>+92</Text>
              <View style={styles.prefixDivider} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="3XX XXXXXXX"
              placeholderTextColor={colors.onSurfaceMuted}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={(t) => { setPhone(t); setError(''); }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              maxLength={11}
            />
            {phone.length >= 10 && (
              <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
            )}
          </Animated.View>

          {/* Error */}
          {error ? (
            <Animated.Text entering={FadeInDown.duration(200)} style={styles.errorText}>
              {error}
            </Animated.Text>
          ) : null}

          {/* CTA Button */}
          <TouchableOpacity
            onPress={handleSendOtp}
            disabled={!canSend}
            activeOpacity={0.85}
            style={styles.btnWrapper}
          >
            <LinearGradient
              colors={canSend ? [colors.primary, colors.primaryDim] : [`${colors.primary}40`, `${colors.primaryDim}40`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.btn}
            >
              {loading ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <>
                  <Text style={styles.btnText}>OTP Bhejo</Text>
                  <Ionicons name="arrow-forward" size={20} color={colors.onPrimary} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            Continue kore aap hamare Terms & Privacy se agree karte hain
          </Text>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topDecor: {
    position: 'absolute', top: 0, left: 0, right: 0, height: height * 0.4,
  },
  content: {
    flex: 1, justifyContent: 'center', padding: spacing.xl, gap: spacing.xl,
  },
  logoArea: { alignItems: 'center', gap: spacing.sm },
  coinContainer: { alignItems: 'center', marginBottom: spacing.sm },
  coinGradient: {
    width: 88, height: 88, borderRadius: 44,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: `${colors.primary}40`,
  },
  coinGlow: {
    position: 'absolute', width: 88, height: 88, borderRadius: 44,
    backgroundColor: `${colors.primary}20`,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, shadowRadius: 20, elevation: 10,
  },
  coinEmoji: { fontSize: 42 },
  appName: {
    ...typography.headlineMd, color: colors.primary, letterSpacing: 1,
    textShadowColor: `${colors.primary}60`, textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  tagline: { ...typography.labelSm, color: colors.onSurfaceMuted, letterSpacing: 0.5 },
  card: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xxl,
    borderWidth: 1, borderColor: colors.glassBorder,
    padding: spacing.xl, gap: spacing.lg,
  },
  cardTitle: { ...typography.headlineMd, color: colors.white },
  cardSubtitle: { ...typography.bodyMd, color: colors.onSurfaceVariant, marginTop: -spacing.sm },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.lg, borderWidth: 1.5,
    height: 60, paddingRight: spacing.md,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 0 }, shadowRadius: 8,
  },
  prefixBox: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, gap: spacing.xs, height: '100%',
  },
  flagText: { fontSize: 20 },
  prefixText: { ...typography.labelMd, color: colors.primary, fontSize: 16 },
  prefixDivider: {
    width: 1, height: 24, backgroundColor: colors.glassBorderBright, marginLeft: spacing.sm,
  },
  input: {
    flex: 1, ...typography.bodyLg, color: colors.white,
    paddingHorizontal: spacing.sm, height: '100%',
  },
  errorText: {
    ...typography.labelSm, color: colors.error,
    marginTop: -spacing.sm, textAlign: 'center',
  },
  btnWrapper: { borderRadius: borderRadius.pill, overflow: 'hidden' },
  btn: {
    flexDirection: 'row', height: 58,
    justifyContent: 'center', alignItems: 'center', gap: spacing.sm,
  },
  btnText: { ...typography.labelMd, fontSize: 17, color: colors.onPrimary },
  disclaimer: {
    ...typography.labelSm, color: colors.onSurfaceMuted,
    textAlign: 'center', lineHeight: 16,
  },
});
