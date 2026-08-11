# Sign in with Apple

Implement after Google mobile login works. Required for iOS App Store submission because Pech Pechoo offers Google login for the primary account.

## Flow

1. Native Apple button calls `window.PechPechooNative.startAppleLogin()`.
2. App opens `https://pechpechoo.au/auth/apple?platform=mobile` in the system browser.
3. Backend starts Apple authorisation.
4. Apple returns to the registered HTTPS backend callback.
5. Backend validates the response and creates/links the MongoDB user.
6. Backend creates a random, single-use code expiring in 60–120 seconds.
7. Backend redirects to:

`pechpechoo://auth/callback?provider=apple&code=<code>`

8. App emits `pechpechoo:auth-callback`.
9. Frontend exchanges the code through the existing `POST /api/v1/auth/mobile/exchange` endpoint and updates the existing Redux auth state/session.

## Apple Developer setup

- App ID `au.pechpechoo` with Sign in with Apple enabled.
- Services ID for the server/web authorisation flow.
- Register `pechpechoo.au` and the exact HTTPS backend return URL.
- Keep the Apple private key/client secret generation material only in backend secrets.

## Frontend

Use the same client-side callback/error handling as Google. Show Apple login on iOS/native only unless the product also wants it on the website.

```js
window.PechPechooNative?.startAppleLogin()
```

## Backend/security

- Validate `state`, `nonce`, issuer, audience, signature and token expiry server-side.
- Store Apple's stable `sub` provider identifier.
- Do not merge accounts based on display name.
- Apply the existing verified-email linking policy; Apple may return a private relay email.
- Never put Pech Pechoo JWTs in redirect URLs.
- Reuse the same atomic, single-use exchange-code mechanism as Google.

## Acceptance test

Physical iPhone: tap Apple → authenticate → app reopens → existing PechPechoo session is logged in and the account is correctly created/linked.