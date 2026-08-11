import { Capacitor } from '@capacitor/core';
import { initialiseNativeBridge } from './native-bridge';

export async function initialisePechPechooMobile() {
  if (!Capacitor.isNativePlatform()) return;

  const platform = Capacitor.getPlatform();
  if (platform !== 'ios' && platform !== 'android') return;

  await initialiseNativeBridge(platform);
}

void initialisePechPechooMobile().catch((error) => {
  console.error('[Pech Pechoo Mobile] Failed to initialise native runtime', error);
});
