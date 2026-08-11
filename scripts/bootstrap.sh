#!/usr/bin/env bash
set -euo pipefail

printf '\nPech Pechoo mobile bootstrap\n\n'

if ! command -v node >/dev/null 2>&1; then
  echo 'Node.js is required before running this script.'
  exit 1
fi

npm install

if [ ! -d ios ]; then
  npx cap add ios
fi

if [ ! -d android ]; then
  npx cap add android
fi

npx cap sync

echo
echo 'Bootstrap complete.'
echo 'Open iOS:     npm run open:ios'
echo 'Open Android: npm run open:android'
