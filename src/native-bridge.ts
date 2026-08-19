import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Network } from '@capacitor/network';
import { SplashScreen } from '@capacitor/splash-screen';
import {
  enablePushNotifications,
  getPushPermission,
  initialisePushNotificationListeners,
} from './push-notifications';
import { pickPhoto, shareContent, takePhoto } from './native-features';

const APP_SCHEME = 'pechpechoo://';
const API_BASE = 'https://pech-pechoo-77b2f05c2712.herokuapp.com/api/v1';
const GOOGLE_AUTH_PATH = `${API_BASE}/auth/google`;
const APPLE_AUTH_PATH = `${API_BASE}/auth/apple`;

const processedDeepLinks = new Set<string>();

type NativeBridge = {
  isNative: true;
  platform: 'ios' | 'android' | 'web';
  openExternal: (url: string) => Promise<void>;
  startGoogleLogin: () => Promise<void>;
  startAppleLogin: () => Promise<void>;
  getNetworkStatus: () => Promise<{ connected: boolean; connectionType: string }>;
  hideSplash: () => Promise<void>;
  getPushPermission: () => Promise<string>;
  enablePushNotifications: () => Promise<{ permission: string; registered: boolean }>;
  share: (input: { title?: string; text?: string; url?: string }) => Promise<void>;
  takePhoto: () => Promise<{ webPath?: string; format: string }>;
  pickPhoto: () => Promise<{ webPath?: string; format: string }>;
};

declare global {
  interface Window {
    PechPechooNative?: NativeBridge;
  }
}

function dispatch(name: string, detail?: unknown) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

