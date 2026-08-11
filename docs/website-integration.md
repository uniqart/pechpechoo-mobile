# Website integration requirements

This file is the running handoff checklist for the Pech Pechoo web developer. The Capacitor app currently loads the production site directly, so the website must initialise the mobile runtime when running inside the native container.

## 1. Add Capacitor mobile runtime to the web app

Install the required Capacitor packages in the website project and port/import the logic from `src/native-bridge.ts`, `src/push-notifications.ts` and `src/index.ts`.

Required packages:

- `@capacitor/app`
- `@capacitor/browser`
- `@capacitor/network`
- `@capacitor/push-notifications`
- `@capacitor/splash-screen`

The website should initialise the bridge only when `Capacitor.isNativePlatform()` is true.

Expected global API after initialisation:

```ts
window.PechPechooNative = {
  isNative: true,
  platform: 'ios' | 'android',
  openExternal(url),
  startGoogleLogin(),
  getNetworkStatus(),
  hideSplash(),
  getPushPermission(),
  enablePushNotifications(),
};
```

## 2. Google login button

When running natively, the existing Google button must call:

```ts
window.PechPechooNative?.startGoogleLogin()
```

instead of navigating the embedded WebView to Google OAuth.

The backend must support the mobile OAuth branch described in `docs/authentication.md`.

The website should listen for:

```ts
window.addEventListener('pechpechoo:auth-callback', async (event) => {
  const { code } = event.detail;
  // POST code to /api/v1/auth/mobile/exchange
  // Persist the returned web session/JWT state using the app's normal auth layer.
});
```

Also handle `pechpechoo:auth-error` and show the normal login error UI.

## 3. Session security

Keep the current backend as the single authority for authentication. The mobile wrapper must not create a parallel user/session system.

For Google mobile login, exchange only a short-lived, single-use code through the deep link. Never place access or refresh JWTs in the callback URL.

After the code exchange, use the website's existing authenticated-session mechanism. If the current refresh token is accessible to JavaScript (for example localStorage), the development team should review moving the long-lived refresh credential to a Secure, HttpOnly cookie where the current architecture permits it. Access tokens should remain short-lived.

Logout must clear the normal Pech Pechoo session and should also disassociate the current device push token if the product does not intend notifications to continue after logout.

## 4. App-ready / loading state

When the authenticated/public application shell is ready for interaction, call:

```ts
await window.PechPechooNative?.hideSplash();
```

Do this after the initial auth/session restore has completed, rather than on the first JavaScript execution.

For now the native configuration still auto-hides the splash as a safety fallback. Once this integration is deployed and verified, `launchAutoHide` can be disabled so the website controls the hand-off precisely.

## 5. Offline handling

The mobile runtime listens to Capacitor Network changes and displays a native-app-specific full-screen retry state when the device is offline.

The website may additionally listen to:

```ts
window.addEventListener('pechpechoo:network-change', (event) => {
  const { connected, connectionType } = event.detail;
});
```

Normal API error handling should remain in place because being technically online does not guarantee the backend is reachable.

## 6. External links

Links outside `pechpechoo.au` and `www.pechpechoo.au` should open in the system browser rather than replacing the app WebView.

Where the application programmatically opens an external URL rather than using an `<a>` element, call:

```ts
window.PechPechooNative?.openExternal(url)
```

Only HTTPS URLs are permitted by the bridge.

## 7. Android back behaviour

The runtime handles the Android system Back button as follows:

- Navigate back through web history when possible.
- Exit the app when there is no useful history.

The web app should avoid artificially adding duplicate history entries during redirects because this can make the native Back experience confusing.

## 8. Push notifications

Do not request notification permission immediately on first launch. Prompt after a relevant user action or an explanation of the benefit.

Request/enable notifications with:

```ts
await window.PechPechooNative?.enablePushNotifications();
```

When native registration succeeds:

```ts
window.addEventListener('pechpechoo:push-token', async (event) => {
  const { token } = event.detail;
  // POST token + native platform to the authenticated backend.
});
```

The backend should associate multiple device tokens with a user rather than storing a single token on the user record. See `docs/push-notifications.md`.

Handle foreground notifications using `pechpechoo:push-received` and notification taps using `pechpechoo:push-action`.

Notification navigation should use a validated Pech Pechoo internal path such as `/events/123`; never navigate directly to an arbitrary URL received in push data.

## 9. Native detection

Do not rely on user-agent sniffing. Use Capacitor native-platform detection in the website bundle and keep the normal website behaviour unchanged in desktop/mobile browsers.

## 10. Work still to be added to this handoff

The checklist will be extended as later milestones add:

- Sign in with Apple
- Native sharing/camera/file access where required
- Universal/App Links for HTTPS deep linking
- Store/privacy configuration
