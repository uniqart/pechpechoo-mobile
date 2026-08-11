# Sign in with Apple

Required before iOS App Store submission because the app offers Google login for the user's primary account.

## Backend flow

1. App opens `https://pechpechoo.au/auth/apple?platform=mobile` in the system browser.
2. Backend starts Apple authorisation.
3. Apple returns to the registered HTTPS backend callback.
4. Backend validates the response and creates/links the MongoDB user.
5. Backend creates a random, single-use exchange code expiring in 60–120 seconds.
6. Backend redirects to:

`pechpechoo://auth/callback?provider=apple&code=<code>`

7. App emits `pechpechoo:auth-callback`.
8. Website exchanges the code through the same `POST /api/v1/auth/mobile/exchange` endpoint used by Google.

## Apple Developer setup

- App ID: `au.pechpechoo`, Sign in with Apple enabled.
- Services ID for server/web authorisation.
- Register `pechpechoo.au` and the backend HTTPS return URL.
- Store the Sign in with Apple private key only in backend secrets.

## Frontend requirement

Show the Apple login option in the iOS app and call:

```ts
window.PechPechooNative?.startAppleLogin()
```

Use the same callback/error handling as Google.

## Account/security requirements

- Validate `state`, `nonce` and Apple identity tokens server-side.
- Store Apple's stable provider subject ID.
- Do not merge accounts based on display name.
- Apply the existing verified-email linking policy; Apple may provide a private relay email.
- Never put Pech Pechoo JWTs in redirect URLs.

## Acceptance test

On a physical iPhone: tap Apple login → authenticate → app reopens → user is created/linked and logged in.