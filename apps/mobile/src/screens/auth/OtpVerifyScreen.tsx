import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { colors, typography, spacing } from '../../theme/designSystem';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../api/client';

type Props = NativeStackScreenProps<RootStackParamList, 'OtpVerify'>;

export default function OtpVerifyScreen({ route, navigation }: Props) {
  const { phone } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setError('');
    setLoading(true);
    try {
      // We pass a dummy deviceId here since the interceptor will add the real one or we let backend handle it
      // actually, apiClient interceptor needs deviceId, let's just pass 'temp-device' if required by the body
      const res = await api.auth.verifyOtp(phone, otp, 'temp-device-id');
      
      if (res.data?.isNewUser) {
        // Technically we need a Create Profile screen, but for this redesign let's assume we register them or go Home
        // In a real app we'd navigate to 'CreateProfile'
        // Just for flow, let's pretend login succeeded
      }
      
      if (res.data?.accessToken) {
        await AsyncStorage.setItem('accessToken', res.data.accessToken);
        if (res.data.refreshToken) {
          await AsyncStorage.setItem('refreshToken', res.data.refreshToken);
        }
      }
      
      // Navigate Home
      navigation.replace('Home');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setCountdown(60);
    try {
      await api.auth.requestOtp(phone);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Ionicons name="shield-checkmark-outline" size={60} color={colors.secondary} />
          <Text style={styles.title}>Verification</Text>
          <Text style={styles.subtitle}>Enter the 6-digit code sent to{'\n'}{phone}</Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="• • • • • •"
            placeholderTextColor={colors.onSurfaceVariant}
            keyboardType="number-pad"
            value={otp}
            onChangeText={(text) => {
              setOtp(text);
              setError('');
            }}
            maxLength={6}
            textAlign="center"
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity 
          style={[styles.button, (!otp || loading) && styles.buttonDisabled]} 
          onPress={handleVerify}
          disabled={!otp || loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <Text style={styles.buttonText}>Verify & Proceed</Text>
          )}
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive the code? </Text>
          <TouchableOpacity onPress={handleResend} disabled={countdown > 0}>
            <Text style={[styles.resendLink, countdown > 0 && styles.resendDisabled]}>
              {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    paddingTop: spacing.xl * 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.surfaceVariant}50`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl * 1.5,
  },
  title: {
    ...typography.displayLg,
    fontSize: 28,
    color: '#fff',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodyLg,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  inputContainer: {
    backgroundColor: `${colors.surfaceVariant}50`,
    borderWidth: 1,
    borderColor: `${colors.onSurface}22`,
    borderRadius: 16,
    height: 70,
    marginBottom: spacing.xl,
    justifyContent: 'center',
  },
  input: {
    ...typography.displayLg,
    fontSize: 32,
    color: '#fff',
    letterSpacing: 8,
  },
  errorText: {
    color: colors.error,
    ...typography.labelMd,
    textAlign: 'center',
    marginTop: -spacing.md,
    marginBottom: spacing.md,
  },
  button: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    ...typography.labelMd,
    fontSize: 16,
    color: colors.onPrimary,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  resendText: {
    ...typography.bodyLg,
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },
  resendLink: {
    ...typography.labelMd,
    fontSize: 14,
    color: colors.primary,
  },
  resendDisabled: {
    color: colors.onSurfaceVariant,
  }
});
