import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { colors, typography, spacing } from '../../theme/designSystem';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../api/client';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PhoneAuth'>;
};

export default function PhoneAuthScreen({ navigation }: Props) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    
    setError('');
    setLoading(true);
    try {
      // Clean phone number
      const cleanPhone = phone.startsWith('0') ? phone : `0${phone}`;
      await api.auth.requestOtp(cleanPhone);
      navigation.navigate('OtpVerify', { phone: cleanPhone });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons name="chatbubbles-outline" size={60} color={colors.primary} />
          <Text style={styles.title}>Let's Sign You In</Text>
          <Text style={styles.subtitle}>Enter your mobile number to receive an OTP</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.prefix}>+92</Text>
          <TextInput
            style={styles.input}
            placeholder="300 1234567"
            placeholderTextColor={colors.onSurfaceVariant}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={(text) => {
              setPhone(text);
              setError('');
            }}
            maxLength={11}
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity 
          style={[styles.button, (!phone || loading) && styles.buttonDisabled]} 
          onPress={handleSendOtp}
          disabled={!phone || loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <>
              <Text style={styles.buttonText}>Send OTP</Text>
              <Ionicons name="arrow-forward" size={20} color={colors.onPrimary} />
            </>
          )}
        </TouchableOpacity>
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
    justifyContent: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.surfaceVariant}50`,
    borderWidth: 1,
    borderColor: `${colors.onSurface}22`,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    height: 60,
    marginBottom: spacing.xl,
  },
  prefix: {
    ...typography.bodyLg,
    color: colors.primary,
    marginRight: spacing.sm,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    ...typography.bodyLg,
    color: '#fff',
    height: '100%',
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
    flexDirection: 'row',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    ...typography.labelMd,
    fontSize: 16,
    color: colors.onPrimary,
  }
});
