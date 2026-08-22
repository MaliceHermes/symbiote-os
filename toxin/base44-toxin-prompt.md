# Base44 "Toxin" Prompt

> **Vibe Coding Platform for Building Apps and Websites | Base44**

## Prompt for Base44

```
Build a complete Android app called "Toxin" — the mobile node for Symbiote OS (a privacy-first portable agentic OS running on Debian 13 + LineageOS + microG). 

The app is a status dashboard and control center for the Symbiote OS mobile stack. It should be built with Kotlin, targeting Android 14 (API 34), using Material 3 dark theme with the following specific colors from the Symbiote OS threat model palette:
- synaptic_green: #FF4CAF50 (status indicators)
- carnage_red: #FFFF0000 (alerts/dangers)
- hive_blue: #FF2196F3 (Hive vault references)
- tendril_onion: #FF9C27B0 (Tor/onion service references)

The dashboard should display:
1. App header with "Symbiote Toxin" title and "v1.0 (Phase 6)" version
2. Status banner showing current system status
3. Component status list with these items (each as a card with status badge):
   - microG: Configured (✅) — Google Play Services replacement
   - Syncthing: Pending (⏳) — Hive vault sync
   - Shelter: Pending (⏳) — Work profile isolation
   - Tor: Pending (⏳) — Onion service bridge
4. Footer with build info and "Building in public" attribution

Technical requirements:
- Package name: com.example.toxin
- Permissions: INTERNET, ACCESS_NETWORK_STATE, WRITE_EXTERNAL_STORAGE, READ_EXTERNAL_STORAGE
- Uses microG instead of GApps (no Google Play Services dependency)
- Integrates with Syncthing for syncing ~/.symbiote-brain to /storage/emulated/0/Symbiote/Hive
- Designed to run on LineageOS with microG stack (GmsCore, FakeStore, GsfProxy)
- Has an adaptive launcher icon (ic_launcher.xml for API 26+)
- Build configuration with debug and release buildTypes
- Uses ConstraintLayout for responsive layout
- Includes proper AndroidManifest.xml with exported activity

The app connects back to the "Venom" desktop component (Symbiote OS brain on SSD) via encrypted Tor onion services, and syncs through "Hive" (shared vault) and "Tendril" (Tor bridge).

Include the full Gradle build configuration (project-level + app-level), all resource files (strings.xml, colors.xml, themes.xml, AndroidManifest.xml), the Kotlin MainActivity, and layout files. The app should be ready to build with `gradle assembleDebug`.

App README should document:
- Quick start (build APK -> install on device/AVD -> configure microG -> set up Syncthing -> pair with Venom desktop)
- Component status table
- microG compatibility matrix (Gmail, Maps, Drive, Contacts work; Google Pay/YouTube Premium don't due to hardware attestation)
- AVD setup instructions (FDroidToxin_Prototype AVD on Android 14 API 34)
- Troubleshooting section
- Architecture diagram showing Toxin's place in the Symbiote OS ecosystem (Venom -> Tendril -> Toxin -> Hive)
```

## Key Design References

### Symbiote OS Ecosystem
- **Venom** (Brain/SSD) — Debian 13 core with Hermes Agent + Codex + Ollama
- **Tendril** (Tor) — Onion service bridge for encrypted communication
- **Toxin** (Android) — Mobile prototype with microG, this app
- **Hive** (Vault) — Shared Syncthing-synced vault (~/.symbiote-brain)
- **Carnage** (ACL/Redaction) — Access control and redaction layer
- **Phage** (LLM) — Ollama hermes3:8b local inference

### microG Integration
- Uses microG instead of full GApps
- Compatible services: Gmail, Maps, Drive, Contacts, YouTube
- Incompatible services: Google Pay, YouTube Premium (hardware attestation)

### Build Output
- APK at: `app/build/outputs/apk/debug/app-debug.apk`
- Size target: ~5.5 MB
- Debuggable: Yes
- Target SDK: 34 (Android 14)
