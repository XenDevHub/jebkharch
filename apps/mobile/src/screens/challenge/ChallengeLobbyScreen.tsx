// src/screens/challenge/ChallengeLobbyScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ActivityIndicator, Clipboard, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { io, Socket } from 'socket.io-client';
import { colors, spacing, typography, borderRadius } from '../../theme/designSystem';
import { api } from '../../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// In dev, use the same API URL base but replace http with ws for websockets
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://109.199.122.238:3000';
const SOCKET_URL = `${API_URL.replace('/api', '')}/challenge`;

export default function ChallengeLobbyScreen({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [isCreator, setIsCreator] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [countdown, setCountdown] = useState<number | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const connectSocket = async (challId: string) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) return;

      const socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('Socket connected, joining room');
        socket.emit('join_challenge_room', { challengeId: challId });
      });

      socket.on('challenge:started', (data: any) => {
        setWaitingForOpponent(false);
        setStatusText('Opponent joined! Starting...');
      });

      socket.on('challenge:countdown', (data: any) => {
        setCountdown(data.count);
        if (data.count === 0) {
          socket.disconnect();
          navigation.replace('ChallengePlay', { challengeId: challId, isCreator });
        }
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });
    } catch (e) {
      console.log('Socket connection error', e);
    }
  };

  const handleCreateLobby = async () => {
    setLoading(true);
    try {
      const res = await api.challenge.create();
      setInviteCode(res.data.inviteCode);
      setChallengeId(res.data.challengeId);
      setIsCreator(true);
      setWaitingForOpponent(true);
      setStatusText('Waiting for friend to join...');
      
      // Connect real-time socket
      await connectSocket(res.data.challengeId);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Lobby creation failed. Do you have 100 coins?');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinLobby = async () => {
    if (inputCode.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit code.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.challenge.join(inputCode.toUpperCase());
      setChallengeId(res.data.challengeId);
      setIsCreator(false);
      setStatusText('Joining game...');
      
      // Connect real-time socket and wait for redirect
      await connectSocket(res.data.challengeId);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Invalid code or insufficient coins (100 required).');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    Clipboard.setString(inviteCode);
    Alert.alert('Copied!', 'Invite code copied to clipboard. Share it with your friend!');
  };

  // Developer force start logic for testing on one device
  const forceStartGame = () => {
    if (socketRef.current) socketRef.current.disconnect();
    navigation.replace('ChallengePlay', { challengeId, isCreator });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient colors={['#070d1a', '#0a1728', '#070d1a']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>1v1 Friend Challenge</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Processing...</Text>
          </View>
        ) : waitingForOpponent ? (
          <Animated.View entering={FadeInUp} style={styles.lobbyCard}>
            <Text style={styles.lobbyEmoji}>🎮</Text>
            <Text style={styles.lobbyTitle}>Challenge Created!</Text>
            <Text style={styles.lobbySubtitle}>
              Share this code with your friend. They must enter it on their device to join.
            </Text>

            <View style={styles.codeContainer}>
              <Text style={styles.codeText}>{inviteCode}</Text>
              <TouchableOpacity onPress={copyToClipboard} style={styles.copyBtn}>
                <Ionicons name="copy-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.statusBox}>
              <ActivityIndicator size="small" color={colors.secondary} style={{ marginRight: 8 }} />
              <Text style={styles.statusText}>{statusText}</Text>
            </View>

            {countdown !== null && (
              <Text style={styles.countdownText}>Starting in {countdown}s...</Text>
            )}

            {/* Dev force start */}
            <TouchableOpacity style={styles.devBtn} onPress={forceStartGame}>
              <Text style={styles.devBtnText}>Force Start (Dev/Testing Mode)</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <View style={styles.actionsContainer}>
            {/* Create Card */}
            <Animated.View entering={FadeInDown.delay(100)} style={styles.actionCard}>
              <Text style={styles.actionIcon}>⚔️</Text>
              <Text style={styles.actionTitle}>Create a New Challenge</Text>
              <Text style={styles.actionSubtitle}>
                Deduct 100 coins to generate a play code. Winner takes all 200 coins!
              </Text>
              <TouchableOpacity style={styles.createBtn} onPress={handleCreateLobby}>
                <Text style={styles.createBtnText}>Create Lobby (-100 Coins)</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Join Card */}
            <Animated.View entering={FadeInDown.delay(200)} style={styles.actionCard}>
              <Text style={styles.actionIcon}>🔑</Text>
              <Text style={styles.actionTitle}>Join Friend's Challenge</Text>
              <Text style={styles.actionSubtitle}>
                Enter the 6-digit invite code sent by your friend. Entry fee is 100 coins.
              </Text>

              <View style={styles.inputRow}>
                <TextInput
                  style={styles.codeInput}
                  placeholder="ENTER 6-DIGIT CODE"
                  placeholderTextColor={colors.onSurfaceMuted}
                  value={inputCode}
                  onChangeText={(t) => setInputCode(t.toUpperCase().slice(0, 6))}
                  autoCapitalize="characters"
                  maxLength={6}
                />
                <TouchableOpacity style={styles.joinBtn} onPress={handleJoinLobby}>
                  <Text style={styles.joinBtnText}>Join</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        )}
      </View>
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
  content: { flex: 1, padding: spacing.lg, justifyContent: 'center' },
  center: { alignItems: 'center', gap: spacing.md },
  loadingText: { ...typography.bodyMd, color: colors.onSurfaceVariant },
  
  // Lobby view
  lobbyCard: {
    backgroundColor: colors.surfaceCard, padding: spacing.xl,
    borderRadius: borderRadius.xxl, borderWidth: 1,
    borderColor: colors.glassBorder, alignItems: 'center', gap: spacing.md,
  },
  lobbyEmoji: { fontSize: 48 },
  lobbyTitle: { ...typography.headlineSm, color: colors.white },
  lobbySubtitle: { ...typography.bodyMd, color: colors.onSurfaceVariant, textAlign: 'center', lineHeight: 22 },
  codeContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: borderRadius.lg,
    borderWidth: 1.5, borderColor: colors.primary, marginVertical: spacing.sm, gap: 12,
  },
  codeText: { ...typography.headlineSm, color: colors.primary, fontSize: 28, letterSpacing: 2 },
  copyBtn: { padding: 4 },
  statusBox: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },
  statusText: { ...typography.labelMd, color: colors.secondary },
  countdownText: { ...typography.bodyLg, color: colors.white, fontWeight: '700' },
  devBtn: { marginTop: spacing.lg, padding: 8 },
  devBtnText: { ...typography.labelSm, color: colors.onSurfaceMuted, textDecorationLine: 'underline' },

  // Setup/Action view
  actionsContainer: { gap: spacing.lg },
  actionCard: {
    backgroundColor: colors.surfaceCard, padding: spacing.lg,
    borderRadius: borderRadius.xxl, borderWidth: 1,
    borderColor: colors.glassBorder, alignItems: 'center', gap: spacing.sm,
  },
  actionIcon: { fontSize: 36, marginBottom: spacing.xs },
  actionTitle: { ...typography.labelMd, fontSize: 18, color: colors.white },
  actionSubtitle: { ...typography.bodyMd, color: colors.onSurfaceVariant, textAlign: 'center', fontSize: 13, lineHeight: 20 },
  createBtn: {
    backgroundColor: colors.primary, paddingVertical: 14,
    paddingHorizontal: 30, borderRadius: borderRadius.pill, marginTop: spacing.sm,
  },
  createBtnText: { ...typography.labelMd, color: colors.onPrimary },
  inputRow: {
    flexDirection: 'row', width: '100%', gap: spacing.sm, marginTop: spacing.sm,
  },
  codeInput: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', borderWidth: 1,
    borderColor: colors.glassBorder, borderRadius: borderRadius.pill,
    paddingHorizontal: spacing.md, color: colors.white, textAlign: 'center',
    ...typography.labelMd, letterSpacing: 1.5,
  },
  joinBtn: {
    backgroundColor: colors.secondary, paddingHorizontal: 25,
    borderRadius: borderRadius.pill, justifyContent: 'center',
  },
  joinBtnText: { ...typography.labelMd, color: colors.onPrimary },
});
