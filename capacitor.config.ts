import type { CapacitorConfig } from '@capacitor/cli';

const BRAND_BLUE = '#5669FF';

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
      backgroundColor: BRAND_BLUE
    }
  },
  android: {
    backgroundColor: BRAND_BLUE
  },
  ios: {
    backgroundColor: BRAND_BLUE,
    contentInset: 'automatic'
  }
};

export default config;
