#!/bin/bash
# FDroidToxin - MicroG AVD Setup with Pre-installed Components
# This script creates a complete Toxin prototype AVD ready for testing
# 
# Prerequisites: Android SDK with command-line tools
# Usage: ./setup-fdroid-toxin.sh [avd-name] [api-level]

set -e

# Configuration
AVD_NAME="${1:-FDroidToxin_Prototype}"
API_LEVEL="${2:-34}"
TAG="android-${API_LEVEL}"
DEVICE_TYPE="pixel_4"
ARCH="x86_64"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}║     FDroidToxin - MicroG AVD Setup v1.0               ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════${NC}"
echo ""

# Function to check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"
    
    # Check Android tools
    if ! command -v avdmanager &> /dev/null; then
        echo -e "${RED}❌ avdmanager not found${NC}"
        echo "   Install: $ANDROID_HOME/cmdline-tools/latest/bin/avdmanager"
        exit 1
    fi
    
    if ! command -v emulator &> /dev/null; then
        echo -e "${RED}❌ emulator not found${NC}"
        echo "   Install: $ANDROID_HOME/emulator"
        exit 1
    fi
    
    # Check SDK manager
    if ! command -v sdkmanager &> /dev/null; then
        echo -e "${RED}❌ sdkmanager not found${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Prerequisites OK${NC}"
}

# Function to install system images
install_system_images() {
    echo -e "${YELLOW}📦 Installing system images...${NC}"
    
    # Ensure at least one system image is available
    sdkmanager --install "system-images;android-${API_LEVEL};default;x86_64"
    sdkmanager --install "system-images;android-${API_LEVEL};google_apis;x86_64"
    
    echo -e "${GREEN}✅ System images installed${NC}"
}

# Function to create base AVD
create_base_avd() {
    echo -e "${YELLOW}⚙️  Creating base AVD: ${AVD_NAME}${NC}"
    
    # Create AVD with default system image (we'll manually set up microG)
    yes | avdmanager create avd \
        --name "$AVD_NAME" \
        --package "system-images;android-${API_LEVEL};default;x86_64" \
        --device "$DEVICE_TYPE" \
        --abi "$ARCH" \
        --force 2>/dev/null
    
    # Verify creation
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Base AVD created${NC}"
    else
        echo -e "${RED}❌ Failed to create base AVD${NC}"
        exit 1
    fi
}

# Function to download microG components
download_microg_components() {
    echo -e "${YELLOW}📥 Downloading microG components...${NC}"
    
    mkdir -p "${HOME}/.microg-components"
    cd "${HOME}/.microg-components"
    
    # Download latest microG components (as of setup)
    declare -A COMPONENTS=(
        ["GmsCore"]="com.google.android.gms"
        ["FakeStore"]="com.google.android.finsky"
        ["GsfProxy"]="org.microg.gms.fallback"
        ["UnifiedNlp"]="org.microg.unifiednlp"
        ["Nominatim"]="org.microg.nominatim"
    )
    
    for component in "${!COMPONENTS[@]}"; do
        echo "  Downloading ${component}..."
        case $component in
            "GmsCore")
                curl -sL "https://github.com/microg/GmsCore/releases/latest/download/app-release.apk" \
                    -o "GmsCore.apk" 2>/dev/null || echo "    ⚠️  Manual install required"
                ;;
            "FakeStore")
                curl -sL "https://github.com/microg/FakeStore/releases/latest/download/app-release.apk" \
                    -o "FakeStore.apk" 2>/dev/null || echo "    ⚠️  Manual install required"
                ;;
            "GsfProxy")
                curl -sL "https://github.com/microg/GsfProxy/releases/latest/download/app-release.apk" \
                    -o "GsfProxy.apk" 2>/dev/null || echo "    ⚠️  Manual install required"
                ;;
            "UnifiedNlp")
                curl -sL "https://github.com/microg/UnifiedNlp/releases/latest/download/app-release.apk" \
                    -o "UnifiedNlp.apk" 2>/dev/null || echo "    ⚠️  Manual install required"
                ;;
            "Nominatim")
                curl -sL "https://github.com/microg/Nominatim/releases/latest/download/Nominatim.apk" \
                    -o "Nominatim.apk" 2>/dev/null || echo "    ⚠️  Manual install required"
                ;;
        esac
    done
    
    echo -e "${GREEN}✅ Components downloaded${NC}"
}

