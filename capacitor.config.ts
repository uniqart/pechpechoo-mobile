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
    Keyboard: {
      // Prevent iOS from resizing the WebView when the keyboard opens.
      // This eliminates the viewport height change that causes fullscreen
      // dialogs (like WriteReviewForm) to re-layout and flicker.
      resize: 'none',
      resizeOnFullScreen: false
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
