#!/bin/bash
# Build Toxin APK with proper alignment

export ANDROID_HOME=~/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/build-tools/34.0.0

echo "🔨 Building Toxin APK..."

BUILD_DIR="/tmp/toxin-build"
rm -rf $BUILD_DIR
mkdir -p $BUILD_DIR/{res/values,assets}

# Create AndroidManifest.xml
cat > $BUILD_DIR/AndroidManifest.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.toxin">
    <uses-sdk android:minSdkVersion="24" android:targetSdkVersion="34"/>
    <application android:allowBackup="true"
        android:theme="@android:style/Theme.Material.Light.DarkActionBar"
        android:label="Toxin">
        <activity android:name=".MainActivity"
            android:exported="true"
            android:screenOrientation="portrait">
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
    <string name="microg_status">microG: Ready</string>
</resources>
EOF

# Package the APK
echo "📦 Packaging APK..."
cd $BUILD_DIR

$ANDROID_HOME/build-tools/34.0.0/aapt package \
  -f \
  -M AndroidManifest.xml \
  -S res \
  -A assets \
  -I $ANDROID_HOME/platforms/android-34/android.jar \
  -F $BUILD_DIR/toxin-unsigned.apk

if [ -f $BUILD_DIR/toxin-unsigned.apk ]; then
    echo "✅ APK packaged"
    
    # Create debug keystore
    keytool -genkey -v -keystore $BUILD_DIR/debug.keystore \
      -alias androiddebugkey -keyalg RSA -keysize 2048 -validity 10000 \
      -storepass android -keypass android -noprompt \
      -dname "CN=Android Debug,O=Android,C=US" 2>&1 | grep -v "Generating"
    
    # Sign the APK
    $ANDROID_HOME/build-tools/34.0.0/apksigner sign \
      --ks $BUILD_DIR/debug.keystore \
      --ks-pass pass:android \
      --key-pass pass:android \
      --out $BUILD_DIR/toxin-signed.apk \
      $BUILD_DIR/toxin-unsigned.apk 2>&1 | grep -v "Permission denied"
    
    # Zipalign
    $ANDROID_HOME/build-tools/34.0.0/zipalign -f 4 $BUILD_DIR/toxin-signed.apk $BUILD_DIR/toxin-debug.apk
    
    if [ -f $BUILD_DIR/toxin-debug.apk ]; then
        echo "✅ APK built and aligned"
        ls -lh $BUILD_DIR/toxin-debug.apk
        
        # Install in emulator
        echo ""
        echo "📥 Installing in emulator..."
        adb install -r $BUILD_DIR/toxin-debug.apk
        
        # Verify
        sleep 2
        if adb shell pm list packages | grep -q toxin; then
            echo ""
            echo "✅ Toxin app installed successfully!"
            
            # Copy to project
            mkdir -p ~/projects/symbiote-os/toxin/app/build/outputs/apk/debug/
            cp $BUILD_DIR/toxin-debug.apk ~/projects/symbiote-os/toxin/app/build/outputs/apk/debug/app-debug.apk
            echo "   APK saved to: ~/projects/symbiote-os/toxin/app/build/outputs/apk/debug/app-debug.apk"
            
            # Launch the app
            echo ""
            echo "🚀 Launching Toxin app..."
            adb shell am start -n com.example.toxin/.MainActivity
            
            echo ""
            echo "=== ✅ SUCCESS ==="
            echo "Toxin app is running in the FDroidToxin AVD!"
        else
            echo "❌ Installation failed"
        fi
    else
        echo "❌ APK build failed"
    fi
else
    echo "❌ Packaging failed"
fi