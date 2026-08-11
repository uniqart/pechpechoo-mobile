#!/usr/bin/env bash
set -euo pipefail

printf '\nPech Pechoo mobile bootstrap\n\n'

if ! command -v node >/dev/null 2>&1; then
  echo 'Node.js 20+ is required before running this script.'
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo 'npm is required before running this script.'
  exit 1
fi

NODE_MAJOR=$(node -p "process.versions.node.split('.')[0]")
if [ "$NODE_MAJOR" -lt 20 ]; then
  echo "Node.js 20+ is required. Current version: $(node -v)"
  exit 1
fi

npm install

if [ ! -d ios ]; then
  npx cap add ios
fi

if [ ! -d android ]; then
  npx cap add android
fi

if [ -f resources/icon.png ] && [ -f resources/splash.png ]; then
  npm run assets
else
  echo 'Brand assets not found in resources/. Native projects will use default Capacitor artwork until they are added.'
fi

npx cap sync

echo
echo 'Bootstrap complete.'
echo 'Open iOS:     npm run open:ios'
echo 'Open Android: npm run open:android'
