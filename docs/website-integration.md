# Website/backend integration

Implement these changes in order. Keep normal browser behaviour unchanged; native-only behaviour should use `Capacitor.isNativePlatform()`.

## 1. Add the mobile runtime

Port/import from the mobile repo:

- `src/index.ts`
- `src/native-bridge.ts`
- `src/push-notifications.ts`
- `src/native-features.ts`

Required packages:

- `@capacitor/app`
- `@capacitor/browser`
- `@capacitor/camera`
- `@capacitor/network`
- `@capacitor/push-notifications`
- `@capacitor/share`
- `@capacitor/splash-screen`

## 2. Fix social login

### Google

In the native app, call:

```ts
window.PechPechooNative?.startGoogleLogin()
```

Implement the backend mobile flow in `authentication.md`, including `POST /api/v1/auth/mobile/exchange`.

### Apple

For iOS, show Apple login and call:

```ts
window.PechPechooNative?.startAppleLogin()
```

Implement `apple-sign-in.md`.

### Shared callback

```ts
window.addEventListener('pechpechoo:auth-callback', async (event) => {
  const { code, provider } = event.detail;
  // exchange code and update the existing authenticated session
});
```

Handle `pechpechoo:auth-error` with the existing login error UI.

## 3. Session/logout

- Keep the existing backend/session model; do not create a second mobile user store.
- Never place JWTs in social-login callback URLs.
- Review JavaScript-accessible long-lived refresh-token storage; prefer Secure, HttpOnly cookies where compatible.
- Logout must clear the Pech Pechoo session and remove the current push token if notifications should stop after logout.

## 4. App loading/offline/external links

When initial session restoration and the application shell are ready:

```ts
await window.PechPechooNative?.hideSplash();
```

Optional network event:

```ts
window.addEventListener('pechpechoo:network-change', (event) => {
  const { connected } = event.detail;
});
```

For programmatic external links:

```ts
window.PechPechooNative?.openExternal(url)
```

The native bridge already handles normal external `<a>` links and Android Back behaviour.

## 5. Push notifications

Implement `push-notifications.md`.

Key hooks:

```ts
await window.PechPechooNative?.enablePushNotifications();
```

```ts
window.addEventListener('pechpechoo:push-token', async (event) => {
  // save token + platform for authenticated user
});
```

```ts
window.addEventListener('pechpechoo:navigate', (event) => {
  // route event.detail.path using the existing router
});
```

## 6. Optional native features

Use where the existing product needs them:

```ts
window.PechPechooNative?.share({ title, text, url })
window.PechPechooNative?.takePhoto()
window.PechPechooNative?.pickPhoto()
```

Connect selected photos to the existing upload pipeline.

## 7. Later: Universal/App Links

When release credentials are final, host:

- `/.well-known/apple-app-site-association`
- `/.well-known/assetlinks.json`

Values require the final Apple Team ID and Android signing certificate fingerprint.

## Completion criteria

Before store submission, verify on physical devices:

- email/password login
- Google login
- Apple login on iOS
- logout/session expiry
- push registration and notification navigation
- external links and offline behaviour
