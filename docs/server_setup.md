# Raspberry Pi Server Setup Guide

---

## 1. Initial System Update

```bash
sudo apt update && sudo apt -y upgrade
```
## 2. Automatic Security Updates

```bash
sudo apt install unattended-upgrades
sudo dpkg-reconfigure unattended-upgrades
# Choose "Yes" to enable automatic updates
```

---

## 3. SSH Hardening

Disable root login and password authentication — key-based auth only.

```bash
sudo nano /etc/ssh/sshd_config
```

Set or verify:
```
PermitRootLogin no
PasswordAuthentication no
```

Also check the cloud-init override (it may override sshd_config):
```bash
sudo nano /etc/ssh/sshd_config.d/50-cloud-init.conf
# Set: PasswordAuthentication no
```

Restart SSH:
```bash
sudo systemctl restart ssh
```

Lock the root account password:
```bash
sudo passwd -l root
```

Add your public key:
```bash
nano ~/.ssh/authorized_keys
# Paste your public key
```

---

## 4. Firewall (UFW)

```bash
sudo apt install -y ufw

# Default policy
sudo ufw default deny incoming
sudo ufw default allow outgoing

# SSH — LAN only
sudo ufw allow from 192.168.1.0/24 to any port 22 proto tcp

# PostgreSQL — LAN only
sudo ufw allow from 192.168.1.0/24 to any port 5432 proto tcp

# App ports (PM2 / Node.js) — LAN only
sudo ufw allow from 192.168.1.0/24 to any port 30000:30999 proto tcp

# mDNS (optional, for local discovery)
sudo ufw allow in proto udp to 224.0.0.251 port 5353
sudo ufw allow in proto udp to ff02::fb port 5353

sudo ufw enable
sudo ufw status verbose
```

---

## 5. Cloudflare Tunnel (Remote Access)

Exposes the app publicly without opening ports, via Cloudflare's network.

```bash
# Add Cloudflare GPG key
sudo mkdir -p --mode=0755 /usr/share/keyrings
curl -fsSL https://pkg.cloudflare.com/cloudflare-public-v2.gpg \
  | sudo tee /usr/share/keyrings/cloudflare-public-v2.gpg >/dev/null

# Add repo
echo 'deb [signed-by=/usr/share/keyrings/cloudflare-public-v2.gpg] https://pkg.cloudflare.com/cloudflared any main' \
  | sudo tee /etc/apt/sources.list.d/cloudflared.list

# Install
sudo apt-get update && sudo apt-get install cloudflared

# Install tunnel service (get the token from Cloudflare Zero Trust dashboard)
sudo cloudflared service install <YOUR_TUNNEL_TOKEN>
```

---

## 6. NordVPN (Optional — for outbound traffic routing)

The app uses NordVPN so outbound requests (e.g. to Binance API) go through a VPN.

```bash
sh <(curl -sSf https://downloads.nordcdn.com/apps/linux/install.sh)

sudo groupadd nordvpn
sudo usermod -aG nordvpn $USER

sudo reboot  # required for group membership to take effect

nordvpn login --token <YOUR_TOKEN>
nordvpn connect Poland  # or your preferred country

# Enable LAN access (so local services remain reachable)
nordvpn set lan-discovery on
nordvpn whitelist add subnet 192.168.1.0/24

# Auto-connect on boot
nordvpn set autoconnect on Poland
```

If the daemon fails after reboot:
```bash
sudo systemctl restart nordvpnd
```

---

## 7. Node.js (via nvm)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc

nvm install --lts
node -v
npm -v
```

---

## 8. PM2 (Process Manager)

```bash
npm install -g pm2

# Allow PM2 to survive user logout (must be done before first reboot)
loginctl enable-linger

# Generate and run the startup script (copy the printed command and run it)
pm2 startup
# e.g.: sudo env PATH=$PATH:/home/segvan/.nvm/versions/node/v24.12.0/bin \
#   /home/segvan/.nvm/versions/node/v24.12.0/lib/node_modules/pm2/bin/pm2 startup systemd -u segvan --hp /home/segvan
```

---

## 9. Yarn (Package Manager)

```bash
corepack enable
corepack prepare yarn@1.22.22 --activate
```

---

## 10. PostgreSQL

### Install

```bash
sudo apt install -y postgresql postgresql-contrib
```

### Configure Remote Access

```bash
sudo nano /etc/postgresql/17/main/postgresql.conf
# Set: listen_addresses = '*'

sudo nano /etc/postgresql/17/main/pg_hba.conf
# Add a line to allow LAN connections with md5 auth:
# host  all  all  192.168.1.0/24  md5

sudo systemctl restart postgresql
sudo ss -lntp | grep 5432   # verify it's listening
```

### Create Users and Databases

```bash
sudo -u postgres psql

-- Inside psql:
CREATE USER appuser WITH PASSWORD 'your_password';
ALTER ROLE appuser CREATEDB;

CREATE DATABASE kapitalist OWNER appuser;
ALTER SCHEMA public OWNER TO appuser;
GRANT USAGE, CREATE ON SCHEMA public TO appuser;

