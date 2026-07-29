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
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRefs = useRef<(TextInput | null)[]>(Array(OTP_LENGTH).fill(null));

  const shakeAnim = useSharedValue(0);
  const successScale = useSharedValue(1);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Auto-submit when all digits are filled
  useEffect(() => {
    if (otp.every(d => d !== '') && !loading) {
      handleVerify(otp.join(''));
    }
  }, [otp]);

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
      setOtp(Array(OTP_LENGTH).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeText = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setError('');
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      inputRefs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setCountdown(60);
    setOtp(Array(OTP_LENGTH).fill(''));
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

        {/* OTP Boxes */}
        <Animated.View
          entering={FadeInUp.delay(300).springify().damping(16)}
          style={[styles.otpRow, shakeStyle]}
        >
          {otp.map((digit, index) => {
            const isFocused = focusedIndex === index;
            const isFilled = digit !== '';
            return (
              <View key={index} style={styles.otpBoxWrapper}>
                {isFocused && <View style={styles.otpFocusBg} />}
                <TextInput
                  ref={(ref) => { inputRefs.current[index] = ref; }}
                  style={[
                    styles.otpBox,
                    isFocused && styles.otpBoxFocused,
                    isFilled && styles.otpBoxFilled,
                    error ? styles.otpBoxError : {},
                  ]}
                  value={digit}
                  onChangeText={(t) => handleChangeText(t, index)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                  onFocus={() => setFocusedIndex(index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  textAlign="center"
                  selectionColor={colors.primary}
                  caretHidden
                />
              </View>
            );
          })}
        </Animated.View>

        {/* Error */}
        {error ? (
          <Animated.Text entering={FadeInDown.duration(200)} style={styles.errorText}>
            ❌ {error}
          </Animated.Text>
        ) : null}

        {/* Verify button */}
        <Animated.View entering={FadeInUp.delay(400)} style={styles.btnWrapper}>
          <TouchableOpacity
            onPress={() => handleVerify(otp.join(''))}
            disabled={otp.some(d => d === '') || loading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={
                otp.every(d => d !== '')
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
