# Pech Pechoo Mobile

Capacitor wrapper for the Pech Pechoo web application.

## App identity

- App name: **Pech Pechoo**
- Bundle/Application ID: `au.pechpechoo`
- Web app: `https://pechpechoo.au`
- Platforms: iOS and Android

## Milestone 1 — foundation

The repository contains the Capacitor configuration, native dependencies, local fallback shell, native bootstrap script and asset-generation setup.

Capacitor's generated `ios/` and `android/` projects should be created from this source configuration rather than hand-maintained boilerplate.

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

The native container currently loads the production Pech Pechoo site at `https://pechpechoo.au`. A minimal `www/index.html` is retained as the Capacitor web directory/fallback shell.

The web/native bridge, offline UX, navigation handling, deep links and authentication integration will be added in the next milestones.

## App artwork

See `resources/README.md`. Final icon and splash assets require the approved Pech Pechoo logo/brand artwork.

## Secrets

Do not commit Firebase configuration, signing keys, provisioning profiles, certificates or environment secrets. The repository is public.
