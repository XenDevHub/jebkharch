// src/screens/auth/OtpVerifyScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import Animated, {
  FadeInDown, FadeInUp,
  useSharedValue, useAnimatedStyle,
  withSequence, withTiming, withSpring, Easing,
} from 'react-native-reanimated';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { colors, typography, spacing, borderRadius } from '../../theme/designSystem';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../api/client';

type Props = NativeStackScreenProps<RootStackParamList, 'OtpVerify'>;

const OTP_LENGTH = 6;

export default function OtpVerifyScreen({ route, navigation }: Props) {
  const { phone } = route.params;
  const [otpText, setOtpText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [isFocused, setIsFocused] = useState(false);
  const hiddenInputRef = useRef<TextInput>(null);

  const shakeAnim = useSharedValue(0);
  const successScale = useSharedValue(1);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Auto-submit when all digits are filled
  useEffect(() => {
    if (otpText.length === OTP_LENGTH && !loading) {
      handleVerify(otpText);
    }
  }, [otpText]);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeAnim.value }],
  }));

  const triggerShake = () => {
    shakeAnim.value = withSequence(
      withTiming(-12, { duration: 60 }), withTiming(12, { duration: 60 }),
      withTiming(-10, { duration: 60 }), withTiming(10, { duration: 60 }),
      withTiming(-6, { duration: 60 }), withTiming(0, { duration: 60 })
    );
  };

  const handleVerify = async (code: string) => {
    if (code.length !== OTP_LENGTH) return;
    setError('');
    setLoading(true);
    try {
      const res = await api.auth.verifyOtp(phone, code, 'temp-device-id');
      if (res.data?.accessToken) {
        await AsyncStorage.setItem('accessToken', res.data.accessToken);
        if (res.data.refreshToken) {
          await AsyncStorage.setItem('refreshToken', res.data.refreshToken);
        }
      }
      successScale.value = withSpring(1.1, { damping: 8 }, () => {
        successScale.value = withSpring(1);
      });
      navigation.replace('Home');
    } catch (err: any) {
      setError(err.response?.data?.message || 'OTP galat hai, dobara try karo');
      triggerShake();
      setOtpText('');
      setTimeout(() => hiddenInputRef.current?.focus(), 100);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (text: string) => {
    const cleanText = text.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH);
    setOtpText(cleanText);
    setError('');
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setCountdown(60);
    setOtpText('');
    setError('');
    try {
      await api.auth.requestOtp(phone);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Resend nahi ho paya');
    }
  };

  // Circular progress for countdown
  const progressPct = countdown / 60;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient colors={['#070d1a', '#091520', '#070d1a']} style={StyleSheet.absoluteFill} />

      <View style={styles.content}>
        {/* Back button */}
        <Animated.View entering={FadeInDown.delay(50)}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={colors.onSurface} />
          </TouchableOpacity>
        </Animated.View>

        {/* Header */}
        <Animated.View entering={FadeInDown.delay(150).springify()} style={styles.header}>
          <View style={styles.iconWrap}>
            <LinearGradient
              colors={[`${colors.secondary}30`, `${colors.secondary}10`]}
              style={styles.iconBg}
            >
              <Text style={{ fontSize: 44 }}>🔐</Text>
            </LinearGradient>
            <View style={styles.iconGlow} />
          </View>
          <Text style={styles.title}>Verification</Text>
          <Text style={styles.subtitle}>
            <Text style={{ color: colors.primary }}>{phone}</Text>
            {'\n'}pe bheja gaya 6-digit code dalo
          </Text>
        </Animated.View>

        {/* Hidden TextInput for native keyboard handling */}
        <TextInput
          ref={hiddenInputRef}
          style={styles.hiddenInput}
          value={otpText}
          onChangeText={handleOtpChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          keyboardType="number-pad"
          maxLength={OTP_LENGTH}
          autoFocus
          caretHidden
          secureTextEntry={false}
        />

        {/* Visual OTP Boxes */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => hiddenInputRef.current?.focus()}
        >
          <Animated.View
            entering={FadeInUp.delay(300).springify().damping(16)}
            style={[styles.otpRow, shakeStyle]}
          >
            {Array(OTP_LENGTH)
              .fill(0)
              .map((_, index) => {
                const digit = otpText[index] || '';
                const isCurrentFocused = isFocused && (otpText.length === index || (otpText.length === OTP_LENGTH && index === OTP_LENGTH - 1));
                const isFilled = digit !== '';
                return (
                  <View key={index} style={styles.otpBoxWrapper}>
                    {isCurrentFocused && <View style={styles.otpFocusBg} />}
                    <View
                      style={[
                        styles.otpBox,
                        isCurrentFocused && styles.otpBoxFocused,
                        isFilled && styles.otpBoxFilled,
                        error ? styles.otpBoxError : {},
                        { justifyContent: 'center', alignItems: 'center' },
                      ]}
                    >
                      <Text style={styles.otpBoxText}>{digit}</Text>
                    </View>
                  </View>
                );
              })}
          </Animated.View>
        </TouchableOpacity>

        {/* Error */}
        {error ? (
          <Animated.Text entering={FadeInDown.duration(200)} style={styles.errorText}>
            ❌ {error}
          </Animated.Text>
        ) : null}

        {/* Verify button */}
        <Animated.View entering={FadeInUp.delay(400)} style={styles.btnWrapper}>
          <TouchableOpacity
            onPress={() => handleVerify(otpText)}
            disabled={otpText.length < OTP_LENGTH || loading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={
                otpText.length === OTP_LENGTH
                  ? [colors.primary, colors.primaryDim]
                  : [`${colors.primary}40`, `${colors.primaryDim}40`]
              }
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.btn}
            >
              {loading
                ? <ActivityIndicator color={colors.onPrimary} />
                : <Text style={styles.btnText}>Verify & Aage Baro 🚀</Text>
              }
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Resend */}
        <Animated.View entering={FadeInUp.delay(500)} style={styles.resendRow}>
          <Text style={styles.resendLabel}>Code nahi mila? </Text>
          <TouchableOpacity onPress={handleResend} disabled={countdown > 0}>
            <Text style={[styles.resendLink, countdown > 0 && styles.resendDisabled]}>
              {countdown > 0 ? `Resend (${countdown}s)` : 'Resend Code'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const BOX_SIZE = 48;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: {
    flex: 1, padding: spacing.xl, paddingTop: spacing.xl * 2,
    justifyContent: 'center', gap: spacing.lg,
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center', alignItems: 'center',
    alignSelf: 'flex-start', marginBottom: spacing.sm,
  },
  header: { alignItems: 'center', gap: spacing.sm },
  iconWrap: { position: 'relative', marginBottom: spacing.sm },
  iconBg: {
    width: 96, height: 96, borderRadius: 48,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: `${colors.secondary}40`,
  },
  iconGlow: {
    position: 'absolute', width: 96, height: 96, borderRadius: 48,
    shadowColor: colors.secondary, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5, shadowRadius: 16,
  },
  title: { ...typography.displayMd, color: colors.white },
  subtitle: {
    ...typography.bodyMd, color: colors.onSurfaceVariant,
    textAlign: 'center', lineHeight: 24,
  },
  otpRow: {
    flexDirection: 'row', justifyContent: 'center', gap: spacing.sm,
  },
  otpBoxWrapper: { position: 'relative' },
  otpFocusBg: {
    position: 'absolute', inset: -3, borderRadius: 16,
    backgroundColor: `${colors.primary}12`,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6, shadowRadius: 8,
  },
  otpBox: {
    width: BOX_SIZE, height: BOX_SIZE + 10, borderRadius: 12,
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1.5, borderColor: colors.glassBorder,
  },
  otpBoxText: {
    ...typography.headlineMd, fontSize: 22, color: colors.white,
    textAlign: 'center',
  },
  otpBoxFocused: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}12`,
  },
  otpBoxFilled: {
    borderColor: `${colors.primary}80`,
  },
  otpBoxError: { borderColor: colors.error },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  errorText: {
    ...typography.labelSm, color: colors.error,
    textAlign: 'center', marginTop: -spacing.sm,
  },
  btnWrapper: { borderRadius: borderRadius.pill, overflow: 'hidden' },
  btn: {
    height: 58, justifyContent: 'center', alignItems: 'center', gap: spacing.sm,
  },
  btnText: { ...typography.labelMd, fontSize: 17, color: colors.onPrimary },
  resendRow: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
  },
  resendLabel: { ...typography.bodyMd, color: colors.onSurfaceVariant },
  resendLink: { ...typography.labelMd, color: colors.primary, fontSize: 14 },
  resendDisabled: { color: colors.onSurfaceMuted },
});
