#!/bin/bash
# FDroidToxin AVD Launcher

export ANDROID_HOME=~/Android/Sdk
export ANDROIDSDK_ROOT=~/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin

echo "🚀 Launching FDroidToxin AVD..."
echo ""

# Start emulator
echo "🎮 Starting Android emulator (this may take a few minutes)..."
emulator -avd FDroidToxin_Prototype -no-snapshot -no-window -gpu swiftshader_indirect -accel on

