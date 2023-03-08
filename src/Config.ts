import { Platform } from 'react-native';

export default {
  isAndroid: Platform.OS === 'android',
  isIos: Platform.OS === 'ios',
  isWeb: Platform.OS === 'web',
  isWindows: Platform.OS === 'windows',
};
