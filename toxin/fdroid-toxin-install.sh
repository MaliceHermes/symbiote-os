#!/bin/bash
# FDroidToxin Automation - Install Toxin App in microG AVD
# This script automates the installation of the Toxin prototype app
# with all necessary microG integrations

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

TOXIN_PKG="com.example.toxin"
DEBUG_APK="${HOME}/projects/symbiote-os/toxin/app/build/outputs/apk/debug/app-debug.apk"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     FDroidToxin Automation - Toxin App Installer         ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to wait for emulator
wait_for_emulator() {
    echo -e "${YELLOW}⏳ Waiting for emulator...${NC}"
    
    for i in {1..30}; do
        if adb devices | grep -q "emulator"; then
            echo -e "${GREEN}✅ Emulator connected${NC}"
            adb devices
            return 0
        fi
        sleep 2
    done
    
    echo -e "${RED}❌ No emulator found. Start with: emulator -avd FDroidToxin_Prototype${NC}"
    exit 1
}

# Function to verify microG components
verify_microg() {
    echo -e "${YELLOW}🔍 Verifying microG components...${NC}"
    
    declare -A REQUIRED_PACKAGES=(
        ["GmsCore"]="com.google.android.gms"
        ["FakeStore"]="com.google.android.finsky"
        ["GsfProxy"]="org.microg.gms.fallback"
    )
    
    local all_installed=true
    
    for name in "${!REQUIRED_PACKAGES[@]}"; do
        pkg="${REQUIRED_PACKAGES[$name]}"
        if adb shell pm list packages "$pkg" 2>/dev/null | grep -q "$pkg"; then
            echo -e "  ${GREEN}✓${NC} ${name} installed"
        else
            echo -e "  ${YELLOW}⚠${NC} ${name} not installed"
            all_installed=false
        fi
    done
    
    if [ "$all_installed" = false ]; then
        echo -e "${YELLOW}⚠  Some microG components missing. Install with: ~/bin/fdroid-toxin-install.sh all${NC}"
    fi
}

# Function to verify target APK
verify_apk() {
    if [ -f "$DEBUG_APK" ]; then
        local size=$(du -h "$DEBUG_APK" | cut -f1)
        echo -e "${GREEN}✅ Found debug APK: ${size}${NC}"
        return 0
    else
        echo -e "${RED}❌ Debug APK not found at: ${DEBUG_APK}${NC}"
        echo "   Build with: cd ~/projects/symbiote-os/toxin && ./gradlew assembleDebug"
        return 1
    fi
}

# Function to install Toxin app
install_toxin_app() {
    echo -e "${YELLOW}📥 Installing Toxin app...${NC}"
    
    # Uninstall if already present
    if adb shell pm list packages "$TOXIN_PKG" 2>/dev/null | grep -q "$TOXIN_PKG"; then
        echo "  Uninstalling existing version..."
        adb uninstall "$TOXIN_PKG"
    fi
    
    # Install new version
    adb install -r "$DEBUG_APK"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Toxin app installed${NC}"
    else
        echo -e "${RED}❌ Installation failed${NC}"
        exit 1
    fi
}

# Function to verify microG integration
verify_microg_integration() {
    echo -e "${YELLOW}🔧 Verifying microG integration...${NC}"
    
    # Check if app requests microG services
    local checks=(
        "com.google.android.gms"
        "android.permission.FAKE_PACKAGE_SIGNATURE"
    )
    
    for check in "${checks[@]}"; do
        if adb shell dumpsys package "$TOXIN_PKG" 2>/dev/null | grep -q "$check"; then
            echo -e "  ${GREEN}✓${NC} Uses $check"
        else
            echo -e "  ${YELLOW}ℹ${NC} $check not detected (may not be used)"
        fi
    done
}

# Function to grant necessary permissions
grant_permissions() {
    echo -e "${YELLOW}🔐 Granting permissions...${NC}"
    
    local permissions=(
        "android.permission.INTERNET"
        "android.permission.ACCESS_NETWORK_STATE"
        "android.permission.WRITE_EXTERNAL_STORAGE"
        "android.permission.READ_EXTERNAL_STORAGE"
    )
    
    for perm in "${permissions[@]}"; do
        adb shell pm grant "$TOXIN_PKG" "$perm" 2>/dev/null || \
            echo "  ⚠ Cannot grant $perm (may be runtime permission)"
    done
    
    echo -e "${GREEN}✅ Permissions processed${NC}"
}

# Function to launch Toxin app
launch_app() {
    echo -e "${YELLOW}🚀 Launching Toxin app...${NC}"
    
    adb shell am start -n "$TOXIN_PKG/.MainActivity"
    sleep 2
    
    echo -e "${GREEN}✅ App launched${NC}"
}

# Function to capture screenshot
capture_screenshot() {
    local output="${HOME}/toxin-app-screenshot.png"
    adb shell screencap -p /sdcard/toxin.png
    adb pull /sdcard/toxin.png "$output"
    echo "Screenshot saved to: $output"
}

# Function to show status
show_status() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  Toxin App Status                                           ${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    
    # Package info
    echo "Package: $TOXIN_PKG"
    
    # Installation status
    if adb shell pm list packages "$TOXIN_PKG" 2>/dev/null | grep -q "$TOXIN_PKG"; then
        echo -e "Status: ${GREEN}Installed ✅${NC}"
    else
        echo -e "Status: ${RED}Not installed ❌${NC}"
    fi
    
    # Version info
    local version=$(adb shell dumpsys package "$TOXIN_PKG" 2>/dev/null | grep versionName | head -1 | awk -F= '{print $2}')
    if [ -n "$version" ]; then
        echo "Version: $version"
    fi
    
    # MicroG status
    if adb shell pm list packages "com.google.android.gms" 2>/dev/null | grep -q "com.google.android.gms"; then
        echo -e "microG: ${GREEN}Ready ✅${NC}"
    else
        echo -e "microG: ${YELLOW}Not installed ⚠${NC}"
    fi
    
    echo ""
}

# Main execution
main() {
    echo "Starting FDroidToxin automation..."
    echo ""
    
    # Check prerequisites
    wait_for_emulator
    verify_microg
    
    if ! verify_apk; then
        echo ""
        echo "💡 To build the APK first:"
        echo "   cd ~/projects/symbiote-os/toxin"
        echo "   ./gradlew assembleDebug"
        echo ""
        read -p "Build and continue? (y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            cd "${HOME}/projects/symbiote-os/toxin"
            ./gradlew assembleDebug
            if [ $? -ne 0 ]; then
                echo -e "${RED}❌ Build failed${NC}"
                exit 1
            fi
        else
            exit 1
        fi
    fi
    
    # Install
    install_toxin_app
    verify_microg_integration
    grant_permissions
    launch_app
    
    # Show final status
    show_status
    
    # Offer screenshot
    echo -e "${YELLOW}💡 Tips${NC}"
    echo "  View logs: adb logcat | grep toxin"
    echo "  Open activity: adb shell am start -n $TOXIN_PKG/.MainActivity"
    echo "  View package: adb shell dumpsys package $TOXIN_PKG"
    echo ""
    read -p "Capture screenshot? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        capture_screenshot
    fi
    
    echo ""
    echo -e "${GREEN}✓ FDroidToxin automation complete!${NC}"
}

# Run if emulator is connected, otherwise just check
if adb devices 2>/dev/null | grep -q "emulator"; then
    main "$@"
else
    echo -e "${YELLOW}No emulator connected.${NC}"
    echo "Run this script after starting: emulator -avd ${AVD_NAME:-FDroidToxin_Prototype}"
    exit 0
fi