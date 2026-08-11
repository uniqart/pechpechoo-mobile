import fs from 'node:fs';

const androidManifest = 'android/app/src/main/AndroidManifest.xml';
const iosInfo = 'ios/App/App/Info.plist';

if (fs.existsSync(androidManifest)) {
  let xml = fs.readFileSync(androidManifest, 'utf8');
  if (!xml.includes('pechpechoo')) {
    xml = xml.replace(
      '<activity',
      '<activity',
    ).replace(
      '</activity>',
      `  <intent-filter>\n        <action android:name="android.intent.action.VIEW" />\n        <category android:name="android.intent.category.DEFAULT" />\n        <category android:name="android.intent.category.BROWSABLE" />\n        <data android:scheme="pechpechoo" android:host="auth" />\n      </intent-filter>\n    </activity>`,
    );
    fs.writeFileSync(androidManifest, xml);
    console.log('Configured Android deep link: pechpechoo://auth');
  }
}

if (fs.existsSync(iosInfo)) {
  let plist = fs.readFileSync(iosInfo, 'utf8');
  if (!plist.includes('<string>pechpechoo</string>')) {
    plist = plist.replace(
      '</dict>\n</plist>',
      `  <key>CFBundleURLTypes</key>\n  <array>\n    <dict>\n      <key>CFBundleURLName</key>\n      <string>au.pechpechoo</string>\n      <key>CFBundleURLSchemes</key>\n      <array>\n        <string>pechpechoo</string>\n      </array>\n    </dict>\n  </array>\n</dict>\n</plist>`,
    );
    fs.writeFileSync(iosInfo, plist);
    console.log('Configured iOS URL scheme: pechpechoo://');
  }
}
