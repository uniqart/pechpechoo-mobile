import {
  FirebaseMessaging,
  type PermissionStatus,
  type Notification,
  type ActionPerformed,
} from '@capacitor-firebase/messaging';

export type PushRegistrationResult = {
  permission: PermissionStatus['receive'];
  registered: boolean;
};

function dispatch(name: string, detail?: unknown) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

function getSafeInternalPath(notification: Notification): string | null {
  const raw = notification.data?.path;
  if (typeof raw !== 'string') return null;
  if (!raw.startsWith('/') || raw.startsWith('//')) return null;

  try {
    const resolved = new URL(raw, 'https://pechpechoo.au');
    if (resolved.origin !== 'https://pechpechoo.au') return null;
    return `${resolved.pathname}${resolved.search}${resolved.hash}`;
  } catch {
    return null;
  }
}

let listenersInitialised = false;

export async function initialisePushNotificationListeners() {
  if (listenersInitialised) return;
  listenersInitialised = true;

  // Firebase Messaging emits an FCM registration token on both iOS and Android.
  // This is the token expected by the backend Firebase Admin SDK.
  await FirebaseMessaging.addListener('tokenReceived', ({ token }) => {
    dispatch('pechpechoo:push-token', { token, provider: 'fcm' });
  });

  await FirebaseMessaging.addListener('notificationReceived', (notification: Notification) => {
    dispatch('pechpechoo:push-received', { notification });
  });

  await FirebaseMessaging.addListener('notificationActionPerformed', (action: ActionPerformed) => {
    const path = getSafeInternalPath(action.notification);
    const data = {
      ...(action.notification.data || {}),
      ...(path ? { path } : {}),
    };

    dispatch('pechpechoo:push-action', {
      data,
      actionId: action.actionId,
      inputValue: action.inputValue,
      notification: action.notification,
    });

    if (path) {
      dispatch('pechpechoo:navigate', { path, source: 'push' });
    }
  });
}

export async function getPushPermission() {
  const permissions = await FirebaseMessaging.checkPermissions();
  return permissions.receive;
}

export async function enablePushNotifications(): Promise<PushRegistrationResult> {
  let permission = await getPushPermission();

  if (permission === 'prompt' || permission === 'prompt-with-rationale') {
    const requested = await FirebaseMessaging.requestPermissions();
    permission = requested.receive;
  }

  if (permission !== 'granted') {
    return { permission, registered: false };
  }

  await initialisePushNotificationListeners();

  try {
    // getToken() registers for remote notifications and returns the FCM token
    // required by firebase-admin/messaging on the backend.
    const { token } = await FirebaseMessaging.getToken();
    if (!token) {
      throw new Error('Firebase Messaging returned an empty FCM token.');
    }
    dispatch('pechpechoo:push-token', { token, provider: 'fcm' });
    return { permission, registered: true };
  } catch (error) {
    dispatch('pechpechoo:push-registration-error', { error });
    return { permission, registered: false };
  }
}