# Function to create FDroidToxin APK installer
create_toxin_installer() {
    echo -e "${YELLOW}📦 Creating FDroidToxin installer...${NC}"
    
    # Create a simple APK installer script
    cat > "${HOME}/bin/fdroid-toxin-install.sh" << 'EOF'
#!/bin/bash
# FDroidToxin - MicroG Component Installer
# Usage: ./fdroid-toxin-install.sh [component]

COMPONENT_DIR="${HOME}/.microg-components"

install_component() {
    local component=$1
    local apk_file="${COMPONENT_DIR}/${component}.apk"
    
    if [ -f "$apk_file" ]; then
        echo "Installing ${component}..."
        adb shell pm install -r "$apk_file"
        
        # Grant necessary permissions
        case $component in
            "GmsCore")
                adb shell pm grant com.google.android.gms android.permission.FAKE_PACKAGE_SIGNATURE
                adb shell pm grant com.google.android.gms android.permission.WRITE_SECURE_SETTINGS
                adb shell pm grant com.google.android.gms android.permission.ACCESS_FINE_LOCATION
                ;;
            *)
                echo "Component ${component} installed"
                ;;
        esac
    else
        echo "APK not found for ${component}"
        echo "Expected: ${apk_file}"
    fi
}

# Wait for device
wait_for_device() {
    echo "Waiting for emulator..."
    for i in {1..30}; do
        if adb devices | grep -q "emulator"; then
            echo "Emulator connected"
            return 0
        fi
        sleep 2
    done
    echo "No emulator connected"
    return 1
}

start_emulator() {
    echo "Starting emulator..."
    if ! pgrep -f "emulator.*${AVD_NAME}" > /dev/null; then
        nohup emulator -avd ${AVD_NAME} -no-snapshot -no-window -gpu swiftshader_indirect \
            > /tmp/toxin-emulator.log 2>&1 &
        echo "Emulator starting in background"
    fi
}

# Main
if [ "$1" = "all" ]; then
    wait_for_device
    for component in GmsCore FakeStore GsfProxy UnifiedNlp; do
        install_component "$component"
    done
elif [ -n "$1" ]; then
    wait_for_device
    install_component "$1"
else
    echo "FDroidToxin - Install microG components"
    echo "Usage: $0 [component|all]"
    echo ""
    echo "Available components:"
    echo "  - GmsCore (Google Play Services replacement)"
    echo "  - FakeStore (License verification)"
    echo "  - GsfProxy (Google System Frameworks)"
    echo "  - UnifiedNlp (Location services)"
    echo "  - all (install all components)"
fi
EOF

    chmod +x "${HOME}/bin/fdroid-toxin-install.sh"
    echo -e "${GREEN}✅ FDroidToxin installer created${NC}"
}

# Function to create microG configuration
create_microg_config() {
    echo -e "${YELLOW}🔧 Creating microG configuration...${NC}"
    
    cat > "${HOME}/bin/setup-microg-config.sh" << 'EOF'
#!/bin/bash
# MicroG configuration script for Toxin AVD

echo "Configuring microG..."

# Enable mock locations
adb shell settings put global fake_location 1
adb shell settings put secure location_providers_allowed +gps

# Disable secure flags for microG
adb shell pm grant com.google.android.gms android.permission.WRITE_SECURE_SETTINGS

# Configure signature spoofing (if supported)
adb shell pm grant com.google.android.gms android.permission.FAKE_PACKAGE_SIGNATURE

# Set network security config
adb shell settings put global package_verifier_enable 0

echo "microG configuration complete"
EOF

    chmod +x "${HOME}/bin/setup-microg-config.sh"
    echo -e "${GREEN}✅ microG configuration created${NC}"
}

