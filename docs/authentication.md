# Mobile authentication

## Existing application

- Frontend: `uniqart/PechPechoo` — Next.js 16, React 19, Redux Toolkit, Axios.
- Backend: Node.js/Express + MongoDB/Mongoose, Passport.js, custom JWT auth.
- Google: `passport-google-oauth20`.

Do not create a separate mobile user store or auth system. Reuse the existing API, Redux auth state and Axios layer.

## Google mobile flow

Do not run Google OAuth inside the app WebView.

1. Native Google button calls `window.PechPechooNative.startGoogleLogin()`.
2. App opens `https://pechpechoo.au/auth/google?platform=mobile` in the system browser.
3. Existing Passport Google flow authenticates and creates/links the user.
4. Backend preserves the mobile context and creates a random, single-use code expiring in 60–120 seconds.
5. Backend redirects to:

`pechpechoo://auth/callback?provider=google&code=<code>`

6. App emits `pechpechoo:auth-callback`.
7. Frontend exchanges the code:

`POST /api/v1/auth/mobile/exchange`

```json
{ "code": "<code>" }
```

8. Use the exchange response to update the existing PechPechoo auth state/session exactly as a normal successful login does.

## PechPechoo frontend integration

Relevant existing files:

- `src/features/auth/components/AuthForm.jsx`
- `src/app/auth/authForms/AuthSocialButtons.jsx`
- `src/store/auth/authSlice.js`
- existing shared Axios/API configuration

The Google button already receives `onGoogleAuth`. Keep the normal browser handler unchanged; branch only when running natively.

```js
if (window.PechPechooNative?.isNative) {
  await window.PechPechooNative.startGoogleLogin();
  return;
}

// existing browser Google login
```

Register the callback in client-side code only:

```js
window.addEventListener('pechpechoo:auth-callback', async (event) => {
  const { code, provider } = event.detail;
  // Exchange code through the existing Axios layer.
  // Dispatch/update the existing Redux auth state.
});
```

Handle `pechpechoo:auth-error` through the existing auth error UI.

## Backend requirements

- Preserve `platform=mobile` safely through the OAuth round trip, preferably using validated OAuth `state` or server-side state rather than trusting a callback query parameter.
- Add the single-use exchange-code store and `POST /api/v1/auth/mobile/exchange`.
- Consume each code atomically once.
- Return the same user/token/session contract expected by the existing frontend auth logic.

## Security

- Never put Pech Pechoo JWTs in callback URLs.
- Exchange codes must be cryptographically random, single-use and short-lived.
- Keep Google OAuth/JWT secrets server-side.
- Restrict redirects to approved Pech Pechoo callbacks.
- Review any long-lived refresh token stored in JavaScript-accessible storage; prefer a Secure, HttpOnly cookie where compatible with the existing architecture.

## Acceptance test

Physical iPhone/Android: tap Google → system browser → authenticate → Pech Pechoo app reopens → existing Redux session shows the user as logged in.