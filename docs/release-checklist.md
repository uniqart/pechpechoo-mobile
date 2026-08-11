# Release checklist

Use this only after `website-integration.md`, authentication and push notifications are working end to end.

## Shared

- Production HTTPS/API URLs confirmed.
- `npm install`, `npm run assets`, `npm run sync` complete.
- Icon/splash verified on physical devices.
- Email/password, Google and Apple login verified.
- Logout/session expiry verified.
- Push registration, receipt and tap navigation verified.
- Offline/external-link behaviour verified.
- Public privacy policy and terms URLs live.
- Remove test endpoints/debug logging.

## iOS / App Store

- App ID `au.pechpechoo` configured.
- Signing/provisioning configured.
- Sign in with Apple enabled.
- Push Notifications/APNs configured.
- Camera/photo usage descriptions added if those features are used.
- Valid `PrivacyInfo.xcprivacy` included for the final dependency set; Capacitor is on Apple's list of SDKs subject to privacy-manifest requirements.
- Associated Domains added if Universal Links are enabled.
- Archive and test through TestFlight.
- Complete App Privacy, age rating, screenshots, review notes and privacy policy in App Store Connect.

## Android / Google Play

- Play Console app created for `au.pechpechoo`.
- Upload keystore generated and stored securely.
- Release signing configured without committing secrets.
- Firebase/FCM configured and `google-services.json` supplied to the build.
- Signed `.aab` tested through Internal Testing.
- Complete Data safety, content rating, target audience, app access and privacy policy.
- Configure App Links if `assetlinks.json` is deployed.

GitHub Actions release secrets:

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_STORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

## Universal/App Links

When enabled, website hosts:

- `/.well-known/apple-app-site-association`
- `/.well-known/assetlinks.json`

Until then, `pechpechoo://auth/callback` remains the mobile social-login callback.

## Release gate

Do not submit until authentication and notifications work on physical iOS and Android devices.