import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { colors, typography, spacing } from '../../theme/designSystem';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../api/client';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Wallet'>;
};

export default function WalletScreen({ navigation }: Props) {
  const [balance, setBalance] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const res = await api.wallet.getBalance();
      setBalance(res.data.balance);
    } catch (e) {
      console.log(e);
    }
  };

  const handleWithdraw = async () => {
    const withdrawAmount = parseInt(amount, 10);
    if (!withdrawAmount || isNaN(withdrawAmount) || withdrawAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }
    if (balance && withdrawAmount > balance) {
      Alert.alert('Insufficient Balance', 'You cannot withdraw more than your current balance.');
      return;
    }
    if (!phone || phone.length < 10) {
      Alert.alert('Invalid Number', 'Please enter a valid Easypaisa account number.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.wallet.requestWithdrawal(withdrawAmount, phone);
      if (res.data.success) {
        setBalance(res.data.newBalance);
        setAmount('');
        setPhone('');
        Alert.alert('Success!', `Withdrawal request of ${withdrawAmount} Coins submitted successfully.`);
      }
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to withdraw');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wallet</Text>
        <TouchableOpacity onPress={() => navigation.navigate('WithdrawalHistory' as any)} style={styles.backBtn}>
          <Ionicons name="time-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Balance Card */}
        <LinearGradient
          colors={[colors.primary, '#006b4b']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <View style={styles.balanceContainer}>
            <Ionicons name="star" size={32} color={colors.secondary} />
            <Text style={styles.balanceValue}>
              {balance !== null ? balance : '...'}
            </Text>
          </View>
        </LinearGradient>

        <Text style={styles.sectionTitle}>Withdraw to Easypaisa</Text>

        <View style={styles.form}>
          <Text style={styles.inputLabel}>Amount (Coins)</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="e.g. 1000"
              placeholderTextColor={colors.onSurfaceVariant}
              keyboardType="number-pad"
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          <Text style={styles.inputLabel}>Easypaisa Account Number</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="e.g. 03001234567"
              placeholderTextColor={colors.onSurfaceVariant}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              maxLength={11}
            />
          </View>

          <TouchableOpacity 
            style={[styles.withdrawButton, loading && styles.disabledButton]} 
            onPress={handleWithdraw}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <Text style={styles.withdrawButtonText}>Submit Request</Text>
            )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.xl,
    paddingTop: spacing.xl * 2,
  },
  backBtn: {
    padding: spacing.sm,
    backgroundColor: `${colors.surfaceVariant}50`,
    borderRadius: 8,
  },
  headerTitle: {
    ...typography.headlineMd,
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: spacing.xl,
  },
  balanceCard: {
    padding: spacing.xl,
    borderRadius: 24,
    marginBottom: spacing.xl * 1.5,
    alignItems: 'center',
  },
  balanceLabel: {
    ...typography.bodyLg,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: spacing.xs,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  balanceValue: {
    ...typography.displayLg,
    fontSize: 40,
    color: '#fff',
  },
  sectionTitle: {
    ...typography.headlineMd,
    color: '#fff',
    marginBottom: spacing.lg,
  },
  form: {
    gap: spacing.md,
  },
  inputLabel: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.xs,
  },
  inputContainer: {
    backgroundColor: `${colors.surfaceVariant}50`,
    borderWidth: 1,
    borderColor: `${colors.onSurface}22`,
    borderRadius: 16,
    height: 56,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  input: {
    ...typography.bodyLg,
    color: '#fff',
    height: '100%',
  },
  withdrawButton: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  disabledButton: {
    opacity: 0.7,
  },
  withdrawButtonText: {
    ...typography.labelMd,
    fontSize: 16,
    color: colors.onPrimary,
  }
});
