#!/bin/bash
# Toxin Setup Script
# Configures Syncthing for Hive sync with Venom desktop

set -e

echo "=== Toxin Setup Script ==="
echo ""

# Check if device is connected
if ! ~/Android/Sdk/platform-tools/adb devices | grep -q "device$"; then
    echo "⚠️  No Android device connected"
    echo "   Connect device via USB and enable developer options"
    exit 1
fi

echo "✅ Device connected"

# Create Hive directory on device
echo "📁 Creating Hive directory on device..."
~/Android/Sdk/platform-tools/adb shell mkdir -p /storage/emulated/0/Symbiote/Hive

# Check if Syncthing is installed
echo "🔍 Checking for Syncthing..."
if ~/Android/Sdk/platform-tools/adb shell "which syncthing" 2>/dev/null; then
    echo "✅ Syncthing found on device"
else
    echo "⚠️  Syncthing not found - install from F-Droid:"
    echo "   1. Open F-Droid on device"
    echo "   2. Search 'Syncthing'"
    echo "   3. Install syncthing@6577223"
fi

# Configure desktop Syncthing for Hive sync
echo ""
echo "=== Desktop Configuration ==="
echo "Run on Venom desktop to start Syncthing GUI:"
echo "  syncthing --gui-address=\"tcp://0.0.0.0:8384\""
echo ""
echo "Then pair with device by scanning QR code at http://localhost:8384"
echo "Sync folder: ~/.symbiote-brain ↔ /storage/emulated/0/Symbiote/Hive"

# Optional: Generate QR code for pairing (requires qrencode)
if command -v qrencode &> /dev/null; then
    echo ""
    echo "📋 Device ID for pairing:"
    ~/Android/Sdk/platform-tools/adb shell settings get secure android_id 2>/dev/null || echo "  Get from Syncthing GUI → Device ID"
fi

echo ""
echo "=== Setup Complete ==="