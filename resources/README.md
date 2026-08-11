# App icon and splash assets

Before generating final store assets, add the approved Pech Pechoo brand artwork here.

Recommended source files:

- `icon-only.png` — square PNG, at least 1024×1024, no transparency for safest App Store handling.
- `icon-foreground.png` — optional Android adaptive icon foreground.
- `icon-background.png` — optional Android adaptive icon background.
- `splash.png` — high-resolution centred Pech Pechoo mark for splash generation.
- `splash-dark.png` — optional dark-mode splash artwork.

Then run:

```bash
npm run assets
npm run sync
```

Do not commit signing certificates, provisioning profiles, Firebase configuration files, keystores, or other secrets to this public repository.