function parseAppDeepLink(url: string) {
  if (!url || typeof url !== 'string') return null;

  // Replace custom scheme with https:// so standard WHATWG URL parser extracts host/params correctly
  const normalized = url.replace(/^pechpechoo:\/\//i, 'https://');

  try {
    const parsed = new URL(normalized);
    const searchParams = parsed.searchParams;

    let hashParams = new URLSearchParams();
    if (parsed.hash && parsed.hash.length > 1) {
      hashParams = new URLSearchParams(parsed.hash.substring(1));
    }

    const getParam = (key: string) => searchParams.get(key) || hashParams.get(key);

    return {
      host: parsed.hostname || parsed.host,
      path: parsed.pathname,
      code: getParam('code'),
      accessToken: getParam('accessToken') || getParam('accesstoken'),
      refreshToken: getParam('refreshToken') || getParam('refreshtoken'),
      error: getParam('error') || getParam('error_description'),
      provider: getParam('provider') || 'unknown',
    };
  } catch (err) {
    console.error('[Pech Pechoo] Failed to parse deep link URL:', url, err);
    return null;
  }
}

function routeDeepLink(url: string) {
  if (!url || typeof url !== 'string') return;
  if (!url.toLowerCase().startsWith(APP_SCHEME)) return;

  // Close the in-app browser overlay immediately upon deep link reception
  void Browser.close().catch(() => undefined);
  setTimeout(() => {
    void Browser.close().catch(() => undefined);
  }, 300);

  if (processedDeepLinks.has(url)) return;
  processedDeepLinks.add(url);

  console.log('[Pech Pechoo] Processing native deep link:', url);

  const parsed = parseAppDeepLink(url);
  if (!parsed) return;

  const isAuth =
    parsed.host === 'auth' ||
    parsed.path.includes('auth') ||
    parsed.path.includes('callback') ||
    Boolean(parsed.code) ||
    Boolean(parsed.accessToken);

  if (isAuth) {
    if (parsed.error) {
      dispatch('pechpechoo:auth-error', { error: parsed.error, provider: parsed.provider });
      return;
    }

    if (parsed.accessToken) {
      dispatch('pechpechoo:auth-callback', {
        accessToken: parsed.accessToken,
        refreshToken: parsed.refreshToken,
        provider: parsed.provider,
      });
      return;
    }

    if (parsed.code) {
      dispatch('pechpechoo:auth-callback', {
        code: parsed.code,
        provider: parsed.provider,
      });
    }
  }
}

function createOfflineOverlay() {
  const existing = document.getElementById('pechpechoo-offline');
  if (existing) return existing;

  const overlay = document.createElement('div');
  overlay.id = 'pechpechoo-offline';
  overlay.setAttribute('role', 'alert');
  overlay.style.cssText = [
    'position:fixed',
    'inset:0',
    'z-index:2147483647',
    'display:none',
    'align-items:center',
    'justify-content:center',
    'background:#fff',
    'padding:32px',
    'font-family:system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif',
    'text-align:center',
  ].join(';');

  overlay.innerHTML = `
    <div style="max-width:360px">
      <div style="font-size:44px;margin-bottom:16px">📡</div>
      <h1 style="font-size:22px;margin:0 0 8px;color:#111">You're offline</h1>
      <p style="font-size:15px;line-height:1.5;margin:0 0 20px;color:#666">Check your internet connection and try again.</p>
      <button id="pechpechoo-retry" type="button" style="border:0;border-radius:12px;padding:12px 20px;background:#5669FF;color:white;font-size:16px;font-weight:600">Try again</button>
    </div>`;

  document.body.appendChild(overlay);
  overlay.querySelector('#pechpechoo-retry')?.addEventListener('click', async () => {
    const status = await Network.getStatus();
    if (status.connected) {
      overlay.style.display = 'none';
      window.location.reload();
    }
  });

  return overlay;
}

async function updateOfflineState(connected: boolean) {
  if (!document.body) return;
  const overlay = createOfflineOverlay();
  overlay.style.display = connected ? 'none' : 'flex';
}

export async function initialiseNativeBridge(platform: NativeBridge['platform']) {
  await initialisePushNotificationListeners();

  window.PechPechooNative = {
    isNative: true,
    platform,
    openExternal: async (url: string) => {
      let targetUrl = url?.trim();
      if (!targetUrl) return;
      if (!/^(https?:\/\/|mailto:|tel:)/i.test(targetUrl)) {
        targetUrl = `https://${targetUrl}`;
      }
      await Browser.open({ url: targetUrl, windowName: '_self' });
    },
    startGoogleLogin: async () => {
      const url = `${GOOGLE_AUTH_PATH}?platform=mobile`;
      await Browser.open({ url });
    },
    startAppleLogin: async () => {
      const url = `${APPLE_AUTH_PATH}?platform=mobile`;
      await Browser.open({ url });
    },
    getNetworkStatus: async () => {
      const status = await Network.getStatus();
      return { connected: status.connected, connectionType: status.connectionType };
    },
    hideSplash: async () => {
      await SplashScreen.hide();
    },
    getPushPermission: async () => getPushPermission(),
    enablePushNotifications: async () => enablePushNotifications(),
    share: shareContent,
    takePhoto,
    pickPhoto,
  };

  const initialStatus = await Network.getStatus();
  await updateOfflineState(initialStatus.connected);

  await App.addListener('appUrlOpen', ({ url }) => routeDeepLink(url));

  // Check if app was cold-started from a deep link
  try {
    const launchUrl = await App.getLaunchUrl();
    if (launchUrl?.url && launchUrl.url.startsWith(APP_SCHEME)) {
      routeDeepLink(launchUrl.url);
    }
  } catch (err) {
    console.warn('[Pech Pechoo] getLaunchUrl check failed:', err);
  }

  if (platform === 'android') {
    await App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack || window.history.length > 1) {
        window.history.back();
      } else {
        void App.exitApp();
      }
    });
  }

  await Network.addListener('networkStatusChange', (status) => {
    void updateOfflineState(status.connected);
    dispatch('pechpechoo:network-change', {
      connected: status.connected,
      connectionType: status.connectionType,
    });
  });

  dispatch('pechpechoo:native-ready', { platform });
}
