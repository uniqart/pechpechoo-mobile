# Sign in with Apple

Pech Pechoo should support Sign in with Apple before iOS App Store submission because Google is offered as a social login for the user's primary account.

## Recommended architecture

Keep Apple authentication server-backed, matching the existing Google architecture.

1. Native app opens `https://pechpechoo.au/auth/apple?platform=mobile` in the system browser.
2. Backend starts Sign in with Apple authorization.
3. Apple posts the authorization response to an HTTPS callback under `pechpechoo.au`.
4. Backend validates the Apple authorization response and creates/links the MongoDB user.
5. Backend creates a short-lived, single-use mobile exchange code.
6. Backend redirects to `pechpechoo://auth/callback?provider=apple&code=<single-use-code>`.
7. Capacitor receives the deep link and dispatches `pechpechoo:auth-callback`.
8. Website exchanges the code through the same `/api/v1/auth/mobile/exchange` endpoint used for Google.

## Apple Developer configuration

The Apple Developer account will need:

- App ID for `au.pechpechoo` with Sign in with Apple enabled.
- A Services ID for the web/server authorization flow.
- `pechpechoo.au` registered as an approved domain.
- An HTTPS Apple return URL registered for the backend callback.
- A Sign in with Apple private key stored only on the backend/secret manager.

The Apple return URL itself must be HTTPS. Apple should return to the backend first; the backend then redirects to the Pech Pechoo custom app scheme using only a short-lived exchange code.

## Account linking

Prefer deterministic linking rules and never merge two existing Pech Pechoo accounts solely because display names match.

If Apple supplies an email that matches an existing account, apply the same verified-email/account-linking policy used by the current authentication system. Apple may provide a private relay email, so the persistent Apple subject identifier should be stored as the provider identity.

## Security

- Validate `state` and `nonce`.
- Validate Apple identity tokens server-side.
- Keep Apple private keys and client secrets off the app and website bundle.
- Do not put Pech Pechoo JWTs in callback URLs.
- Make mobile exchange codes random, single-use and short-lived.
- Store the Apple provider subject ID for future login matching.
