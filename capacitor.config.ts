import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'au.pechpechoo',
  appName: 'Pech Pechoo',
  webDir: 'www',
  bundledWebRuntime: false,
  server: {
    url: 'https://pechpechoo.au',
    cleartext: false,
    androidScheme: 'https',
    iosScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1400,
      launchAutoHide: true,
      backgroundColor: '#FFFFFF',
      showSpinner: false
    },
    StatusBar: {
      overlaysWebView: false,
      style: 'LIGHT',
      backgroundColor: '#FFFFFF'
    }
  },
  android: {
    backgroundColor: '#FFFFFF'
  },
  ios: {
    backgroundColor: '#FFFFFF',
    contentInset: 'automatic'
  }
};

export default config;
