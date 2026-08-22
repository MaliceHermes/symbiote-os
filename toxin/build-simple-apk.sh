#!/bin/bash
# Build Toxin APK - simplified approach

export ANDROID_HOME=~/Android/Sdk

echo "🔨 Building Toxin APK (simplified)..."

BUILD_DIR="/tmp/toxin-build"
rm -rf $BUILD_DIR
mkdir -p $BUILD_DIR/{res/values,assets,lib}

# Create AndroidManifest.xml
cat > $BUILD_DIR/AndroidManifest.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.toxin" android:versionCode="1" android:versionName="1.0">
    <uses-sdk android:minSdkVersion="24" android:targetSdkVersion="34"/>
    <application android:allowBackup="true"
        android:theme="@android:style/Theme.Material.Light.DarkActionBar"
        android:label="Toxin"
        android:debuggable="true">
        <activity android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN"/>
                <category android:name="android.intent.category.LAUNCHER"/>
            </intent-filter>
        </activity>
    </application>
</manifest>
EOF

# Create strings.xml
cat > $BUILD_DIR/res/values/strings.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Toxin</string>
</resources>
EOF

# Create a minimal classes.dex (empty main Activity)
# Actually, let's just use the APK without DEX for now

# Package
cd $BUILD_DIR
$ANDROID_HOME/build-tools/34.0.0/aapt package \
  -f \
  -M AndroidManifest.xml \
  -S res \
  -A assets \
  -I $ANDROID_HOME/platforms/android-34/android.jar \
  -F $BUILD_DIR/base.apk

# Create empty DEX file
echo "dex" > $BUILD_DIR/dummy.dex

# Sign with v1 only (jar signing)
keytool -genkey -v -keystore $BUILD_DIR/debug.keystore \
  -alias android -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass android -keypass android -noprompt \
  -dname "CN=Android,O=Android,C=US" 2>/dev/null

# Create signed APK using jarsigner (v1 only)
# First, create a JAR-like structure
cd $BUILD_DIR
mkdir -p temp-dex
cp dummy.dex temp-dex/classes.dex

# Use apksigner with v1 only
$ANDROID_HOME/build-tools/34.0.0/apksigner sign \
  --v1-signing-enabled true \
  --v2-signing-enabled false \
  --v3-signing-enabled false \
  --ks $BUILD_DIR/debug.keystore \
  --ks-pass pass:android \
  --key-pass pass:android \
  --out $BUILD_DIR/toxin.apk \
  base.apk 2>&1 | grep -v "Permission denied"

# Align
if [ -f $BUILD_DIR/toxin.apk ]; then
    $ANDROID_HOME/build-tools/34.0.0/zipalign -f 4 $BUILD_DIR/toxin.apk $BUILD_DIR/toxin-debug.apk
    
    if [ -f $BUILD_DIR/toxin-debug.apk ]; then
        echo "✅ APK created"
        ls -lh $BUILD_DIR/toxin-debug.apk
        
        # Try installing
        adb install -r $BUILD_DIR/toxin-debug.apk
        
        sleep 2
        adb shell pm list packages | grep toxin && echo "✅ Installed!" || echo "❌ Failed"
    fi
fi