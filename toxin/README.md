# Toxin — Android Prototype

> Phase 6 — Mobile spawn for Symbiote-OS  
> Uses MicroG for Google app compatibility (no GApps)

## Status: ✅ **Build Ready + AVD Prototype Available**

---

## 📱 Digital Prototype: FDroidToxin AVD

### Quick Start - Virtual Environment Setup

```bash
# 1. Setup the microG-enabled AVD
cd ~/projects/symbiote-os/toxin
./setup-fdroid-toxin.sh                    # Creates FDroidToxin_Prototype AVD

# 2. Start the emulator
emulator -avd FDroidToxin_Prototype

# 3. Install microG components
~/bin/fdroid-toxin-install.sh all          # Installs GmsCore, FakeStore, GsfProxy

# 4. Install Toxin app
./fdroid-toxin-install.sh                  # Builds and installs app

# 5. Verify setup
adb shell pm list packages com.example.toxin  # Check installation
```

### AVD Components

| Component | Purpose | Status |
|-----------|---------|--------|
| **FDroidToxin_Prototype** | Android 14 (API 34) AVD | ✅ Created |
| **GmsCore** | Google Play Services replacement | Configurable |
| **FakeStore** | License verification bypass | Configurable |
| **GsfProxy** | Google System Frameworks | Configurable |
| **Toxin App** | Main Symbiote OS component | ✅ Built |

### Documentation Files

- 📖 `FDROID_TOXIN_AVD_GUIDE.md` - Complete AVD usage guide
- 🔧 `MICROG_AVD_SETUP.md` - microG-specific configuration
- 🚀 `setup-fdroid-toxin.sh` - Full AVD setup script
- 📥 `fdroid-toxin-install.sh` - App installation automation

---

## What Works

- ✅ Debug APK built (5.5 MB) - `app/build/outputs/apk/debug/app-debug.apk`
- ✅ Status dashboard with component tracking
- ✅ Adaptive launcher icon
- ✅ Themed UI (Material3 dark theme)
- ✅ Build.gradle configured with dependencies
- ✅ FDroidToxin AVD prototype scripts created

### What's Needed

- LineageOS-capable device (Google Pixel recommended)
- TWRP recovery for ROM flashing
- microG for Google service replacement
- USB debugging enabled

---

## Setup Instructions

### 1. Build APK (Done)
```bash
cd ~/projects/symbiote-os/toxin
export ANDROID_HOME=~/Android/Sdk
/tmp/gradle-8.5/bin/gradle assembleDebug
```

### 2. Install APK on Device
```bash
# Connect device via USB
~/Android/Sdk/platform-tools/adb install app/build/outputs/apk/debug/app-debug.apk

# Verify:
~/Android/Sdk/platform-tools/adb shell pm list packages | grep toxin
```

### 3. 🆕 Virtual Environment (AVD) Setup

```bash
# Create microG-compliant AVD
./setup-fdroid-toxin.sh

# Start emulator (with or without window)
emulator -avd FDroidToxin_Prototype -no-window  # headless
emulator -avd FDroidToxin_Prototype             # with UI

# Verify AVD
adb devices  # Should show emulator-5554
```

### 4. Install microG in AVD

```bash
# Quick install all components
~/bin/fdroid-toxin-install.sh all

# Or manual F-Droid setup:
# 1. Install F-Droid from https://f-droid.org/
# 2. Add repo: https://microg.org/fdroid.xml
# 3. Install: GmsCore, FakeStore, GsfProxy
```

### 5. Set Up LineageOS Device (when hardware available)
1. Unlock bootloader
2. Install TWRP recovery
3. Flash LineageOS ROM
4. Wipe Dalvik/Cache

### 6. Configure Syncthing for Hive sync
```bash
# On device (F-Droid): Install Syncthing
# On desktop:
syncthing --gui-address="tcp://0.0.0.0:8384"

# Sync folder: ~/.symbiote-brain ↔ /storage/emulated/0/Symbiote/Hive
```

---

## Component Status Dashboard

