# Pech Pechoo native assets

Place the approved brand source files in this directory before running `npm run assets`:

- `icon.png` — 1024×1024 PNG app icon source.
- `splash.png` — 2732×2732 PNG splash source.

Approved brand details:

- Primary blue: `#5669FF`
- Product name: `Pech Pechoo`
- Bundle ID: `au.pechpechoo`
- Brand typeface: Airbnb Cereal (use only where licensing permits bundling; the wrapped website remains responsible for its own web-font delivery).

The approved Milestone 1 artwork is the blue calendar/chat icon and the white Pech Pechoo splash artwork supplied in chat. The Capacitor asset generator creates the required iOS and Android size variants from these source PNGs.

Run:

```bash
npm run assets
npm run sync
```

Do not bake rounded corners into the iOS app icon; the operating system applies the icon mask.

Do not commit signing certificates, provisioning profiles, Firebase configuration files, keystores, or other secrets to this public repository.
