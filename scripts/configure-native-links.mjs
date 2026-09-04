import fs from 'node:fs';

const androidManifest = 'android/app/src/main/AndroidManifest.xml';
const iosInfo = 'ios/App/App/Info.plist';
const iosProject = 'ios/App/App.xcodeproj/project.pbxproj';

const IOS_BUNDLE_ID = 'au.pechpechoo.app';
const APPLE_TEAM_ID = '68D6E2QK47';

if (fs.existsSync(androidManifest)) {
  let xml = fs.readFileSync(androidManifest, 'utf8');

  if (!xml.includes('android:scheme="pechpechoo"')) {
    xml = xml.replace(
      '</activity>',
      `  <intent-filter>\n        <action android:name="android.intent.action.VIEW" />\n        <category android:name="android.intent.category.DEFAULT" />\n        <category android:name="android.intent.category.BROWSABLE" />\n        <data android:scheme="pechpechoo" android:host="auth" />\n      </intent-filter>\n    </activity>`,
    );
    console.log('Configured Android deep link: pechpechoo://auth');
  }

  if (!xml.includes('android:host="pechpechoo.au"')) {
    xml = xml.replace(
      '</activity>',
      `  <intent-filter android:autoVerify="true">\n        <action android:name="android.intent.action.VIEW" />\n        <category android:name="android.intent.category.DEFAULT" />\n        <category android:name="android.intent.category.BROWSABLE" />\n        <data android:scheme="https" android:host="pechpechoo.au" />\n      </intent-filter>\n    </activity>`,
    );
    console.log('Configured Android App Link: https://pechpechoo.au');
  }

  fs.writeFileSync(androidManifest, xml);
}

if (fs.existsSync(iosInfo)) {
  let plist = fs.readFileSync(iosInfo, 'utf8');
  if (!plist.includes('<string>pechpechoo</string>')) {
    plist = plist.replace(
      '</dict>\n</plist>',
      `  <key>CFBundleURLTypes</key>\n  <array>\n    <dict>\n      <key>CFBundleURLName</key>\n      <string>${IOS_BUNDLE_ID}</string>\n      <key>CFBundleURLSchemes</key>\n      <array>\n        <string>pechpechoo</string>\n      </array>\n    </dict>\n  </array>\n</dict>\n</plist>`,
    );
  } else {
    plist = plist.replace(
      /<key>CFBundleURLName<\/key>\s*<string>[^<]+<\/string>/,
      `<key>CFBundleURLName</key>\n      <string>${IOS_BUNDLE_ID}</string>`,
    );
  }
  fs.writeFileSync(iosInfo, plist);
  console.log('Configured iOS URL scheme: pechpechoo://');
}

if (fs.existsSync(iosProject)) {
  let project = fs.readFileSync(iosProject, 'utf8');

  // The existing Android package remains au.pechpechoo. Only the Xcode target
  // is overridden to the production Apple Bundle ID.
  project = project.replace(
    /PRODUCT_BUNDLE_IDENTIFIER = [^;]+;/g,
    `PRODUCT_BUNDLE_IDENTIFIER = ${IOS_BUNDLE_ID};`,
  );

  if (!project.includes('CODE_SIGN_ENTITLEMENTS = App/App.entitlements;')) {
    project = project.replace(
      /CODE_SIGN_STYLE = Automatic;/g,
      `CODE_SIGN_ENTITLEMENTS = App/App.entitlements;\n\t\t\t\tCODE_SIGN_STYLE = Automatic;`,
    );
  }

  // Keep signing pinned to the current organisation team after an app transfer.
  if (/DEVELOPMENT_TEAM = [^;]+;/g.test(project)) {
    project = project.replace(
      /DEVELOPMENT_TEAM = [^;]+;/g,
      `DEVELOPMENT_TEAM = ${APPLE_TEAM_ID};`,
    );
  } else {
    project = project.replace(
      /CODE_SIGN_STYLE = Automatic;/g,
      `CODE_SIGN_STYLE = Automatic;\n\t\t\t\tDEVELOPMENT_TEAM = ${APPLE_TEAM_ID};`,
    );
  }

  const firebaseFileRef = 'A11C0FFEE1234567890ABC01';
  const firebaseBuildRef = 'A11C0FFEE1234567890ABC02';
  const entitlementsFileRef = 'A11C0FFEE1234567890ABC03';

  if (!project.includes(`${firebaseBuildRef} /* GoogleService-Info.plist in Resources */ =`)) {
    project = project.replace(
      '/* End PBXBuildFile section */',
      `\t\t${firebaseBuildRef} /* GoogleService-Info.plist in Resources */ = {isa = PBXBuildFile; fileRef = ${firebaseFileRef} /* GoogleService-Info.plist */; };\n/* End PBXBuildFile section */`,
    );
  }

  if (!project.includes(`${firebaseFileRef} /* GoogleService-Info.plist */ = {isa = PBXFileReference;`)) {
    project = project.replace(
      '/* End PBXFileReference section */',
      `\t\t${firebaseFileRef} /* GoogleService-Info.plist */ = {isa = PBXFileReference; lastKnownFileType = text.plist.xml; path = "GoogleService-Info.plist"; sourceTree = "<group>"; };\n\t\t${entitlementsFileRef} /* App.entitlements */ = {isa = PBXFileReference; lastKnownFileType = text.plist.entitlements; path = App.entitlements; sourceTree = "<group>"; };\n/* End PBXFileReference section */`,
    );
  }

  if (!project.includes(`${firebaseFileRef} /* GoogleService-Info.plist */,`)) {
    project = project.replace(
      '50379B222058CBB4000EE86E /* capacitor.config.json */,',
      `50379B222058CBB4000EE86E /* capacitor.config.json */,\n\t\t\t\t${firebaseFileRef} /* GoogleService-Info.plist */,\n\t\t\t\t${entitlementsFileRef} /* App.entitlements */,`,
    );
  }

  if (!project.includes(`${firebaseBuildRef} /* GoogleService-Info.plist in Resources */,`)) {
    project = project.replace(
      '504EC3121FED79650016851F /* LaunchScreen.storyboard in Resources */,',
      `504EC3121FED79650016851F /* LaunchScreen.storyboard in Resources */,\n\t\t\t\t${firebaseBuildRef} /* GoogleService-Info.plist in Resources */,`,
    );
  }

  fs.writeFileSync(iosProject, project);
  console.log(`Configured iOS production bundle ID: ${IOS_BUNDLE_ID}`);
  console.log(`Configured iOS signing team: ${APPLE_TEAM_ID}`);
  console.log('Configured iOS entitlements and Firebase plist in Xcode project');
}
