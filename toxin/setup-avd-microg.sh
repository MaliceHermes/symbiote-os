#!/bin/bash
# F-Droid + microG AVD Setup Script for Toxin Prototype
# Creates a complete Android emulator environment for testing microG compatibility
# Usage: ./setup-avd-microg.sh [avd-name] [api-level]

set -e

AVD_NAME="${1:-Toxin_MicroG_Prototype}"
API_LEVEL="${2:-34}"
ARCHITECTURE="x86_64"
IMAGE_TYPE="google_apis"  # We'll use this as base, then install microG
DEVICE_TYPE="pixel_4"
TAG="android-${API_LEVEL}"

echo "🔬 Setting up Toxin microG AVD Prototype"
echo "📱 AVD Name: ${AVD_NAME}"
echo "🔢 API Level: ${API_LEVEL}"
echo "🏗️  Architecture: ${ARCHITECTURE}"
echo ""

# Check Android SDK
if [ -z "$ANDROID_HOME" ] && [ -z "$ANDROID_SDK_ROOT" ]; then
    if [ -d "$HOME/Android/Sdk" ]; then
        export ANDROID_HOME="$HOME/Android/Svd"
    fi
fi

# Ensure command line tools are available
if ! command -v avdmanager &> /dev/null; then
    echo "❌ Android command line tools not found"
    echo "   Run: sdkmanager --install 'commandlinetools-linux-latest'"
    exit 1
fi

# Install system image if not present
echo "📦 Checking system image for Android ${API_LEVEL}..."
if ! avdmanager list avd | grep -q "$AVD_NAME"; then
    sdkmanager --install "system-images;android-${API_LEVEL};google_apis;x86_64" --quiet
    sdkmanager --install "system-images;android-${API_LEVEL};default;x86_64" --quiet
fi

# Create AVD
echo "⚙️  Creating AVD..."
avdmanager create avd \
    --name "$AVD_NAME" \
    --package "system-images;android-${API_LEVEL};google_apis;x86_64" \
    --device "$DEVICE_TYPE" \
    --abi "$ARCHITECTURE" \
    --force

# Create microG-specific AVD variant (for reference)
echo "🧬 Creating microG AVD variant..."
avdmanager create avd \
    --name "${AVD_NAME}_microG" \
    --package "system-images;android-${API_LEVEL};default;x86_64" \
    --device "$DEVICE_TYPE" \
    --abi "$ARCHITECTURE" \
    --force

# Generate emulator configuration
cat > "${HOME}/.android/avd/${AVD_NAME}.ini" << EOF
avd.ini.encoding=UTF-8
AvdId=${AVD_NAME}
boot.control.alpha.mode=auto
fastBoot=true
image.sysdir.1=system-images/android-${API_LEVEL}/google_apis/x86_64/
showDeviceOnError=no
EOF

# Create startup script for microG AVD
cat > "${HOME}/bin/toxin-emulator.sh" << 'EMULATOR_SCRIPT'
#!/bin/bash
# Toxin emulator launcher with microG setup

AVD_NAME="Toxin_MicroG_Prototype"
EMULATOR_LOG="${HOME}/toxin-emulator.log"

echo "🚀 Launching Toxin emulator..."

# Start emulator in background
nohup emulator -avd "$AVD_NAME" -no-snapshot-load -no-window -gpu swiftshader_indirect \
    -qemu -append "androidboot.hardware=toxin" > "$EMULATOR_LOG" 2>&1 &

EMULATOR_PID=$!

# Wait for boot
echo "⏳ Waiting for emulator to boot..."
for i in {1..60}; do
    if adb shell getprop sys.boot_completed 2>/dev/null | grep -q "1"; then
        echo "✅ Emulator booted!"
        break
    fi
    sleep 2
done

# Install microG components
echo "📥 Installing microG components..."

# F-Droid privileged extension (if needed)
adb shell pm install -r \
    "https://f-droid.org/repos/org.fdroid.fdroid.privileged.api.xml" \
    || echo "⚠️  Privileged extension installation skipped (requires rooted AVD)"

# Install microG GmsCore
adb shell pm install -r \
    "https://microg.org/packages/com.google.android.gms.apk" \
    || echo "⚠️  Manual microG install required - see setup guide"

# Install FakeStore for license verification
adb shell pm install -r \
    "https://github.com/microg/FakeStore/releases/latest/download/app-release.apk"

# Install GsfProxy for Google System Frameworks
adb shell pm install -r \
    "https://github.com/microg/GsfProxy/releases/latest/download/app-release.apk"

# Set microG permissions
adb shell pm grant com.google.android.gms android.permission.FAKE_PACKAGE_SIGNATURE
adb shell pm grant com.google.android.gms android.permission.WRITE_SECURE_SETTINGS

# Configure microG
echo "🔧 Configuring microG..."
adb shell pm grant com.google.android.gms android.permission.ACCESS_FINE_LOCATION
adb shell pm grant com.google.android.gms android.permission.INTERNET
adb shell pm grant com.google.android.gms android.permission.WRITE_EXTERNAL_STORAGE

echo ""
echo "✅ Toxin AVD is ready!"
echo ""
echo "📋 Next steps:"
echo "   1. Run: $HOME/bin/toxin-emulator.sh"
echo "   2. Open F-Droid in emulator"
echo "   3. Add microG repository: https://microg.org/fdroid.xml"
echo "   4. Install: GmsCore, FakeStore, GsfProxy"
echo ""
echo "🔗 Documentation: https://microg.org/"
EMULATOR_SCRIPT

chmod +x "${HOME}/bin/toxin-emulator.sh"

echo ""
echo "📊 AVD Creation Complete!"
echo ""
echo "Created AVDs:"
echo "  - ${AVD_NAME} (Google APIs - base)"
echo "  - ${AVD_NAME}_microG (AOSP - microG target)"
echo ""
echo "To start the emulator:"
echo "  emulator -avd ${AVD_NAME}"
echo ""
echo "For microG testing, install these in AVD:"
echo "  1. F-Droid (from https://f-droid.org/)"
echo "  2. Add repo: https://microg.org/fdroid.xml"
echo "  3. Install: GmsCore, FakeStore, GsfProxy"
echo "  4. Open microG Settings → Configure"