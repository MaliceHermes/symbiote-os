#!/bin/bash
# Complete FDroidToxin microG Setup

export ANDROID_HOME=~/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

DEVICE="emulator-5554"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     FDroidToxin microG Complete Setup                     ║"
echo "╚════════════════════════════════════════════════════════════╝"

# Wait for device
echo -e "\n⏳ Waiting for emulator..."
adb -s $DEVICE wait-for-device

# Check boot status
BOOT_STATUS=$(adb -s $DEVICE shell getprop sys.boot_completed)
if [ "$BOOT_STATUS" != "1" ]; then
    echo "   Waiting for boot..."
    for i in {1..30}; do
        BOOT_STATUS=$(adb -s $DEVICE shell getprop sys.boot_completed 2>/dev/null)
        if [ "$BOOT_STATUS" = "1" ]; then
            echo "   ✅ Booted!"
            break
        fi
        sleep 2
    done
else
    echo "   ✅ Already booted"
fi

echo -e "\n📱 Device: $(adb -s $DEVICE shell getprop ro.product.model)"
echo "   Android: $(adb -s $DEVICE shell getprop ro.build.version.release)"

# Install microG components
echo -e "\n🔧 Installing microG components..."

declare -A COMPONENTS=(
    ["GmsCore"]="com.google.android.gms"
    ["FakeStore"]="com.google.android.finsky"
    ["GsfProxy"]="org.microg.gms.fallback"
)

for name in "${!COMPONENTS[@]}"; do
    pkg="${COMPONENTS[$name]}"
    echo "   Checking $name..."
    
    if adb -s $DEVICE shell pm list packages | grep -q "$pkg"; then
        echo "   ✅ $name already installed"
    else
        # Try to install
        APK="/tmp/${name}.apk"
        URL="https://github.com/microg/${name}/releases/latest/download/app-release.apk"
        
        if [ "$name" = "FakeStore" ]; then
            URL="https://github.com/microg/FakeStore/releases/latest/download/app-release.apk"
        fi
        
        echo "   📥 Downloading $name..."
        curl -sL --max-filesize 20M "$URL" -o "$APK" 2>/dev/null
        
        if [ -s "$APK" ]; then
            echo "   📥 Installing $name..."
            adb -s $DEVICE install -r "$APK" 2>&1 | grep -v "^$"
        fi
    fi
done

# Grant permissions
echo -e "\n⚙️  Granting microG permissions..."
adb -s $DEVICE shell pm grant com.google.android.gms android.permission.WRITE_SECURE_SETTINGS 2>/dev/null || true
adb -s $DEVICE shell pm grant com.google.android.gms android.permission.FAKE_PACKAGE_SIGNATURE 2>/dev/null || true
adb -s $DEVICE shell settings put global fake_location 1 2>/dev/null || true

echo -e "\n✅ microG setup complete!"
echo ""
echo "📋 Verification:"
echo "   adb shell pm list packages | grep microg"
echo ""
echo "🚀 To launch microG:"
echo "   adb shell am start -n com.google.android.gms/.settings.SettingsActivity"
echo ""
echo "📦 To build and install Toxin:"
echo "   cd ~/projects/symbiote-os/toxin && ./gradlew assembleDebug"
echo "   adb install app/build/outputs/apk/debug/app-debug.apk"
echo "   adb shell am start -n com.example.toxin/.MainActivity"