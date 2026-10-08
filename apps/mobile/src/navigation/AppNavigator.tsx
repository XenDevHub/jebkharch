// src/navigation/AppNavigator.tsx
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import PhoneAuthScreen from '../screens/auth/PhoneAuthScreen';
import OtpVerifyScreen from '../screens/auth/OtpVerifyScreen';
import HomeScreen from '../screens/HomeScreen';
import QuizScreen from '../screens/quiz/QuizScreen';
import QuizResultScreen from '../screens/quiz/QuizResultScreen';
import WalletScreen from '../screens/wallet/WalletScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import WithdrawalHistoryScreen from '../screens/wallet/WithdrawalHistoryScreen';
import ChallengeLobbyScreen from '../screens/challenge/ChallengeLobbyScreen';
import ChallengePlayScreen from '../screens/challenge/ChallengePlayScreen';
import ChallengeResultScreen from '../screens/challenge/ChallengeResultScreen';
import MissionsScreen from '../screens/MissionsScreen';
import ReferralScreen from '../screens/ReferralScreen';
import WrongAnswersScreen from '../screens/WrongAnswersScreen';
import SpinScreen from '../screens/SpinScreen';
import TeamsScreen from '../screens/TeamsScreen';
import VoiceQuizScreen from '../screens/VoiceQuizScreen';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  PhoneAuth: undefined;
  OtpVerify: { phone: string };
  Home: undefined;
  Quiz: { categoryId: string; categoryName: string };
  QuizResult: { score: number; total: number; coinsEarned: number };
  Wallet: undefined;
  Profile: undefined;
  Leaderboard: undefined;
  WithdrawalHistory: undefined;
  ChallengeLobby: undefined;
  ChallengePlay: { challengeId: string; isCreator?: boolean };
  ChallengeResult: { challengeId: string; myScore: number; total: number; result?: 'win' | 'lose' | 'draw' };
  Missions: undefined;
  Referral: undefined;
  WrongAnswers: undefined;
  Spin: undefined;
  Teams: undefined;
  VoiceQuiz: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="PhoneAuth" component={PhoneAuthScreen} />
        <Stack.Screen name="OtpVerify" component={OtpVerifyScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Quiz" component={QuizScreen} />
        <Stack.Screen name="QuizResult" component={QuizResultScreen} />
        <Stack.Screen name="Wallet" component={WalletScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
        <Stack.Screen name="WithdrawalHistory" component={WithdrawalHistoryScreen} />
        <Stack.Screen name="ChallengeLobby" component={ChallengeLobbyScreen} />
        <Stack.Screen name="ChallengePlay" component={ChallengePlayScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="ChallengeResult" component={ChallengeResultScreen} options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="Missions" component={MissionsScreen} />
        <Stack.Screen name="Referral" component={ReferralScreen} />
        <Stack.Screen name="WrongAnswers" component={WrongAnswersScreen} />
        <Stack.Screen name="Spin" component={SpinScreen} />
        <Stack.Screen name="Teams" component={TeamsScreen} />
        <Stack.Screen name="VoiceQuiz" component={VoiceQuizScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

