# Release checklist

Use only after `website-integration.md`, authentication and push notifications work end to end.

## Code/security

- Production HTTPS/API URLs confirmed.
- Audit committed `.env` files in application repositories; remove/rotate any exposed secrets and keep secrets out of Git.
- Remove test endpoints and unnecessary debug logging.
- Privacy policy and terms are public without login.

## Functional gate

On physical devices verify:

- email/password login
- Google mobile login
- Apple login on iOS
- logout/session expiry
- push registration, receipt and tap navigation
- offline behaviour and external links
- icon/splash and status-bar presentation

## Mobile build

From `uniqart/pechpechoo-mobile`:

```bash
npm install
npm run assets
npm run sync
```

## iOS / App Store

- App ID `au.pechpechoo` configured.
- Production signing/provisioning configured.
- Sign in with Apple enabled.
- Push Notifications/APNs configured.
- Camera/photo usage descriptions included if those features are exposed.
- Final `PrivacyInfo.xcprivacy`/required-reason API declarations reviewed against the final Capacitor/plugin dependency set.
- Associated Domains configured only when Universal Links are ready.
- Archive and test through TestFlight.
- Complete App Privacy, age rating, screenshots, review notes and privacy policy in App Store Connect.

## Android / Google Play

- Play Console app created for `au.pechpechoo`.
- Upload keystore generated and stored securely.
- Release signing configured without committing secrets.
- Firebase/FCM configured and `google-services.json` supplied to the build.
- Signed `.aab` tested through Internal Testing.
- Complete Data safety, content rating, target audience, app access and privacy policy.
- Configure App Links only after `assetlinks.json` is deployed and verified.

GitHub Actions release secrets:

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_STORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

## Universal/App Links

When enabled, `pechpechoo.au` hosts:

- `/.well-known/apple-app-site-association`
- `/.well-known/assetlinks.json`

Until then, `pechpechoo://auth/callback` remains the social-login app callback.

## Release gate

Do not submit until the live `uniqart/PechPechoo` integration and backend changes have been deployed and authentication/push flows pass on physical iOS and Android devices.