| Component | Status | Action Required |
|-----------|--------|----------------|
| **microG** | ✅ Ready | Install on AVD or LineageOS device |
| **FDroid** | ✅ Ready | Install in AVD |
| **Syncthing** | ⏳ Setup | Install + pair with desktop |
| **Shelter** | ⏳ Setup | Install + configure work profile |
| **Tor** | ⏳ Setup | Configure onion service bridge |

---

## Build Output

```
app/build/outputs/apk/debug/app-debug.apk
├── Size: 5.5 MB
├── Debuggable: Yes
└── Target SDK: 34 (Android 14)
```

---

## Architecture Notes

```
┌─────────────────────────────────────────────────────┐
│  Toxin (Android)                                    │
│  • LineageOS + microG                             │
│  • Syncthing → ~/.symbiote-brain                    │
│  • Shelter work profile for isolation              │
│  • Connects via Tor onion service                  │
│                                                    │
│  Google apps via microG:                           │
│  ✓ Gmail, Maps, Drive, Contacts                   │
│  ✓ YouTube (vanilla)                               │
│  ✗ Google Pay, YouTube Premium                    │
└─────────────────────────────────────────────────────┘
```

---

## microG Compatibility

| Service | Status |
|---------|--------|
| Google Play Services | ✅ GmsCore |
| Gmail | ✅ Works |
| Maps | ✅ Works |
| Drive | ✅ Works |
| YouTube | ✅ Works |
| Google Pay | ❌ No (hardware attestation) |

---

## Development Workflow

### For AVD Development
```bash
# 1. Start emulator
emulator -avd FDroidToxin_Prototype -no-snapshot

# 2. Install/update app
./fdroid-toxin-install.sh

# 3. View logs
adb logcat | grep toxin

# 4. Test features
adb shell am start -n com.example.toxin/.MainActivity
```

### For Real Device
1. Build APK: `./gradlew assembleDebug`
2. Install: `adb install -r app/build/outputs/apk/debug/app-debug.apk`
3. Test: Open via launcher or `adb shell am start ...`

---

## See Also

- `FDROID_TOXIN_AVD_GUIDE.md` — Full AVD setup and verification guide
- `MICROG_AVD_SETUP.md` — microG-specific configuration notes
- `setup-fdroid-toxin.sh` — Script to create the AVD
- `fdroid-toxin-install.sh` — Script to install the app
- SYMBIOTE_TENDRIL_TOXIN_INTEGRATION.md for Tor bridge setup
- ~/.symbiote-brain/ on Venom desktop for the shared vault

---

## Troubleshooting

### AVD Won't Start
```bash
# Wipe data
emulator -avd FDroidToxin_Prototype -wipe-data

# Or recreate
rm -rf ~/.android/avd/FDroidToxin_Prototype*
./setup-fdroid-toxin.sh
```

### microG Not Working
```bash
# Force restart GmsCore
adb shell am force-stop com.google.android.gms
adb shell am start -n com.google.android.gms/.settings.SettingsActivity

# Run self-check
# (Open microG Settings → Self-Check)
```

### App Crashes
```bash
# Check logs
adb logcat | grep -i "com.example.toxin"

# Clear data
adb shell pm clear com.example.toxin

# Reinstall
./fdroid-toxin-install.sh
```

---

## Quick Reference

```bash
# AVD Commands
emulator -avd FDroidToxin_Prototype                  # Start AVD
adb devices                                        # Check connection
adb install toxin.apk                             # Install app
adb shell pm list packages | grep toxin           # Verify installation
adb logcat | grep toxin                           # View logs
adb shell am start -n com.example.toxin/.MainActivity  # Launch app
```

---

## Related Projects

- **Venom** (Brain/SSD) — Symbiote OS core on Debian 13
- **Tendril** (Tor) — Onion service bridge
- **Toxin** (Android) — Mobile prototype with microG
- **Hive** — Shared vault synced via Syncthing

---

*Part of Symbiote OS — Privacy-first portable agentic OS*
*Building in public: "Old Roots, New Rituals" — GeekzNThingz Substack*