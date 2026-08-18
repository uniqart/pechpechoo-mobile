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
const TRUSTED_HOSTS = new Set(['pechpechoo.au', 'www.pechpechoo.au']);
const API_BASE_URL = 'https://pech-pechoo-77b2f05c2712.herokuapp.com/api/v1';
const GOOGLE_AUTH_URL = `${API_BASE_URL}/auth/google`;
const APPLE_AUTH_URL = `${API_BASE_URL}/auth/apple`;

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

function isTrustedWebUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && TRUSTED_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

function dispatch(name: string, detail?: unknown) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

function routeDeepLink(url: string) {
  if (!url.startsWith(APP_SCHEME)) return;

  const parsed = new URL(url);
  if (parsed.hostname === 'auth' && parsed.pathname === '/callback') {
    const code = parsed.searchParams.get('code');
    const error = parsed.searchParams.get('error');
    const provider = parsed.searchParams.get('provider') ?? 'unknown';

    void Browser.close().catch(() => undefined);

    if (error) {
      dispatch('pechpechoo:auth-error', { error, provider });
      return;
    }

    if (code) {
      dispatch('pechpechoo:auth-callback', { code, provider });
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

function mobileAuthUrl(endpoint: string) {
  const url = new URL(endpoint);
  url.searchParams.set('platform', 'mobile');
  return url.toString();
}

export async function initialiseNativeBridge(platform: NativeBridge['platform']) {
  await initialisePushNotificationListeners();

  window.PechPechooNative = {
    isNative: true,
    platform,
    openExternal: async (url: string) => {
      if (!/^https:\/\//i.test(url)) throw new Error('Only HTTPS URLs may be opened externally.');
      await Browser.open({ url });
    },
    startGoogleLogin: async () => {
      await Browser.open({ url: mobileAuthUrl(GOOGLE_AUTH_URL) });
    },
    startAppleLogin: async () => {
      await Browser.open({ url: mobileAuthUrl(APPLE_AUTH_URL) });
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

  document.addEventListener('click', async (event) => {
    const target = event.target as HTMLElement | null;
    const anchor = target?.closest('a[href]') as HTMLAnchorElement | null;
    if (!anchor) return;

    const href = anchor.href;
    if (!href || isTrustedWebUrl(href)) return;

    if (/^https:\/\//i.test(href)) {
      event.preventDefault();
      await Browser.open({ url: href });
    }
  });

  dispatch('pechpechoo:native-ready', { platform });
}
