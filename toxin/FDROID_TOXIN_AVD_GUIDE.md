# FDroidToxin AVD - Digital Prototype Guide

## Overview

This guide documents the setup and usage of the FDroidToxin AVD (Android Virtual Device) for Toxin development and testing. The AVD simulates a microG-compatible Android environment for privacy-first app testing.

## Quick Start

### 1. Create the AVD

```bash
cd ~/projects/symbiote-os/toxin
chmod +x setup-fdroid-toxin.sh
./setup-fdroid-toxin.sh
```

This creates:
- **AVD Name:** `FDroidToxin_Prototype`
- **API Level:** 34 (Android 14)
- **Device:** Pixel 4, x86_64
- **System:** AOSP base with microG tooling

### 2. Start the Emulator

```bash
emulator -avd FDroidToxin_Prototype -no-snapshot -no-window
```

Or with GUI:
```bash
emulator -avd FDroidToxin_Prototype
```

### 3. Install microG Components

```bash
# Install all microG components
~/bin/fdroid-toxin-install.sh all
```

Components installed:
| Component | Package Name | Purpose |
|-----------|-------------|---------|
| GmsCore | `com.google.android.gms` | Google Play Services replacement |
| FakeStore | `com.google.android.finsky` | License verification bypass |
| GsfProxy | `org.microg.gms.fallback` | Google System Frameworks proxy |
| UnifiedNlp | `org.microg.unifiednlp` | Location service provider |

### 4. Install Toxin App

```bash
# Build and install
cd ~/projects/symbiote-os/toxin
./fdroid-toxin-install.sh
```

## Directory Structure

```
~/projects/symbiote-os/toxin/
├── setup-avd-microg.sh           # Basic AVD setup script
├── setup-fdroid-toxin.sh         # Complete FDroidToxin setup
├── fdroid-toxin-install.sh       # App installation automation
├── scripts/
│   └── install-microg-components.sh  # Offline microG installer
└── Documentation/
    ├── FDROID_TOXIN_AVD_GUIDE.md          # This file
    └── MICROG_AVD_SETUP.md                  # microG-specific notes
```

## Verification Commands

### Check Emulator Connection
```bash
adb devices
# Expected output should show: emulator-5554   device
```

### Verify microG Installation
```bash
# List installed microG packages
adb shell pm list packages | grep microg

# Check GmsCore status
adb shell pm list packages com.google.android.gms

# Open microG settings UI
adb shell am start -n com.google.android.gms/.settings.SettingsActivity
```

### Verify Toxin App Installation
```bash
# Check package installation
adb shell pm list packages com.example.toxin

# View app info
adb shell dumpsys package com.example.toxin

# Launch app
adb shell am start -n com.example.toxin/.MainActivity

# Check app version
adb shell dumpsys package com.example.toxin | grep versionName
```

### Test microG Services
```bash
# Check Google Play Services status
adb shell dumpsys gmscore

# Test location service
adb shell settings get secure location_providers_allowed

# Check network connectivity
adb shell ping -c 1 google.com
```

## FDroid Setup (Within Emulator)

Once the emulator is running:

1. **Install F-Droid:**
   - Open browser in emulator
   - Download from: https://f-droid.org/FDroid.apk
   - Install via: `adb install FDroid.apk`

2. **Add microG Repository:**
   - Open F-Droid
   - Settings → Repositories → +Add
   - URL: `https://microg.org/fdroid.xml`

3. **Install microG apps:**
   - Search for: GmsCore, FakeStore, GsfProxy
   - Install all three

## Usage Scenarios

### App Development
```bash
# Build debug APK
./gradlew assembleDebug

# Install on running AVD
adb install -r app/build/outputs/apk/debug/app-debug.apk

# Clear app data (for testing)
adb shell pm clear com.example.toxin

# View logs
adb logcat | grep toxin
```

### microG Testing
```bash
# Enable mock locations
adb shell settings put global fake_location 1

# Test Google Maps API
adb shell am start -n com.example.toxin/.MapsActivity

# Verify FCM push
adb logcat | grep -i fcm
```

### Integration Testing
```bash
# Test Syncthing setup
adb shell am start -n com.nik synchronized/.MainActivity

# Test Shelter work profile (requires rooted AVD)
adb shell pm create-user --profile 0 ShelterProfile
```

## Troubleshooting

### Emulator Won't Boot
```bash
# Clean AVD data
emulator -avd FDroidToxin_Prototype -wipe-data

# Or completely recreate
rm -rf ~/.android/avd/FDroidToxin_Prototype*
./setup-fdroid-toxin.sh
```

### microG Not Responding
```bash
# Force stop and restart
adb shell am force-stop com.google.android.gms
adb shell am start -n com.google.android.gms/.ui.MainActivity

# Check for errors
adb logcat | grep microg
```

### Installation Failed
```bash
# Check device storage
adb shell df -h /data

# Uninstall existing versions
adb uninstall com.example.toxin
adb uninstall com.google.android.gms

# Reinstall
./fdroid-toxin-install.sh
```

### Permissions Issues
```bash
# Grant all necessary permissions
adb shell pm grant com.example.toxin android.permission.INTERNET
adb shell pm grant com.example.toxin android.permission.WRITE_SECURE_SETTINGS
adb shell pm grant com.google.android.gms android.permission.WRITE_SECURE_SETTINGS
adb shell pm grant com.google.android.gms android.permission.FAKE_PACKAGE_SIGNATURE
```

## CI/CD Integration

For automated testing:

```yaml
# .github/workflows/avd-test.yml
name: Toxin AVD Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Android SDK
        uses: android-actions/setup-android@v2
        
      - name: Create AVD
        run: |
          echo "no" | avdmanager create avd -n test -k "system-images;android-34;default;x86_64"
          
      - name: Run Emulator
        run: |
          emulator -avd test -no-window -no-audio &
          adb wait-for-device
          
      - name: Build and Test
        run: |
          ./gradlew assembleDebug testDebug
```

## Next Steps

After verification, continue with:

1. **Syncthing Integration** - Set up Hive sync between AVD and desktop
2. **Tor Bridge** - Configure onion service for Tendril integration
3. **Shelter Isolation** - Test work profile isolation (requires rooted setup)
4. **Real Device Testing** - Port to actual LineageOS + microG device

## Related Documentation

- [Toxin Android README](./README.md) - Main Toxin documentation
- [microG Documentation](https://microg.org/) - Official microG resources
- [F-Droid Documentation](https://f-droid.org/docs/) - F-Droid usage guide

## Support

For issues or questions:
- Check the troubleshooting section above
- Review Android logs: `adb logcat`
- Verify microG setup: Open microG Settings in emulator
- Consult the [Symbiote OS Wiki](https://github.com/symbiote-os/wiki)

---

*Created: 2026-08-20 | Version: 1.0*
*For: Symbiote OS - Toxin Component (Android + microG)*