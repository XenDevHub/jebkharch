// src/services/adMobService.ts
import { RewardedAd, RewardedAdEventType, TestIds, AdEventType } from 'react-native-google-mobile-ads';

// AdMob configuration: Use Google's official Test IDs in development to avoid policy strikes
// In production, replace PROD_REWARDED_AD_UNIT_ID with your AdMob unit ID
export const ADMOB_CONFIG = {
  // Official Google Rewarded Test Unit ID:
  TEST_REWARDED_ID: TestIds.REWARDED,
  // Your real Ad Unit ID from AdMob Console (can also be passed via env):
  PROD_REWARDED_ID: process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID || TestIds.REWARDED,
};

export class AdMobManager {
  private static rewardedAd: RewardedAd | null = null;
  private static isLoaded: boolean = false;
  private static isLoading: boolean = false;

  private static getAdUnitId(): string {
    return __DEV__ ? ADMOB_CONFIG.TEST_REWARDED_ID : ADMOB_CONFIG.PROD_REWARDED_ID;
  }

  /**
   * Preload a Rewarded Ad so it's ready when the user taps "Watch Ad"
   */
  public static preloadRewardedAd(): void {
    if (this.isLoaded || this.isLoading) return;

    this.isLoading = true;
    const adUnitId = this.getAdUnitId();

    try {
      this.rewardedAd = RewardedAd.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: true,
      });

      this.rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
        this.isLoaded = true;
        this.isLoading = false;
      });

      this.rewardedAd.addAdEventListener(AdEventType.ERROR, (error) => {
        console.log('AdMob Load Error:', error);
        this.isLoaded = false;
        this.isLoading = false;
      });

      this.rewardedAd.load();
    } catch (e) {
      console.log('AdMob initialization error:', e);
      this.isLoading = false;
    }
  }

  /**
   * Show the Rewarded Ad and trigger reward callback upon completion
   */
  public static showRewardedAd(
    onRewardEarned: (reward: { amount: number; type: string }) => void,
    onAdClosed?: () => void,
    onError?: (error: any) => void
  ): void {
    if (!this.rewardedAd || !this.isLoaded) {
      // If native ad isn't loaded yet, preload for next time and notify
      this.preloadRewardedAd();
      onError?.(new Error('Ad is still loading, please try again in a moment.'));
      return;
    }

    let earned = false;

    const rewardListener = this.rewardedAd.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      (reward) => {
        earned = true;
        onRewardEarned(reward);
      }
    );

    const closeListener = this.rewardedAd.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        this.isLoaded = false;
        rewardListener();
        closeListener();
        // Immediately preload the next ad
        this.preloadRewardedAd();
        onAdClosed?.();
      }
    );

    const errorListener = this.rewardedAd.addAdEventListener(
      AdEventType.ERROR,
      (error) => {
        this.isLoaded = false;
        rewardListener();
        closeListener();
        errorListener();
        this.preloadRewardedAd();
        onError?.(error);
      }
    );

    this.rewardedAd.show();
  }

  public static isAdReady(): boolean {
    return this.isLoaded;
  }
}