-- Optional dev database (same ownership grants required)
CREATE DATABASE kapitalist_dev OWNER appuser;
```

```bash
sudo -u postgres psql -d kapitalist_dev -c "ALTER SCHEMA public OWNER TO appuser;"
sudo -u postgres psql -d kapitalist_dev -c "GRANT USAGE, CREATE ON SCHEMA public TO appuser;"
```

### Restore from Dump (if migrating)

```bash
# Dump from source (run on source machine or locally)
pg_dump -Fc "postgresql://appuser:password@host:5432/kapitalist" -f /tmp/srcdb.dump

# Copy to Pi
scp /tmp/srcdb.dump segvan@parma:/tmp/

# Restore on Pi
sudo -u postgres pg_restore \
  --no-owner --no-acl --role=appuser \
  -d kapitalist /tmp/srcdb.dump
```

---

## 11. Application Deployment

### Clone and Set Up

```bash
mkdir ~/sites && cd ~/sites
sudo apt install -y git
git clone https://github.com/segvan/kapitalist-nuxt.git
cd kapitalist-nuxt

yarn install

# Create environment file
cp .env.example .env  # or: touch .env
nano .env
```

Required `.env` variables:
```
DATABASE_URL=postgresql://appuser:password@localhost:5432/kapitalist
TOKEN_SECRET=your_jwt_secret
TOKEN_EXP=3600
BNB_API_KEY=your_binance_key
BNB_SECRET_KEY=your_binance_secret
TLG_TOKEN_ID=your_telegram_bot_token
TLG_CHAT_ID=your_telegram_chat_id
API_KEY=your_worker_api_key
```

### Run Migrations and Build

```bash
yarn db:deploy
yarn build
```

### PM2 Ecosystem Config

Create `ecosystem.config.cjs`:
```js
module.exports = {
  apps: [{
    name: 'kapitalist',
    script: '.output/server/index.mjs',
    env_production: {
      NODE_ENV: 'production',
      PORT: 30000,
    },
  }],
}
```

### Start and Save

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 list
pm2 logs kapitalist
```

### Deploy Script (`zdeploy.sh`)

Create `zdeploy.sh` in the project root:
```bash
#!/bin/bash
set -e

git pull
yarn install
yarn db:deploy
yarn build
pm2 restart kapitalist
pm2 save
```

```bash
chmod +x zdeploy.sh
./zdeploy.sh
```

---

## 12. Python Workers (Background Jobs)

The workers run as cron jobs using `uv` (Python package manager).

### Install uv

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
source $HOME/.local/bin/env
```

### Set Up Worker Project

```bash
mkdir ~/workers && cd ~/workers
uv init
uv add requests python-dotenv

# Create .env with secrets
touch .env && chmod 600 .env
nano .env
```

### Create Run Script

```bash
nano ~/workers/run_kapitalist_job.sh
```

```bash
#!/bin/bash
cd /home/segvan/workers
/home/segvan/.local/bin/uv run flock -n /tmp/kapitalist_job.lock python kapitalist_job.py >> kapitalist_job.log 2>&1
```

```bash
chmod +x ~/workers/run_kapitalist_job.sh
```

### Cron Job

```bash
crontab -e
```

Example entry (runs every 5 minutes):
```
*/5 * * * * /home/segvan/workers/run_kapitalist_job.sh
```

Make sure cron is running:
```bash
sudo systemctl enable --now cron
sudo systemctl status cron --no-pager
crontab -l  # verify
```

### Log Rotation

```bash
sudo nano /etc/logrotate.d/kapitalist_job
```

```
/home/segvan/workers/kapitalist_job.log {
    daily
    rotate 7
    compress
    missingok
    notifempty
}
```

```bash
sudo logrotate -d /etc/logrotate.d/kapitalist_job  # dry run to verify
```

---

## 13. Time Sync (NTP)

Ensure the clock is accurate — important for API request signing (Binance requires it).

```bash
sudo timedatectl set-ntp true
sudo systemctl restart systemd-timesyncd
timedatectl status
```

---

## 14. Monitoring & Useful Commands

```bash
# System
htop
df -h
vcgencmd measure_temp          # Pi CPU temperature

# App
pm2 list
pm2 logs kapitalist
pm2 restart kapitalist

# Postgres
sudo -u postgres psql -d kapitalist -c "\dt"
sudo -u postgres psql -d kapitalist -c "SELECT COUNT(*) FROM \"Trades\";"

# Network
sudo ss -tulnp
sudo ufw status verbose
nordvpn status

# Enable user lingering (so PM2 survives logout)
loginctl enable-linger
```

---

## 15. Configuration Files

### SSH
```bash
/etc/ssh/sshd_config
/etc/ssh/sshd_config.d/50-cloud-init.conf
```

### PostgreSQL
```bash
/etc/postgresql/17/main/postgresql.conf
/etc/postgresql/17/main/pg_hba.conf
```

### App (PM2 + deploy script)
```bash
~/sites/kapitalist-nuxt/ecosystem.config.cjs
~/sites/kapitalist-nuxt/zdeploy.sh
```

### Log Rotation
```bash
/etc/logrotate.d/kapitalist_job
```

### Crontab
```bash
crontab -l
```
