# Proton Drive — Encrypted Cloud Backup

> Proton Drive integration for Business-Private vault backups

## Status: 🚧 Pending Manual Setup

### Overview
Proton Drive provides end-to-end encrypted cloud storage. This is used for:
- **Business-Private** vault backups (encrypted recovery)
- Off-site redundancy of sensitive Hive data

### Installation (Manual Required)

Proton doesn't provide a standalone Linux CLI client via apt. Setup requires manual steps:

#### Option A: Proton Drive AppImage + Rclone
1. Download Proton Mail Desktop AppImage (includes Drive web UI) from proton.me/download
2. Install rclone with Proton Drive remote:
   ```bash
   sudo apt install rclone
   rclone config
   # Select "protondrive" remote
   ```

#### Option B: Proton Drive CLI (open-source)
```bash
# Via pip
pip install proton-drive-linux

# Or via cargo
cargo install proton-drive

# Or GitHub binary
cargo install proton-drive-linux
```

### Planned Sync Config
```
Source: ~/.symbiote-brain/Business-Private/
Target: /Proton/Backups/Symbiote-OS/Business-Private/
Schedule: Daily @ 2 AM (cron)
Encryption: Proton end-to-end (client-side)
```

### Integration with Hive
The Business-Private cage contains data that must be backed up securely:
- Personal documents
- Financial records
- Vault recovery keys

### Next Steps
When you get a Proton Drive client running, add this to the wiki with the actual config:
- Sync paths
- Cron schedule
- Authentication method (device password / 2FA)
