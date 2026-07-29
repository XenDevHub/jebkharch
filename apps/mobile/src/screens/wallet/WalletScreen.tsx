// src/screens/wallet/WalletScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  Alert, ScrollView,
} from 'react-native';
import Animated, {
  FadeInDown, FadeInUp,
  useSharedValue, useAnimatedStyle, withTiming, withSpring,
} from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme/designSystem';
import { api } from '../../api/client';
import AnimatedNumber from '../../components/AnimatedNumber';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Wallet'>;
};

const QUICK_AMOUNTS = [100, 500, 1000, 2000];

export default function WalletScreen({ navigation }: Props) {
  const [balance, setBalance] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<'amount' | 'phone' | null>(null);

  const amountBorder = useSharedValue(0);
  const phoneBorder = useSharedValue(0);
  const btnScale = useSharedValue(1);

  useEffect(() => { fetchBalance(); }, []);

  useEffect(() => {
    amountBorder.value = withTiming(focusedField === 'amount' ? 1 : 0, { duration: 200 });
    phoneBorder.value = withTiming(focusedField === 'phone' ? 1 : 0, { duration: 200 });
  }, [focusedField]);

  const fetchBalance = async () => {
    try {
      const res = await api.wallet.getBalance();
      setBalance(res.data.balance);
    } catch {}
  };

  const handleWithdraw = async () => {
    const amt = parseInt(amount, 10);
    if (!amt || isNaN(amt) || amt <= 0) {
      Alert.alert('❌ Invalid Amount', 'Please enter a valid withdrawal amount.');
      return;
    }
    if (balance !== null && amt > balance) {
      Alert.alert('❌ Insufficient Balance', `You only have ${balance} coins.`);
      return;
    }
    if (!phone || phone.length < 10) {
      Alert.alert('❌ Invalid Number', 'Please enter a valid Easypaisa account number.');
      return;
    }
    setLoading(true);
    btnScale.value = withSpring(0.95);
    try {
      const res = await api.wallet.requestWithdrawal(amt, phone);
      if (res.data.success) {
        setBalance(res.data.newBalance);
        setAmount('');
        setPhone('');
        Alert.alert('✅ Request Submitted!', `Your withdrawal of ${amt} Coins has been submitted. Processing in 24-48 hours.`);
      }
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Withdrawal request failed.');
    } finally {
      setLoading(false);
      btnScale.value = withSpring(1);
    }
  };

  const amountBorderStyle = useAnimatedStyle(() => ({
    borderColor: focusedField === 'amount' ? colors.primary : colors.glassBorder,
    shadowOpacity: amountBorder.value * 0.35,
  }));
  const phoneBorderStyle = useAnimatedStyle(() => ({
    borderColor: focusedField === 'phone' ? colors.primary : colors.glassBorder,
    shadowOpacity: phoneBorder.value * 0.35,
  }));
  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  const canWithdraw = amount.length > 0 && phone.length >= 10 && !loading;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient colors={['#070d1a', '#091a14', '#070d1a']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <Animated.View entering={FadeInDown.delay(50)} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Wallet</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('WithdrawalHistory' as any)}
          style={styles.historyBtn}
        >
          <Ionicons name="time-outline" size={20} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Balance Card */}
        <Animated.View entering={FadeInDown.delay(150).springify()} style={styles.balanceCardWrapper}>
          <LinearGradient
            colors={[colors.primaryDim, '#004d35', '#002a1e']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.balanceCard}
          >
            {/* Decoration circles */}
            <View style={styles.decorCircle1} />
            <View style={styles.decorCircle2} />

            <View style={styles.balanceContent}>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <View style={styles.balanceRow}>
                <Text style={styles.starIcon}>⭐</Text>
                {balance !== null ? (
                  <AnimatedNumber
                    value={balance}
                    style={styles.balanceValue}
                    duration={1000}
                  />
                ) : (
                  <ActivityIndicator color={colors.white} size="large" style={{ marginLeft: spacing.sm }} />
                )}
              </View>
              <Text style={styles.balanceSubtext}>Coins available to withdraw</Text>
            </View>

            {/* Quick stats row */}
            <View style={styles.balanceStatsRow}>
              <View style={styles.balanceStat}>
                <Text style={styles.balanceStatValue}>PKR {balance ? Math.floor(balance * 0.1) : 0}</Text>
                <Text style={styles.balanceStatLabel}>Est. Cash Value</Text>
              </View>
              <View style={styles.balanceStatDivider} />
              <View style={styles.balanceStat}>
                <Text style={styles.balanceStatValue}>10 Coins = PKR 1</Text>
                <Text style={styles.balanceStatLabel}>Current Rate</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Easypaisa badge */}
        <Animated.View entering={FadeInDown.delay(250)} style={styles.epBadge}>
          <LinearGradient
            colors={[`${colors.secondary}20`, `${colors.secondary}08`]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.epGradient}
          >
            <Text style={{ fontSize: 22 }}>💚</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.epTitle}>Easypaisa Withdrawal</Text>
              <Text style={styles.epSubtitle}>Minimum 100 coins · Processed in 24-48h</Text>
            </View>
            <View style={styles.epBadgePill}>
              <Text style={styles.epBadgeText}>SAFE</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Form */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.form}>
          {/* Amount input */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              <Ionicons name="star" size={13} color={colors.secondary} /> Amount (Coins)
            </Text>
            <Animated.View style={[styles.inputWrapper, amountBorderStyle,
              { shadowColor: colors.primary }
            ]}>
              <Ionicons name="cash-outline" size={20} color={colors.onSurfaceMuted} />
              <TextInput
                style={styles.input}
                placeholder="e.g. 500"
                placeholderTextColor={colors.onSurfaceMuted}
                keyboardType="number-pad"
                value={amount}
                onChangeText={setAmount}
                onFocus={() => setFocusedField('amount')}
                onBlur={() => setFocusedField(null)}
              />
              {amount.length > 0 && (
                <TouchableOpacity onPress={() => setAmount('')}>
                  <Ionicons name="close-circle" size={18} color={colors.onSurfaceMuted} />
                </TouchableOpacity>
              )}
            </Animated.View>

            {/* Quick amount chips */}
            <View style={styles.quickAmounts}>
              {QUICK_AMOUNTS.map(q => (
                <TouchableOpacity
                  key={q}
                  style={[styles.quickChip, amount === String(q) && styles.quickChipActive]}
                  onPress={() => setAmount(String(q))}
                >
                  <Text style={[styles.quickChipText, amount === String(q) && styles.quickChipTextActive]}>
                    {q}
                  </Text>
                </TouchableOpacity>
              ))}
              {balance !== null && (
                <TouchableOpacity
                  style={[styles.quickChip, styles.quickChipAll]}
                  onPress={() => setAmount(String(balance))}
                >
                  <Text style={styles.quickChipAllText}>All</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Phone input */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              <Ionicons name="phone-portrait-outline" size={13} color={colors.secondary} /> Easypaisa Number
            </Text>
            <Animated.View style={[styles.inputWrapper, phoneBorderStyle,
              { shadowColor: colors.primary }
            ]}>
              <Text style={{ fontSize: 18 }}>🇵🇰</Text>
              <Text style={styles.phonePrefix}>+92</Text>
              <View style={styles.phoneDivider} />
              <TextInput
                style={styles.input}
                placeholder="3XX XXXXXXX"
                placeholderTextColor={colors.onSurfaceMuted}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField(null)}
                maxLength={11}
              />
            </Animated.View>
          </View>

          {/* Submit button */}
          <Animated.View style={btnStyle}>
            <TouchableOpacity
              onPress={handleWithdraw}
              disabled={!canWithdraw}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={canWithdraw ? [colors.primary, colors.primaryDim] : [`${colors.primary}40`, `${colors.primaryDim}40`]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.submitBtn}
              >
                {loading ? (
                  <ActivityIndicator color={colors.onPrimary} />
                ) : (
                  <>
                    <Ionicons name="send" size={18} color={colors.onPrimary} />
                    <Text style={styles.submitBtnText}>Withdrawal Request Bhejo</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingTop: spacing.xl * 2, paddingBottom: spacing.md,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: colors.surfaceVariant, justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { ...typography.headlineSm, color: colors.white },
  historyBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: colors.surfaceVariant, justifyContent: 'center', alignItems: 'center',
  },
  scrollContent: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  balanceCardWrapper: {
    borderRadius: borderRadius.xxl, overflow: 'hidden',
    ...shadows.neonGreen,
  },
  balanceCard: { padding: spacing.xl, overflow: 'hidden' },
  decorCircle1: {
    position: 'absolute', right: -30, top: -30,
    width: 150, height: 150, borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  decorCircle2: {
    position: 'absolute', right: 40, bottom: -50,
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  balanceContent: { alignItems: 'center', marginBottom: spacing.lg },
  balanceLabel: { ...typography.labelSm, color: 'rgba(255,255,255,0.7)', letterSpacing: 1, marginBottom: spacing.sm },
  balanceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  starIcon: { fontSize: 36 },
  balanceValue: { ...typography.displayLg, color: colors.white, fontSize: 44 },
  balanceSubtext: { ...typography.bodyMd, color: 'rgba(255,255,255,0.55)', marginTop: spacing.xs, fontSize: 12 },
  balanceStatsRow: {
    flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: borderRadius.lg, padding: spacing.md, alignItems: 'center',
  },
  balanceStat: { flex: 1, alignItems: 'center' },
  balanceStatValue: { ...typography.labelMd, color: colors.white },
  balanceStatLabel: { ...typography.labelSm, color: 'rgba(255,255,255,0.55)', fontSize: 10 },
  balanceStatDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.2)' },
  epBadge: { borderRadius: borderRadius.xl, overflow: 'hidden', borderWidth: 1, borderColor: `${colors.secondary}30` },
  epGradient: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.md },
  epTitle: { ...typography.labelMd, color: colors.white },
  epSubtitle: { ...typography.labelSm, color: colors.onSurfaceVariant, fontSize: 11 },
  epBadgePill: {
    backgroundColor: `${colors.primary}20`, paddingHorizontal: spacing.xs,
    paddingVertical: 3, borderRadius: borderRadius.sm,
    borderWidth: 1, borderColor: colors.neonBorder,
  },
  epBadgeText: { ...typography.labelSm, color: colors.primary, fontSize: 9 },
  form: { gap: spacing.lg },
  fieldGroup: { gap: spacing.sm },
  fieldLabel: { ...typography.labelSm, color: colors.onSurfaceVariant },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surfaceVariant, borderRadius: borderRadius.lg,
    borderWidth: 1.5, height: 56, paddingHorizontal: spacing.md, gap: spacing.sm,
    shadowOffset: { width: 0, height: 0 }, shadowRadius: 8,
  },
  input: { flex: 1, ...typography.bodyMd, color: colors.white },
  phonePrefix: { ...typography.labelMd, color: colors.primary },
  phoneDivider: { width: 1, height: 22, backgroundColor: colors.glassBorderBright },
  quickAmounts: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  quickChip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1, borderColor: colors.glassBorder,
  },
  quickChipActive: { backgroundColor: `${colors.primary}25`, borderColor: colors.primary },
  quickChipText: { ...typography.labelSm, color: colors.onSurfaceVariant },
  quickChipTextActive: { color: colors.primary },
  quickChipAll: { backgroundColor: `${colors.secondary}20`, borderColor: `${colors.secondary}50` },
  quickChipAllText: { ...typography.labelSm, color: colors.secondary },
  submitBtn: {
    flexDirection: 'row', height: 58, borderRadius: borderRadius.pill,
    justifyContent: 'center', alignItems: 'center', gap: spacing.sm,
  },
  submitBtnText: { ...typography.labelMd, fontSize: 16, color: colors.onPrimary },
});
