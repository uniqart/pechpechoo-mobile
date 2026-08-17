import {
  PushNotifications,
  type PermissionStatus,
  type PushNotificationSchema,
  type ActionPerformed,
  type Token,
} from '@capacitor/push-notifications';

export type PushRegistrationResult = {
  permission: PermissionStatus['receive'];
  registered: boolean;
};

function dispatch(name: string, detail?: unknown) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

function getSafeInternalPath(notification: PushNotificationSchema): string | null {
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

  await PushNotifications.addListener('registration', (token: Token) => {
    dispatch('pechpechoo:push-token', { token: token.value });
  });

  await PushNotifications.addListener('registrationError', (error) => {
    dispatch('pechpechoo:push-registration-error', { error });
  });

  await PushNotifications.addListener(
    'pushNotificationReceived',
    (notification: PushNotificationSchema) => {
      dispatch('pechpechoo:push-received', { notification });
    },
  );

  await PushNotifications.addListener(
    'pushNotificationActionPerformed',
    (action: ActionPerformed) => {
      const path = getSafeInternalPath(action.notification);
      const data = {
        ...(action.notification.data || {}),
        ...(path ? { path } : {}),
      };

      // Contract consumed by the Next.js application:
      // event.detail.data.path
      dispatch('pechpechoo:push-action', {
        data,
        actionId: action.actionId,
        inputValue: action.inputValue,
        notification: action.notification,
      });

      // Keep the existing validated navigation event for backwards compatibility.
      if (path) {
        dispatch('pechpechoo:navigate', { path, source: 'push' });
      }
    },
  );
}

export async function getPushPermission() {
  const permissions = await PushNotifications.checkPermissions();
  return permissions.receive;
}

export async function enablePushNotifications(): Promise<PushRegistrationResult> {
  let permission = await getPushPermission();

  if (permission === 'prompt' || permission === 'prompt-with-rationale') {
    const requested = await PushNotifications.requestPermissions();
    permission = requested.receive;
  }

  if (permission !== 'granted') {
    return { permission, registered: false };
  }

  await initialisePushNotificationListeners();
  await PushNotifications.register();
  return { permission, registered: true };
}
