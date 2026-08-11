# PechPechoo website integration

Target frontend: `uniqart/PechPechoo` (Next.js 16 / React 19).

Because the Capacitor app loads the live PechPechoo site, native integration must be initialised from client-side website code. Do not run Capacitor APIs during SSR.

## 1. Add the native runtime

Install the Capacitor packages used by the mobile runtime in `uniqart/PechPechoo` and port/import these files from `uniqart/pechpechoo-mobile`:

- `src/index.ts`
- `src/native-bridge.ts`
- `src/push-notifications.ts`
- `src/native-features.ts`

Packages:

- `@capacitor/core`
- `@capacitor/app`
- `@capacitor/browser`
- `@capacitor/camera`
- `@capacitor/network`
- `@capacitor/push-notifications`
- `@capacitor/share`
- `@capacitor/splash-screen`

Initialise only in a client component / `useEffect` and only when `Capacitor.isNativePlatform()` is true. Normal web behaviour must remain unchanged.

## 2. Google login — do first

Existing integration points:

- `src/features/auth/components/AuthForm.jsx`
- `src/app/auth/authForms/AuthSocialButtons.jsx`
- `src/store/auth/authSlice.js`
- existing Axios/API layer

The existing Google button already receives `onGoogleAuth`. For native only, call:

```js
window.PechPechooNative?.startGoogleLogin()
```

Otherwise keep the existing browser Google flow.

Implement `authentication.md`, including:

`POST /api/v1/auth/mobile/exchange`

Listen client-side for:

```js
window.addEventListener('pechpechoo:auth-callback', async (event) => {
  const { code, provider } = event.detail;
  // exchange using existing Axios layer
  // update existing Redux auth state/session
});
```

Handle `pechpechoo:auth-error` with the existing login error UI.

## 3. Apple login — after Google works

Implement `apple-sign-in.md`. On iOS, show the Apple option and call:

```js
window.PechPechooNative?.startAppleLogin()
```

Reuse the same mobile exchange endpoint and existing Redux auth state.

## 4. App shell and navigation

After initial auth/session restoration and the page shell are ready:

```js
await window.PechPechooNative?.hideSplash()
```

For programmatic external URLs:

```js
window.PechPechooNative?.openExternal(url)
```

The mobile runtime handles normal external `<a>` links, offline state and Android Back behaviour.

## 5. Push notifications — after auth

Implement `push-notifications.md`.

```js
await window.PechPechooNative?.enablePushNotifications()
```

```js
window.addEventListener('pechpechoo:push-token', async (event) => {
  // save event.detail.token + platform for the authenticated user
});
```

```js
window.addEventListener('pechpechoo:navigate', (event) => {
  // navigate to event.detail.path with the existing Next.js router
});
```

## 6. Optional native features

Use only where the product needs them:

```js
window.PechPechooNative?.share({ title, text, url })
window.PechPechooNative?.takePhoto()
window.PechPechooNative?.pickPhoto()
```

Connect photos to the existing upload/S3 flow; do not treat the returned local path as permanent storage.

## 7. Later: Universal/App Links

When release credentials are final, host:

- `/.well-known/apple-app-site-association`
- `/.well-known/assetlinks.json`

## Completion order

1. Google mobile login end to end.
2. Apple login on iOS.
3. Push registration/navigation.
4. Optional native features.
5. Universal/App Links and release work.

Test all auth/push flows on physical devices.