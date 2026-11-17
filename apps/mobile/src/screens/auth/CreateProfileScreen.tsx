// src/screens/auth/CreateProfileScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { colors, typography, spacing, borderRadius } from '../../theme/designSystem';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../api/client';
import { registerForPushNotificationsAsync } from '../../services/notificationService';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateProfile'>;

export default function CreateProfileScreen({ route, navigation }: Props) {
  const { phone, otpCode, deviceId } = route.params;
  const [name, setName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateProfile = async () => {
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setError('Apna naam daalein (kam az kam 2 huroof)');
      return;
    }
    setError('');
    setLoading(true);
    try {
      // Create profile with name and optional referral code
      const regRes = await api.auth.register({
        phone,
        name: trimmedName,
        referralCode: referralCode.trim() || undefined,
        deviceId,
        platform: 'android',
        deviceModel: 'Android SDK built for x86',
      });

      if (regRes.data?.accessToken) {
        await AsyncStorage.setItem('accessToken', regRes.data.accessToken);
        if (regRes.data.refreshToken) {
          await AsyncStorage.setItem('refreshToken', regRes.data.refreshToken);
        }
        await AsyncStorage.setItem('user_phone', phone);
        // Register push token immediately after creating profile
        registerForPushNotificationsAsync().catch(() => null);
      }
      navigation.replace('Home');
    } catch (err: any) {
      const msg = err.response?.data?.message;
      if (typeof msg === 'string' && msg.toLowerCase().includes('referral')) {
        setError('Referral code galat hai. Check karein ya chor dein.');
      } else {
        setError(msg || 'Profile nahi ban saka. Dobara koshish karein.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient colors={['#070d1a', '#091520', '#070d1a']} style={StyleSheet.absoluteFill} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
            <View style={styles.iconWrap}>
              <LinearGradient
                colors={[`${colors.secondary}30`, `${colors.secondary}10`]}
                style={styles.iconBg}
              >
                <Text style={{ fontSize: 44 }}>👤</Text>
              </LinearGradient>
            </View>
            <Text style={styles.title}>Apna Profile Banayein</Text>
            <Text style={styles.subtitle}>
              Khel shuru karne ke liye apna naam daalein
            </Text>
          </Animated.View>

          {/* Name Input */}
          <Animated.View entering={FadeInUp.delay(200).springify()}>
            <Text style={styles.inputLabel}>Apna Naam *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color={colors.onSurfaceVariant} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Naam daalein"
                placeholderTextColor={colors.onSurfaceMuted}
                value={name}
                onChangeText={(t) => { setName(t); setError(''); }}
                maxLength={30}
                autoFocus
              />
            </View>
          </Animated.View>

          {/* Referral Code Input */}
          <Animated.View entering={FadeInUp.delay(300).springify()}>
            <Text style={styles.inputLabel}>Referral Code (Ikhtiyari)</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="gift-outline" size={20} color={colors.onSurfaceVariant} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Agar koi code hai toh yahan daalein"
                placeholderTextColor={colors.onSurfaceMuted}
                value={referralCode}
                onChangeText={(t) => { setReferralCode(t.toUpperCase()); setError(''); }}
                maxLength={20}
                autoCapitalize="characters"
              />
            </View>
            <Text style={styles.inputHint}>
              🎁 Referral code se aap aur aapke dost dono ko coins milte hain!
            </Text>
          </Animated.View>

          {/* Error */}
          {error ? (
            <Animated.Text entering={FadeInDown.duration(200)} style={styles.errorText}>
              ❌ {error}
            </Animated.Text>
          ) : null}

          {/* Create button */}
          <Animated.View entering={FadeInUp.delay(400)} style={styles.btnWrapper}>
            <TouchableOpacity
              onPress={handleCreateProfile}
              disabled={loading || name.trim().length < 2}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={
                  name.trim().length >= 2
                    ? [colors.primary, colors.primaryDim]
                    : [`${colors.primary}40`, `${colors.primaryDim}40`]
                }
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.btn}
              >
                {loading
                  ? <ActivityIndicator color={colors.onPrimary} />
                  : <Text style={styles.btnText}>Shuru Karein 🚀</Text>
                }
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1, justifyContent: 'center' },
  content: {
    padding: spacing.xl,
    paddingVertical: spacing.xl * 1.5,
    gap: spacing.lg,
  },
  header: { alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  iconWrap: { marginBottom: spacing.sm },
  iconBg: {
    width: 96, height: 96, borderRadius: 48,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: `${colors.secondary}40`,
  },
  title: { ...typography.displayMd, color: colors.white },
  subtitle: {
    ...typography.bodyMd, color: colors.onSurfaceVariant,
    textAlign: 'center', lineHeight: 24,
  },
  inputLabel: {
    ...typography.labelSm, color: colors.onSurface,
    marginBottom: spacing.xs, marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5, borderColor: colors.glassBorder,
    paddingHorizontal: spacing.md,
    height: 56,
  },
  inputIcon: { marginRight: spacing.sm },
  input: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.white,
    fontSize: 16,
  },
  inputHint: {
    ...typography.labelSm, color: colors.onSurfaceMuted,
    marginTop: spacing.xs, marginLeft: 4, fontSize: 12,
  },
  errorText: {
    ...typography.labelSm, color: colors.error,
    textAlign: 'center',
  },
  btnWrapper: { borderRadius: borderRadius.pill, overflow: 'hidden', marginTop: spacing.sm },
  btn: {
    height: 58, justifyContent: 'center', alignItems: 'center', gap: spacing.sm,
  },
  btnText: { ...typography.labelMd, fontSize: 17, color: colors.onPrimary },
});
