# Push notification architecture

Pech Pechoo uses Capacitor's official `@capacitor/push-notifications` plugin.

## Runtime behaviour

The native bridge now exposes:

```ts
window.PechPechooNative?.getPushPermission()
window.PechPechooNative?.enablePushNotifications()
```

Do not request notification permission automatically on first launch. Ask at a useful product moment after the user understands why notifications are valuable.

When registration succeeds, the mobile runtime dispatches:

```ts
window.addEventListener('pechpechoo:push-token', (event) => {
  const { token } = event.detail;
});
```

The website should send that token to the backend and associate it with the authenticated user/device.

Suggested endpoint:

`POST /api/v1/users/me/push-tokens`

Suggested request:

```json
{
  "token": "native-device-token",
  "platform": "ios"
}
```

Store multiple active device tokens per account and support token replacement/removal. Do not assume one token per user.

## Notification events

Foreground notification:

`pechpechoo:push-received`

Notification tapped/opened:

`pechpechoo:push-action`

Registration failure:

`pechpechoo:push-registration-error`

The notification payload should include a safe internal destination such as:

```json
{
  "data": {
    "path": "/events/123"
  }
}
```

The website should validate the path before navigating. Do not accept arbitrary external URLs from push payloads.

## Android configuration

Android push delivery requires a Firebase project configured for the Android application ID `au.pechpechoo` and the resulting `google-services.json` placed in the generated native Android app at:

`android/app/google-services.json`

Do not commit production Firebase credentials/configuration to the public repository unless the development team has explicitly confirmed the configuration contains no sensitive server credentials. Server-side Firebase credentials must never be committed.

## iOS configuration

iOS requires the Push Notifications capability and the appropriate APNs entitlement/provisioning configuration for `au.pechpechoo` in the Apple Developer account/Xcode project.

The backend notification service must know whether a registered token is an iOS/APNs token or an Android/FCM token.

## Backend responsibilities

- Associate tokens with authenticated users and platforms.
- Deduplicate tokens.
- Remove invalid/unregistered tokens after provider errors.
- Never trust navigation data received from a push notification without validation.
- Send only the minimum data required in notification payloads.
- Keep APNs keys and Firebase server credentials on the backend only.
