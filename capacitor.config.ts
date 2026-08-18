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
      overlaysWebView: true,
      style: 'LIGHT',
      backgroundColor: '#00000000'
    },
    GoogleSignIn: {
      clientId: '51321670906-kfqr213paho92bnv00ra8f94d81tiuhm.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    }
  },
  android: {
    backgroundColor: BRAND_BLUE
  },
  ios: {
    backgroundColor: BRAND_BLUE,
    contentInset: 'never'
  }
};

export default config;
