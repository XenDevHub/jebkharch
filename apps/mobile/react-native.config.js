/**
 * react-native.config.js
 *
 * In a PNPM monorepo, the React Native autolinking script sometimes
 * cannot correctly resolve expo-modules-core's own react-native.config.js
 * and falls back to the old `expo.core.ExpoModulesPackage` class path.
 *
 * This file explicitly overrides that to use the correct class path
 * for expo-modules-core v2.x (Expo SDK 52+).
 */
module.exports = {
  dependencies: {
    'expo-modules-core': {
      platforms: {
        android: {
          packageImportPath: 'import expo.modules.kotlin.ExpoModulesPackage;',
          packageInstance: 'new ExpoModulesPackage()',
        },
      },
    },
  },
};
