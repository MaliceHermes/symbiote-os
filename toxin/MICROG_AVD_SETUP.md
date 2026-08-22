# microG AVD Setup Guide

## microG-Specific AVD Configuration

This guide covers microG setup for Android Virtual Devices.

### Recommended AVD Configuration

Use AOSP system images (not Google APIs) for better microG compatibility:

```bash
# Create microG-ready AVD
avdmanager create avd \
  --name "MicroG_Test" \
  --package "system-images;android-34;default;x86_64" \
  --device "pixel_4"
```

### Installing microG Components (Offline)

For reliable offline installation:

```bash
# Download APKs manually
mkdir -p ~/microg-offline
cd ~/microg-offline

# Download from GitHub releases
curl -L -o GmsCore.apk "https://github.com/microg/GmsCore/releases/latest/download/app-release.apk"
curl -L -o FakeStore.apk "https://github.com/microg/FakeStore/releases/latest/download/app-release.apk"
curl -L -o GsfProxy.apk "https://github.com/microg/GsfProxy/releases/latest/download/app-release.apk"

# Install on AVD
adb install -r GmsCore.apk FakeStore.apk GsfProxy.apk
```

### Required Permissions

After installation, grant these permissions:

```bash
# Google Play Services permissions
adb shell pm grant com.google.android.gms android.permission.WRITE_SECURE_SETTINGS
adb shell pm grant com.google.android.gms android.permission.FAKE_PACKAGE_SIGNATURE
adb shell pm grant com.google.android.gms android.permission.ACCESS_FINE_LOCATION

# For apps using microG
adb shell pm grant com.example.toxin android.permission.INTERNET
adb shell pm grant com.example.toxin android.permission.ACCESS_NETWORK_STATE
```

### Signature Spoofing

microG requires signature spoofing to work with apps expecting Google Play Services:

```bash
# Check if spoofing is available
adb shell pm dump com.google.android.gms | grep -i "signature"

# If not available, use Shamiko (rooted devices only)
# Or use fake-sigspoof Xposed module (requires root)
```

### microG Setup Wizard

After installation, launch the setup wizard:

```bash
adb shell am start -n com.google.android.gms/.ui.SettingsActivity
# Or simply open Settings → microG on the emulator
```

Configure:
1. **Self-Check** - Run diagnostics
2. **Cloud Messaging** - Set up push notifications
3. **Location** - Configure loc providers
4. **System Integration** - Register as account type

### Testing microG Functionality

```bash
# Check if Google Play Services is running
adb shell dumpsys gmscore | grep "GooglePlayServices"

# Test location providers
adb shell settings list secure location_providers_allowed

# Check network services
adb shell netstat -tuln | grep 5037  # ADB
```

### F-Droid Privileged Extension

For privileged F-Droid operations (requires rooted AVD or Magisk):

```bash
# Install privileged extension
adb install "https://f-droid.org/repos/org.fdroid.fdroid.privileged.api.xml"

# Grant permission
adb shell pm grant org.fdroid.fdroid.privileged.api android.permission.WRITE_SECURE_SETTINGS
```

## Common Issues

### "Google Play services not responding"
- Clear GmsCore data: `adb shell pm clear com.google.android.gms`
- Restart emulator
- Re-run self-check in microG settings

### "Signature spoofing not enabled"
- Solution: Use LineageOS for microG (pre-rooted)
- Alternative: Shamiko module (requires Magisk)

### Apps crash on startup
- Check logcat: `adb logcat | grep -i "com.example.toxin"`
- Verify microG is properly configured
- Ensure targetSdkVersion < 30 (newer versions may require additional setup)

### Push notifications not working
- Install FakeStore
- Enable "Google Cloud Messaging" in microG settings
- Check app manifest for proper receiver declarations

## Best Practices

1. **Always use AOSP images** for microG testing
2. **Install FakeStore** for license simulation
3. **Grant WRITE_SECURE_SETTINGS** to GmsCore
4. **Run self-check** after installation
5. **Test on real device** before production release