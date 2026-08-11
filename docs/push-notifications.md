# Push notifications

Pech Pechoo uses `@capacitor/push-notifications`.

## Frontend

Request permission only after explaining the value to the user:

```ts
await window.PechPechooNative?.enablePushNotifications();
```

On registration:

```ts
window.addEventListener('pechpechoo:push-token', async (event) => {
  const { token } = event.detail;
  // POST token + platform to backend
});
```

Handle:

- `pechpechoo:push-received` — foreground notification
- `pechpechoo:push-action` — notification tapped
- `pechpechoo:navigate` — validated internal navigation path
- `pechpechoo:push-registration-error` — registration failure

## Backend API

Suggested endpoint:

`POST /api/v1/users/me/push-tokens`

```json
{
  "token": "<device-token>",
  "platform": "ios"
}
```

Also provide token removal on logout/device removal.

Backend must:

- support multiple device tokens per user
- deduplicate/update tokens
- remove invalid tokens after provider errors
- store platform/provider with each token
- keep APNs/FCM server credentials private

## Notification payload

Use only validated internal routes:

```json
{
  "data": {
    "path": "/events/123"
  }
}
```

Never send arbitrary external URLs for in-app navigation.

## Native configuration

### Android

- Firebase project for application ID `au.pechpechoo`
- `android/app/google-services.json`
- backend FCM credentials

### iOS

- Push Notifications capability for `au.pechpechoo`
- APNs entitlement/provisioning
- backend APNs credentials

With the current Capacitor setup, treat iOS registration values as APNs tokens and Android registration values as FCM tokens.

## Acceptance test

On physical iOS and Android devices: opt in → token reaches backend → foreground notification arrives → tapping a notification opens the intended Pech Pechoo screen.