import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Network } from '@capacitor/network';

const APP_SCHEME = 'pechpechoo://';
const TRUSTED_HOSTS = new Set(['pechpechoo.au', 'www.pechpechoo.au']);

type NativeBridge = {
  isNative: true;
  platform: 'ios' | 'android' | 'web';
  openExternal: (url: string) => Promise<void>;
  getNetworkStatus: () => Promise<{ connected: boolean; connectionType: string }>;
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

function routeDeepLink(url: string) {
  if (!url.startsWith(APP_SCHEME)) return;

  const parsed = new URL(url);
  if (parsed.hostname === 'auth' && parsed.pathname === '/callback') {
    const code = parsed.searchParams.get('code');
    if (!code) return;

    window.dispatchEvent(
      new CustomEvent('pechpechoo:auth-callback', {
        detail: { code },
      }),
    );
  }
}

export async function initialiseNativeBridge(platform: NativeBridge['platform']) {
  window.PechPechooNative = {
    isNative: true,
    platform,
    openExternal: async (url: string) => {
      if (!/^https:\/\//i.test(url)) throw new Error('Only HTTPS URLs may be opened externally.');
      await Browser.open({ url });
    },
    getNetworkStatus: async () => {
      const status = await Network.getStatus();
      return { connected: status.connected, connectionType: status.connectionType };
    },
  };

  await App.addListener('appUrlOpen', ({ url }) => routeDeepLink(url));

  await Network.addListener('networkStatusChange', (status) => {
    window.dispatchEvent(
      new CustomEvent('pechpechoo:network-change', {
        detail: { connected: status.connected, connectionType: status.connectionType },
      }),
    );
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
}
