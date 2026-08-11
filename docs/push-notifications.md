# Push notifications

Implement after mobile authentication is working.

Pech Pechoo uses `@capacitor/push-notifications`.

## Frontend

Request permission only after explaining the benefit to the user:

```js
await window.PechPechooNative?.enablePushNotifications()
```

On registration:

```js
window.addEventListener('pechpechoo:push-token', async (event) => {
  const { token } = event.detail;
  // POST token + native platform using the existing Axios layer
});
```

Handle:

- `pechpechoo:push-received` — foreground notification
- `pechpechoo:push-action` — notification tapped
- `pechpechoo:navigate` — validated internal app path
- `pechpechoo:push-registration-error` — registration failure

For navigation, use the existing Next.js router and accept only supported internal PechPechoo paths.

## Backend API

Suggested registration endpoint:

`POST /api/v1/users/me/push-tokens`

```json
{
  "token": "<device-token>",
  "platform": "ios"
}
```

Also provide token removal for logout/device removal.

Store device tokens separately from the user record or as a multi-device collection/array that supports:

- multiple active devices per user
- platform/provider
- deduplication/update
- created/last-seen timestamps
- removal of invalid tokens after provider errors

## Notification payload

Send a safe internal route only:

```json
{
  "data": {
    "path": "/events/123"
  }
}
```

Do not use arbitrary external URLs for in-app navigation.

## Native/provider configuration

### Android

- Firebase project for application ID `au.pechpechoo`.
- `android/app/google-services.json` supplied to the native build.
- FCM server credentials stored only on the backend/secret manager.

### iOS

- Push Notifications capability for `au.pechpechoo`.
- APNs entitlement/provisioning configured.
- APNs key/credentials stored only on the backend/secret manager.

Current Capacitor registration values should be treated as APNs tokens on iOS and FCM registration tokens on Android.

## Acceptance test

Physical iOS and Android: opt in → token reaches backend → foreground notification appears → tapping a notification opens the intended Pech Pechoo route.