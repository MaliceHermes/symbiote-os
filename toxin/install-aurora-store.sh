#!/bin/bash
# Install Aurora Store + microG in FDroidToxin AVD

export ANDROID_HOME=~/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║     Aurora Store + microG Setup for Toxin AVD            ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check if emulator is connected
if ! adb devices | grep -q emulator; then
    echo "❌ No emulator connected"
    echo "   Start with: emulator -avd FDroidToxin_Prototype"
    exit 1
fi

echo "✅ Emulator connected: $(adb devices | grep emulator | awk '{print $1}')"
echo ""

# Step 1: Download and install Aurora Store
echo "📦 Installing Aurora Store..."
cd /tmp

# Aurora Store via F-Droid (recommended)
if adb shell pm list packages | grep -q fdroid; then
    echo "   Via F-Droid (recommended):"
    echo "   1. Open F-Droid in emulator"
    echo "   2. Search for: Aurora Store"
    echo "   3. Install it"
    echo ""
fi

# Try direct download as backup
AURORA_URL="https://github.com/AuroraStore/AuroraStore/releases/latest/download/app-release.apk"
echo "   Direct download link: $AURORA_URL"
curl -sL --max-filesize 20971520 "$AURORA_URL" -o aurora-store.apk 2>/dev/null

if [ -s aurora-store.apk ]; then
    echo "   Uploading Aurora Store..."
    adb install -r aurora-store.apk
    if [ $? -eq 0 ]; then
        echo "   ✅ Aurora Store installed"
    else
        echo "   ⚠️  Installation attempt made (may need F-Droid install)"
    fi
else
    echo "   ⚠️  Download size limit, use F-Droid instead"
fi

echo ""
echo "🔐 Installing microG components via F-Droid..."
echo ""
echo "Recommended microG packages from F-Droid:"
echo "  1. GmsCore (Google Play Services replacement)"
echo "  2. FakeStore (License verification bypass)"
echo "  3. GsfProxy (Google System Frameworks)"
echo ""

# Download microG from their F-Droid repo
echo "   Downloading microG components..."
cd /tmp

# GmsCore
curl -sL "https://github.com/microg/GmsCore/releases/latest/download/app-release.apk" -o GmsCore.apk 2>/dev/null
if [ -s GmsCore.apk ]; then
    adb install -r GmsCore.apk && echo "   ✅ GmsCore installed" || echo "   ⚠️  GmsCore ready for F-Droid install"
fi

# FakeStore
curl -sL "https://github.com/microg/FakeStore/releases/latest/download/app-release.apk" -o FakeStore.apk 2>/dev/null
if [ -s FakeStore.apk ]; then
    adb install -r FakeStore.apk && echo "   ✅ FakeStore installed" || echo "   ⚠️  FakeStore ready for F-Droid install"
fi

# GsfProxy
curl -sL "https://github.com/microg/GsfProxy/releases/latest/download/app-release.apk" -o GsfProxy.apk 2>/dev/null
if [ -s GsfProxy.apk ]; then
    adb install -r GsfProxy.apk && echo "   ✅ GsfProxy installed" || echo "   ⚠️  GsfProxy ready for F-Droid install"
fi

echo ""
echo "⚙️  Granting microG permissions..."

# Grant necessary permissions to microG
adb shell pm grant com.google.android.gms android.permission.WRITE_SECURE_SETTINGS 2>/dev/null || echo "   (Permission may already be granted)"
adb shell pm grant com.google.android.gms android.permission.FAKE_PACKAGE_SIGNATURE 2>/dev/null || echo "   (Permission may already be granted)"
adb shell pm grant com.google.android.gms android.permission.ACCESS_FINE_LOCATION 2>/dev/null || echo "   (Permission may already be granted)"

echo ""
echo "📋 Verification Commands:"
echo "   Check installed: adb shell pm list packages | grep microg"
echo "   Open microG:    adb shell am start -n com.google.android.gms/.settings.SettingsActivity"
echo "   Open Aurora:    adb shell am start -n com AuroraStore"

echo ""
echo "✅ Setup complete! To fully configure:"
echo "   1. Open Aurora Store in emulator"
echo "   2. Sign in with Google account (or use as guest)"
echo "   3. Download apps from Play Store"
echo "   4. Or: Use F-Droid + microG repo for FOSS apps"