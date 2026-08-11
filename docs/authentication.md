# Authentication architecture

Pech Pechoo currently uses a Node.js/Express backend with MongoDB/Mongoose, Passport.js and custom JWT access/refresh tokens.

## Existing web flow

- Email/password authentication is handled by the existing backend.
- Google authentication uses Google OAuth 2.0 via `passport-google-oauth20`.
- The browser starts at `/auth/google`.
- Google returns to `/api/v1/auth/google/callback`.
- The backend creates or links the MongoDB user, issues Pech Pechoo JWT access/refresh tokens, then redirects to the web frontend.

## Mobile strategy

### Email/password

Keep the existing web/API authentication contract. Do not create a second user store or a parallel authentication system for the mobile app.

### Google

Do not authenticate Google inside the embedded app WebView. The mobile app should open the existing Google OAuth start URL in the system authentication browser and return to the app through a mobile callback/deep link.

Recommended mobile callback:

`pechpechoo://auth/callback`

Recommended flow:

1. Mobile app opens `https://pechpechoo.au/auth/google?platform=mobile` in the system browser.
2. Existing Passport Google OAuth flow authenticates the user.
3. Backend callback creates/links the MongoDB user as it does today.
4. Backend creates a short-lived, single-use mobile exchange code rather than putting access/refresh JWTs in a URL.
5. Backend redirects to `pechpechoo://auth/callback?code=<single-use-code>`.
6. Capacitor receives the deep link.
7. App exchanges the code over HTTPS for the normal Pech Pechoo access/refresh tokens.
8. Tokens are persisted using platform-secure storage once the secure-storage layer is added.

Suggested backend endpoint:

`POST /api/v1/auth/mobile/exchange`

Request:

```json
{
  "code": "single-use-mobile-code"
}
```

Response should use the same access/refresh token model as the existing web authentication API.

## Security notes

- Do not place Pech Pechoo JWT access or refresh tokens directly in redirect URLs.
- Mobile exchange codes should be random, single-use and expire quickly (for example, 60–120 seconds).
- The exchange endpoint must be HTTPS-only.
- Restrict redirects to approved Pech Pechoo app callback schemes/universal links.
- Keep Google OAuth client secrets and JWT secrets on the backend only.

## iOS login requirement

Because the product offers Google as a social login for the user's primary account, the iOS app should also provide an equivalent privacy-preserving login option that meets Apple's App Review Guideline 4.8. In practice, Sign in with Apple is the straightforward implementation and should be added before App Store submission.

## Next implementation steps

- Configure iOS and Android deep-link handling for `pechpechoo://auth/callback`.
- Add the Capacitor Browser and App listeners to open/receive the system OAuth flow.
- Add secure token persistence.
- Add the backend `platform=mobile` branch and single-use token exchange endpoint.
- Add Sign in with Apple before iOS store submission.
