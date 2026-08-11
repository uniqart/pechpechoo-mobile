# Release checklist

This checklist covers the remaining production work before Pech Pechoo can be submitted to Google Play and the Apple App Store.

## Shared

- Confirm production API/base URLs and HTTPS everywhere.
- Run `npm install`, `npm run assets` and `npm run sync`.
- Verify icon and splash output on real devices.
- Verify email/password, Google and Apple authentication.
- Verify logout and session expiry.
- Verify offline state, external links and Android Back behaviour.
- Verify push registration, foreground receipt and notification tap navigation.
- Confirm privacy policy and terms URLs are live and accessible without login.
- Remove debugging logs and test endpoints.

## Android / Google Play

- Create the application in Play Console using application ID `au.pechpechoo`.
- Generate and securely store an upload keystore.
- Configure `android/app/build.gradle` release signing from environment variables or local Gradle properties; do not commit secrets.
- Add `google-services.json` locally/through CI secrets when Firebase Cloud Messaging is configured.
- Build an Android App Bundle (`.aab`) and test through Internal Testing before Production.
- Complete Data safety, content rating, target audience, app access and privacy policy declarations.
- Configure Android App Links when the website hosts the required `assetlinks.json` file.

GitHub Actions secrets expected by `.github/workflows/android-release.yml`:

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_STORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

## iOS / App Store

- Create the App ID for `au.pechpechoo` in the Apple Developer portal.
- Enable Push Notifications and Sign in with Apple capabilities.
- Create/update provisioning profiles and signing certificates.
- Configure APNs and backend push credentials.
- Add Associated Domains when Universal Links are enabled.
- Add required iOS privacy usage descriptions for camera/photo access.
- Add the privacy manifest required by the final dependency set.
- Archive with Xcode and test using TestFlight before App Review.
- Complete App Privacy, age rating, review notes, screenshots and privacy policy fields in App Store Connect.

## Deep-link domains

For production HTTPS deep links, the website must eventually host:

- `/.well-known/apple-app-site-association`
- `/.well-known/assetlinks.json`

Until those are configured and tested, the custom `pechpechoo://` scheme remains the mobile OAuth callback mechanism.

## Release gate

Do not submit to either store until the website/backend handoff in `docs/website-integration.md` is implemented and end-to-end authentication and notifications have been tested on physical iOS and Android devices.
