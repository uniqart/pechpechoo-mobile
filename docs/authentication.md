# Mobile authentication

## Current backend

- Node.js/Express + MongoDB/Mongoose
- Passport.js
- Custom JWT access/refresh tokens
- Google OAuth via `passport-google-oauth20`

## Google mobile flow

Do not authenticate Google inside the app WebView.

1. App opens `https://pechpechoo.au/auth/google?platform=mobile` in the system browser.
2. Existing Google OAuth flow completes normally.
3. Backend creates/links the user.
4. For `platform=mobile`, backend creates a random, single-use exchange code that expires in 60–120 seconds.
5. Backend redirects to:

`pechpechoo://auth/callback?provider=google&code=<code>`

6. App receives the deep link and emits `pechpechoo:auth-callback`.
7. Website posts the code to:

`POST /api/v1/auth/mobile/exchange`

```json
{ "code": "<code>" }
```

8. Exchange endpoint consumes the code once and establishes/returns the normal Pech Pechoo authenticated session using the existing auth model.

## Frontend requirement

In the native app only, the Google button must call:

```ts
window.PechPechooNative?.startGoogleLogin()
```

Listen for:

```ts
window.addEventListener('pechpechoo:auth-callback', async (event) => {
  const { code } = event.detail;
  // exchange code, then update the existing auth/session state
});
```

Handle `pechpechoo:auth-error` with the normal login error UI.

## Security

- Never put access or refresh JWTs in callback URLs.
- Exchange codes must be random, short-lived and single-use.
- Keep OAuth/JWT secrets server-side only.
- Restrict mobile redirects to approved Pech Pechoo callback URLs/schemes.
- Keep the existing backend as the single authentication authority.
- If long-lived refresh tokens are currently stored in JavaScript-accessible storage, review moving them to a Secure, HttpOnly cookie where compatible with the existing architecture.

## Acceptance test

On a physical iPhone/Android device: tap Google → system browser opens → authenticate → app reopens → user is logged in inside the app.