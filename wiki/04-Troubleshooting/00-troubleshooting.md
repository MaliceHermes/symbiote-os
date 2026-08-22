# Troubleshooting

> Common issues and solutions for Symbiote-OS.

## sudo Access Issues

### Problem: Can't create hermes user / can't `dd` / can't `mkfs`
**Cause:** Hermes Agent blocks `sudo -S` password piping and raw block device writes for security.

**Solutions:**
1. Create `~/.hermes/.env` with `SUDO_PASSWORD=***` — allows passwordless sudo for approved commands
2. Add NOPASSWD rules to `/etc/sudoers.d/`:
   ```bash
   echo "%uncannyblacc ALL=(ALL) NOPASSWD: /usr/sbin/useradd, /usr/bin/chmod, /usr/bin/chown, /usr/bin/mkdir" | sudo tee /etc/sudoers.d/hermes-setup
   ```
3. For `dd`/`mkfs`: run those specific commands in your own terminal — the agent blocks them as hardline commands.

### Problem: `sudo: a terminal is required to read the password`
**Cause:** No TTY attached to agent's shell session.

**Solution:** Configure SUDO_ASKPASS:
```bash
echo '#!/bin/bash' > /tmp/symbiote-askpass.sh
echo 'echo "password"' >> /tmp/symbiote-askpass.sh
chmod +x /tmp/symbiote-askpass.sh
SUDO_ASKPASS=/tmp/symbiote-askpass.sh sudo -A command_here
```

## Hive Issues

### Problem: `~/.symbiote-brain/` disappeared
**Cause:** Unknown — possibly a cleanup process or MEGA sync conflict.

**Solution:** Recreate the structure (see Install guide):
```bash
mkdir -p ~/.symbiote-brain/{Life-OS,Business-Private,Claude-Brain}
mkdir -p ~/.symbiote-brain/Claude-Brain/{00-Handoff,01-Knowledge,02-Tools}/{incoming-briefs,outgoing-results}
```

### Problem: `grok-Brain` vs `Claude-Brain`
**Cause:** MEGA sync folder had a different name (`grok-Brain`) from an earlier configuration.

**Fix:** 
```bash
# If MEGA shows grok-Brain, rename it to Claude-Brain:
mv ~/MEGA/"The Hive"/grok-Brain ~/MEGA/"The Hive"/Claude-Brain
```

## Tor Issues

### Problem: `tor: no relay configured` / service won't start
**Cause:** Missing `/etc/tor/torrc` configuration.

**Fix:**
```bash
cat > /etc/tor/torrc <<EOF
HiddenServiceDir /var/lib/tor/symbiote-onion-service/
HiddenServicePort 3030 127.0.0.1:3030
SocksPort 9050
ControlPort 9051
Log notice syslog
EOF
sudo systemctl restart tor
```

### Problem: Can't connect to .onion address
**Cause:** Tor hidden service needs time to bootstrap (2-5 minutes).

**Fix:**
```bash
# Check Tor status
sudo systemctl status tor
# Check hidden service readiness
cat /var/lib/tor/symbiote-onion-service/hostname 2>/dev/null || echo "Not ready yet"
# Wait and retry in a few minutes
```

## Orchestrator Issues

### Problem: `MODULE_NOT_FOUND` — orchestrator crashes on startup
**Cause:** `orchestrator/src/index.js` was missing from the repo (scaffold only).

**Fix:** The file has been created at `orchestrator/src/index.js` — run `node src/index.js` from the orchestrator directory.

### Problem: Port already in use
**Fix:**
```bash
# Find process on port 3030
lsof -i :3030
# Kill it
kill -9 $(lsof -t -i :3030)
# Restart orchestrator
```

## Frontend Issues

### Problem: Vite returns 404
**Cause:** No `index.html` or source files in the frontend directory (scaffold only).

**Fix:** The file has been created at `frontend/index.html` + `frontend/src/`. Run `npm run dev` from the frontend directory.

### Problem: Frontend can't fetch API from :3030
**Cause:** CORS or proxy not configured.

**Fix:** `vite.config.js` has the proxy set up:
```js
server: {
  proxy: { '/api': 'http://localhost:3030' }
}
// Or use cors option in Express
```