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
      dispatch('pechpechoo:push-action', {
        actionId: action.actionId,
        inputValue: action.inputValue,
        notification: action.notification,
      });
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