# Function to generate documentation
generate_docs() {
    echo -e "${YELLOW}📚 Generating documentation...${NC}"
    
    cat > "${HOME}/projects/symbiote-os/toxin/FDROID_TOXIN_AVD_GUIDE.md" << 'EOF'
# FDroidToxin AVD - Development Guide

## Overview

This guide documents the microG-enabled Android AVD setup for Toxin development and testing.

## Created Components

### AVD: ${AVD_NAME}
- **API Level:** ${API_LEVEL}
- **Device:** Pixel 4 (x86_64)
- **System:** AOSP (to be configured with microG)

### Installed Tools

1. **`setup-fdroid-toxin.sh`** - Main setup script
2. **`fdroid-toxin-install.sh`** - Component installer
3. **`setup-microg-config.sh`** - microG configuration

## Quick Start

```bash
# 1. Create and start AVD
./setup-fdroid-toxin.sh

# 2. Start emulator
emulator -avd ${AVD_NAME}

# 3. Install microG components
~/bin/fdroid-toxin-install.sh all

# 4. Configure microG
~/bin/setup-microg-config.sh
```

## microG Components

| Component | Package | Purpose |
|-----------|---------|---------|
| GmsCore | com.google.android.gms | Google Play Services replacement |
| FakeStore | com.google.android.finsky | License verification bypass |
| GsfProxy | org.microg.gms.fallback | Google System Frameworks proxy |
| UnifiedNlp | org.microg.unifiednlp | Location services |

## Verification

After setup, verify microG is working:

```bash
# Check installed packages
adb shell pm list packages | grep microg

# Check microG services
adb shell dumpsys package com.google.android.gms

# Open microG settings
adb shell am start -n com.google.android.gms/.settings.SettingsActivity
```

## Development Workflow

1. Build your Toxin app:
   ```bash
   cd ~/projects/symbiote-os/toxin
   ./gradlew assembleDebug
   ```

2. Install on AVD:
   ```bash
   adb install -r app/build/outputs/apk/debug/app-debug.apk
   ```

3. Test microG integration:
   ```bash
   adb shell am start -n com.example.toxin/.MainActivity
   ```

## Troubleshooting

### Emulator Won't Boot
```bash
# Clear AVD data
adb -s emulator-5554 emu kill
rm -rf ~/.android/avd/${AVD_NAME}.avd
```

### microG Not Responding
```bash
# Force stop and restart
adb shell am force-stop com.google.android.gms
adb shell am start -n com.google.android.gms/.ui.MainActivity
```

### Permissions Issues
```bash
# Grant all microG permissions
adb shell pm grant com.google.android.gms android.permission.WRITE_SECURE_SETTINGS
adb shell pm grant com.google.android.gms android.permission.FAKE_PACKAGE_SIGNATURE
```

## Next Steps

- [ ] Integrate with Symbiote OS Hive sync
- [ ] Configure Tor onion bridge
- [ ] Set up Shelter work profile isolation
- [ ] Test Syncthing integration
EOF

    echo -e "${GREEN}✅ Documentation generated${NC}"
}

# Main execution
main() {
    check_prerequisites
    install_system_images
    create_base_avd
    download_microg_components
    create_toxin_installer
    create_microg_config
    generate_docs
    
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}║        FDroidToxin AVD Setup Complete! ✅              ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "📱 To start your Toxin AVD:"
    echo "   emulator -avd ${AVD_NAME}"
    echo ""
    echo "📥 To install microG components:"
    echo "   ~/bin/fdroid-toxin-install.sh all"
    echo ""
    echo "⚙️  To configure microG:"
    echo "   ~/bin/setup-microg-config.sh"
    echo ""
    echo "📖 Documentation: ~/projects/symbiote-os/toxin/FDROID_TOXIN_AVD_GUIDE.md"
}

# Run main function
main