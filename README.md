# Pech Pechoo Mobile

Capacitor wrapper for the Pech Pechoo web application.

## App identity

- App name: **Pech Pechoo**
- Bundle/Application ID: `au.pechpechoo`
- Web app: `https://pechpechoo.au`
- Platforms: iOS and Android

## Current milestone status

### Milestone 1 — foundation

Complete:

- Capacitor configuration
- iOS/Android bootstrap workflow
- Pech Pechoo icon and splash asset sources
- App identity and branding
- Android debug build workflow

### Milestone 2 — native wrapper UX

Implemented in the mobile runtime/reference integration:

- Native bridge
- Deep-link callback handling
- System-browser Google OAuth flow
- Offline/retry state
- External-link safeguards
- Android back-button handling
- Native splash hand-off

### Milestone 3 — authentication and notifications

In progress:

- Mobile OAuth exchange-code architecture
- Session-security guidance
- Push permission/registration bridge
- Push token, foreground-notification and notification-action events
- Backend/web integration requirements documented

The remaining integration work that must happen in the production website/backend is tracked in `docs/website-integration.md`.

## First local setup

Requirements:

- Node.js + npm
- Xcode for iOS development (macOS)
- Android Studio + Android SDK for Android development

Run:

```bash
npm install
bash scripts/bootstrap.sh
```

The bootstrap script creates `ios/` and `android/` if they do not exist and then runs `cap sync`.

Open the projects with:

```bash
npm run open:ios
npm run open:android
```

## Current web loading strategy

The native container loads the production Pech Pechoo site at `https://pechpechoo.au`. A minimal `www/index.html` remains as the Capacitor web directory/fallback shell.

Because the production site is loaded directly, the TypeScript under `src/` is the reference mobile runtime that must be integrated into the website bundle by the web developer. This lets Pech Pechoo keep one primary product codebase while still exposing native behaviour.

## Push notifications

See `docs/push-notifications.md` for device registration, backend token association, Android Firebase setup and iOS APNs requirements.

## Authentication

See `docs/authentication.md` for the Google OAuth mobile flow and exchange-code design.

## App artwork

Approved source artwork is stored in `resources/`. Run:

```bash
npm run assets
npm run sync
```

after the native projects have been created to generate platform-specific app artwork.

## Secrets

Do not commit signing keys, provisioning profiles, certificates, JWT secrets, APNs private keys, Firebase server credentials or environment secrets. The repository is public.
