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
      </Stack.Navigator>
    </NavigationContainer>
  );
}

