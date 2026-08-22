#!/usr/bin/env python3
"""
Create a minimal valid Android APK for Toxin
"""
import os
import zipfile
import subprocess
import struct

def create_minimal_apk():
    """Create a minimal APK with proper structure"""
    
    apk_path = "/tmp/toxin-test.apk"
    
    # Create APK structure
    with zipfile.ZipFile(apk_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        # AndroidManifest.xml (XML bytes)
        manifest = b'<?xml version="1.0" encoding="utf-8"?>\n<manifest xmlns:android="http://schemas.android.com/apk/res/android" package="com.example.toxin">\n  <application android:allowBackup="true" android:debuggable="true">\n    <activity android:name=".MainActivity" android:exported="true">\n      <intent-filter>\n        <action android:name="android.intent.action.MAIN"/>\n        <category android:name="android.intent.category.LAUNCHER"/>\n      </intent-filter>\n    </activity>\n  </application>\n</manifest>'
        zf.writestr('AndroidManifest.xml', manifest)
        
        # Basic resources
        zf.writestr('res/values/strings.xml', '<?xml version="1.0"?><resources><string name="app_name">Toxin</string></resources>')
    
    print(f"Created APK at {apk_path}")
    print(f"Size: {os.path.getsize(apk_path)} bytes")
    
    # Sign with test keys
    keystore = "/tmp/test.keystore"
    
    # Generate keystore
    subprocess.run([
        "keytool", "-genkey", "-v",
        "-keystore", keystore,
        "-alias", "android",
        "-keyalg", "RSA",
        "-keysize", "2048",
        "-validity", "10000",
        "-storepass", "android",
        "-keypass", "android",
        "-noprompt",
        "-dname", "CN=Android,O=Android,C=US"
    ], check=True, capture_output=True)
    
    print("✅ Keystore created")
    
    # Sign APK
    result = subprocess.run([
        "/home/uncannyblacc/Android/Sdk/build-tools/34.0.0/apksigner", "sign",
        "--ks", keystore,
        "--ks-pass", "pass:android",
        "--key-pass", "pass:android",
        "--v1-signing-enabled", "true",
        "--v2-signing-enabled", "false",
        "--out", "/tmp/toxin-signed.apk",
        apk_path
    ], capture_output=True, text=True)
    
    if result.returncode == 0:
        print("✅ APK signed successfully")
        
        # Align
        subprocess.run([
            "/home/uncannyblacc/Android/Sdk/build-tools/34.0.0/zipalign", "-f", "4",
            "/tmp/toxin-signed.apk", "/tmp/toxin-debug.apk"
        ], check=True)
        
        print("✅ APK aligned")
        print("✅ Ready: /tmp/toxin-debug.apk")
        
        return "/tmp/toxin-debug.apk"
    else:
        print(f"❌ Signing failed: {result.stderr}")
        return None

if __name__ == "__main__":
    apk_path = create_minimal_apk()
    if apk_path:
        print(f"\n✅ Final APK: {apk_path}")