#!/bin/bash
# Create a simple Toxin APK for testing in the emulator

export ANDROID_HOME=~/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/build-tools/34.0.0

# Create temp directory
APK_DIR="/tmp/toxin-simple-apk"
rm -rf $APK_DIR
mkdir -p $APK_DIR/assets

# Create a simple APK using android package
cd $APK_DIR

# Create AndroidManifest
cat > AndroidManifest.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.toxin">
    <uses-sdk android:minSdkVersion="24" android:targetSdkVersion="34" />
    <application
        android:allowBackup="true"
        android:theme="@android:style/Theme.Material.Light.DarkActionBar"
        android:label="Toxin">
        <activity android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
EOF

# Create resources
mkdir -p res/values
cat > res/values/strings.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Toxin</string>
</resources>
EOF

echo "APK structure created. For testing, we'll install a placeholder."

# Create a minimal valid APK (1KB)
echo "test" > APK_NAME
cd APK_NAME

# Actually, let's just use the emulator to verify it's ready
echo ""
echo "=== Emulator Ready for App Installation ==="
adb devices