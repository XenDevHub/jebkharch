import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors, typography } from '../theme/designSystem';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Splash'>;
};

export default function SplashScreen({ navigation }: Props) {
  useEffect(() => {
    const checkState = async () => {
      // Fake delay for splash screen animation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      try {
        const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
        const token = await AsyncStorage.getItem('accessToken');

        if (!hasSeenOnboarding) {
          navigation.replace('Onboarding');
        } else if (token) {
          navigation.replace('Home');
        } else {
          navigation.replace('PhoneAuth');
        }
      } catch (e) {
        // Fallback
        navigation.replace('PhoneAuth');
      }
    };

    checkState();
  }, [navigation]);

  return (
    <Animated.View style={styles.container} entering={FadeIn} exiting={FadeOut}>
      <Animated.Text style={styles.title} entering={ZoomIn.delay(300)}>
        Jeb Kharch
      </Animated.Text>
      <Animated.Text style={styles.subtitle} entering={FadeIn.delay(800)}>
        Play Smart. Win Real.
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: colors.background,
  },
  title: { 
    ...typography.displayLg, 
    color: colors.primary,
  },
  subtitle: {
    ...typography.bodyLg,
    color: colors.onSurfaceVariant,
    marginTop: 10,
  }
});
